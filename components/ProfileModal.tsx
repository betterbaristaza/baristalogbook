import React, {
  useState,
} from 'react';

import {
  BrewMethod,
  UserProfile,
} from '../types';

import { Icons } from '../constants';

interface ProfileModalProps {
  initialData?: UserProfile;
  onSave: (
    profile: UserProfile
  ) => void | Promise<void>;
  onCancel?: () => void;
  onDeleteAccount?: () => void;
  isFirstLaunch?: boolean;
}

const ROLES = [
  'Home Brewer',
  'Barista',
  'Trainer',
  'Roaster',
  'Coffee Enthusiast',
];

const ProfileModal: React.FC<
  ProfileModalProps
> = ({
  initialData,
  onSave,
  onCancel,
  onDeleteAccount,
  isFirstLaunch,
}) => {
  const [formData, setFormData] =
    useState<UserProfile>(
      initialData || {
        name: '',
        role: 'Home Brewer',
        defaultMethod: 'all',
        defaultGrinder: '',
        defaultBrewer: '',
      }
    );

  const [isSaving, setIsSaving] =
    useState(false);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        ...formData,
        name: formData.name.trim(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl border-x border-[var(--bp-line)] bg-[var(--bp-paper)] sm:border">
      <div
        className="sticky top-0 z-20 border-b border-[var(--bp-line)] bg-[var(--bp-paper)] px-4 pb-4 sm:px-6"
        style={{
          paddingTop:
            'calc(env(safe-area-inset-top) + 1rem)',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="bp-index">
              08 / PROFILE EDITOR
            </p>

            <h2 className="bp-heading mt-1 text-2xl text-[var(--bp-blue)]">
              {isFirstLaunch
                ? 'Create Profile'
                : 'Edit Profile'}
            </h2>

            <p className="bp-code mt-2 text-[var(--bp-muted)]">
              Identity and default brewing setup.
            </p>
          </div>

          {!isFirstLaunch &&
            onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="bp-button h-10 min-h-0 px-3"
              >
                Close
              </button>
            )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 px-4 py-6 sm:px-6"
      >
        <section>
          <div className="mb-3">
            <p className="bp-index">
              08.01 / IDENTITY
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Brewer Identity
            </h3>
          </div>

          <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
            <div className="border-b border-[var(--bp-line)] p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Display Name
              </label>

              <input
                type="text"
                required
                value={formData.name}
                onChange={event =>
                  setFormData({
                    ...formData,
                    name: event.target.value,
                  })
                }
                placeholder="Your name"
                className="bp-input mt-2 w-full"
              />
            </div>

            <div className="p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Role
              </label>

              <select
                value={formData.role}
                onChange={event =>
                  setFormData({
                    ...formData,
                    role: event.target.value,
                  })
                }
                className="bp-input mt-2 w-full"
              >
                {ROLES.map(role => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3">
            <p className="bp-index">
              08.02 / DEFAULTS
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Brewing Defaults
            </h3>

            <p className="bp-code mt-1 text-[var(--bp-muted)]">
              Used as starting values when creating brew records.
            </p>
          </div>

          <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
            <div className="border-b border-[var(--bp-line)] p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Default Brew Method
              </label>

              <select
                value={formData.defaultMethod}
                onChange={event =>
                  setFormData({
                    ...formData,
                    defaultMethod:
                      event.target.value,
                  })
                }
                className="bp-input mt-2 w-full"
              >
                <option value="all">
                  Not Specified
                </option>

                {Object.values(
                  BrewMethod
                ).map(method => (
                  <option
                    key={method}
                    value={method}
                  >
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="border-b border-[var(--bp-line)] p-4 sm:border-b-0 sm:border-r">
                <label className="bp-label text-[var(--bp-muted)]">
                  Default Grinder
                </label>

                <input
                  type="text"
                  value={
                    formData.defaultGrinder
                  }
                  onChange={event =>
                    setFormData({
                      ...formData,
                      defaultGrinder:
                        event.target.value,
                    })
                  }
                  placeholder="e.g. Comandante C40"
                  className="bp-input mt-2 w-full"
                />
              </div>

              <div className="p-4">
                <label className="bp-label text-[var(--bp-muted)]">
                  Default Machine / Brewer
                </label>

                <input
                  type="text"
                  value={
                    formData.defaultBrewer
                  }
                  onChange={event =>
                    setFormData({
                      ...formData,
                      defaultBrewer:
                        event.target.value,
                    })
                  }
                  placeholder="e.g. V60 or espresso machine"
                  className="bp-input mt-2 w-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3">
            <p className="bp-index">
              08.03 / SYNC
            </p>
          </div>

          <div className="flex items-start gap-3 border border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-4">
            <Icons.Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bp-blue)]" />

            <p className="bp-code leading-relaxed text-[var(--bp-muted)]">
              Your profile and brew data are synced securely to your authenticated account.
            </p>
          </div>
        </section>

        {!isFirstLaunch &&
          onDeleteAccount && (
            <section>
              <div className="mb-3">
                <p className="bp-index text-[var(--bp-danger)]">
                  08.04 / ACCOUNT
                </p>
              </div>

              <button
                type="button"
                onClick={onDeleteAccount}
                className="bp-label min-h-14 w-full border border-[var(--bp-danger)] px-4 text-[var(--bp-danger)]"
              >
                Delete Account
              </button>
            </section>
          )}

        <div className="grid grid-cols-1 border border-[var(--bp-line)] sm:grid-cols-2">
          {!isFirstLaunch &&
          onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="bp-label min-h-14 border-b border-[var(--bp-line)] px-4 text-[var(--bp-blue)] disabled:opacity-50 sm:border-b-0 sm:border-r"
            >
              Cancel
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="min-h-14 bg-[var(--bp-orange)] px-4 text-[var(--bp-blue)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="bp-label">
              {isSaving
                ? 'Saving...'
                : isFirstLaunch
                  ? 'Start Brewing'
                  : 'Save Profile'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileModal;
