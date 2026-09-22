const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(
  path.join(__dirname, '../api/paystack-test-status.ts'),
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
    request: {
      method: 'GET',
      headers: { authorization: 'Bearer fixture-token' },
      query: { user_id: 'another-user' },
    },
    env: {
      SUPABASE_URL: 'https://fixture.invalid',
      SUPABASE_SERVICE_ROLE_KEY: 'fixture-server-key',
      PAYSTACK_SECRET_KEY: 'sk_test_fixture',
    },
    user: { id: 'test-owner' },
    authError: null,
    lookupError: null,
    throwLookup: false,
    row: {
      environment: 'test',
      entitlement: 'brewprint_pro',
      starts_at: '2000-01-01T00:00:00.000Z',
      expires_at: '2100-01-01T00:00:00.000Z',
      revoked_at: null,
      subscription: {
        environment: 'test',
        attempt: {
          user_id: 'test-owner',
          environment: 'test',
          plan_code: 'pro_annual',
          status: 'succeeded',
        },
      },
    },
  };
}

async function execute(f) {
  const calls = [];
  const headers = {};
  const moduleObject = { exports: {} };
  let authCalls = 0;
  let receivedToken;
  let status;
  let body;

  const query = {};

  for (const method of [
    'select', 'eq', 'is', 'lte', 'gt', 'order', 'limit',
  ]) {
    query[method] = (...args) => {
      calls.push([method, ...args]);
      return query;
    };
  }

  query.maybeSingle = async () => {
    calls.push(['maybeSingle']);

    if (f.throwLookup) {
      throw new Error('Database unavailable');
    }

    return { data: f.row, error: f.lookupError };
  };

  // No insert, update, delete or RPC methods are provided.
  const admin = {
    auth: {
      async getUser(token) {
        authCalls++;
        receivedToken = token;

        return {
          data: { user: f.user },
          error: f.authError,
        };
      },
    },
    from(table) {
      calls.push(['from', table]);
      return query;
    },
  };

  vm.runInNewContext(compiled, {
    exports: moduleObject.exports,
    module: moduleObject,
    require(name) {
      if (name !== '@supabase/supabase-js') {
        throw new Error(`Unexpected dependency: ${name}`);
      }

      return { createClient: () => admin };
    },
    process: { env: f.env },
    console: { error() {} },
  });

  const response = {
    setHeader(name, value) {
      headers[name] = value;
    },
    status(code) {
      status = code;
      return this;
    },
    json(value) {
      body = JSON.parse(JSON.stringify(value));
      return this;
    },
  };

  await moduleObject.exports.default(f.request, response);

  assert.equal(headers['Cache-Control'], 'no-store');
  assert.equal(headers.Vary, 'Authorization');

  if (status !== 200) {
    assert.equal(body.testAccessActive, undefined);
    assert.equal(typeof body.error, 'string');
  }

  return {
    status,
    body,
    headers,
    calls,
    authCalls,
    receivedToken,
  };
}

for (const plan of ['pro_monthly', 'pro_annual']) {
  test(`returns active TEST status for ${plan}`, async () => {
    const f = fixture();
    f.row.subscription.attempt.plan_code = plan;

    const result = await execute(f);

    assert.equal(result.status, 200);
    assert.equal(result.body.environment, 'test');
    assert.equal(result.body.testAccessActive, true);
    assert.equal(result.body.planCode, plan);
    assert.equal(result.body.startsAt, f.row.starts_at);
    assert.equal(result.body.expiresAt, f.row.expires_at);
    assert.ok(Number.isFinite(Date.parse(result.body.checkedAt)));
    assert.equal(result.receivedToken, 'fixture-token');

    assert.deepEqual(Object.keys(result.body).sort(), [
      'checkedAt',
      'environment',
      'expiresAt',
      'planCode',
      'startsAt',
      'testAccessActive',
    ].sort());

    const hasCall = (...expected) => result.calls.some(
      call => JSON.stringify(call) === JSON.stringify(expected)
    );

    assert.ok(hasCall('from', 'billing_test_entitlements'));
    assert.ok(hasCall('eq', 'environment', 'test'));
    assert.ok(hasCall('eq', 'entitlement', 'brewprint_pro'));
    assert.ok(hasCall('is', 'revoked_at', null));
    assert.ok(hasCall('lte', 'starts_at', result.body.checkedAt));
    assert.ok(hasCall('gt', 'expires_at', result.body.checkedAt));
    assert.ok(hasCall('eq', 'subscription.environment', 'test'));
    assert.ok(hasCall('eq', 'subscription.attempt.environment', 'test'));
    assert.ok(hasCall('eq', 'subscription.attempt.user_id', 'test-owner'));
    assert.ok(hasCall('eq', 'subscription.attempt.status', 'succeeded'));
    assert.ok(hasCall('limit', 1));

    const selection = result.calls.find(call => call[0] === 'select')[1];
    assert.match(selection, /billing_test_subscriptions!inner/);
    assert.match(selection, /billing_payment_attempts!inner/);
  });
}

test('returns inactive status when no valid entitlement exists', async () => {
  const f = fixture();
  f.row = null;

  const result = await execute(f);

  assert.equal(result.status, 200);
  assert.equal(result.body.testAccessActive, false);
  assert.equal(result.body.planCode, null);
  assert.equal(result.body.startsAt, null);
  assert.equal(result.body.expiresAt, null);
});

test('rejects POST without reading the database', async () => {
  const f = fixture();
  f.request.method = 'POST';

  const result = await execute(f);

  assert.equal(result.status, 405);
  assert.equal(result.headers.Allow, 'GET');
  assert.equal(result.authCalls, 0);
  assert.equal(result.calls.length, 0);
});

for (const authorization of [
  undefined,
  '',
  'Basic fixture-token',
  'Bearer ',
  'Bearer token extra',
]) {
  test(`rejects invalid authorization: ${String(authorization)}`, async () => {
    const f = fixture();
    f.request.headers.authorization = authorization;

    const result = await execute(f);

    assert.equal(result.status, 401);
    assert.equal(result.authCalls, 0);
    assert.equal(result.calls.length, 0);
  });
}

for (const mode of ['missing user', 'authentication error']) {
  test(`rejects ${mode}`, async () => {
    const f = fixture();

    if (mode === 'missing user') {
      f.user = null;
    } else {
      f.authError = { message: 'Invalid token' };
    }

    const result = await execute(f);

    assert.equal(result.status, 401);
    assert.equal(result.calls.length, 0);
  });
}

for (const key of [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PAYSTACK_SECRET_KEY',
]) {
  test(`rejects missing ${key}`, async () => {
    const f = fixture();
    delete f.env[key];

    const result = await execute(f);

    assert.equal(result.status, 503);
    assert.equal(result.authCalls, 0);
    assert.equal(result.calls.length, 0);
  });
}

test('rejects a live Paystack key', async () => {
  const f = fixture();
  f.env.PAYSTACK_SECRET_KEY = 'sk_live_fixture';

  const result = await execute(f);

  assert.equal(result.status, 503);
  assert.equal(result.calls.length, 0);
});

for (const mode of ['returned error', 'thrown error']) {
  test(`database ${mode} does not become inactive access`, async () => {
    const f = fixture();

    if (mode === 'returned error') {
      f.lookupError = { message: 'Database unavailable' };
    } else {
      f.throwLookup = true;
    }

    const result = await execute(f);
    assert.equal(result.status, 503);
  });
}

const invalidRows = [
  ['another owner', row => {
    row.subscription.attempt.user_id = 'another-user';
  }],
  ['live entitlement', row => {
    row.environment = 'live';
  }],
  ['live subscription', row => {
    row.subscription.environment = 'live';
  }],
  ['live attempt', row => {
    row.subscription.attempt.environment = 'live';
  }],
  ['unverified attempt', row => {
    row.subscription.attempt.status = 'pending';
  }],
  ['wrong entitlement', row => {
    row.entitlement = 'something_else';
  }],
  ['invalid plan', row => {
    row.subscription.attempt.plan_code = 'free';
  }],
  ['revoked entitlement', row => {
    row.revoked_at = '2020-01-01T00:00:00.000Z';
  }],
  ['expired entitlement', row => {
    row.expires_at = '2001-01-01T00:00:00.000Z';
  }],
  ['future entitlement', row => {
    row.starts_at = '2099-01-01T00:00:00.000Z';
  }],
  ['invalid start date', row => {
    row.starts_at = 'invalid';
  }],
  ['invalid expiry date', row => {
    row.expires_at = 'invalid';
  }],
  ['missing expiry', row => {
    row.expires_at = null;
  }],
  ['missing subscription', row => {
    row.subscription = null;
  }],
  ['missing attempt', row => {
    row.subscription.attempt = null;
  }],
];

for (const [name, mutate] of invalidRows) {
  test(`fails closed for ${name}`, async () => {
    const f = fixture();
    mutate(f.row);

    const result = await execute(f);
    assert.equal(result.status, 503);
  });
}
