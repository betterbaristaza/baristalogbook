import React, { useEffect, useState } from 'react';

import {
  getTestBillingStatus,
  type TestBillingStatus,
} from '../services/testBillingService';

interface TestBillingAccessProps {
  enabled: boolean;
  children: React.ReactNode;
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; status: TestBillingStatus };

const TestBillingAccess: React.FC<TestBillingAccessProps> = ({
  enabled,
  children,
}) => {
  const [state, setState] = useState<LoadState>({
    kind: 'loading',
  });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setState({ kind: 'loading' });
      return;
    }

    const controller = new AbortController();
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;

    setState({ kind: 'loading' });

    void getTestBillingStatus(controller.signal)
      .then(status => {
        if (controller.signal.aborted) return;

        setState({ kind: 'loaded', status });

        if (status.testAccessActive) {
          // Use server timestamps so the browser clock cannot extend access.
          const remaining =
            Date.parse(status.expiresAt) - Date.parse(status.checkedAt);

          expiryTimer = setTimeout(() => {
            setState({ kind: 'loading' });
            setRevision(value => value + 1);
          }, Math.min(Math.max(remaining, 1000), 2_147_483_647));
        }
      })
      .catch(error => {
        if (controller.signal.aborted) return;

        setState({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to check TEST access.',
        });
      });

    const refresh = () => {
      if (document.visibilityState === 'visible') {
        setState({ kind: 'loading' });
        setRevision(value => value + 1);
      }
    };

    document.addEventListener('visibilitychange', refresh);

    return () => {
      controller.abort();
      clearTimeout(expiryTimer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [enabled, revision]);

  if (!enabled) {
    return <>{children}</>;
  }

  if (state.kind === 'loading') {
    return (
      <div
        role="status"
        className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-5"
      >
        <p className="bp-code text-[var(--bp-muted)]">
          Checking TEST access...
        </p>
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-5">
        <p role="alert" className="text-sm text-[var(--bp-danger)]">
          {state.message}
        </p>

        <button
          type="button"
          onClick={() => {
            setState({ kind: 'loading' });
            setRevision(value => value + 1);
          }}
          className="bp-label mt-4 min-h-11 border border-[var(--bp-line)] px-4 text-[var(--bp-blue)]"
        >
          Retry access check
        </button>
      </div>
    );
  }

  if (!state.status.testAccessActive) {
    return <>{children}</>;
  }

  const { planCode, expiresAt } = state.status;
  const expiryLabel = new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Africa/Johannesburg',
  }).format(new Date(expiresAt));

  return (
    <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
      <div className="border-b border-[var(--bp-line)] p-5">
        <p className="bp-label text-[var(--bp-orange)]">
          Paystack TEST mode
        </p>

        <h3 className="bp-heading mt-2 text-xl text-[var(--bp-blue)]">
          TEST Pro access active
        </h3>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="bp-code text-[var(--bp-muted)]">
            Verified plan
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--bp-blue)]">
            {planCode === 'pro_annual'
              ? 'Brewprint Pro Annual'
              : 'Brewprint Pro Monthly'}
          </p>
        </div>

        <div>
          <p className="bp-code text-[var(--bp-muted)]">
            TEST access until
          </p>
          <p className="mt-2 text-sm text-[var(--bp-blue)]">
            <time dateTime={expiresAt}>{expiryLabel}</time>
            {' SAST'}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-[var(--bp-muted)]">
          Your TEST payment is verified. This status does not unlock
          production Pro features. Plan changes are not available yet.
        </p>
      </div>
    </div>
  );
};

export default TestBillingAccess;
