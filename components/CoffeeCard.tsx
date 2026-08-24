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
            (coffee.remainingWeight /
              coffee.totalWeight) *
              100
          )
        )
      : 0;

  const handleEdit = (
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    onEdit(coffee);
  };

  const handleDelete = (
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    onDelete(coffee);
  };

  return (
    <article
      onClick={() => onClick(coffee)}
      className="group cursor-pointer border border-[var(--bp-line)] bg-[var(--bp-paper-light)]"
    >
      {(coffee.bagImage ||
        coffee.labelImage) && (
        <div
          className={`grid gap-px border-b border-[var(--bp-line)] bg-[var(--bp-line)] ${
            coffee.bagImage &&
            coffee.labelImage
              ? 'grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {coffee.bagImage && (
            <div className="overflow-hidden bg-[var(--bp-paper-dark)]">
              <img
                src={coffee.bagImage}
                alt={`${coffee.name} front of bag`}
                className="h-36 w-full object-cover sm:h-44"
              />
            </div>
          )}

          {coffee.labelImage && (
            <div className="overflow-hidden bg-[var(--bp-paper-dark)]">
              <img
                src={coffee.labelImage}
                alt={`${coffee.name} back of bag`}
                className="h-36 w-full object-cover sm:h-44"
              />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto] border-b border-[var(--bp-line)]">
        <div className="min-w-0 p-5">
          <p className="bp-label text-[var(--bp-orange)]">
            {coffee.roaster ||
              'Roaster not added'}
          </p>

          <h3 className="bp-coffee-name mt-2 text-2xl leading-tight text-[var(--bp-blue)]">
            {coffee.name}
          </h3>
        </div>

        <div className="flex min-w-[90px] flex-col items-center justify-center border-l border-[var(--bp-line)] px-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Roast
          </p>

          <p className="bp-code mt-2 text-center text-[var(--bp-blue)]">
            {coffee.roastLevel ||
              'Not set'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b border-[var(--bp-line)]">
        <div className="min-w-0 border-r border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Origin
          </p>

          <p className="bp-code mt-2 truncate text-[var(--bp-blue)]">
            {coffee.origin ||
              'Not recorded'}
          </p>
        </div>

        <div className="min-w-0 p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Process
          </p>

          <p className="bp-code mt-2 truncate text-[var(--bp-blue)]">
            {coffee.process ||
              'Not recorded'}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="bp-label text-[var(--bp-muted)]">
              Coffee remaining
            </p>

            <div className="mt-2 flex items-end gap-2">
              <p className="bp-measurement text-2xl font-semibold text-[var(--bp-blue)]">
                {coffee.remainingWeight}
              </p>

              <span className="bp-code pb-0.5 text-[var(--bp-muted)]">
                G
              </span>
            </div>
          </div>

          <p className="bp-code text-right text-[var(--bp-muted)]">
            {Math.round(progress)}%
            <br />
            {coffee.totalWeight}G TOTAL
          </p>
        </div>

        <div className="mt-4 h-[3px] bg-[var(--bp-paper-dark)]">
          <div
            className="h-full bg-[var(--bp-orange)] transition-[width] duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] border-t border-[var(--bp-line)]">
  <button
    type="button"
    onClick={() => onClick(coffee)}
    className="flex items-center justify-between px-4 py-4 text-left"
  >
    <div>
      <p className="bp-label text-[var(--bp-muted)]">
        Brew from record
      </p>

      <p className="bp-code mt-1 text-[var(--bp-blue)]">
        Open coffee
      </p>
    </div>

    <Icons.Coffee className="h-4 w-4 text-[var(--bp-blue)]" />
  </button>

  <button
    type="button"
    onClick={handleEdit}
    className="flex w-14 items-center justify-center border-l border-[var(--bp-line)] text-[var(--bp-blue)]"
    title="Edit coffee"
    aria-label={`Edit ${coffee.name}`}
  >
    <Icons.Edit className="h-4 w-4" />
  </button>

  <button
    type="button"
    onClick={handleDelete}
    className="flex w-14 items-center justify-center border-l border-[var(--bp-line)] text-[var(--bp-danger)]"
    title="Delete coffee"
    aria-label={`Delete ${coffee.name}`}
  >
    <Icons.Trash className="h-4 w-4" />
  </button>
</div>
    </article>
  );
};

export default CoffeeCard;