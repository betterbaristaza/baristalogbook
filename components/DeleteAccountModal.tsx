import React from 'react';

interface DeleteAccountModalProps {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

const DeleteAccountModal: React.FC<
  DeleteAccountModalProps
> = ({
  isDeleting,
  onCancel,
  onConfirm,
}) => {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(12,39,72,0.56)] p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
    >
      <section className="w-full max-w-md border border-[var(--bp-danger)] bg-[var(--bp-paper)]">
        <div className="border-b border-[var(--bp-danger)] p-5">
          <p className="bp-index text-[var(--bp-danger)]">
            08.90 / PERMANENT ACTION
          </p>

          <h2
            id="delete-account-title"
            className="bp-heading mt-2 text-2xl text-[var(--bp-blue)]"
          >
            Delete Account
          </h2>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-relaxed text-[var(--bp-blue)]">
            This permanently deletes your profile, coffees, brew logs and uploaded images.
          </p>

          <div className="border-l-2 border-[var(--bp-danger)] pl-4">
            <p className="bp-label text-[var(--bp-danger)]">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-[var(--bp-danger)]">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="bp-label min-h-14 border-r border-[var(--bp-danger)] px-4 text-[var(--bp-blue)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={() =>
              void onConfirm()
            }
            className="min-h-14 bg-[var(--bp-danger)] px-4 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="bp-label">
              {isDeleting
                ? 'Deleting...'
                : 'Delete Account'}
            </span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default DeleteAccountModal;
