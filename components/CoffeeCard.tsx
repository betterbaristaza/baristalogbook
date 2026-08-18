import React from 'react';
import { CoffeeBean } from '../types';
import { Icons } from '../constants';

interface CoffeeCardProps {
  coffee: CoffeeBean;
  onClick: (coffee: CoffeeBean) => void;
  onEdit: (coffee: CoffeeBean) => void;
  onDelete: (coffee: CoffeeBean) => void;
}

const CoffeeCard: React.FC<CoffeeCardProps> = ({
  coffee,
  onClick,
  onEdit,
  onDelete,
}) => {
  const progress =
    coffee.totalWeight > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (coffee.remainingWeight / coffee.totalWeight) * 100
          )
        )
      : 0;

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit(coffee);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(coffee);
  };

  return (
    <article
      onClick={() => onClick(coffee)}
      className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition-all hover:border-stone-300 hover:shadow-md"
    >
      {(coffee.bagImage || coffee.labelImage) && (
        <div
          className={`grid gap-px bg-stone-200 ${
            coffee.bagImage && coffee.labelImage
              ? 'grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {coffee.bagImage && (
            <div className="overflow-hidden bg-stone-100">
              <img
                src={coffee.bagImage}
                alt={`${coffee.name} front of bag`}
                className="h-36 w-full object-cover sm:h-44"
              />
            </div>
          )}

          {coffee.labelImage && (
            <div className="overflow-hidden bg-stone-100">
              <img
                src={coffee.labelImage}
                alt={`${coffee.name} back of bag`}
                className="h-36 w-full object-cover sm:h-44"
              />
            </div>
          )}
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="mb-1 truncate text-[10px] font-black uppercase tracking-[0.2em] text-amber-800">
              {coffee.roaster || 'Roaster not added'}
            </p>

            <h3 className="text-xl font-bold leading-tight text-stone-900 display-font">
              {coffee.name}
            </h3>
          </div>

          <span className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-stone-600">
            {coffee.roastLevel}
          </span>
        </div>

        <div className="my-5 grid grid-cols-2 divide-x divide-stone-200 border-y border-stone-100 py-4">
          <div className="min-w-0 pr-4">
            <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-stone-400">
              Origin
            </p>

            <p className="truncate text-sm font-semibold text-stone-700">
              {coffee.origin || 'Not recorded'}
            </p>
          </div>

          <div className="min-w-0 pl-4">
            <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-stone-400">
              Process
            </p>

            <p className="truncate text-sm font-semibold text-stone-700">
              {coffee.process || 'Not recorded'}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-end justify-between gap-4">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-400">
              Coffee remaining
            </p>

            <p className="font-mono text-xs font-bold text-stone-700">
              {coffee.remainingWeight}g
              <span className="text-stone-400">
                {' '}
                / {coffee.totalWeight}g
              </span>
            </p>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-amber-800 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-400">
            Tap card to log a brew
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleEdit}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 transition-colors hover:border-amber-200 hover:text-amber-800"
              title="Edit coffee"
              aria-label={`Edit ${coffee.name}`}
            >
              <Icons.Edit className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-400 transition-colors hover:border-rose-200 hover:text-rose-600"
              title="Delete coffee"
              aria-label={`Delete ${coffee.name}`}
            >
              <Icons.Trash className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CoffeeCard;