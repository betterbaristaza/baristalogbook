import React from 'react';

import {
  BrewprintMark,
  BrewprintWordmark,
} from './BrewprintBrand';

interface OnboardingWelcomeProps {
  onStart: () => void;
  onSkip: () => void;
}

const OnboardingWelcome: React.FC<
  OnboardingWelcomeProps
> = ({ onStart, onSkip }) => {
  const steps = [
    {
      code: '01',
      title: 'Set up your profile',
      description:
        'Add your preferred brew method, grinder and brewer.',
    },
    {
      code: '02',
      title: 'Add your first coffee',
      description:
        'Record the coffee you are currently brewing.',
    },
    {
      code: '03',
      title: 'Log your first brew',
      description:
        'Build a history you can compare as you dial in.',
    },
  ];

  return (
    <div className="bp-page min-h-screen">
      <div className="bp-grid min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
          <div className="w-full max-w-2xl">
            <header className="mb-4 flex items-center justify-between border-b border-[var(--bp-line)] pb-4">
              <div className="flex items-center gap-3">
                <BrewprintMark className="h-9 w-9" />

                <BrewprintWordmark className="h-[16px] w-auto" />
              </div>

              <span className="bp-code text-[var(--bp-muted)]">
                SETUP / V1
              </span>
            </header>

            <main className="border border-[var(--bp-line)] bg-[var(--bp-paper)]">
              <section className="border-b border-[var(--bp-line)] p-5 sm:p-7">
                <p className="bp-label text-[var(--bp-orange)]">
                  00.10 / INITIAL SETUP
                </p>

                <div className="mt-4 max-w-xl">
                  <h1 className="bp-heading text-4xl leading-[1.05] text-[var(--bp-blue)] sm:text-5xl">
                    Build better brews,
                    <br />
                    one record at a time.
                  </h1>

                  <p className="mt-5 max-w-lg text-sm leading-relaxed text-[var(--bp-muted)] sm:text-base">
                    BREWPRINT gives you a structured record of your coffees,
                    recipes and results so you can compare what changed and
                    improve the next cup.
                  </p>
                </div>
              </section>

              <section className="border-b border-[var(--bp-line)]">
                <div className="flex items-center justify-between border-b border-[var(--bp-line)] px-5 py-3 sm:px-7">
                  <p className="bp-label text-[var(--bp-blue)]">
                    Setup Sequence
                  </p>

                  <p className="bp-code text-[var(--bp-muted)]">
                    03 STEPS
                  </p>
                </div>

                <div>
                  {steps.map((step, index) => (
                    <div
                      key={step.code}
                      className={`grid grid-cols-[72px_1fr] ${
                        index < steps.length - 1
                          ? 'border-b border-[var(--bp-line)]'
                          : ''
                      }`}
                    >
                      <div className="flex min-h-24 items-center justify-center border-r border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
                        <span className="bp-measurement text-2xl font-semibold text-[var(--bp-orange)]">
                          {step.code}
                        </span>
                      </div>

                      <div className="flex min-h-24 flex-col justify-center px-5 py-4 sm:px-6">
                        <p className="bp-label text-[var(--bp-blue)]">
                          {step.title}
                        </p>

                        <p className="mt-2 text-sm leading-relaxed text-[var(--bp-muted)]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-5 sm:p-7">
                <button
                  type="button"
                  onClick={onStart}
                  className="flex min-h-16 w-full items-center justify-between bg-[var(--bp-orange)] px-5 text-left text-[var(--bp-blue)]"
                >
                  <div>
                    <p className="bp-label">
                      Guided Setup
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      Get Started
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className="bp-code text-xl"
                  >
                    →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onSkip}
                  className="bp-label mt-3 min-h-12 w-full border border-[var(--bp-line)] px-4 text-[var(--bp-blue)]"
                >
                  Skip Setup For Now
                </button>
              </section>
            </main>

            <footer className="mt-4 flex items-center justify-between border-t border-[var(--bp-line)] pt-3">
              <p className="bp-code text-[var(--bp-muted)]">
                RECORD / BREW / COMPARE / IMPROVE
              </p>

              <p className="bp-code text-[var(--bp-muted)]">
                BREWPRINT
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWelcome;
