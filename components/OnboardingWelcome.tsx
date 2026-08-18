import React from 'react';
import { Icons } from '../constants';

interface OnboardingWelcomeProps {
  onStart: () => void;
  onSkip: () => void;
}

const OnboardingWelcome: React.FC<
  OnboardingWelcomeProps
> = ({ onStart, onSkip }) => {
  return (
    <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mb-8">
            <Icons.Coffee className="w-8 h-8" />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-800 mb-3">
            Barista Logbook
          </p>

          <h1 className="text-4xl font-black text-stone-900 display-font leading-tight">
            Build better brews,
            <br />
            one cup at a time.
          </h1>

          <p className="text-stone-500 mt-5 leading-relaxed">
            Save your coffees, record your brew recipes and
            compare results as you dial in.
          </p>
        </div>

        <div className="space-y-4 mb-10">
          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-black text-xs text-amber-800 shrink-0">
              1
            </div>

            <div>
              <p className="font-bold text-stone-800">
                Set up your profile
              </p>
              <p className="text-sm text-stone-400">
                Add your preferred equipment and brew method.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-black text-xs text-amber-800 shrink-0">
              2
            </div>

            <div>
              <p className="font-bold text-stone-800">
                Add your first coffee
              </p>
              <p className="text-sm text-stone-400">
                Record the coffee you are currently brewing.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-black text-xs text-amber-800 shrink-0">
              3
            </div>

            <div>
              <p className="font-bold text-stone-800">
                Log your first brew
              </p>
              <p className="text-sm text-stone-400">
                Start building a history you can compare.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="w-full bg-stone-900 text-white py-5 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95 transition-all"
        >
          Get Started
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full mt-4 py-3 text-sm font-semibold text-stone-400 hover:text-stone-700 transition-colors"
        >
          Skip setup for now
        </button>
      </div>
    </div>
  );
};

export default OnboardingWelcome;