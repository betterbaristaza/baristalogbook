import React, { useEffect, useState } from 'react';

import {
  isTestPaymentReference,
  verifyTestPayment,
  type TestPaymentVerification,
} from '../services/paymentVerificationService';

interface TestPaymentReturnProps {
  userId: string;
  reference: string | null;
  onContinue: () => void;
}

type VerificationState =
  | { kind: 'checking' }
  | { kind: 'error'; message: string }
  | { kind: 'complete'; result: TestPaymentVerification };

interface ScopedState {
  userId: string;
  reference: string | null;
  attempt: number;
  value: VerificationState;
}

const TestPaymentReturn: React.FC<TestPaymentReturnProps> = ({
  userId,
  reference,
  onContinue,
}) => {
  const [attempt, setAttempt] = useState(0);
  const [savedState, setSavedState] = useState<ScopedState | null>(null);

  const validReference = isTestPaymentReference(reference);

  // Never display a result from another account, reference or retry.
  const state: VerificationState =
    savedState?.userId === userId
    && savedState.reference === reference
    && savedState.attempt === attempt
      ? savedState.value
      : { kind: 'checking' };

  useEffect(() => {
    if (!userId || !isTestPaymentReference(reference)) {
      return;
    }

    const controller = new AbortController();
    let disposed = false;
    let timedOut = false;

    const publish = (value: VerificationState) => {
      if (disposed) return;

      setSavedState({
        userId,
        reference,
        attempt,
        value,
      });
    };

    publish({ kind: 'checking' });

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();

      publish({
        kind: 'error',
        message:
          'Verification took too long. The payment may still have been saved. Retry verification for this same payment.',
      });
    }, 25000);

    void verifyTestPayment(reference, controller.signal)
      .then(result => {
        if (disposed || timedOut) return;

        publish({ kind: 'complete', result });
      })
      .catch(error => {
        if (disposed || timedOut) return;

        publish({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to verify this TEST payment. Please retry.',
        });
      })
      .finally(() => {
        clearTimeout(timeout);
      });

    return () => {
      disposed = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [userId, reference, attempt]);

  const paymentSaved =
    state.kind === 'complete'
    && state.result.paymentVerified
    && state.result.entitlementApplied;

  const canRetry =
    validReference
    && state.kind !== 'checking'
    && !paymentSaved;

  return (
    <main className="min-h-screen bg-[var(--bp-paper)] px-4 py-12 text-[var(--bp-blue)] sm:px-6">
      <section
        aria-labelledby="test-payment-heading"
        className="mx-auto w-full max-w-xl border border-[var(--bp-line)] bg-[var(--bp-paper-light)]"
      >
        <header className="border-b border-[var(--bp-line)] p-6">
          <p className="bp-label text-[var(--bp-orange)]">
            Paystack TEST mode
          </p>

          <h1
            id="test-payment-heading"
            className="bp-heading mt-3 text-2xl"
          >
            Payment verification
          </h1>
        </header>

        <div className="space-y-5 p-6">
          {!validReference ? (
            <p role="alert" className="text-sm leading-relaxed">
              This return link has a missing or invalid payment reference.
              Payment cannot be confirmed from this link.
            </p>
          ) : (
            <div aria-live="polite" aria-atomic="true">
              {state.kind === 'checking' && (
                <p role="status" className="text-sm leading-relaxed">
                  Checking your TEST payment with the server.
                  Please wait.
                </p>
              )}

              {state.kind === 'error' && (
                <p
                  role="alert"
                  className="text-sm leading-relaxed text-[var(--bp-danger)]"
                >
                  {state.message}
                </p>
              )}

              {state.kind === 'complete' && (
                <div className="space-y-3">
                  <h2 className="bp-heading text-xl">
                    {paymentSaved
                      ? 'TEST payment verified and saved'
                      : 'Payment is not confirmed'}
                  </h2>

                  <p className="text-sm">
                    Plan:{' '}
                    {state.result.planCode === 'pro_annual'
                      ? 'Brewprint Pro Annual'
                      : 'Brewprint Pro Monthly'}
                  </p>

                  {!paymentSaved && (
                    <>
                      <p className="text-sm">
                        Provider status: {state.result.paymentStatus}
                      </p>

                      <p className="text-sm leading-relaxed">
                        You can check this same payment again.
                        This screen does not start another checkout.
                      </p>
                    </>
                  )}

                  {paymentSaved && (
                    <p className="text-sm leading-relaxed">
                      Open Profile to check your current TEST status
                      and expiry.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <p className="text-sm leading-relaxed text-[var(--bp-muted)]">
            TEST payments do not unlock production Pro features.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            {canRetry && (
              <button
                type="button"
                onClick={() => setAttempt(value => value + 1)}
                className="bp-label min-h-12 border border-[var(--bp-line)] bg-[var(--bp-orange)] px-5 py-3"
              >
                Retry verification
              </button>
            )}

            <button
              type="button"
              onClick={onContinue}
              className="bp-label min-h-12 border border-[var(--bp-line)] px-5 py-3"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TestPaymentReturn;
