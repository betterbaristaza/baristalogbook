const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(
  path.join(__dirname, '../api/paystack-verify.ts'),
  'utf8'
);

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

function fixture() {
  return {
    user: { id: 'test-owner' },
    authError: null,
    lookupError: null,
    attempt: {
      reference: 'bp-test-fixture',
      user_id: 'test-owner',
      environment: 'test',
      plan_code: 'pro_monthly',
      amount: 5900,
      currency: 'ZAR',
      paystack_plan_code: 'PLN_fixture',
    },
    payment: {
      id: 123456,
      domain: 'test',
      status: 'success',
      reference: 'bp-test-fixture',
      amount: 5900,
      currency: 'ZAR',
      paid_at: '2026-09-21T07:00:00.000Z',
      plan: 'PLN_fixture',
      metadata: {
        brewprint_user_id: 'test-owner',
        brewprint_plan_code: 'pro_monthly',
        brewprint_environment: 'test',
      },
    },
    request: {
      method: 'POST',
      headers: { authorization: 'Bearer fixture-token' },
      body: { reference: 'bp-test-fixture' },
    },
    env: {
      SUPABASE_URL: 'https://fixture.invalid',
      SUPABASE_SERVICE_ROLE_KEY: 'fixture-server-key',
      PAYSTACK_SECRET_KEY: 'sk_test_fixture',
    },
    providerOk: true,
    envelopeStatus: true,
    fetchError: false,
    badJson: false,
  };
}

async function execute(f) {
  let providerCalls = 0;
  let databaseCalls = 0;
  const logs = [];
  const headers = {};
  const moduleObject = { exports: {} };

  const admin = {
    auth: {
      async getUser(token) {
        assert.equal(token, 'fixture-token');
        return {
          data: { user: f.user },
          error: f.authError,
        };
      },
    },
    from(table) {
      databaseCalls++;
      assert.equal(table, 'billing_payment_attempts');
      const filters = {};

      const query = {
        select() {
          return query;
        },
        eq(column, value) {
          filters[column] = value;
          return query;
        },
        async maybeSingle() {
          // Assert ownership restrictions, independently of the mock result.
          assert.equal(filters.user_id, f.user.id);
          assert.equal(filters.environment, 'test');
          assert.equal(filters.reference, f.request.body.reference);

          const matches = f.attempt && Object.entries(filters)
            .every(([key, value]) => f.attempt[key] === value);

          return {
            data: matches ? f.attempt : null,
            error: f.lookupError,
          };
        },
      };

      // No write methods exist. Any attempted write fails the happy tests.
      return query;
    },
  };

  const sandbox = {
    module: moduleObject,
    exports: moduleObject.exports,
    require(name) {
      assert.equal(name, '@supabase/supabase-js');
      return { createClient: () => admin };
    },
    process: { env: f.env },
    AbortSignal,
    console: {
      error: (...args) => logs.push(args.join(' ')),
    },
    fetch: async (url, options) => {
      providerCalls++;
      assert.equal(
        url,
        'https://api.paystack.co/transaction/verify/bp-test-fixture'
      );
      assert.equal(options.method, 'GET');
      assert.equal(options.redirect, 'error');
      assert.equal(
        options.headers.Authorization,
        'Bearer sk_test_fixture'
      );

      if (f.fetchError) throw new Error('private-provider-error');

      return {
        ok: f.providerOk,
        async json() {
          if (f.badJson) throw new Error('private-provider-body');
          return { status: f.envelopeStatus, data: f.payment };
        },
      };
    },
  };

  vm.runInNewContext(compiled, sandbox);

  let code;
  let body;
  const response = {
    setHeader(name, value) {
      headers[name] = value;
    },
    status(value) {
      code = value;
      return response;
    },
    json(value) {
      body = JSON.parse(JSON.stringify(value));
      return response;
    },
  };

  await moduleObject.exports.default(f.request, response);

  assert.equal(headers['Cache-Control'], 'no-store');

  const output = JSON.stringify({ body, logs });
  for (const secret of [
    'fixture-token',
    'fixture-server-key',
    'sk_test_fixture',
    'private-provider-error',
    'private-provider-body',
  ]) {
    assert.equal(output.includes(secret), false);
  }

  return { code, body, providerCalls, databaseCalls, headers };
}

function scenario(name, modify, expectedCode, expectedCalls, verified) {
  test(name, async () => {
    const f = fixture();
    modify(f);
    const result = await execute(f);

    assert.equal(result.code, expectedCode);
    assert.equal(result.providerCalls, expectedCalls);

    if (expectedCode === 200) {
      assert.equal(result.body.paymentVerified, verified);
      assert.equal(result.body.entitlementApplied, false);
      assert.equal(result.body.environment, 'test');
    } else {
      assert.equal(result.body.paymentVerified, undefined);
    }
  });
}

scenario('matching monthly success', () => {}, 200, 1, true);

scenario('matching annual success', f => {
  f.attempt.plan_code = 'pro_annual';
  f.attempt.amount = 49900;
  f.payment.amount = 49900;
  f.payment.metadata.brewprint_plan_code = 'pro_annual';
}, 200, 1, true);

for (const status of [
  'failed', 'abandoned', 'pending', 'ongoing',
  'processing', 'queued', 'reversed',
]) {
  scenario(`${status} never confirms payment`, f => {
    f.payment.status = status;
  }, 200, 1, false);
}

scenario('GET callback cannot confirm payment', f => {
  f.request.method = 'GET';
}, 405, 0);

scenario('missing authentication', f => {
  f.request.headers = {};
}, 401, 0);

scenario('invalid session', f => {
  f.user = null;
  f.authError = { message: 'invalid' };
}, 401, 0);

scenario('invalid reference', f => {
  f.request.body.reference = '../another-reference';
}, 400, 0);

scenario('missing attempt', f => {
  f.attempt = null;
}, 404, 0);

scenario('cross-account reference', f => {
  f.user.id = 'another-user';
}, 404, 0);

scenario('live key rejected before provider access', f => {
  f.env.PAYSTACK_SECRET_KEY = 'sk_live_fixture';
}, 503, 0);

scenario('database lookup failure', f => {
  f.lookupError = { message: 'unavailable' };
}, 503, 0);

scenario('invalid saved amount', f => {
  f.attempt.amount = 1;
}, 503, 0);

for (const [field, value] of [
  ['domain', 'live'],
  ['reference', 'bp-test-other'],
  ['amount', 1],
  ['currency', 'USD'],
]) {
  scenario(`provider ${field} mismatch`, f => {
    f.payment[field] = value;
  }, 409, 1);
}

for (const field of [
  'brewprint_user_id',
  'brewprint_plan_code',
  'brewprint_environment',
]) {
  scenario(`metadata ${field} mismatch`, f => {
    f.payment.metadata[field] = 'wrong';
  }, 409, 1);
}

scenario('missing ownership metadata', f => {
  f.payment.metadata = null;
}, 409, 1);

scenario('unknown provider status', f => {
  f.payment.status = 'unexpected';
}, 503, 1);

scenario('API success is not payment success', f => {
  f.envelopeStatus = true;
  f.payment.status = 'failed';
}, 200, 1, false);

scenario('provider HTTP failure', f => {
  f.providerOk = false;
}, 503, 1);

scenario('provider envelope failure', f => {
  f.envelopeStatus = false;
}, 503, 1);

scenario('provider timeout or network error', f => {
  f.fetchError = true;
}, 503, 1);

scenario('malformed provider JSON', f => {
  f.badJson = true;
}, 503, 1);

scenario('wrong successful-payment plan', f => {
  f.payment.plan = 'PLN_wrong';
}, 409, 1);

scenario('missing successful-payment timestamp', f => {
  f.payment.paid_at = null;
}, 409, 1);

scenario('unsafe numeric transaction ID rejected', f => {
  f.payment.id = Number.MAX_SAFE_INTEGER + 1;
}, 409, 1);

scenario('large transaction ID preserved as text', f => {
  f.payment.id = '18446744073709551615';
}, 200, 1, true);

scenario('stringified metadata supported', f => {
  f.payment.metadata = JSON.stringify(f.payment.metadata);
}, 200, 1, true);

scenario('plan object supported', f => {
  f.payment.plan = { plan_code: 'PLN_fixture' };
}, 200, 1, true);

scenario('plan_object fallback supported', f => {
  f.payment.plan = null;
  f.payment.plan_object = { plan_code: 'PLN_fixture' };
}, 200, 1, true);

scenario('forged client success fields ignored', f => {
  f.request.body.status = 'success';
  f.request.body.amount = 5900;
  f.request.body.user_id = 'another-user';
  f.payment.status = 'failed';
}, 200, 1, false);