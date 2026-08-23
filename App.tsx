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
import GrindReference from './components/GrindReference';
import AnalyticsView from './components/AnalyticsView';
import AuthScreen from './components/AuthScreen';
import OnboardingWelcome from './components/OnboardingWelcome';
import HomeDashboard from './components/HomeDashboard';

import { useAuth } from './context/AuthContext';

import { coffeeService } from './services/coffeeService';
import { brewLogService } from './services/brewLogService';
import { profileService } from './services/profileService';
import { imageService } from './services/imageService';
import { accountService } from './services/accountService';

const FLAVOR_GROUP_STYLING: Record<string, string> = {
  Floral: 'bg-rose-50 text-rose-700 border-rose-100',
  Fruity: 'bg-red-50 text-red-700 border-red-100',
  'Nutty/Sweet':
    'bg-amber-50 text-amber-700 border-amber-100',
  Chocolatey:
    'bg-stone-50 text-stone-700 border-stone-100',
  Earthy:
    'bg-emerald-50 text-emerald-700 border-emerald-100',
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
      `barista_journal_export_${
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
    const coffee = coffees.find(
      current =>
        current.id === log.coffeeId
    );

    if (!coffee) {
      setActiveTab('journal');
      return;
    }

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

    setPrefillLog(log);
    setEditingLog(null);
    setSelectedCoffee(coffee);
    setShowBrewFlow(true);
    setBrewFlowStep('brew');
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
      className="min-h-screen flex flex-col bg-[#fdfcfb]"
      style={{
        paddingBottom:
          'calc(env(safe-area-inset-bottom) + 8rem)',
      }}
    >
      <header
        className="bg-white border-b border-stone-100 sticky top-0 z-30 px-6 pb-4 flex justify-between items-center shadow-sm"
        style={{
          paddingTop:
            'calc(env(safe-area-inset-top) + 1rem)',
        }}
      >
        <h1 className="text-2xl font-bold display-font text-stone-800">
          Barista{' '}
          <span className="text-amber-800">
            Logbook
          </span>
        </h1>

        <div className="flex items-center gap-3">
          {profile && (
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black uppercase text-stone-400 tracking-widest">
                {profile.role}
              </p>

              <p className="text-xs font-bold text-stone-800">
                {profile.name}
              </p>
            </div>
          )}

          <button
            onClick={() =>
              setShowProfileModal(true)
            }
            className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-amber-800 hover:border-amber-200 transition-all shadow-sm active:scale-95"
            title="Edit Profile"
          >
            <Icons.User className="w-5 h-5" />
          </button>

          <button
            onClick={async () => {
              await signOut();
            }}
            className="px-4 h-10 rounded-2xl bg-stone-50 border border-stone-200 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-rose-600 hover:border-rose-200 transition-all"
            title="Sign Out"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6">
        {activeTab === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
                Welcome back,
              </p>

              <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 display-font leading-tight break-words">
                {profile?.name ||
                  'Coffee Lover'}
              </h2>
            </div>

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
                setActiveTab('analytics')
              }
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            brewLogs={brewLogs}
            coffees={coffees}
            onBack={() =>
              setActiveTab('home')
            }
          />
        )}

        {activeTab === 'journal' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-stone-800 display-font">
                Daily Journal
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="p-4 bg-white border border-stone-100 text-stone-400 hover:text-amber-800 hover:border-amber-200 rounded-2xl transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  title="Export CSV"
                >
                  <Icons.Download className="w-4 h-4" />
                  Export
                </button>

                {coffees.length > 0 && (
                  <button
                    onClick={
                      startBrewCapture
                    }
                    className="bg-amber-800 text-white p-4 px-6 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-900/20 active:scale-95 transition-all"
                  >
                    <Icons.Plus className="w-4 h-4" />
                    Capture Brew
                  </button>
                )}
              </div>
            </div>

            {brewLogs.length > 0 && (
              <div className="mb-8 space-y-4">
                <div className="relative group">
                  <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-amber-800 transition-colors" />

                  <input
                    type="text"
                    placeholder="Search journals, beans, or grinders..."
                    value={searchQuery}
                    onChange={event =>
                      setSearchQuery(
                        event.target.value
                      )
                    }
                    className="w-full bg-white border border-stone-100 rounded-2xl py-4 pl-12 pr-14 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-amber-800/5 focus:border-amber-800/20 transition-all shadow-sm"
                  />

                  <button
                    onClick={() =>
                      setShowFilters(
                        !showFilters
                      )
                    }
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl border transition-all ${
                      showFilters
                        ? 'bg-amber-100 border-amber-200 text-amber-800'
                        : 'bg-stone-50 border-stone-100 text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <Icons.Filter className="w-4 h-4" />
                  </button>
                </div>

                {showFilters && (
                  <div className="p-6 bg-white rounded-3xl border border-stone-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
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
                          className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-xs font-bold text-stone-700 outline-none focus:border-amber-200 transition-all"
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

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                          Min Rating
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
                          className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-xs font-bold text-stone-700 outline-none focus:border-amber-200 transition-all"
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

                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                          Timeframe
                        </label>

                        <div className="flex gap-2">
                          {[
                            'all',
                            'today',
                            'week',
                            'month',
                          ].map(range => (
                            <button
                              key={range}
                              onClick={() =>
                                setDateRange(
                                  range as
                                    | 'all'
                                    | 'today'
                                    | 'week'
                                    | 'month'
                                )
                              }
                              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                                dateRange ===
                                range
                                  ? 'bg-stone-900 border-stone-900 text-white shadow-lg'
                                  : 'bg-white border-stone-100 text-stone-400 hover:bg-stone-50'
                              }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={clearFilters}
                      className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-amber-800 hover:bg-amber-50 rounded-xl transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {brewLogsLoading ? (
              <div className="py-24 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">
                  Loading brews...
                </p>
              </div>
            ) : brewLogs.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-stone-200 rounded-[3rem] px-8 py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-[2rem] bg-amber-50 flex items-center justify-center text-amber-800">
                  <Icons.Book className="w-9 h-9" />
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-800 mb-3">
                  Brew Journal
                </p>

                <h3 className="text-2xl font-black text-stone-800 display-font">
                  No brews logged yet
                </h3>

                <p className="text-sm text-stone-400 leading-relaxed max-w-sm mx-auto mt-3 mb-8">
                  Record your recipes and
                  tasting results so you can
                  compare brews and improve over
                  time.
                </p>

                {coffees.length === 0 ? (
                  <button
                    onClick={() =>
                      setActiveTab(
                        'library'
                      )
                    }
                    className="bg-stone-900 text-white px-8 py-5 rounded-2xl inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-stone-900/10 active:scale-95 transition-all"
                  >
                    <Icons.Plus className="w-4 h-4" />
                    Add A Coffee First
                  </button>
                ) : (
                  <button
                    onClick={
                      startBrewCapture
                    }
                    className="bg-stone-900 text-white px-8 py-5 rounded-2xl inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-stone-900/10 active:scale-95 transition-all"
                  >
                    <Icons.Plus className="w-4 h-4" />
                    Log Your First Brew
                  </button>
                )}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-stone-200">
                <Icons.Coffee className="w-16 h-16 text-stone-100 mx-auto mb-4" />

                <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">
                  No matching results
                </p>

                <button
                  onClick={clearFilters}
                  className="mt-4 text-amber-800 font-bold text-sm underline underline-offset-4"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredLogs.map(log => {
                  const coffee =
                    coffees.find(
                      current =>
                        current.id ===
                        log.coffeeId
                    );

                  return (
                    <div
                      key={log.id}
                      onClick={() =>
                        openExistingBrew(log)
                      }
                      className="bg-white p-5 rounded-[2rem] shadow-sm border border-stone-100 hover:border-amber-200 transition-all group relative overflow-hidden cursor-pointer"
                    >
                      <div className="mb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="text-[9px] uppercase font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                                {log.method}
                              </span>

                              {log.machine && (
                                <span className="text-[9px] uppercase font-bold text-stone-500 bg-stone-50 px-2 py-0.5 rounded-md">
                                  {
                                    log.machine
                                  }
                                </span>
                              )}

                              {log.brewerBrand && (
                                <span className="text-[9px] uppercase font-bold text-stone-500 bg-stone-50 px-2 py-0.5 rounded-md">
                                  {
                                    log.brewerBrand
                                  }{' '}
                                  {log.brewer}
                                </span>
                              )}
                            </div>

                            <h3 className="font-bold text-2xl text-stone-800 leading-tight break-words">
                              {coffee?.name ||
                                'Unknown Blend'}
                            </h3>

                            <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-2 flex flex-wrap items-center gap-2">
                              {log.grinder}

                              {log.grindSetting && (
                                <>
                                  <span>
                                    •
                                  </span>

                                  <span className="text-amber-700">
                                    {
                                      log.grindSetting
                                    }
                                  </span>
                                </>
                              )}

                              {log.dose > 0 &&
                                log.yield >
                                  0 && (
                                  <>
                                    <span>
                                      •
                                    </span>

                                    <span className="text-stone-500">
                                      1:
                                      {(
                                        log.yield /
                                        log.dose
                                      ).toFixed(
                                        1
                                      )}
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>

                          <div className="flex items-start justify-between gap-4 shrink-0">
                            <div className="flex gap-2">
                              <button
                                onClick={event => {
                                  event.stopPropagation();
                                  openExistingBrew(
                                    log
                                  );
                                }}
                                className="p-2 bg-stone-50 text-stone-400 hover:text-amber-800 rounded-lg border border-stone-100 hover:border-amber-200 transition-all"
                                title="Edit Brew"
                              >
                                <Icons.Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={event => {
                                  event.stopPropagation();
                                  brewAgainFromLog(
                                    log
                                  );
                                }}
                                className="p-2 bg-stone-50 text-stone-400 hover:text-amber-800 rounded-lg border border-stone-100 hover:border-amber-200 transition-all"
                                title="Brew Again"
                              >
                                <Icons.Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={event => {
                                  event.stopPropagation();

                                  handleDeleteLog(
                                    log.id
                                  );
                                }}
                                className="p-2 bg-rose-50 text-rose-300 hover:text-rose-600 rounded-lg border border-rose-100 hover:border-rose-200 transition-all"
                                title="Delete Brew"
                              >
                                <Icons.Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-[9px] text-stone-300 font-black uppercase tracking-tighter whitespace-nowrap">
                                {new Date(
                                  log.date
                                ).toLocaleDateString()}
                              </p>

                              <div className="flex justify-end gap-0.5 text-amber-500 mt-1">
                                {[
                                  ...Array(5),
                                ].map(
                                  (
                                    _,
                                    index
                                  ) => (
                                    <Icons.Star
                                      key={
                                        index
                                      }
                                      className={`w-3 h-3 ${
                                        index <
                                        log.rating
                                          ? 'fill-current'
                                          : 'text-stone-100'
                                      }`}
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="bg-stone-50 rounded-xl px-2 py-3 text-center">
                          <p className="text-[8px] font-black uppercase tracking-widest text-stone-400">
                            Dose
                          </p>

                          <p className="mt-1 text-sm font-black text-stone-800">
                            {log.dose}g
                          </p>
                        </div>

                        <div className="bg-stone-50 rounded-xl px-2 py-3 text-center">
                          <p className="text-[8px] font-black uppercase tracking-widest text-stone-400">
                            Yield
                          </p>

                          <p className="mt-1 text-sm font-black text-stone-800">
                            {log.yield}g
                          </p>
                        </div>

                        <div className="bg-stone-50 rounded-xl px-2 py-3 text-center">
                          <p className="text-[8px] font-black uppercase tracking-widest text-stone-400">
                            Time
                          </p>

                          <p className="mt-1 text-sm font-black text-stone-800">
                            {log.brewTime}s
                          </p>
                        </div>

                        <div className="bg-stone-50 rounded-xl px-2 py-3 text-center">
                          <p className="text-[8px] font-black uppercase tracking-widest text-stone-400">
                            Temp
                          </p>

                          <p className="mt-1 text-sm font-black text-stone-800">
                            {log.waterTemp}
                            °C
                          </p>
                        </div>
                      </div>

                      {log.flavorGroups &&
                        log.flavorGroups
                          .length > 0 && (
                          <div className="flex flex-wrap gap-2.5 mb-6">
                            {log.flavorGroups.map(
                              group => (
                                <span
                                  key={
                                    group
                                  }
                                  className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                    FLAVOR_GROUP_STYLING[
                                      group
                                    ] ||
                                    'bg-stone-50 text-stone-500 border-stone-100'
                                  }`}
                                >
                                  {group}
                                </span>
                              )
                            )}
                          </div>
                        )}

                      {log.processNotes && (
                        <div className="mb-6 p-5 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                          <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-1.5">
                            Method Notes
                          </p>

                          <p className="text-xs text-stone-600 leading-relaxed font-medium whitespace-pre-wrap italic">
                            "
                            {
                              log.processNotes
                            }
                            "
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'library' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5 mb-8">
              <div className="min-w-0">
                <h2 className="text-3xl font-bold text-stone-800 display-font">
                  Coffee Library
                </h2>

                <p className="text-sm text-stone-400 mt-1">
                  Keep track of the
                  coffees you are brewing.
                </p>
              </div>

              {coffees.length > 0 && (
                <button
                  onClick={() => {
                    setEditingCoffee(
                      null
                    );
                    setShowBeanForm(true);
                  }}
                  className="w-full sm:w-auto bg-stone-900 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-stone-900/10 shrink-0"
                >
                  <Icons.Plus className="w-4 h-4" />
                  Add Bean
                </button>
              )}
            </div>

            {coffeesLoading ? (
              <div className="py-24 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">
                  Loading coffees...
                </p>
              </div>
            ) : coffees.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-stone-200 rounded-[3rem] px-8 py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-[2rem] bg-amber-50 flex items-center justify-center text-amber-800">
                  <Icons.Coffee className="w-9 h-9" />
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-800 mb-3">
                  Coffee Library
                </p>

                <h3 className="text-2xl font-black text-stone-800 display-font">
                  No coffees yet
                </h3>

                <p className="text-sm text-stone-400 leading-relaxed max-w-sm mx-auto mt-3 mb-8">
                  Add the coffee you are
                  brewing so you can use it
                  in your brew logs and keep
                  track of your recipes.
                </p>

                <button
                  onClick={() => {
                    setEditingCoffee(
                      null
                    );
                    setShowBeanForm(true);
                  }}
                  className="bg-stone-900 text-white px-8 py-5 rounded-2xl inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-stone-900/10 active:scale-95 transition-all"
                >
                  <Icons.Plus className="w-4 h-4" />
                  Add Your First Coffee
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {coffees.map(
                  coffee => (
                    <CoffeeCard
                      key={coffee.id}
                      coffee={coffee}
                      onClick={current => {
                        setSelectedCoffee(
                          current
                        );
                        setEditingLog(null);
                        setPrefillLog(null);
                        setBrewFlowStep(
                          'brew'
                        );
                        setShowBrewFlow(
                          true
                        );
                      }}
                      onEdit={current => {
                        setEditingCoffee(
                          current
                        );
                        setShowBeanForm(
                          true
                        );
                      }}
                      onDelete={current =>
                        handleDeleteCoffee(
                          current.id
                        )
                      }
                    />
                  )
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'grind' && (
          <GrindReference />
        )}

        {activeTab === 'community' && (
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
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-6 overflow-y-auto">
          {brewFlowStep ===
            'select' && (
            <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-stone-800 display-font">
                    Select Roast
                  </h3>

                  <p className="text-xs text-stone-400 font-medium">
                    Which bean are we
                    calibrating today?
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowBrewFlow(
                      false
                    );
                    setEditingLog(null);
                    setPrefillLog(null);
                    setSelectedCoffee(
                      null
                    );
                  }}
                  className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-stone-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto mb-8 pr-2 custom-scrollbar">
                {coffees.map(coffee => (
                  <button
                    key={coffee.id}
                    onClick={() => {
                      setSelectedCoffee(
                        coffee
                      );
                      setBrewFlowStep(
                        'brew'
                      );
                    }}
                    className="w-full text-left p-5 rounded-[1.5rem] border border-stone-100 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex justify-between items-center group"
                  >
                    <div>
                      <p className="font-black text-stone-800 group-hover:text-amber-900">
                        {coffee.name}
                      </p>

                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">
                        {coffee.roaster}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-1 rounded-md">
                        {
                          coffee.remainingWeight
                        }
                        g
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setBrewFlowStep(
                    'new-bean'
                  )
                }
                className="w-full py-5 border-2 border-dashed border-stone-200 text-stone-400 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] hover:border-amber-400 hover:text-amber-800 hover:bg-amber-50/30 transition-all"
              >
                + Register New Bean
              </button>
            </div>
          )}

          {brewFlowStep ===
            'new-bean' && (
            <CoffeeBeanForm
              onSave={handleSaveBean}
              onCancel={() =>
                setBrewFlowStep(
                  'select'
                )
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
                    onboardingStep ===
                    'brew'
                  ) {
                    void completeOnboarding();
                    return;
                  }

                  setShowBrewFlow(
                    false
                  );
                  setEditingLog(null);
                  setPrefillLog(null);
                  setSelectedCoffee(
                    null
                  );
                }}
              />
            )}
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
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-6 overflow-y-auto">
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
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-8 shadow-2xl">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                  Permanent action
                </p>

                <h3 className="mt-2 text-2xl font-black text-stone-800 display-font">
                  Delete your account?
                </h3>
              </div>

              <p className="text-sm text-stone-500 leading-6">
                This will permanently
                delete your profile,
                coffees, brew logs and
                uploaded images. This
                action cannot be undone.
              </p>

              <div className="pt-4 space-y-3">
                <button
                  type="button"
                  disabled={
                    isDeletingAccount
                  }
                  onClick={async () => {
                    if (
                      isDeletingAccount
                    ) {
                      return;
                    }

                    setIsDeletingAccount(
                      true
                    );

                    try {
                      await accountService.deleteAccount();

                      localStorage.clear();

                      setCoffees([]);
                      setBrewLogs([]);
                      setProfile(null);

                      setShowDeleteAccountModal(
                        false
                      );

                      setShowProfileModal(
                        false
                      );

                      await signOut();
                    } catch (error) {
                      console.error(
                        'Account deletion failed:',
                        error
                      );

                      alert(
                        error instanceof
                          Error
                          ? error.message
                          : 'Unable to delete account.'
                      );
                    } finally {
                      setIsDeletingAccount(
                        false
                      );
                    }
                  }}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {isDeletingAccount
                    ? 'Deleting Account...'
                    : 'Permanently Delete Account'}
                </button>

                <button
                  type="button"
                  disabled={
                    isDeletingAccount
                  }
                  onClick={() =>
                    setShowDeleteAccountModal(
                      false
                    )
                  }
                  className="w-full bg-stone-100 text-stone-700 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md bg-stone-900/90 backdrop-blur-xl border border-white/10 px-4 py-5 flex justify-around items-center z-50 rounded-[3rem] shadow-2xl">
        {[
          {
            id: 'home',
            icon: (
              <Icons.Coffee className="w-6 h-6" />
            ),
            label: 'Home',
          },
          {
            id: 'journal',
            icon: (
              <Icons.Book className="w-6 h-6" />
            ),
            label: 'Journal',
          },
          {
            id: 'library',
            icon: (
              <Icons.Search className="w-6 h-6" />
            ),
            label: 'Library',
          },
          {
            id: 'community',
            icon: (
              <Icons.Users className="w-6 h-6" />
            ),
            label: 'Community',
          },
        ].map(item => {
          const isActive =
            activeTab === item.id ||
            (
              activeTab ===
                'analytics' &&
              item.id === 'home'
            );

          return (
            <button
              key={item.id}
              onClick={() =>
                setActiveTab(
                  item.id as
                    | 'home'
                    | 'journal'
                    | 'library'
                    | 'community'
                )
              }
              className={`flex flex-col items-center gap-1.5 transition-all group ${
                isActive
                  ? 'text-amber-400'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <div
                className={`p-2.5 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-amber-400/10 scale-110 shadow-inner'
                    : 'group-hover:bg-white/5'
                }`}
              >
                {item.icon}
              </div>

              <span
                className={`text-[8px] font-black uppercase tracking-[0.3em] ${
                  isActive
                    ? 'opacity-100'
                    : 'opacity-40'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default App;