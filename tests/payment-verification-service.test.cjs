const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(
  path.join(__dirname, '../services/paymentVerificationService.ts'),
  'utf8'
);

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const reference = 'bp-test-fixture';

function fixture(overrides = {}) {
  return {
    environment: 'test',
    reference,
    planCode: 'pro_monthly',
    paymentStatus: 'success',
    paymentVerified: true,
    entitlementApplied: true,
    persistenceReused: false,
    ...overrides,
  };
}

function setup(options = {}) {
  const calls = [];
  let sessionCalls = 0;
  const moduleObject = { exports: {} };

  vm.runInNewContext(compiled, {
    module: moduleObject,
    exports: moduleObject.exports,
    require(name) {
      assert.equal(name, './supabaseClient');

      return {
        supabase: {
          auth: {
            async getSession() {
              sessionCalls += 1;

              return {
                data: {
                  session: options.signedOut
                    ? null
                    : { access_token: 'fixture-token' },
                },
                error: options.sessionError ?? null,
              };
            },
          },
        },
      };
    },
    async fetch(url, init) {
      calls.push({ url, init });

      if (options.networkError) {
        throw new Error('Network unavailable');
      }

      return {
        ok: options.ok ?? true,
        async json() {
          if (options.badJson) {
            throw new Error('Invalid JSON');
          }

          return options.payload ?? fixture();
        },
      };
    },
  });

  return {
    service: moduleObject.exports,
    calls,
    sessionCalls: () => sessionCalls,
  };
}

for (const planCode of ['pro_monthly', 'pro_annual']) {
  test(`accepts saved TEST success for ${planCode}`, async () => {
    const f = setup({ payload: fixture({ planCode }) });
    const result = await f.service.verifyTestPayment(reference);

    assert.equal(result.planCode, planCode);
    assert.equal(result.paymentVerified, true);
    assert.equal(result.entitlementApplied, true);

    assert.equal(f.calls.length, 1);
    const { url, init } = f.calls[0];
    assert.equal(url, '/api/paystack-verify');
    assert.equal(init.method, 'POST');
    assert.equal(init.headers.Authorization, 'Bearer fixture-token');
    assert.equal(init.cache, 'no-store');
    assert.equal(init.redirect, 'error');
    assert.deepEqual(JSON.parse(init.body), { reference });
  });
}

test('accepts an idempotently reused result', async () => {
  const f = setup({
    payload: fixture({ persistenceReused: true }),
  });

  const result = await f.service.verifyTestPayment(reference);
  assert.equal(result.persistenceReused, true);
});

for (const paymentStatus of [
  'abandoned', 'failed', 'ongoing', 'pending',
  'processing', 'queued', 'reversed',
]) {
  test(`${paymentStatus} remains unconfirmed`, async () => {
    const f = setup({
      payload: fixture({
        paymentStatus,
        paymentVerified: false,
        entitlementApplied: false,
      }),
    });

    const result = await f.service.verifyTestPayment(reference);
    assert.equal(result.paymentVerified, false);
    assert.equal(result.entitlementApplied, false);
  });
}

for (const [label, changes] of [
  ['live environment', { environment: 'live' }],
  ['different reference', { reference: 'bp-test-another' }],
  ['unknown plan', { planCode: 'lifetime' }],
  ['unsaved success', { entitlementApplied: false }],
  ['unverified success', { paymentVerified: false }],
  ['missing reuse flag', { persistenceReused: undefined }],
  ['unknown status', { paymentStatus: 'unexpected' }],
  ['failed status with success flags', { paymentStatus: 'failed' }],
]) {
  test(`rejects ${label}`, async () => {
    const f = setup({ payload: fixture(changes) });
    await assert.rejects(
      f.service.verifyTestPayment(reference),
      /invalid|inconsistent/
    );
  });
}

test('invalid reference makes no session or network request', async () => {
  const f = setup();

  await assert.rejects(
    f.service.verifyTestPayment('forged-success'),
    /Invalid TEST payment reference/
  );

  assert.equal(f.sessionCalls(), 0);
  assert.equal(f.calls.length, 0);
});

test('signed-out user makes no network request', async () => {
  const f = setup({ signedOut: true });

  await assert.rejects(
    f.service.verifyTestPayment(reference),
    /Sign in/
  );

  assert.equal(f.calls.length, 0);
});

test('session failure makes no network request', async () => {
  const f = setup({ sessionError: new Error('fixture') });

  await assert.rejects(
    f.service.verifyTestPayment(reference),
    /session/
  );

  assert.equal(f.calls.length, 0);
});

test('HTTP failure cannot become payment success', async () => {
  const f = setup({ ok: false, payload: fixture() });

  await assert.rejects(
    f.service.verifyTestPayment(reference),
    /Unable to verify/
  );
});

test('server retry message reaches the caller', async () => {
  const message = 'Retry verification for this same payment.';
  const f = setup({
    ok: false,
    payload: { error: message },
  });

  await assert.rejects(
    f.service.verifyTestPayment(reference),
    error => error.message === message
  );
});

test('malformed JSON cannot become payment success', async () => {
  const f = setup({ badJson: true });

  await assert.rejects(
    f.service.verifyTestPayment(reference),
    /invalid/
  );
});

test('network failure remains an error', async () => {
  const f = setup({ networkError: true });

  await assert.rejects(
    f.service.verifyTestPayment(reference),
    /Network unavailable/
  );
});

test('already aborted request does not read session or fetch', async () => {
  const f = setup();
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    f.service.verifyTestPayment(reference, controller.signal),
    error => error.name === 'AbortError'
  );

  assert.equal(f.sessionCalls(), 0);
  assert.equal(f.calls.length, 0);
});

test('passes cancellation signal to fetch', async () => {
  const f = setup();
  const controller = new AbortController();

  await f.service.verifyTestPayment(reference, controller.signal);

  assert.equal(f.calls[0].init.signal, controller.signal);
});
