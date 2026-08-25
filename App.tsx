import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  BrewLog,
  BrewMethod,
  CoffeeBean,
  UserProfile,
} from './types';

import { Icons } from './constants';

import CoffeeCard from './components/CoffeeCard';
import BrewForm from './components/BrewForm';
import CoffeeBeanForm from './components/CoffeeBeanForm';
import ProfileModal from './components/ProfileModal';
import ProfileView from './components/ProfileView';
import DeleteAccountModal from './components/DeleteAccountModal';
import GrindReference from './components/GrindReference';
import AnalyticsView from './components/AnalyticsView';
import AuthScreen from './components/AuthScreen';
import OnboardingWelcome from './components/OnboardingWelcome';
import HomeDashboard from './components/HomeDashboard';
import {
  BrewprintIcon,
  BrewprintMark,
  BrewprintWordmark,
} from './components/BrewprintBrand';

import { useAuth } from './context/AuthContext';

import { coffeeService } from './services/coffeeService';
import { brewLogService } from './services/brewLogService';
import { profileService } from './services/profileService';
import { imageService } from './services/imageService';
import { accountService } from './services/accountService';

interface BrewDetailCellProps {
  label: string;
  value: React.ReactNode;
}

const BrewDetailCell: React.FC<BrewDetailCellProps> = ({
  label,
  value,
}) => (
  <div className="bg-[var(--bp-paper-light)] p-4">
    <p className="bp-label text-[var(--bp-muted)]">
      {label}
    </p>

    <div className="bp-code mt-2 break-words text-[var(--bp-blue)]">
      {value}
    </div>
  </div>
);

interface BrewDetailViewProps {
  log: BrewLog;
  coffee?: CoffeeBean;
  onBack: () => void;
  onEdit: () => void;
  onBrewAgain: () => void;
  onDelete: () => void;
}

const BrewDetailView: React.FC<BrewDetailViewProps> = ({
  log,
  coffee,
  onBack,
  onEdit,
  onBrewAgain,
  onDelete,
}) => {
  const ratio =
    log.dose > 0 && log.yield > 0
      ? `1:${(log.yield / log.dose).toFixed(1)}`
      : '—';

  const displayDate = new Date(log.date).toLocaleString();

  const sensoryValues = [
    ['Aroma', log.aroma],
    ['Acidity', log.acidity],
    ['Sweetness', log.sweetness],
    ['Bitterness', log.bitterness],
    ['Body', log.body],
    ['Aftertaste', log.aftertaste],
  ] as const;

  return (
    <div className="space-y-8">
      <section className="border-b border-[var(--bp-line)] pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="bp-index">
              06 / BREW DETAIL
            </p>

            <p className="bp-label mt-3 text-[var(--bp-orange)]">
              {log.method}
            </p>

            <h1 className="bp-coffee-name mt-2 break-words text-4xl text-[var(--bp-blue)]">
              {coffee?.name || 'Unknown Coffee'}
            </h1>

            <p className="bp-code mt-2 text-[var(--bp-muted)]">
              {coffee?.roaster || 'Roaster not recorded'}
            </p>

            <p className="bp-code mt-1 text-[var(--bp-muted)]">
              {displayDate}
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="bp-button h-10 min-h-0 px-3"
          >
            Back
          </button>
        </div>
      </section>

      {log.brewImage && (
        <section className="overflow-hidden border border-[var(--bp-line)] bg-[var(--bp-paper-dark)]">
          <img
            src={log.brewImage}
            alt={`${coffee?.name || 'Coffee'} brew`}
            className="max-h-[420px] w-full object-cover"
          />
        </section>
      )}

      <section>
        <div className="mb-3">
          <p className="bp-index">
            06.01 / RECIPE
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Brew Parameters
          </h2>
        </div>

        <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--bp-line)]">
            <div className="p-5 text-center">
              <p className="bp-label text-[var(--bp-muted)]">
                Dose
              </p>

              <p className="bp-measurement mt-2 text-3xl font-semibold text-[var(--bp-blue)]">
                {log.dose}
                <span className="ml-1 text-sm">
                  G
                </span>
              </p>
            </div>

            <div className="px-2 text-xl text-[var(--bp-orange)]">
              →
            </div>

            <div className="border-l border-[var(--bp-line)] p-5 text-center">
              <p className="bp-label text-[var(--bp-muted)]">
                Yield
              </p>

              <p className="bp-measurement mt-2 text-3xl font-semibold text-[var(--bp-blue)]">
                {log.yield}
                <span className="ml-1 text-sm">
                  G
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3">
            <div className="border-r border-[var(--bp-line)] p-4">
              <p className="bp-label text-[var(--bp-muted)]">
                Ratio
              </p>

              <p className="bp-measurement mt-2 text-xl font-semibold text-[var(--bp-blue)]">
                {ratio}
              </p>
            </div>

            <div className="border-r border-[var(--bp-line)] p-4">
              <p className="bp-label text-[var(--bp-muted)]">
                Time
              </p>

              <p className="bp-measurement mt-2 text-xl font-semibold text-[var(--bp-blue)]">
                {log.brewTime > 0
                  ? `${log.brewTime}${
                      log.method === BrewMethod.COLD_BREW
                        ? ' HR'
                        : ' S'
                    }`
                  : '—'}
              </p>
            </div>

            <div className="p-4">
              <p className="bp-label text-[var(--bp-muted)]">
                Temperature
              </p>

              <p className="bp-measurement mt-2 text-xl font-semibold text-[var(--bp-blue)]">
                {log.waterTemp
                  ? `${log.waterTemp}°C`
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="bp-index">
            06.02 / CONTEXT
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Brew Context
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-px border border-[var(--bp-line)] bg-[var(--bp-line)]">
          <BrewDetailCell
            label="Grinder"
            value={log.grinder || '—'}
          />

          <BrewDetailCell
            label="Grind Setting"
            value={log.grindSetting || '—'}
          />

          <BrewDetailCell
            label="Barista"
            value={log.baristaName || '—'}
          />

          <BrewDetailCell
            label="Site"
            value={log.site || '—'}
          />

          <div className="col-span-2">
            <BrewDetailCell
              label="Water"
              value={log.waterType || 'Not recorded'}
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="bp-index">
            06.03 / EQUIPMENT
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            {log.method} Setup
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-px border border-[var(--bp-line)] bg-[var(--bp-line)]">
          {log.method === BrewMethod.ESPRESSO && (
            <>
              <BrewDetailCell
                label="Machine"
                value={
                  log.machine ||
                  log.machineBrand ||
                  '—'
                }
              />

              <BrewDetailCell
                label="Basket"
                value={log.basketType || '—'}
              />

              <BrewDetailCell
                label="Distribution"
                value={log.distributionTool || '—'}
              />

              <BrewDetailCell
                label="Pressure"
                value={
                  log.pressure !== undefined
                    ? `${log.pressure} BAR`
                    : '—'
                }
              />

              <BrewDetailCell
                label="Puck Screen"
                value={log.puckScreen ? 'YES' : 'NO'}
              />

              <BrewDetailCell
                label="Shot Result"
                value={log.shotResult || '—'}
              />
            </>
          )}

          {log.method === BrewMethod.POUR_OVER && (
            <>
              <BrewDetailCell
                label="Brewer"
                value={
                  [log.brewerBrand, log.brewer]
                    .filter(Boolean)
                    .join(' ') || '—'
                }
              />

              <BrewDetailCell
                label="Filter Paper"
                value={log.filterType || '—'}
              />

              <BrewDetailCell
                label="Bloom"
                value={
                  log.bloomTime !== undefined
                    ? `${log.bloomTime} S`
                    : '—'
                }
              />

              <BrewDetailCell
                label="Pour Structure"
                value={log.pourStructure || '—'}
              />

              <div className="col-span-2">
                <BrewDetailCell
                  label="Pour Volumes"
                  value={log.pourVolumes || '—'}
                />
              </div>
            </>
          )}

          {log.method === BrewMethod.AEROPRESS && (
            <>
              <BrewDetailCell
                label="AeroPress Model"
                value={log.aeroPressModel || '—'}
              />

              <BrewDetailCell
                label="Style"
                value={log.aeroMethod || '—'}
              />

              <BrewDetailCell
                label="Filter Cap"
                value={log.filterCapUsed || '—'}
              />

              <BrewDetailCell
                label="Steep"
                value={
                  log.steepTime !== undefined
                    ? `${log.steepTime} S`
                    : '—'
                }
              />

              <BrewDetailCell
                label="Plunge"
                value={
                  log.plungeTime !== undefined
                    ? `${log.plungeTime} S`
                    : '—'
                }
              />

              <BrewDetailCell
                label="Volumes"
                value={log.aeroPourVolumes || '—'}
              />
            </>
          )}

          {log.method === BrewMethod.FRENCH_PRESS && (
            <>
              <BrewDetailCell
                label="Vessel"
                value={log.brewerBrand || '—'}
              />

              <BrewDetailCell
                label="Immersion"
                value={
                  log.steepTime !== undefined
                    ? `${log.steepTime} S`
                    : '—'
                }
              />

              <BrewDetailCell
                label="Plunge Wait"
                value={
                  log.timeBeforePlunge !== undefined
                    ? `${log.timeBeforePlunge} S`
                    : '—'
                }
              />

              <BrewDetailCell
                label="Agitation"
                value={log.agitation || '—'}
              />

              <div className="col-span-2">
                <BrewDetailCell
                  label="Agitation Duration"
                  value={
                    log.agitationDuration !== undefined
                      ? `${log.agitationDuration} S`
                      : '—'
                  }
                />
              </div>
            </>
          )}

          {log.method === BrewMethod.MOKA_POT && (
            <>
              <BrewDetailCell
                label="Pot"
                value={
                  [log.brewerBrand, log.mokaPotModel]
                    .filter(Boolean)
                    .join(' ') || '—'
                }
              />

              <BrewDetailCell
                label="Water Start"
                value={log.waterStartTemp || '—'}
              />

              <BrewDetailCell
                label="Heat"
                value={log.flameControl || '—'}
              />

              <BrewDetailCell
                label="AeroPress Filter"
                value={
                  log.isAeropressFilterUsed
                    ? 'YES'
                    : 'NO'
                }
              />
            </>
          )}

          {log.method === BrewMethod.COLD_BREW && (
            <>
              <BrewDetailCell
                label="System"
                value={log.coldBrewSystem || '—'}
              />

              <BrewDetailCell
                label="Type"
                value={log.coldBrewType || '—'}
              />

              <div className="col-span-2">
                <BrewDetailCell
                  label="Steep Time"
                  value={
                    log.steepTime !== undefined
                      ? `${log.steepTime} HR`
                      : '—'
                  }
                />
              </div>
            </>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="bp-index">
            06.04 / SENSORY
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Sensory Profile
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-px border border-[var(--bp-line)] bg-[var(--bp-line)] sm:grid-cols-3">
          {sensoryValues.map(([label, value]) => (
            <BrewDetailCell
              key={label}
              label={label}
              value={`${value}/5`}
            />
          ))}
        </div>
      </section>

      {log.flavorGroups &&
        log.flavorGroups.length > 0 && (
          <section>
            <div className="mb-3">
              <p className="bp-index">
                06.05 / FLAVOUR GROUPS
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {log.flavorGroups.map(group => (
                <span
                  key={group}
                  className="border border-[var(--bp-line)] px-3 py-2 bp-code text-[var(--bp-blue)]"
                >
                  {group}
                </span>
              ))}
            </div>
          </section>
        )}

      <section>
        <div className="mb-3">
          <p className="bp-index">
            06.06 / TASTE
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Notes
          </h2>
        </div>

        <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
          <div className="border-b border-[var(--bp-line)] p-4">
            <p className="bp-label text-[var(--bp-muted)]">
              Tasting Notes
            </p>

            <p className="mt-2 text-sm leading-relaxed text-[var(--bp-blue)]">
              {log.tastingNotes &&
              log.tastingNotes.length > 0
                ? log.tastingNotes.join(' / ')
                : 'Not recorded'}
            </p>
          </div>

          <div className="p-4">
            <p className="bp-label text-[var(--bp-muted)]">
              Process Notes
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--bp-blue)]">
              {log.processNotes || 'Not recorded'}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="bp-index">
            06.07 / RESULT
          </p>
        </div>

        <div className="grid grid-cols-[1fr_auto] border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
          <div className="p-5">
            <p className="bp-label text-[var(--bp-muted)]">
              Overall Rating
            </p>

            <p className="bp-measurement mt-2 text-4xl font-semibold text-[var(--bp-blue)]">
              {log.rating}/5
            </p>
          </div>

          <div className="flex min-w-[90px] items-center justify-center border-l border-[var(--bp-line)]">
            <Icons.Star className="h-7 w-7 fill-current text-[var(--bp-orange)]" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 border border-[var(--bp-line)] sm:grid-cols-4">
        <button
          type="button"
          onClick={onEdit}
          className="bp-label min-h-14 border-b border-r border-[var(--bp-line)] px-3 text-[var(--bp-blue)] sm:border-b-0"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={onBrewAgain}
          className="bp-label min-h-14 border-b border-[var(--bp-line)] px-3 text-[var(--bp-blue)] sm:border-b-0 sm:border-r"
        >
          Brew Again
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="bp-label min-h-14 border-r border-[var(--bp-line)] px-3 text-[var(--bp-danger)]"
        >
          Delete
        </button>

        <button
          type="button"
          onClick={onBack}
          className="min-h-14 bg-[var(--bp-orange)] px-3 text-[var(--bp-blue)]"
        >
          <span className="bp-label">
            Done
          </span>
        </button>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const {
    user,
    loading,
    passwordRecovery,
    signOut,
  } = useAuth();

  const [coffees, setCoffees] = useState<CoffeeBean[]>(
    []
  );

  const [coffeesLoading, setCoffeesLoading] =
    useState(true);

  const [brewLogs, setBrewLogs] = useState<BrewLog[]>(
    []
  );

  const [brewLogsLoading, setBrewLogsLoading] =
    useState(true);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [showProfileModal, setShowProfileModal] =
    useState(false);

  const [
    showDeleteAccountModal,
    setShowDeleteAccountModal,
  ] = useState(false);

  const [
    isDeletingAccount,
    setIsDeletingAccount,
  ] = useState(false);

  const [viewingCoffee, setViewingCoffee] =
    useState<CoffeeBean | null>(null);

  const [onboardingStep, setOnboardingStep] =
    useState<
      'welcome' | 'profile' | 'coffee' | 'brew' | null
    >(null);

  const [
    onboardingInitialized,
    setOnboardingInitialized,
  ] = useState(false);

  const [activeTab, setActiveTab] = useState<
    | 'home'
    | 'journal'
    | 'library'
    | 'grind'
    | 'community'
    | 'analytics'
    | 'profile'
  >('home');

  const [searchQuery, setSearchQuery] = useState('');

  const [methodFilter, setMethodFilter] = useState<
    BrewMethod | 'all'
  >('all');

  const [ratingFilter, setRatingFilter] = useState<
    number | 'all'
  >('all');

  const [dateRange, setDateRange] = useState<
    'all' | 'today' | 'week' | 'month'
  >('all');

  const [showFilters, setShowFilters] =
    useState(false);

  const [showBeanForm, setShowBeanForm] =
    useState(false);

  const [editingCoffee, setEditingCoffee] =
    useState<CoffeeBean | null>(null);

  const [editingLog, setEditingLog] =
    useState<BrewLog | null>(null);

  const [viewingBrew, setViewingBrew] =
    useState<BrewLog | null>(null);

  const [prefillLog, setPrefillLog] =
    useState<BrewLog | null>(null);

  const [showBrewFlow, setShowBrewFlow] =
    useState(false);

  const [brewFlowStep, setBrewFlowStep] = useState<
    'select' | 'new-bean' | 'brew'
  >('select');

  const [selectedCoffee, setSelectedCoffee] =
    useState<CoffeeBean | null>(null);

  useEffect(() => {
    if (!user) {
      setShowProfileModal(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(true);
      return;
    }

    const loadProfile = async () => {
      try {
        setProfileLoading(true);

        const cloudProfile =
          await profileService.get(user.id);

        setProfile(cloudProfile);
      } catch (error) {
        console.error(
          'Error loading profile from Supabase:',
          error
        );
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setOnboardingInitialized(false);
      setOnboardingStep(null);
      return;
    }

    if (
      profileLoading ||
      onboardingInitialized
    ) {
      return;
    }

    if (
      profile === null ||
      profile.onboardingCompleted === false
    ) {
      setOnboardingStep('welcome');
    } else {
      setOnboardingStep(null);
    }

    setOnboardingInitialized(true);
  }, [
    user,
    profile,
    profileLoading,
    onboardingInitialized,
  ]);

  useEffect(() => {
    if (!user) {
      setCoffees([]);
      setCoffeesLoading(false);
      return;
    }

    const loadCoffees = async () => {
      try {
        setCoffeesLoading(true);

        const cloudCoffees =
          await coffeeService.getAll(user.id);

        setCoffees(cloudCoffees);
      } catch (error) {
        console.error(
          'Error loading coffees from Supabase:',
          error
        );
      } finally {
        setCoffeesLoading(false);
      }
    };

    loadCoffees();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setBrewLogs([]);
      setBrewLogsLoading(false);
      return;
    }

    const loadBrewLogs = async () => {
      try {
        setBrewLogsLoading(true);

        const cloudLogs =
          await brewLogService.getAll(user.id);

        setBrewLogs(cloudLogs);
      } catch (error) {
        console.error(
          'Error loading brew logs from Supabase:',
          error
        );
      } finally {
        setBrewLogsLoading(false);
      }
    };

    loadBrewLogs();
  }, [user]);

  const handleSaveBean = async (
    bean: CoffeeBean
  ) => {
    if (!user) {
      return;
    }

    try {
      const bagImageFile = bean.bagImageFile;
      const labelImageFile = bean.labelImageFile;

      const beanForDatabase: CoffeeBean = {
        ...bean,
        bagImageFile: undefined,
        labelImageFile: undefined,
      };

      let savedBean: CoffeeBean;

      if (editingCoffee) {
        savedBean = await coffeeService.update(
          beanForDatabase,
          user.id
        );
      } else {
        savedBean = await coffeeService.create(
          beanForDatabase,
          user.id
        );
      }

      let beanWithImages = savedBean;

      if (bagImageFile) {
        const bagImagePath =
          await imageService.upload({
            userId: user.id,
            section: 'coffees',
            recordId: savedBean.id,
            kind: 'front',
            file: bagImageFile,
          });

        const bagImage =
          await imageService.createSignedUrl(
            bagImagePath
          );

        beanWithImages = {
          ...beanWithImages,
          bagImage,
          bagImagePath,
        };
      }

      if (labelImageFile) {
        const labelImagePath =
          await imageService.upload({
            userId: user.id,
            section: 'coffees',
            recordId: savedBean.id,
            kind: 'back',
            file: labelImageFile,
          });

        const labelImage =
          await imageService.createSignedUrl(
            labelImagePath
          );

        beanWithImages = {
          ...beanWithImages,
          labelImage,
          labelImagePath,
        };
      }

      if (bagImageFile || labelImageFile) {
        savedBean = await coffeeService.update(
          beanWithImages,
          user.id
        );
      }

      if (editingCoffee) {
        setCoffees(previous =>
          previous.map(coffee =>
            coffee.id === savedBean.id
              ? savedBean
              : coffee
          )
        );
      } else {
        setCoffees(previous => [
          savedBean,
          ...previous,
        ]);
      }

      if (onboardingStep === 'coffee') {
        setSelectedCoffee(savedBean);
        setShowBeanForm(false);
        setEditingCoffee(null);
        setBrewFlowStep('brew');
        setShowBrewFlow(true);
        setOnboardingStep('brew');
        return;
      }

      if (brewFlowStep === 'new-bean') {
        setSelectedCoffee(savedBean);
        setBrewFlowStep('brew');
      } else {
        setShowBeanForm(false);
        setEditingCoffee(null);
      }
    } catch (error) {
      console.error(
        'Error saving coffee:',
        error
      );

      alert(
        'There was a problem saving the coffee or its images.'
      );
    }
  };

  const handleDeleteCoffee = async (
    id: string
  ) => {
    if (!user) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this coffee? All associated brew logs will remain but might look incomplete.'
    );

    if (!confirmed) {
      return;
    }

    try {
      await coffeeService.delete(id, user.id);

      setCoffees(previous =>
        previous.filter(
          coffee => coffee.id !== id
        )
      );

      setViewingCoffee(previous =>
        previous?.id === id
          ? null
          : previous
      );
    } catch (error) {
      console.error(
        'Error deleting coffee:',
        error
      );

      alert(
        'There was a problem deleting this coffee.'
      );
    }
  };

  const uploadBrewImage = async (
    savedLog: BrewLog,
    brewImageFile?: File
  ): Promise<BrewLog> => {
    if (!user || !brewImageFile) {
      return savedLog;
    }

    const brewImagePath =
      await imageService.upload({
        userId: user.id,
        section: 'brews',
        recordId: savedLog.id,
        kind: 'brew',
        file: brewImageFile,
      });

    const brewImage =
      await imageService.createSignedUrl(
        brewImagePath
      );

    return brewLogService.update(
      {
        ...savedLog,
        brewImage,
        brewImagePath,
        brewImageFile: undefined,
      },
      user.id
    );
  };

  const handleSaveBrew = async (
    log: Partial<BrewLog>
  ) => {
    if (!user) {
      return;
    }

    try {
      if (editingLog) {
        const updatedLog = {
          ...editingLog,
          ...log,
        } as BrewLog;

        let savedLog =
          await brewLogService.update(
            {
              ...updatedLog,
              brewImageFile: undefined,
            },
            user.id
          );

        savedLog = await uploadBrewImage(
          savedLog,
          log.brewImageFile
        );

        setBrewLogs(previous =>
          previous.map(existingLog =>
            existingLog.id === savedLog.id
              ? savedLog
              : existingLog
          )
        );

        setEditingLog(null);
      } else {
        const newLog = {
          ...log,
          id: crypto.randomUUID(),
          date: new Date().toISOString(),

          aroma: log.aroma || 3,
          acidity: log.acidity || 3,
          sweetness: log.sweetness || 3,
          bitterness: log.bitterness || 3,
          body: log.body || 3,
          aftertaste: log.aftertaste || 3,

          flavorGroups:
            log.flavorGroups || [],
        } as BrewLog;

        let savedLog =
          await brewLogService.create(
            {
              ...newLog,
              brewImageFile: undefined,
            },
            user.id
          );

        savedLog = await uploadBrewImage(
          savedLog,
          log.brewImageFile
        );

        setBrewLogs(previous => [
          savedLog,
          ...previous,
        ]);

        if (log.coffeeId) {
          const coffee = coffees.find(
            current =>
              current.id === log.coffeeId
          );

          if (coffee) {
            const updatedCoffee = {
              ...coffee,
              remainingWeight: Math.max(
                0,
                coffee.remainingWeight -
                  (log.dose || 0)
              ),
            };

            setCoffees(previous =>
              previous.map(current =>
                current.id ===
                updatedCoffee.id
                  ? updatedCoffee
                  : current
              )
            );
          }
        }
      }

      if (onboardingStep === 'brew') {
        await profileService.setOnboardingCompleted(
          user.id,
          true
        );

        setProfile(previous =>
          previous
            ? {
                ...previous,
                onboardingCompleted: true,
              }
            : previous
        );

        setOnboardingStep(null);
      }

      setShowBrewFlow(false);
      setBrewFlowStep('select');
      setSelectedCoffee(null);
      setPrefillLog(null);
    } catch (error) {
      console.error(
        'Error saving brew log:',
        error
      );

      alert(
        'There was a problem saving the brew or its photo.'
      );
    }
  };

  const handleDeleteLog = async (
    id: string
  ) => {
    if (!user) {
      return;
    }

    const confirmed = window.confirm(
      'Delete this brew log permanently?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await brewLogService.delete(
        id,
        user.id
      );

      setBrewLogs(previous =>
        previous.filter(log => log.id !== id)
      );

      setViewingBrew(previous =>
        previous?.id === id
          ? null
          : previous
      );

    } catch (error) {
      console.error(
        'Error deleting brew log:',
        error
      );

      alert(
        'There was a problem deleting this brew log.'
      );
    }
  };

  const filteredLogs = useMemo(() => {
    return brewLogs.filter(log => {
      const coffee = coffees.find(
        current =>
          current.id === log.coffeeId
      );

      const query =
        searchQuery.toLowerCase();

      const searchMatch =
        !searchQuery ||
        coffee?.name
          .toLowerCase()
          .includes(query) ||
        coffee?.roaster
          .toLowerCase()
          .includes(query) ||
        log.grinder
          .toLowerCase()
          .includes(query) ||
        log.tastingNotes?.some(note =>
          note
            .toLowerCase()
            .includes(query)
        ) ||
        log.processNotes
          ?.toLowerCase()
          .includes(query) ||
        log.method
          .toLowerCase()
          .includes(query);

      const methodMatch =
        methodFilter === 'all' ||
        log.method === methodFilter;

      const ratingMatch =
        ratingFilter === 'all' ||
        (
          log.rating !== undefined &&
          log.rating >= Number(ratingFilter)
        );

      const dateMatch = (() => {
        if (dateRange === 'all') {
          return true;
        }

        const logDate = new Date(log.date);
        const now = new Date();

        if (dateRange === 'today') {
          return (
            logDate.toDateString() ===
            now.toDateString()
          );
        }

        if (dateRange === 'week') {
          return (
            logDate >=
            new Date(
              now.getTime() -
                7 *
                  24 *
                  60 *
                  60 *
                  1000
            )
          );
        }

        if (dateRange === 'month') {
          return (
            logDate >=
            new Date(
              now.getTime() -
                30 *
                  24 *
                  60 *
                  60 *
                  1000
            )
          );
        }

        return true;
      })();

      return (
        searchMatch &&
        methodMatch &&
        ratingMatch &&
        dateMatch
      );
    });
  }, [
    brewLogs,
    coffees,
    searchQuery,
    methodFilter,
    ratingFilter,
    dateRange,
  ]);

  const clearFilters = () => {
    setSearchQuery('');
    setMethodFilter('all');
    setRatingFilter('all');
    setDateRange('all');
  };

  const handleExportCSV = () => {
    if (brewLogs.length === 0) {
      alert('No brew logs to export.');
      return;
    }

    const headers = [
      'Date',
      'Coffee Name',
      'Roaster',
      'Origin',
      'Process',
      'Roast Level',
      'Method',
      'Machine/Brewer',
      'Grinder',
      'Grind Setting',
      'Dose (g)',
      'Yield (g)',
      'Brew Time (s)',
      'Water Temp (°C)',
      'Water Type',
      'Rating',
      'Tasting Notes',
      'Aroma',
      'Acidity',
      'Sweetness',
      'Bitterness',
      'Body',
      'Aftertaste',
      'Process Notes',
    ];

    const rows = brewLogs.map(log => {
      const coffee = coffees.find(
        current =>
          current.id === log.coffeeId
      );

      const brewerInfo =
        log.machine ||
        (
          log.brewerBrand
            ? `${log.brewerBrand} ${log.brewer || ''}`.trim()
            : ''
        );

      return [
        new Date(
          log.date
        ).toLocaleString(),
        coffee?.name || 'Unknown',
        coffee?.roaster || 'Unknown',
        coffee?.origin || 'Unknown',
        coffee?.process || 'Unknown',
        coffee?.roastLevel || 'Unknown',
        log.method,
        brewerInfo,
        log.grinder,
        log.grindSetting,
        log.dose,
        log.yield,
        log.brewTime,
        log.waterTemp,
        log.waterType || 'Not Specified',
        log.rating,
        (log.tastingNotes || []).join(
          '; '
        ),
        log.aroma,
        log.acidity,
        log.sweetness,
        log.bitterness,
        log.body,
        log.aftertaste,
        (log.processNotes || '').replace(
          /(\r\n|\n|\r)/gm,
          ' '
        ),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row
          .map(
            cell =>
              `"${String(cell).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob(
      [csvContent],
      {
        type: 'text/csv;charset=utf-8;',
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.setAttribute('href', url);

    link.setAttribute(
      'download',
      `brewprint_history_export_${
        new Date()
          .toISOString()
          .split('T')[0]
      }.csv`
    );

    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

    const handleExportUserData = () => {
    if (!user) {
      alert('You must be signed in to export your data.');
      return;
    }

    const exportedAt = new Date();

    const exportData = {
      schemaVersion: 1,
      exportedAt: exportedAt.toISOString(),

      account: {
        id: user.id,
        email: user.email ?? null,
        createdAt: user.created_at ?? null,
      },

      profile,

      coffees,

      brews: brewLogs,
    };

    const excludedKeys = new Set([
      'bagImage',
      'labelImage',
      'brewImage',
      'bagImageFile',
      'labelImageFile',
      'brewImageFile',
    ]);

    const jsonContent = JSON.stringify(
      exportData,
      (key, value) => {
        if (excludedKeys.has(key)) {
          return undefined;
        }

        return value;
      },
      2
    );

    const blob = new Blob(
      [jsonContent],
      {
        type: 'application/json;charset=utf-8;',
      }
    );

    const url = URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.setAttribute(
      'href',
      url
    );

    link.setAttribute(
      'download',
      `brewprint_user_data_${
        exportedAt
          .toISOString()
          .split('T')[0]
      }.json`
    );

    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const completeOnboarding = async () => {
    if (!user) {
      return;
    }

    try {
      let completedProfile = profile;

      if (!completedProfile) {
        completedProfile =
          await profileService.update(
            {
              name:
                user.user_metadata?.name ||
                user.email?.split('@')[0] ||
                'Coffee Lover',
              role: 'Home Brewer',
              defaultMethod: 'all',
              defaultGrinder: '',
              defaultBrewer: '',
              onboardingCompleted: true,
            },
            user.id
          );
      } else {
        await profileService.setOnboardingCompleted(
          user.id,
          true
        );

        completedProfile = {
          ...completedProfile,
          onboardingCompleted: true,
        };
      }

      setProfile(completedProfile);
      setOnboardingStep(null);
      setShowProfileModal(false);
      setShowBeanForm(false);
      setShowBrewFlow(false);
      setEditingCoffee(null);
      setEditingLog(null);
      setViewingBrew(null);
      setViewingCoffee(null);
      setPrefillLog(null);
      setSelectedCoffee(null);
      setBrewFlowStep('select');
    } catch (error) {
      console.error(
        'Error completing onboarding:',
        error
      );

      alert(
        'There was a problem completing setup. Please try again.'
      );
    }
  };

  const startBrewCapture = () => {
    setViewingBrew(null);
    setViewingCoffee(null);
    setEditingLog(null);
    setPrefillLog(null);
    setSelectedCoffee(null);
    setBrewFlowStep('select');
    setShowBrewFlow(true);
  };

  const handleDashboardLogBrew = () => {
    if (coffees.length === 0) {
      setEditingCoffee(null);
      setShowBeanForm(true);
      return;
    }

    startBrewCapture();
  };

  const openExistingBrew = (
    log: BrewLog
  ) => {
    setViewingCoffee(null);
    setViewingBrew(log);
  };

  const editExistingBrew = (
    log: BrewLog
  ) => {
    const coffee = coffees.find(
      current =>
        current.id === log.coffeeId
    );

    if (!coffee) {
      setActiveTab('journal');
      return;
    }

    setViewingBrew(null);
    setEditingLog(log);
    setPrefillLog(null);
    setSelectedCoffee(coffee);
    setShowBrewFlow(true);
    setBrewFlowStep('brew');
  };

  const brewAgainFromLog = (
    log: BrewLog
  ) => {
    const coffee = coffees.find(
      current =>
        current.id === log.coffeeId
    );

    if (!coffee) {
      setActiveTab('journal');
      return;
    }

    setViewingBrew(null);
    setPrefillLog(log);
    setEditingLog(null);
    setSelectedCoffee(coffee);
    setShowBrewFlow(true);
    setBrewFlowStep('brew');
  };

  const goToTab = (
    tab: typeof activeTab
  ) => {
    setViewingBrew(null);
    setViewingCoffee(null);
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user || passwordRecovery) {
    return <AuthScreen />;
  }

  if (
    profileLoading ||
    !onboardingInitialized
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (onboardingStep === 'welcome') {
    return (
      <OnboardingWelcome
        onStart={() => {
          setOnboardingStep('profile');
          setShowProfileModal(true);
        }}
        onSkip={completeOnboarding}
      />
    );
  }

  return (
    <div
  className="bp-page min-h-screen flex flex-col"
  style={{
    paddingBottom:
      'calc(env(safe-area-inset-bottom) + 88px)',
  }}
>
   
      <header
  className="sticky top-0 z-40 border-b border-[var(--bp-line)] bg-[var(--bp-paper)]"
  style={{
    paddingTop:
      'env(safe-area-inset-top)',
  }}
>
  <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
    <button
      type="button"
      onClick={() => goToTab('home')}
      className="flex items-center gap-3"
      aria-label="Go to Home"
    >
      <BrewprintMark className="h-8 w-8" />

      <BrewprintWordmark className="h-[15px] w-auto" />
    </button>

    <div className="hidden items-center gap-4 sm:flex">
      {profile && (
        <div className="border-r border-[var(--bp-line)] pr-4 text-right">
          <p className="bp-label text-[var(--bp-muted)]">
            {profile.role}
          </p>

          <p className="mt-0.5 text-xs font-semibold text-[var(--bp-blue)]">
            {profile.name}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          goToTab('profile')
        }
        className="bp-label min-h-10 border border-[var(--bp-blue)] px-4 text-[var(--bp-blue)]"
      >
        Profile
      </button>
    </div>
  </div>
</header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {viewingBrew && (
          <BrewDetailView
            log={viewingBrew}
            coffee={coffees.find(
              coffee =>
                coffee.id === viewingBrew.coffeeId
            )}
            onBack={() =>
              setViewingBrew(null)
            }
            onEdit={() =>
              editExistingBrew(viewingBrew)
            }
            onBrewAgain={() =>
              brewAgainFromLog(viewingBrew)
            }
            onDelete={() =>
              void handleDeleteLog(viewingBrew.id)
            }
          />
        )}


        {activeTab === 'profile' && !viewingBrew && (
  <ProfileView
  profile={profile}
  email={user.email || ''}
  coffeeCount={coffees.length}
  brewCount={brewLogs.length}
  onEdit={() =>
    setShowProfileModal(true)
  }
  onExportData={handleExportUserData}
  onSignOut={signOut}
  onDeleteAccount={() =>
    setShowDeleteAccountModal(true)
  }
/>
)}
{activeTab === 'home' && !viewingBrew && (
  <HomeDashboard
    coffees={coffees}
    brewLogs={brewLogs}
    profileName={profile?.name}
    isLoading={
      coffeesLoading ||
      brewLogsLoading
    }
    onLogBrew={
      handleDashboardLogBrew
    }
    onOpenBrew={
      openExistingBrew
    }
    onBrewAgain={
      brewAgainFromLog
    }
    onOpenAnalytics={() =>
      goToTab('analytics')
    }
  />
)}

        {activeTab === 'analytics' && !viewingBrew && (
          <AnalyticsView
            brewLogs={brewLogs}
            coffees={coffees}
            onBack={() =>
              goToTab('home')
            }
          />
        )}

        {activeTab === 'journal' && !viewingBrew && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="border-b border-[var(--bp-line)] pb-6">
              <p className="bp-index">
                07 / HISTORY
              </p>

              <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <h1 className="bp-heading text-3xl text-[var(--bp-blue)]">
                    Brew History
                  </h1>

                  <p className="bp-code mt-2 max-w-md text-[var(--bp-muted)]">
                    Search, compare and reopen your saved brew records.
                  </p>
                </div>

                <div className="grid grid-cols-2 border border-[var(--bp-line)] sm:flex">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="bp-label flex min-h-12 items-center justify-center gap-2 border-r border-[var(--bp-line)] px-4 text-[var(--bp-blue)] sm:min-w-[120px]"
                    title="Export CSV"
                  >
                    <Icons.Download className="h-4 w-4" />
                    Export
                  </button>

                  {coffees.length > 0 && (
                    <button
                      type="button"
                      onClick={startBrewCapture}
                      className="flex min-h-12 items-center justify-center gap-2 bg-[var(--bp-orange)] px-4 text-[var(--bp-blue)] sm:min-w-[140px]"
                    >
                      <Icons.Plus className="h-4 w-4" />
                      <span className="bp-label">
                        New Brew
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </section>

            {brewLogs.length > 0 && (
              <section className="mt-6 space-y-4">
                <div className="grid grid-cols-[1fr_auto] border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
                  <div className="relative min-w-0">
                    <Icons.Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bp-muted)]" />

                    <input
                      type="text"
                      placeholder="Search coffee, roaster, grinder or notes..."
                      value={searchQuery}
                      onChange={event =>
                        setSearchQuery(
                          event.target.value
                        )
                      }
                      className="w-full bg-transparent py-4 pl-11 pr-4 text-sm text-[var(--bp-blue)] outline-none placeholder:text-[var(--bp-muted)]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowFilters(
                        !showFilters
                      )
                    }
                    className={`bp-label flex min-w-[92px] items-center justify-center gap-2 border-l border-[var(--bp-line)] px-4 ${
                      showFilters
                        ? 'bg-[var(--bp-blue)] text-[var(--bp-paper)]'
                        : 'text-[var(--bp-blue)]'
                    }`}
                    aria-expanded={showFilters}
                  >
                    <Icons.Filter className="h-4 w-4" />
                    Filter
                  </button>
                </div>

                {showFilters && (
                  <div className="border border-[var(--bp-line)] bg-[var(--bp-paper)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      <div className="border-b border-[var(--bp-line)] p-4 sm:border-r">
                        <label className="bp-label text-[var(--bp-muted)]">
                          Method
                        </label>

                        <select
                          value={methodFilter}
                          onChange={event =>
                            setMethodFilter(
                              event.target
                                .value as
                                | BrewMethod
                                | 'all'
                            )
                          }
                          className="bp-input mt-2 w-full"
                        >
                          <option value="all">
                            All Methods
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

                      <div className="border-b border-[var(--bp-line)] p-4">
                        <label className="bp-label text-[var(--bp-muted)]">
                          Minimum Rating
                        </label>

                        <select
                          value={ratingFilter}
                          onChange={event =>
                            setRatingFilter(
                              event.target
                                .value === 'all'
                                ? 'all'
                                : Number(
                                    event
                                      .target
                                      .value
                                  )
                            )
                          }
                          className="bp-input mt-2 w-full"
                        >
                          <option value="all">
                            Any Rating
                          </option>

                          {[1, 2, 3, 4, 5].map(
                            rating => (
                              <option
                                key={rating}
                                value={rating}
                              >
                                {rating}+ Stars
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="border-b border-[var(--bp-line)] p-4">
                      <p className="bp-label text-[var(--bp-muted)]">
                        Date Range
                      </p>

                      <div className="mt-2 grid grid-cols-4 border border-[var(--bp-line)]">
                        {[
                          'all',
                          'today',
                          'week',
                          'month',
                        ].map(range => (
                          <button
                            key={range}
                            type="button"
                            onClick={() =>
                              setDateRange(
                                range as
                                  | 'all'
                                  | 'today'
                                  | 'week'
                                  | 'month'
                              )
                            }
                            className={`bp-label min-h-11 border-r border-[var(--bp-line)] px-2 last:border-r-0 ${
                              dateRange ===
                              range
                                ? 'bg-[var(--bp-blue)] text-[var(--bp-paper)]'
                                : 'text-[var(--bp-blue)]'
                            }`}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="bp-label min-h-12 w-full px-4 text-[var(--bp-orange)]"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}

                <div className="flex items-end justify-between gap-4 border-b border-[var(--bp-line)] pb-3">
                  <div>
                    <p className="bp-index">
                      07.01 / BREW RECORDS
                    </p>

                    <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
                      Saved Brews
                    </h2>
                  </div>

                  <span className="bp-code text-[var(--bp-muted)]">
                    {filteredLogs.length} / {brewLogs.length} RECORDS
                  </span>
                </div>
              </section>
            )}

            {brewLogsLoading ? (
              <div className="mt-8 space-y-4">
                {[1, 2, 3].map(item => (
                  <div
                    key={item}
                    className="h-48 animate-pulse border border-[var(--bp-line)] bg-[var(--bp-paper-light)]"
                  />
                ))}
              </div>
            ) : brewLogs.length === 0 ? (
              <section className="mt-8 border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
                <div className="border-b border-[var(--bp-line)] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-[var(--bp-line-strong)]">
                      <Icons.Book className="h-5 w-5 text-[var(--bp-blue)]" />
                    </div>

                    <div>
                      <p className="bp-index">
                        07.01 / FIRST RECORD
                      </p>

                      <h2 className="bp-heading mt-1 text-xl text-[var(--bp-blue)]">
                        No brews yet
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="max-w-md text-sm leading-relaxed text-[var(--bp-muted)]">
                    Log a brew to start building a searchable record of recipes, equipment and cup results.
                  </p>
                </div>

                {coffees.length === 0 ? (
                  <button
                    type="button"
                    onClick={() =>
                      goToTab('library')
                    }
                    className="flex w-full items-center justify-between border-t border-[var(--bp-line)] bg-[var(--bp-orange)] px-5 py-4 text-[var(--bp-blue)]"
                  >
                    <div className="text-left">
                      <p className="bp-label">
                        First step
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        Add a Coffee
                      </p>
                    </div>

                    <Icons.Plus className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startBrewCapture}
                    className="flex w-full items-center justify-between border-t border-[var(--bp-line)] bg-[var(--bp-orange)] px-5 py-4 text-[var(--bp-blue)]"
                  >
                    <div className="text-left">
                      <p className="bp-label">
                        First record
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        Log a Brew
                      </p>
                    </div>

                    <Icons.Plus className="h-5 w-5" />
                  </button>
                )}
              </section>
            ) : filteredLogs.length === 0 ? (
              <section className="mt-8 border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
                <div className="p-6">
                  <p className="bp-index">
                    07.02 / NO MATCH
                  </p>

                  <h2 className="bp-heading mt-2 text-xl text-[var(--bp-blue)]">
                    No matching brews
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-[var(--bp-muted)]">
                    No saved records match the current search and filters.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="bp-label min-h-12 w-full border-t border-[var(--bp-line)] px-4 text-[var(--bp-orange)]"
                >
                  Reset Search and Filters
                </button>
              </section>
            ) : (
              <div className="mt-6 space-y-4">
                {filteredLogs.map(log => {
                  const coffee =
                    coffees.find(
                      current =>
                        current.id ===
                        log.coffeeId
                    );

                  const ratio =
                    log.dose > 0 &&
                    log.yield > 0
                      ? `1:${(
                          log.yield /
                          log.dose
                        ).toFixed(1)}`
                      : '—';

                  const equipment =
                    log.machine ||
                    [
                      log.brewerBrand,
                      log.brewer,
                    ]
                      .filter(Boolean)
                      .join(' ') ||
                    log.coldBrewSystem ||
                    log.mokaPotModel ||
                    log.aeroPressModel ||
                    'Equipment not recorded';

                  return (
                    <article
                      key={log.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        openExistingBrew(log)
                      }
                      onKeyDown={event => {
                        if (
                          event.key ===
                            'Enter' ||
                          event.key === ' '
                        ) {
                          event.preventDefault();
                          openExistingBrew(
                            log
                          );
                        }
                      }}
                      className="cursor-pointer border border-[var(--bp-line)] bg-[var(--bp-paper-light)] transition-colors hover:border-[var(--bp-line-strong)]"
                    >
                      <div className="grid grid-cols-[1fr_auto] border-b border-[var(--bp-line)]">
                        <div className="min-w-0 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bp-label text-[var(--bp-orange)]">
                              {log.method}
                            </span>

                            <span className="bp-code text-[var(--bp-muted)]">
                              {equipment}
                            </span>
                          </div>

                          <h3 className="bp-coffee-name mt-2 break-words text-2xl text-[var(--bp-blue)]">
                            {coffee?.name ||
                              'Unknown Coffee'}
                          </h3>

                          <p className="bp-code mt-1 text-[var(--bp-muted)]">
                            {coffee?.roaster ||
                              'Roaster not recorded'}
                            {coffee?.origin
                              ? ` / ${coffee.origin}`
                              : ''}
                            {coffee?.process
                              ? ` / ${coffee.process}`
                              : ''}
                          </p>
                        </div>

                        <div className="flex min-w-[104px] flex-col items-end justify-center border-l border-[var(--bp-line)] px-4 py-3 text-right">
                          <p className="bp-code text-[var(--bp-muted)]">
                            {new Date(
                              log.date
                            ).toLocaleDateString()}
                          </p>

                          <div className="mt-2 flex items-center gap-1 text-[var(--bp-orange)]">
                            <Icons.Star className="h-4 w-4 fill-current" />

                            <span className="bp-measurement font-semibold">
                              {log.rating}/5
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 border-b border-[var(--bp-line)]">
                        <div className="border-r border-[var(--bp-line)] p-3 text-center">
                          <p className="bp-label text-[var(--bp-muted)]">
                            Dose
                          </p>

                          <p className="bp-measurement mt-1 font-semibold text-[var(--bp-blue)]">
                            {log.dose}g
                          </p>
                        </div>

                        <div className="border-r border-[var(--bp-line)] p-3 text-center">
                          <p className="bp-label text-[var(--bp-muted)]">
                            Yield
                          </p>

                          <p className="bp-measurement mt-1 font-semibold text-[var(--bp-blue)]">
                            {log.yield}g
                          </p>
                        </div>

                        <div className="border-r border-[var(--bp-line)] p-3 text-center">
                          <p className="bp-label text-[var(--bp-muted)]">
                            Ratio
                          </p>

                          <p className="bp-measurement mt-1 font-semibold text-[var(--bp-blue)]">
                            {ratio}
                          </p>
                        </div>

                        <div className="p-3 text-center">
                          <p className="bp-label text-[var(--bp-muted)]">
                            Time
                          </p>

                          <p className="bp-measurement mt-1 font-semibold text-[var(--bp-blue)]">
                            {log.brewTime}
                            {log.method ===
                            BrewMethod.COLD_BREW
                              ? 'h'
                              : 's'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 border-b border-[var(--bp-line)] sm:grid-cols-2">
                        <div className="border-b border-[var(--bp-line)] p-4 sm:border-b-0 sm:border-r">
                          <p className="bp-label text-[var(--bp-muted)]">
                            Grinder / Setting
                          </p>

                          <p className="bp-code mt-2 text-[var(--bp-blue)]">
                            {log.grinder || '—'}
                            {log.grindSetting
                              ? ` / ${log.grindSetting}`
                              : ''}
                          </p>
                        </div>

                        <div className="p-4">
                          <p className="bp-label text-[var(--bp-muted)]">
                            Water
                          </p>

                          <p className="bp-code mt-2 text-[var(--bp-blue)]">
                            {log.waterTemp
                              ? `${log.waterTemp}°C`
                              : 'Temp —'}
                            {' / '}
                            {log.waterType ||
                              'Type not recorded'}
                          </p>
                        </div>
                      </div>

                      {log.flavorGroups &&
                        log.flavorGroups.length >
                          0 && (
                          <div className="border-b border-[var(--bp-line)] p-4">
                            <p className="bp-label text-[var(--bp-muted)]">
                              Flavour Groups
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {log.flavorGroups.map(
                                group => (
                                  <span
                                    key={group}
                                    className="border border-[var(--bp-line)] px-2.5 py-1.5 bp-code text-[var(--bp-blue)]"
                                  >
                                    {group}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {log.processNotes && (
                        <div className="border-b border-[var(--bp-line)] p-4">
                          <p className="bp-label text-[var(--bp-muted)]">
                            Process Notes
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--bp-blue)]">
                            {log.processNotes}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4">
                        <button
                          type="button"
                          onClick={event => {
                            event.stopPropagation();
                            openExistingBrew(log);
                          }}
                          className="bp-label min-h-12 border-b border-r border-[var(--bp-line)] px-3 text-[var(--bp-blue)] sm:border-b-0"
                        >
                          Open
                        </button>

                        <button
                          type="button"
                          onClick={event => {
                            event.stopPropagation();
                            editExistingBrew(log);
                          }}
                          className="bp-label min-h-12 border-b border-[var(--bp-line)] px-3 text-[var(--bp-blue)] sm:border-b-0 sm:border-r"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={event => {
                            event.stopPropagation();
                            brewAgainFromLog(log);
                          }}
                          className="bp-label min-h-12 border-r border-[var(--bp-line)] px-3 text-[var(--bp-blue)]"
                        >
                          Brew Again
                        </button>

                        <button
                          type="button"
                          onClick={event => {
                            event.stopPropagation();
                            void handleDeleteLog(
                              log.id
                            );
                          }}
                          className="bp-label min-h-12 px-3 text-[var(--bp-danger)]"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!viewingBrew && viewingCoffee && (
  <section className="space-y-8">
    <div className="border-b border-[var(--bp-line)] pb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="bp-index">
            03 / COFFEE DETAIL
          </p>

          <p className="bp-label mt-3 text-[var(--bp-orange)]">
            {viewingCoffee.roaster ||
              'Roaster not recorded'}
          </p>

          <h1 className="bp-coffee-name mt-2 break-words text-4xl text-[var(--bp-blue)]">
            {viewingCoffee.name}
          </h1>
        </div>

        <button
          type="button"
          onClick={() =>
            setViewingCoffee(null)
          }
          className="bp-button h-10 min-h-0 px-3"
        >
          Back
        </button>
      </div>
    </div>

    {(viewingCoffee.bagImage ||
      viewingCoffee.labelImage) && (
      <section className="border border-[var(--bp-line)]">
        <div
          className={`grid gap-px bg-[var(--bp-line)] ${
            viewingCoffee.bagImage &&
            viewingCoffee.labelImage
              ? 'grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {viewingCoffee.bagImage && (
            <div className="bg-[var(--bp-paper-dark)]">
              <img
                src={
                  viewingCoffee.bagImage
                }
                alt={`${viewingCoffee.name} front of bag`}
                className="h-56 w-full object-cover"
              />
            </div>
          )}

          {viewingCoffee.labelImage && (
            <div className="bg-[var(--bp-paper-dark)]">
              <img
                src={
                  viewingCoffee.labelImage
                }
                alt={`${viewingCoffee.name} rear label`}
                className="h-56 w-full object-cover"
              />
            </div>
          )}
        </div>
      </section>
    )}

    <section>
      <div className="mb-3">
        <p className="bp-index">
          03.01 / IDENTITY
        </p>
      </div>

      <div className="grid grid-cols-2 border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
        <div className="border-b border-r border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Roaster
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {viewingCoffee.roaster ||
              '—'}
          </p>
        </div>

        <div className="border-b border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Roaster Location
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {viewingCoffee.roasterLocation ||
              '—'}
          </p>
        </div>

        <div className="border-b border-r border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Origin
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {viewingCoffee.origin ||
              '—'}
          </p>
        </div>

        <div className="border-b border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Region
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {viewingCoffee.region ||
              '—'}
          </p>
        </div>

        <div className="border-r border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Farm
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {viewingCoffee.farm ||
              '—'}
          </p>
        </div>

        <div className="p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Producer
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {viewingCoffee.producer ||
              '—'}
          </p>
        </div>
      </div>
    </section>

    <section>
      <div className="mb-3">
        <p className="bp-index">
          03.02 / PRODUCTION
        </p>
      </div>

      <div className="grid grid-cols-2 border border-[var(--bp-line)] bg-[var(--bp-paper)]">
        <div className="border-b border-r border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Process
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {viewingCoffee.process ||
              '—'}
          </p>
        </div>

        <div className="border-b border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Varietal
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {viewingCoffee.varietal ||
              '—'}
          </p>
        </div>

        <div className="border-b border-r border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Altitude
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {viewingCoffee.altitude ||
              '—'}
          </p>
        </div>

        <div className="border-b border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Harvest
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {viewingCoffee.harvestSeason ||
              '—'}
          </p>
        </div>

        <div className="col-span-2 p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Terroir
          </p>

          <p className="mt-2 text-sm leading-relaxed text-[var(--bp-blue)]">
            {viewingCoffee.terroir ||
              'Not recorded'}
          </p>
        </div>
      </div>
    </section>

    <section>
      <div className="mb-3">
        <p className="bp-index">
          03.03 / ROAST
        </p>
      </div>

      <div className="grid grid-cols-2 border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
        <div className="border-b border-r border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Roast Level
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {viewingCoffee.roastLevel ||
              '—'}
          </p>
        </div>

        <div className="border-b border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Roast Date
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {viewingCoffee.roastDate
              ? new Date(
                  viewingCoffee.roastDate
                ).toLocaleDateString()
              : '—'}
          </p>
        </div>

        <div className="border-r border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Purchase Date
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {viewingCoffee.purchaseDate
              ? new Date(
                  viewingCoffee.purchaseDate
                ).toLocaleDateString()
              : '—'}
          </p>
        </div>

        <div className="p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Price
          </p>

          <p className="bp-code mt-2 text-[var(--bp-blue)]">
            {typeof viewingCoffee.price ===
            'number'
              ? viewingCoffee.price
              : '—'}
          </p>
        </div>
      </div>
    </section>

    <section>
      <div className="mb-3">
        <p className="bp-index">
          03.04 / BAG
        </p>
      </div>

      <div className="grid grid-cols-3 border border-[var(--bp-line)] bg-[var(--bp-paper)]">
        <div className="border-r border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Starting
          </p>

          <p className="bp-measurement mt-2 text-xl font-semibold text-[var(--bp-blue)]">
            {viewingCoffee.totalWeight}g
          </p>
        </div>

        <div className="border-r border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Remaining
          </p>

          <p className="bp-measurement mt-2 text-xl font-semibold text-[var(--bp-blue)]">
            {viewingCoffee.remainingWeight}g
          </p>
        </div>

        <div className="p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Used
          </p>

          <p className="bp-measurement mt-2 text-xl font-semibold text-[var(--bp-blue)]">
            {Math.max(
              0,
              viewingCoffee.totalWeight -
                viewingCoffee.remainingWeight
            )}
            g
          </p>
        </div>
      </div>
    </section>

    <section>
      <div className="mb-3">
        <p className="bp-index">
          03.05 / CUP NOTES
        </p>
      </div>

      <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
        <div className="border-b border-[var(--bp-line)] p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Roaster Tasting Notes
          </p>

          <p className="mt-2 text-sm leading-relaxed text-[var(--bp-blue)]">
            {viewingCoffee.bagTastingNotes &&
            viewingCoffee.bagTastingNotes
              .length > 0
              ? viewingCoffee.bagTastingNotes.join(
                  ' / '
                )
              : 'Not recorded'}
          </p>
        </div>

        <div className="p-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Personal Notes
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--bp-blue)]">
            {viewingCoffee.personalNotes ||
              'Not recorded'}
          </p>
        </div>
      </div>
    </section>

    {viewingCoffee.roasterURL && (
      <a
        href={viewingCoffee.roasterURL}
        target="_blank"
        rel="noreferrer"
        className="bp-button block w-full text-center"
      >
        Roaster Website
      </a>
    )}

    <div className="grid grid-cols-3 border border-[var(--bp-line)]">
      <button
        type="button"
        onClick={() => {
          setEditingCoffee(
            viewingCoffee
          );
          setShowBeanForm(true);
        }}
        className="bp-label border-r border-[var(--bp-line)] px-4 py-4 text-[var(--bp-blue)]"
      >
        Edit Coffee
      </button>

      <button
        type="button"
        onClick={() => {
          handleDeleteCoffee(
            viewingCoffee.id
          );
        }}
        className="bp-label border-r border-[var(--bp-line)] px-4 py-4 text-[var(--bp-danger)]"
      >
        Delete
      </button>

      <button
        type="button"
        onClick={() => {
          setSelectedCoffee(
            viewingCoffee
          );
          setEditingLog(null);
          setPrefillLog(null);
          setBrewFlowStep('brew');
          setShowBrewFlow(true);
        }}
        className="bg-[var(--bp-orange)] px-4 py-4 text-[var(--bp-blue)]"
      >
        <span className="bp-label">
          Brew
        </span>
      </button>
    </div>
  </section>
)}

        {activeTab === 'library' && !viewingCoffee && !viewingBrew && (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <section className="border-b border-[var(--bp-line)] pb-6">
      <p className="bp-index">
        02 / ARCHIVE
      </p>

      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="bp-heading text-3xl text-[var(--bp-blue)]">
            Coffee Archive
          </h1>

          <p className="bp-code mt-2 max-w-md text-[var(--bp-muted)]">
            Your current and previous coffees, weights, references and brew records.
          </p>
        </div>

        {coffees.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setEditingCoffee(null);
              setShowBeanForm(true);
            }}
            className="flex w-full items-center justify-between bg-[var(--bp-orange)] px-5 py-4 text-[var(--bp-blue)] sm:w-auto sm:min-w-[170px]"
          >
            <div className="text-left">
              <p className="bp-label">
                New record
              </p>

              <p className="mt-1 text-sm font-semibold">
                Add coffee
              </p>
            </div>

            <Icons.Plus className="h-5 w-5" />
          </button>
        )}
      </div>
    </section>

    {coffeesLoading ? (
      <div className="mt-8 space-y-4">
        {[1, 2, 3].map(item => (
          <div
            key={item}
            className="h-36 animate-pulse border border-[var(--bp-line)] bg-[var(--bp-paper-light)]"
          />
        ))}
      </div>
    ) : coffees.length === 0 ? (
      <section className="mt-8 border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
        <div className="border-b border-[var(--bp-line)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[var(--bp-line-strong)]">
              <Icons.Coffee className="h-5 w-5 text-[var(--bp-blue)]" />
            </div>

            <div>
              <p className="bp-index">
                02.01 / FIRST COFFEE
              </p>

              <h2 className="bp-heading mt-1 text-xl text-[var(--bp-blue)]">
                No coffees yet
              </h2>
            </div>
          </div>
        </div>

        <div className="p-5">
          <p className="max-w-md text-sm leading-relaxed text-[var(--bp-muted)]">
            Add the coffee you are brewing so BREWPRINT can connect it to brew records, track remaining weight and build your coffee history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCoffee(null);
            setShowBeanForm(true);
          }}
          className="flex w-full items-center justify-between border-t border-[var(--bp-line)] bg-[var(--bp-orange)] px-5 py-4 text-[var(--bp-blue)]"
        >
          <div className="text-left">
            <p className="bp-label">
              Create record
            </p>

            <p className="mt-1 text-sm font-semibold">
              Add your first coffee
            </p>
          </div>

          <Icons.Plus className="h-5 w-5" />
        </button>
      </section>
    ) : (
      <section className="mt-8 space-y-8">
  <section>
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="bp-index">
          02.01 / ACTIVE COFFEES
        </p>

        <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
          Active Records
        </h2>
      </div>

      <span className="bp-code text-[var(--bp-muted)]">
        {
          coffees.filter(
            coffee => coffee.remainingWeight > 0
          ).length
        }{' '}
        ACTIVE
      </span>
    </div>

    <div className="grid grid-cols-1 gap-4">
      {coffees
        .filter(
          coffee => coffee.remainingWeight > 0
        )
        .map(coffee => (
          <CoffeeCard
            key={coffee.id}
            coffee={coffee}
            onClick={current => {
  setViewingCoffee(current);
}}
            onEdit={current => {
              setEditingCoffee(current);
              setShowBeanForm(true);
            }}
            onDelete={current =>
              handleDeleteCoffee(
                current.id
              )
            }
          />
        ))}
    </div>
  </section>

  {coffees.some(
    coffee => coffee.remainingWeight <= 0
  ) && (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4 border-t border-[var(--bp-line)] pt-8">
        <div>
          <p className="bp-index">
            02.02 / FINISHED COFFEES
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Finished Records
          </h2>
        </div>

        <span className="bp-code text-[var(--bp-muted)]">
          {
            coffees.filter(
              coffee =>
                coffee.remainingWeight <= 0
            ).length
          }{' '}
          FINISHED
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {coffees
          .filter(
            coffee =>
              coffee.remainingWeight <= 0
          )
          .map(coffee => (
            <CoffeeCard
              key={coffee.id}
              coffee={coffee}
              onClick={current => {
  setViewingCoffee(current);
}}
              onEdit={current => {
                setEditingCoffee(current);
                setShowBeanForm(true);
              }}
              onDelete={current =>
                handleDeleteCoffee(
                  current.id
                )
              }
            />
          ))}
      </div>
    </section>
  )}
</section>
    )}
  </div>
)}
        {activeTab === 'grind' && !viewingBrew && (
          <GrindReference />
        )}

        {activeTab === 'community' && !viewingBrew && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-12 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-amber-800">
              <Icons.Users className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold display-font mb-2">
              Community Feed
            </h3>

            <p className="text-stone-400 text-sm font-medium mb-8">
              Coming soon: Share your
              calibration recipes with
              baristas worldwide.
            </p>

            <button className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest opacity-50 cursor-not-allowed">
              Join Waitlist
            </button>
          </div>
        )}
      </main>

      {showBrewFlow && (
  <div className="fixed inset-0 z-[70] overflow-y-auto bg-[rgba(12,39,72,0.48)] backdrop-blur-sm">
    <div className="min-h-full p-0 sm:p-6">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-2xl items-start justify-center sm:min-h-0">
        {brewFlowStep === 'select' && (
          <section className="w-full border-x border-[var(--bp-line)] bg-[var(--bp-paper)] sm:border">
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
                    05 / BREW CAPTURE
                  </p>

                  <h2 className="bp-heading mt-1 text-2xl text-[var(--bp-blue)]">
                    Select Coffee
                  </h2>

                  <p className="bp-code mt-2 text-[var(--bp-muted)]">
                    Choose the coffee record for this brew.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowBrewFlow(false);
                    setEditingLog(null);
                    setPrefillLog(null);
                    setSelectedCoffee(null);
                  }}
                  className="bp-button h-10 min-h-0 px-3"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-6 px-4 py-6 sm:px-6">
              <section>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="bp-index">
                      05.01 / COFFEE RECORDS
                    </p>

                    <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
                      Available Coffees
                    </h3>
                  </div>

                  <span className="bp-code text-[var(--bp-muted)]">
                    {
                      coffees.filter(
                        coffee => coffee.remainingWeight > 0
                      ).length
                    }{' '}
                    ACTIVE
                  </span>
                </div>

                <div className="border border-[var(--bp-line)]">
                  {coffees
                    .filter(
                      coffee => coffee.remainingWeight > 0
                    )
                    .map((coffee, index, activeCoffees) => (
                      <button
                        key={coffee.id}
                        type="button"
                        onClick={() => {
                          setSelectedCoffee(coffee);
                          setBrewFlowStep('brew');
                        }}
                        className={`grid w-full grid-cols-[1fr_auto] bg-[var(--bp-paper-light)] text-left ${
                          index < activeCoffees.length - 1
                            ? 'border-b border-[var(--bp-line)]'
                            : ''
                        }`}
                      >
                        <div className="min-w-0 p-4">
                          <p className="bp-label text-[var(--bp-orange)]">
                            {coffee.roaster ||
                              'Roaster not recorded'}
                          </p>

                          <h4 className="bp-coffee-name mt-2 truncate text-2xl text-[var(--bp-blue)]">
                            {coffee.name}
                          </h4>

                          <p className="bp-code mt-2 truncate text-[var(--bp-muted)]">
                            {coffee.origin || 'Origin not recorded'}
                            {coffee.process
                              ? ` / ${coffee.process}`
                              : ''}
                          </p>
                        </div>

                        <div className="flex min-w-[96px] flex-col items-end justify-center border-l border-[var(--bp-line)] px-4">
                          <p className="bp-measurement text-xl font-semibold text-[var(--bp-blue)]">
                            {coffee.remainingWeight}
                            g
                          </p>

                          <p className="bp-label mt-1 text-[var(--bp-muted)]">
                            Remaining
                          </p>
                        </div>
                      </button>
                    ))}
                </div>

                {coffees.filter(
                  coffee => coffee.remainingWeight > 0
                ).length === 0 && (
                  <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-5">
                    <p className="bp-label text-[var(--bp-muted)]">
                      No active coffees
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-[var(--bp-muted)]">
                      Add a new coffee record before logging a brew.
                    </p>
                  </div>
                )}
              </section>

              <section>
                <button
                  type="button"
                  onClick={() =>
                    setBrewFlowStep('new-bean')
                  }
                  className="flex w-full items-center justify-between border border-[var(--bp-line)] bg-[var(--bp-orange)] px-5 py-4 text-[var(--bp-blue)]"
                >
                  <div className="text-left">
                    <p className="bp-label">
                      New record
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      Add Coffee
                    </p>
                  </div>

                  <Icons.Plus className="h-5 w-5" />
                </button>
              </section>
            </div>
          </section>
        )}

        {brewFlowStep === 'new-bean' && (
          <CoffeeBeanForm
            onSave={handleSaveBean}
            onCancel={() =>
              setBrewFlowStep('select')
            }
          />
        )}

        {brewFlowStep === 'brew' &&
          selectedCoffee && (
            <BrewForm
              coffee={selectedCoffee}
              initialData={
                editingLog ||
                prefillLog ||
                undefined
              }
              isBrewAgain={Boolean(
                prefillLog
              )}
              title={
                editingLog
                  ? 'Update Entry'
                  : prefillLog
                    ? 'Brew Again'
                    : 'Log Brew'
              }
              onSave={handleSaveBrew}
              onCancel={() => {
                if (
                  onboardingStep === 'brew'
                ) {
                  void completeOnboarding();
                  return;
                }

                setShowBrewFlow(false);
                setEditingLog(null);
                setPrefillLog(null);
                setSelectedCoffee(null);
              }}
            />
          )}
      </div>
    </div>
  </div>
)}

      {showBeanForm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-6 overflow-y-auto">
          <CoffeeBeanForm
            initialData={
              editingCoffee || undefined
            }
            onSave={handleSaveBean}
            onCancel={() => {
              if (
                onboardingStep ===
                'coffee'
              ) {
                void completeOnboarding();
                return;
              }

              setShowBeanForm(false);
              setEditingCoffee(null);
            }}
          />
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[rgba(12,39,72,0.48)] p-0 backdrop-blur-sm sm:p-6">
          <ProfileModal
            initialData={
              profile || undefined
            }
            isFirstLaunch={
              onboardingStep ===
                'profile' || !profile
            }
            onSave={async newProfile => {
              if (!user) {
                return;
              }

              try {
                const savedProfile =
                  await profileService.update(
                    {
                      ...newProfile,
                      onboardingCompleted:
                        onboardingStep ===
                        'profile'
                          ? false
                          : (
                              newProfile.onboardingCompleted ??
                              profile?.onboardingCompleted ??
                              false
                            ),
                    },
                    user.id
                  );

                setProfile(
                  savedProfile
                );

                setShowProfileModal(
                  false
                );

                if (
                  onboardingStep ===
                  'profile'
                ) {
                  setEditingCoffee(
                    null
                  );

                  setOnboardingStep(
                    'coffee'
                  );

                  setShowBeanForm(
                    true
                  );
                }
              } catch (error) {
                console.error(
                  'Error saving profile:',
                  error
                );

                alert(
                  'There was a problem saving your profile.'
                );
              }
            }}
            onCancel={
              onboardingStep ===
              'profile'
                ? undefined
                : profile
                  ? () =>
                      setShowProfileModal(
                        false
                      )
                  : undefined
            }
            onDeleteAccount={
              onboardingStep ===
              'profile'
                ? undefined
                : () => {
                    setShowProfileModal(
                      false
                    );

                    setShowDeleteAccountModal(
                      true
                    );
                  }
            }
          />
        </div>
      )}

      {showDeleteAccountModal && (
        <DeleteAccountModal
          isDeleting={isDeletingAccount}
          onCancel={() =>
            setShowDeleteAccountModal(false)
          }
          onConfirm={async () => {
            if (isDeletingAccount) {
              return;
            }

            setIsDeletingAccount(true);

            try {
              await accountService.deleteAccount();

              localStorage.clear();

              setCoffees([]);
              setBrewLogs([]);
              setProfile(null);

              setShowDeleteAccountModal(false);
              setShowProfileModal(false);

              await signOut();
            } catch (error) {
              console.error(
                'Account deletion failed:',
                error
              );

              alert(
                error instanceof Error
                  ? error.message
                  : 'Unable to delete account.'
              );
            } finally {
              setIsDeletingAccount(false);
            }
          }}
        />
      )}

      <nav
  className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--bp-line-strong)] bg-[var(--bp-paper)]"
  style={{
    paddingBottom:
      'env(safe-area-inset-bottom)',
  }}
>
  <div className="mx-auto grid h-[76px] w-full max-w-2xl grid-cols-5">
    <button
      type="button"
      onClick={() =>
        goToTab('home')
      }
      className={`relative flex flex-col items-center justify-center gap-1.5 border-r border-[var(--bp-line)] ${
        activeTab === 'home' ||
        activeTab === 'analytics'
          ? 'bg-[var(--bp-paper-light)] text-[var(--bp-blue)]'
          : 'text-[var(--bp-muted)]'
      }`}
    >
      {(activeTab === 'home' ||
        activeTab === 'analytics') && (
        <span className="absolute inset-x-0 top-0 h-[2px] bg-[var(--bp-orange)]" />
      )}

      <BrewprintIcon
        name="home"
        size={21}
      />

      <span className="bp-label">
        Home
      </span>
    </button>

    <button
      type="button"
      onClick={() =>
        goToTab('library')
      }
      className={`relative flex flex-col items-center justify-center gap-1.5 border-r border-[var(--bp-line)] ${
        activeTab === 'library'
          ? 'bg-[var(--bp-paper-light)] text-[var(--bp-blue)]'
          : 'text-[var(--bp-muted)]'
      }`}
    >


      {activeTab === 'library' && (
        <span className="absolute inset-x-0 top-0 h-[2px] bg-[var(--bp-orange)]" />
      )}

      <BrewprintIcon
        name="archive"
        size={21}
      />

      <span className="bp-label">
        Archive
      </span>
    </button>

    <button
      type="button"
      onClick={startBrewCapture}
      className="relative flex flex-col items-center justify-center gap-1.5 bg-[var(--bp-orange)] text-[var(--bp-blue)]"
    >
      <BrewprintIcon
        name="plus"
        size={25}
      />

      <span className="bp-label">
        Brew
      </span>
    </button>

    <button
      type="button"
      onClick={() =>
        goToTab('journal')
      }
      className={`relative flex flex-col items-center justify-center gap-1.5 border-l border-[var(--bp-line)] ${
        activeTab === 'journal'
          ? 'bg-[var(--bp-paper-light)] text-[var(--bp-blue)]'
          : 'text-[var(--bp-muted)]'
      }`}
    >
      {activeTab === 'journal' && (
        <span className="absolute inset-x-0 top-0 h-[2px] bg-[var(--bp-orange)]" />
      )}

      <BrewprintIcon
        name="history"
        size={21}
      />

      <span className="bp-label">
        History
      </span>
    </button>

    <button
      type="button"
      onClick={() =>
        goToTab('profile')
      }
      className={`relative flex flex-col items-center justify-center gap-1.5 border-l border-[var(--bp-line)] ${
        activeTab === 'profile'
          ? 'bg-[var(--bp-paper-light)] text-[var(--bp-blue)]'
          : 'text-[var(--bp-muted)]'
      }`}
    >
      {activeTab === 'profile' && (
        <span className="absolute inset-x-0 top-0 h-[2px] bg-[var(--bp-orange)]" />
      )}

      <BrewprintIcon
        name="profile"
        size={21}
      />

      <span className="bp-label">
        Profile
      </span>
    </button>
  </div>
</nav>
    </div>
  );
};

export default App;