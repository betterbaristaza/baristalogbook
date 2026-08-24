import React, { useMemo, useState } from 'react';
import { BrewLog, CoffeeBean } from '../types';
import { Icons } from '../constants';

interface HomeDashboardProps {
  coffees: CoffeeBean[];
  brewLogs: BrewLog[];
  profileName?: string;
  isLoading?: boolean;
  onLogBrew: () => void;
  onOpenBrew: (log: BrewLog) => void;
  onBrewAgain: (log: BrewLog) => void;
  onOpenAnalytics: () => void;
}

type DetailView =
  | 'favourite'
  | 'best'
  | 'trends'
  | 'usage'
  | null;

const DAY_MS = 24 * 60 * 60 * 1000;

const average = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce((total, value) => total + value, 0) /
    values.length
  );
};

const median = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};

const formatNumber = (
  value: number,
  decimals = 1
) => {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(decimals);
};

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getRatio = (log: BrewLog) => {
  if (log.dose <= 0 || log.yield <= 0) {
    return null;
  }

  return log.yield / log.dose;
};

const getCoffeeForLog = (
  log: BrewLog,
  coffees: CoffeeBean[]
) => {
  return coffees.find(
    coffee => coffee.id === log.coffeeId
  );
};

const countValues = (
  values: Array<string | undefined | null>
) => {
  const counts = new Map<string, number>();

  values.forEach(value => {
    const cleaned = value?.trim();

    if (!cleaned) {
      return;
    }

    counts.set(
      cleaned,
      (counts.get(cleaned) || 0) + 1
    );
  });

  return [...counts.entries()].sort(
    (a, b) => b[1] - a[1]
  );
};

const getMode = (
  values: Array<string | undefined | null>
) => {
  return countValues(values)[0]?.[0] || null;
};

const getChange = (
  current: number,
  previous: number
) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(
    ((current - previous) / previous) * 100
  );
};

const ChangeValue: React.FC<{
  value: number;
}> = ({ value }) => {
  const className =
    value > 0
      ? 'text-[var(--bp-success)]'
      : value < 0
        ? 'text-[var(--bp-danger)]'
        : 'text-[var(--bp-muted)]';

  return (
    <span className={`bp-mono ${className}`}>
      {value > 0 ? '+' : ''}
      {value}%
    </span>
  );
};

const Metric: React.FC<{
  label: string;
  value: React.ReactNode;
  sublabel?: string;
}> = ({
  label,
  value,
  sublabel,
}) => {
  return (
    <div className="min-w-0">
      <p className="bp-label text-[var(--bp-muted)]">
        {label}
      </p>

      <p className="bp-measurement mt-2 text-xl font-semibold text-[var(--bp-blue)]">
        {value}
      </p>

      {sublabel && (
        <p className="bp-code mt-1 text-[var(--bp-muted)]">
          {sublabel}
        </p>
      )}
    </div>
  );
};

const DetailShell: React.FC<{
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({
  title,
  eyebrow,
  onClose,
  children,
}) => {
  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-[rgba(12,39,72,0.48)] backdrop-blur-sm">
      <div className="min-h-full p-0 sm:p-6">
        <div className="mx-auto min-h-[100dvh] w-full max-w-2xl border-x border-[var(--bp-line)] bg-[var(--bp-paper)] sm:min-h-0">
          <div
            className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-[var(--bp-line)] bg-[var(--bp-paper)] px-4 pb-4 sm:px-6"
            style={{
              paddingTop:
                'calc(env(safe-area-inset-top) + 1rem)',
            }}
          >
            <div className="min-w-0">
              <p className="bp-index">
                {eyebrow}
              </p>

              <h2 className="bp-heading mt-1 text-2xl text-[var(--bp-blue)]">
                {title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="bp-button h-10 min-h-0 px-3"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          <div
            className="space-y-6 px-4 py-6 sm:px-6"
            style={{
              paddingBottom:
                'calc(env(safe-area-inset-bottom) + 2rem)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeDashboard: React.FC<HomeDashboardProps> = ({
  coffees,
  brewLogs,
  profileName,
  isLoading = false,
  onLogBrew,
  onOpenBrew,
  onBrewAgain,
  onOpenAnalytics,
}) => {
  const [detailView, setDetailView] =
    useState<DetailView>(null);

  const dashboard = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(
      now.getTime() - 30 * DAY_MS
    );
    const sixtyDaysAgo = new Date(
      now.getTime() - 60 * DAY_MS
    );

    const sortedLogs = [...brewLogs].sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

    const recentBrew = sortedLogs[0] || null;

    const current30 = sortedLogs.filter(log => {
      return new Date(log.date) >= thirtyDaysAgo;
    });

    const previous30 = sortedLogs.filter(log => {
      const date = new Date(log.date);

      return (
        date >= sixtyDaysAgo &&
        date < thirtyDaysAgo
      );
    });

    const activeCoffees = coffees.filter(
      coffee => coffee.remainingWeight > 0
    );

    const totalRemaining = activeCoffees.reduce(
      (total, coffee) =>
        total + coffee.remainingWeight,
      0
    );

    const validDoses = brewLogs
      .map(log => log.dose)
      .filter(value => value > 0);

    const overallMedianDose =
      median(validDoses) || 18;

    const coffeeStats = coffees.map(coffee => {
      const logs = sortedLogs.filter(
        log => log.coffeeId === coffee.id
      );

      const ratings = logs
        .map(log => log.rating)
        .filter(value => value > 0);

      const doses = logs
        .map(log => log.dose)
        .filter(value => value > 0);

      const coffeeMedianDose =
        median(doses) || overallMedianDose;

      return {
        coffee,
        logs,
        brewCount: logs.length,
        averageRating: average(ratings),
        medianDose: coffeeMedianDose,
        estimatedBrewsRemaining:
          coffeeMedianDose > 0
            ? Math.floor(
                coffee.remainingWeight /
                  coffeeMedianDose
              )
            : 0,
      };
    });

    const totalEstimatedBrews = coffeeStats
      .filter(
        item => item.coffee.remainingWeight > 0
      )
      .reduce(
        (total, item) =>
          total +
          item.estimatedBrewsRemaining,
        0
      );

    const favouriteCoffee =
      [...coffeeStats]
        .filter(item => item.brewCount > 0)
        .sort((a, b) => {
          if (b.brewCount !== a.brewCount) {
            return b.brewCount - a.brewCount;
          }

          return (
            b.averageRating -
            a.averageRating
          );
        })[0] || null;

    const highestRatedCoffee =
      [...coffeeStats]
        .filter(item => item.brewCount >= 3)
        .sort(
          (a, b) =>
            b.averageRating -
            a.averageRating
        )[0] || null;

    const bestBrews = [...sortedLogs]
      .filter(log => log.rating > 0)
      .sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }

        return (
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
        );
      })
      .slice(0, 5);

    const topFiveAverageRating =
      bestBrews.length > 0
        ? average(
            bestBrews.map(log => log.rating)
          )
        : 0;

    const topFiveMethod = getMode(
      bestBrews.map(log => log.method)
    );

    const currentMethods = countValues(
      current30.map(log => log.method)
    );

    const currentOrigins = countValues(
      current30.map(
        log =>
          getCoffeeForLog(log, coffees)?.origin
      )
    );

    const currentProcesses = countValues(
      current30.map(
        log =>
          getCoffeeForLog(log, coffees)?.process
      )
    );

    const currentRoasters = countValues(
      current30.map(
        log =>
          getCoffeeForLog(log, coffees)?.roaster
      )
    );

    const previousMethods = countValues(
      previous30.map(log => log.method)
    );

    const previousOrigins = countValues(
      previous30.map(
        log =>
          getCoffeeForLog(log, coffees)?.origin
      )
    );

    const previousProcesses = countValues(
      previous30.map(
        log =>
          getCoffeeForLog(log, coffees)?.process
      )
    );

    const findPreviousCount = (
      list: Array<[string, number]>,
      key?: string
    ) => {
      if (!key) {
        return 0;
      }

      return (
        list.find(([name]) => name === key)?.[1] ||
        0
      );
    };

    const topMethod = currentMethods[0] || null;
    const topOrigin = currentOrigins[0] || null;
    const topProcess =
      currentProcesses[0] || null;

    const coffeeIdsThisMonth = new Set(
      current30.map(log => log.coffeeId)
    );

    const methodsThisMonth = new Set(
      current30.map(log => log.method)
    );

    const ratingsThisMonth = current30
      .map(log => log.rating)
      .filter(value => value > 0);

    const coffeeUsed30Days = current30.reduce(
      (total, log) => total + (log.dose || 0),
      0
    );

    return {
      sortedLogs,
      recentBrew,

      current30,
      previous30,

      activeCoffees,
      totalRemaining,
      totalEstimatedBrews,

      overallMedianDose,
      coffeeStats,

      favouriteCoffee,
      highestRatedCoffee,

      bestBrews,
      topFiveAverageRating,
      topFiveMethod,

      currentMethods,
      currentOrigins,
      currentProcesses,
      currentRoasters,

      topMethod,
      topOrigin,
      topProcess,

      methodChange: topMethod
        ? getChange(
            topMethod[1],
            findPreviousCount(
              previousMethods,
              topMethod[0]
            )
          )
        : 0,

      originChange: topOrigin
        ? getChange(
            topOrigin[1],
            findPreviousCount(
              previousOrigins,
              topOrigin[0]
            )
          )
        : 0,

      processChange: topProcess
        ? getChange(
            topProcess[1],
            findPreviousCount(
              previousProcesses,
              topProcess[0]
            )
          )
        : 0,

      monthlyBrews: current30.length,
      previousMonthlyBrews:
        previous30.length,

      monthlyGrowth: getChange(
        current30.length,
        previous30.length
      ),

      monthlyCoffeeCount:
        coffeeIdsThisMonth.size,

      monthlyMethodCount:
        methodsThisMonth.size,

      monthlyAverageRating:
        average(ratingsThisMonth),

      coffeeUsed30Days,
    };
  }, [brewLogs, coffees]);

  const favouriteDetails = useMemo(() => {
    const favourite =
      dashboard.favouriteCoffee;

    if (!favourite) {
      return null;
    }

    const logs = favourite.logs;

    const doses = logs
      .map(log => log.dose)
      .filter(value => value > 0);

    const yields = logs
      .map(log => log.yield)
      .filter(value => value > 0);

    const brewTimes = logs
      .map(log => log.brewTime)
      .filter(value => value > 0);

    const temperatures = logs
      .map(log => log.waterTemp)
      .filter(
        (value): value is number =>
          typeof value === 'number' &&
          value > 0
      );

    const ratios = logs
      .map(getRatio)
      .filter(
        (value): value is number =>
          value !== null
      );

    const grinders = countValues(
      logs.map(log => log.grinder)
    );

    const methods = countValues(
      logs.map(log => log.method)
    );

    const bestBrew =
      [...logs]
        .filter(log => log.rating > 0)
        .sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }

          return (
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
          );
        })[0] || null;

    const firstBrew =
      [...logs].sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      )[0] || null;

    const latestBrew =
      [...logs].sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )[0] || null;

    const highRated = logs.filter(
      log => log.rating >= 4.5
    );

    const highRatedFlavours = countValues(
      highRated.flatMap(
        log => log.flavorGroups || []
      )
    );

    const sensory = {
      aroma: average(
        highRated.map(log => log.aroma)
      ),
      acidity: average(
        highRated.map(log => log.acidity)
      ),
      sweetness: average(
        highRated.map(log => log.sweetness)
      ),
      bitterness: average(
        highRated.map(log => log.bitterness)
      ),
      body: average(
        highRated.map(log => log.body)
      ),
      aftertaste: average(
        highRated.map(log => log.aftertaste)
      ),
    };

    return {
      ...favourite,
      typicalDose: median(doses),
      typicalYield: median(yields),
      typicalBrewTime: median(brewTimes),
      typicalTemperature:
        median(temperatures),
      typicalRatio: median(ratios),
      topGrinder: grinders[0]?.[0] || null,
      topMethod: methods[0]?.[0] || null,
      bestBrew,
      firstBrew,
      latestBrew,
      highRated,
      highRatedFlavours,
      sensory,
    };
  }, [dashboard.favouriteCoffee]);

  const bestBrewPatterns = useMemo(() => {
    const logs = dashboard.bestBrews;

    if (logs.length === 0) {
      return null;
    }

    const ratios = logs
      .map(getRatio)
      .filter(
        (value): value is number =>
          value !== null
      );

    const temperatures = logs
      .map(log => log.waterTemp)
      .filter(
        (value): value is number =>
          typeof value === 'number' &&
          value > 0
      );

    return {
      dose: median(
        logs
          .map(log => log.dose)
          .filter(value => value > 0)
      ),
      ratio: median(ratios),
      temperature: median(temperatures),
      brewTime: median(
        logs
          .map(log => log.brewTime)
          .filter(value => value > 0)
      ),
      method: getMode(
        logs.map(log => log.method)
      ),
    };
  }, [dashboard.bestBrews]);

  if (isLoading) {
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--bp-line)] pb-6">
        <div className="h-3 w-28 animate-pulse bg-[var(--bp-paper-dark)]" />
        <div className="mt-3 h-10 w-56 animate-pulse bg-[var(--bp-paper-dark)]" />
      </div>

      <div className="grid grid-cols-2 border border-[var(--bp-line)]">
        {[1, 2, 3, 4].map(item => (
          <div
            key={item}
            className="h-32 animate-pulse border border-[var(--bp-line)] bg-[var(--bp-paper-light)]"
          />
        ))}
      </div>
    </div>
  );
}

  if (brewLogs.length === 0) {
  return (
    <div className="space-y-8">
      <section className="border-b border-[var(--bp-line)] pb-6">
        <p className="bp-index">
          01 / HOME
        </p>

        <div className="mt-2 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="bp-label text-[var(--bp-muted)]">
              Welcome back
            </p>

            <h1 className="bp-coffee-name mt-2 break-words text-4xl text-[var(--bp-blue)]">
              {profileName || 'Coffee Lover'}
            </h1>
          </div>

          <span className="bp-code shrink-0 text-[var(--bp-muted)]">
            V1.0
          </span>
        </div>
      </section>

      <section className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-6 text-left">
        <div className="mb-6 flex items-center gap-3">
  <div className="flex h-10 w-10 items-center justify-center border border-[var(--bp-line-strong)]">
    <Icons.Coffee className="h-5 w-5 text-[var(--bp-blue)]" />
  </div>

  <p className="bp-label text-[var(--bp-orange)]">
    Brew record
  </p>
</div>

        <p className="bp-index">
  01.01 / FIRST ENTRY
</p>

        <h2 className="bp-heading mt-2 text-2xl text-[var(--bp-blue)]">
  Start building your brew history
</h2>

        <p className="mx-auto mb-8 mt-3 max-w-sm text-sm leading-relaxed text-stone-400">
          Your favourites, best brews, trends and coffee
          usage will appear here as you log brews.
        </p>

        <button
          type="button"
          onClick={onLogBrew}
          className="inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-stone-900/10 transition-all active:scale-95"
        >
          <Icons.Plus className="h-4 w-4" />
          Log Your First Brew
        </button>
           </section>
    </div>
  );
}
  const recentCoffee =
    dashboard.recentBrew
      ? getCoffeeForLog(
          dashboard.recentBrew,
          coffees
        )
      : null;

  return (
  <>
    <div className="space-y-8">
      <section className="border-b border-[var(--bp-line)] pb-6">
        <p className="bp-index">
          01 / HOME
        </p>

        <div className="mt-2 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="bp-label text-[var(--bp-muted)]">
              Welcome back
            </p>

            <h1 className="bp-coffee-name mt-2 break-words text-4xl text-[var(--bp-blue)]">
              {profileName || 'Coffee Lover'}
            </h1>
          </div>

          <span className="bp-code shrink-0 text-[var(--bp-muted)]">
            V1.0
          </span>
        </div>
      </section>

      <section className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
        <div className="grid grid-cols-[1fr_auto] border-b border-[var(--bp-line)]">
          <div className="p-5">
            <p className="bp-label text-[var(--bp-muted)]">
              Coffee reserve
            </p>

            <div className="mt-2 flex items-end gap-2">
              <p className="bp-measurement text-4xl font-semibold text-[var(--bp-blue)]">
                {Math.round(
                  dashboard.totalRemaining
                )}
              </p>

              <span className="bp-code pb-1 text-[var(--bp-muted)]">
                G
              </span>
            </div>

            <p className="bp-code mt-2 text-[var(--bp-muted)]">
              {dashboard.activeCoffees.length}{' '}
              active{' '}
              {dashboard.activeCoffees.length === 1
                ? 'coffee'
                : 'coffees'}
              {' / '}
              approx.{' '}
              {dashboard.totalEstimatedBrews}{' '}
              brews remaining
            </p>
          </div>

          <div className="flex min-w-[84px] items-center justify-center border-l border-[var(--bp-line)]">
            <Icons.Coffee className="h-6 w-6 text-[var(--bp-blue)]" />
          </div>
        </div>

        <button
          type="button"
          onClick={onLogBrew}
          className="flex w-full items-center justify-between bg-[var(--bp-orange)] px-5 py-4 text-left text-[var(--bp-blue)]"
        >
          <div>
            <p className="bp-label">
              New entry
            </p>

            <p className="mt-1 text-sm font-semibold">
              Log a brew
            </p>
          </div>

          <Icons.Plus className="h-5 w-5" />
        </button>
      </section>

        {dashboard.recentBrew && (
  <section>
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <p className="bp-index">
          01.02 / RECENT BREW
        </p>

        <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
          Recent Brew
        </h3>
      </div>

      <span className="bp-code text-[var(--bp-muted)]">
        {formatDate(
          dashboard.recentBrew.date
        )}
      </span>
    </div>

    <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
      <button
        type="button"
        onClick={() =>
          onOpenBrew(
            dashboard.recentBrew as BrewLog
          )
        }
        className="w-full text-left"
      >
        <div className="grid grid-cols-[1fr_auto] border-b border-[var(--bp-line)]">
          <div className="min-w-0 p-5">
            <p className="bp-label text-[var(--bp-orange)]">
              {dashboard.recentBrew.method}
            </p>

            <h4 className="bp-coffee-name mt-2 truncate text-2xl text-[var(--bp-blue)]">
              {recentCoffee?.name ||
                'Unknown Coffee'}
            </h4>

            <p className="bp-code mt-1 text-[var(--bp-muted)]">
              {recentCoffee?.roaster ||
                'Roaster not recorded'}
            </p>
          </div>

          <div className="flex min-w-[82px] flex-col items-center justify-center border-l border-[var(--bp-line)] px-4">
            <Icons.Star className="h-4 w-4 fill-current text-[var(--bp-orange)]" />

            <span className="bp-measurement mt-1 text-lg font-semibold text-[var(--bp-blue)]">
              {dashboard.recentBrew.rating}
            </span>

            <span className="bp-label mt-1 text-[var(--bp-muted)]">
              Rating
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4">
          <div className="border-b border-r border-[var(--bp-line)] p-4 sm:border-b-0">
            <Metric
              label="Dose"
              value={`${formatNumber(
                dashboard.recentBrew.dose
              )}g`}
            />
          </div>

          <div className="border-b border-[var(--bp-line)] p-4 sm:border-b-0 sm:border-r">
            <Metric
              label="Yield"
              value={`${formatNumber(
                dashboard.recentBrew.yield
              )}g`}
            />
          </div>

          <div className="border-r border-[var(--bp-line)] p-4">
            <Metric
              label="Ratio"
              value={
                getRatio(
                  dashboard.recentBrew
                )
                  ? `1:${getRatio(
                      dashboard.recentBrew
                    )?.toFixed(1)}`
                  : '—'
              }
            />
          </div>

          <div className="p-4">
            <Metric
              label="Time"
              value={
                dashboard.recentBrew
                  .brewTime > 0
                  ? `${dashboard.recentBrew.brewTime}s`
                  : '—'
              }
            />
          </div>
        </div>
      </button>

      <div className="grid grid-cols-2 border-t border-[var(--bp-line)]">
        <button
          type="button"
          onClick={() =>
            onOpenBrew(
              dashboard.recentBrew as BrewLog
            )
          }
          className="bp-label border-r border-[var(--bp-line)] px-4 py-4 text-[var(--bp-blue)]"
        >
          Open Brew
        </button>

        <button
          type="button"
          onClick={() =>
            onBrewAgain(
              dashboard.recentBrew as BrewLog
            )
          }
          className="flex items-center justify-center gap-2 bg-[var(--bp-orange)] px-4 py-4 text-[var(--bp-blue)]"
        >
          <Icons.Copy className="h-3.5 w-3.5" />

          <span className="bp-label">
            Brew Again
          </span>
        </button>
      </div>
    </div>
  </section>
)}

        <section>
  <div className="mb-4 flex items-end justify-between gap-4">
    <div>
      <p className="bp-index">
        01.03 / BREWING
      </p>

      <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
        Your Brewing
      </h3>

      <p className="bp-code mt-1 text-[var(--bp-muted)]">
        Based on your recorded brews
      </p>
    </div>

    <button
      type="button"
      onClick={onOpenAnalytics}
      className="bp-label text-[var(--bp-orange)]"
    >
      Full Analytics
    </button>
  </div>

  <div className="grid grid-cols-2 border border-[var(--bp-line)]">
    <button
      type="button"
      onClick={() =>
        setDetailView('favourite')
      }
      className="min-h-48 border-b border-r border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-5 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center border border-[var(--bp-line-strong)]">
          <Icons.Coffee className="h-4 w-4 text-[var(--bp-blue)]" />
        </span>

        <span className="bp-label text-[var(--bp-muted)]">
          Favourite
        </span>
      </div>

      {dashboard.favouriteCoffee ? (
        <>
          <h4 className="bp-coffee-name mt-6 line-clamp-2 text-xl text-[var(--bp-blue)]">
            {
              dashboard.favouriteCoffee
                .coffee.name
            }
          </h4>

          <p className="bp-code mt-1 truncate text-[var(--bp-muted)]">
            {
              dashboard.favouriteCoffee
                .coffee.roaster
            }
          </p>

          <div className="mt-5 flex items-end justify-between border-t border-[var(--bp-line)] pt-4">
            <div>
              <p className="bp-label text-[var(--bp-muted)]">
                Brews
              </p>

              <p className="bp-measurement mt-1 text-lg font-semibold text-[var(--bp-blue)]">
                {
                  dashboard.favouriteCoffee
                    .brewCount
                }
              </p>
            </div>

            <div className="text-right">
              <p className="bp-label text-[var(--bp-muted)]">
                Rating
              </p>

              <div className="mt-1 flex items-center justify-end gap-1">
                <Icons.Star className="h-3 w-3 fill-current text-[var(--bp-orange)]" />

                <span className="bp-measurement text-lg font-semibold text-[var(--bp-blue)]">
                  {dashboard.favouriteCoffee.averageRating.toFixed(
                    1
                  )}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="bp-code mt-6 text-[var(--bp-muted)]">
          Keep brewing to establish your favourite coffee.
        </p>
      )}
    </button>

    <button
      type="button"
      onClick={() =>
        setDetailView('best')
      }
      className="min-h-48 border-b border-[var(--bp-line)] bg-[var(--bp-paper)] p-5 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center border border-[var(--bp-line-strong)]">
          <Icons.Star className="h-4 w-4 text-[var(--bp-blue)]" />
        </span>

        <span className="bp-label text-[var(--bp-orange)]">
          Best Brews
        </span>
      </div>

      <p className="bp-measurement mt-6 text-4xl font-semibold text-[var(--bp-blue)]">
        {dashboard.topFiveAverageRating.toFixed(
          1
        )}
      </p>

      <p className="bp-label mt-1 text-[var(--bp-muted)]">
        Top 5 average
      </p>

      <div className="mt-5 border-t border-[var(--bp-line)] pt-4">
        <p className="bp-label text-[var(--bp-muted)]">
          Common method
        </p>

        <p className="bp-code mt-2 truncate text-[var(--bp-blue)]">
          {dashboard.topFiveMethod ||
            'Not enough data'}
        </p>
      </div>
    </button>

    <button
      type="button"
      onClick={() =>
        setDetailView('trends')
      }
      className="col-span-2 border-b border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-5 text-left"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="bp-label text-[var(--bp-muted)]">
            Trends / Last 30 days
          </p>

          <div className="mt-2 flex items-end gap-2">
            <p className="bp-measurement text-4xl font-semibold text-[var(--bp-blue)]">
              {dashboard.monthlyBrews}
            </p>

            <span className="bp-code pb-1 text-[var(--bp-muted)]">
              BREWS
            </span>
          </div>

          <p className="bp-code mt-1 text-[var(--bp-muted)]">
            <ChangeValue
              value={
                dashboard.monthlyGrowth
              }
            />
            {' / '}
            vs previous 30 days
          </p>
        </div>

        <span className="flex h-9 w-9 items-center justify-center border border-[var(--bp-line-strong)]">
          <Icons.Book className="h-4 w-4 text-[var(--bp-blue)]" />
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 border-t border-[var(--bp-line)]">
        <div className="border-r border-[var(--bp-line)] py-4 pr-3">
          <p className="bp-label text-[var(--bp-muted)]">
            Method
          </p>

          <p className="bp-code mt-2 truncate text-[var(--bp-blue)]">
            {dashboard.topMethod?.[0] ||
              '—'}
          </p>
        </div>

        <div className="border-r border-[var(--bp-line)] px-3 py-4">
          <p className="bp-label text-[var(--bp-muted)]">
            Origin
          </p>

          <p className="bp-code mt-2 truncate text-[var(--bp-blue)]">
            {dashboard.topOrigin?.[0] ||
              '—'}
          </p>
        </div>

        <div className="py-4 pl-3">
          <p className="bp-label text-[var(--bp-muted)]">
            Process
          </p>

          <p className="bp-code mt-2 truncate text-[var(--bp-blue)]">
            {dashboard.topProcess?.[0] ||
              '—'}
          </p>
        </div>
      </div>
    </button>

    <button
      type="button"
      onClick={() =>
        setDetailView('usage')
      }
      className="col-span-2 bg-[var(--bp-paper)] p-5 text-left"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="bp-label text-[var(--bp-muted)]">
            Coffee Usage
          </p>

          <div className="mt-2 flex items-end gap-2">
            <p className="bp-measurement text-4xl font-semibold text-[var(--bp-blue)]">
              {Math.round(
                dashboard.totalRemaining
              )}
            </p>

            <span className="bp-code pb-1 text-[var(--bp-muted)]">
              G AVAILABLE
            </span>
          </div>
        </div>

        <span className="flex h-9 w-9 items-center justify-center border border-[var(--bp-line-strong)]">
          <Icons.Info className="h-4 w-4 text-[var(--bp-blue)]" />
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 border-t border-[var(--bp-line)]">
        <div className="border-r border-[var(--bp-line)] py-4 pr-3">
          <Metric
            label="Used 30D"
            value={`${Math.round(
              dashboard.coffeeUsed30Days
            )}g`}
          />
        </div>

        <div className="border-r border-[var(--bp-line)] px-3 py-4">
          <Metric
            label="Dose"
            value={`${formatNumber(
              dashboard.overallMedianDose
            )}g`}
          />
        </div>

        <div className="py-4 pl-3">
          <Metric
            label="Est. Brews"
            value={
              dashboard.totalEstimatedBrews
            }
          />
        </div>
      </div>
    </button>
  </div>
</section>

        <section>
  <div className="mb-4 flex items-end justify-between gap-4">
    <div>
      <p className="bp-index">
        01.04 / LAST 30 DAYS
      </p>

      <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
        Activity Summary
      </h3>
    </div>

    <span className="bp-code text-[var(--bp-muted)]">
      {dashboard.monthlyBrews} RECORDED BREWS
    </span>
  </div>

  <div className="grid grid-cols-2 border border-[var(--bp-line)] sm:grid-cols-4">
    <div className="border-b border-r border-[var(--bp-line)] p-4 sm:border-b-0">
      <Metric
        label="Brews"
        value={dashboard.monthlyBrews}
      />
    </div>

    <div className="border-b border-[var(--bp-line)] p-4 sm:border-b-0 sm:border-r">
      <Metric
        label="Coffees"
        value={
          dashboard.monthlyCoffeeCount
        }
      />
    </div>

    <div className="border-r border-[var(--bp-line)] p-4">
      <Metric
        label="Rating"
        value={
          dashboard.monthlyAverageRating > 0
            ? dashboard.monthlyAverageRating.toFixed(
                1
              )
            : '—'
        }
      />
    </div>

    <div className="p-4">
      <Metric
        label="Methods"
        value={
          dashboard.monthlyMethodCount
        }
      />
    </div>
  </div>
</section>
      </div>

      {detailView === 'favourite' &&
        favouriteDetails && (
          <DetailShell
            eyebrow="Favourite Coffee"
            title={
              favouriteDetails.coffee.name
            }
            onClose={() =>
              setDetailView(null)
            }
          >
            <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-800">
                {
                  favouriteDetails.coffee
                    .roaster
                }
              </p>

              <div className="mt-5 grid grid-cols-2 gap-5">
                <Metric
                  label="Origin"
                  value={
                    favouriteDetails.coffee
                      .origin || '—'
                  }
                />

                <Metric
                  label="Process"
                  value={
                    favouriteDetails.coffee
                      .process || '—'
                  }
                />

                <Metric
                  label="Brews"
                  value={
                    favouriteDetails.brewCount
                  }
                />

                <Metric
                  label="Avg Rating"
                  value={
                    favouriteDetails.averageRating >
                    0
                      ? favouriteDetails.averageRating.toFixed(
                          1
                        )
                      : '—'
                  }
                />
              </div>

              {(favouriteDetails.firstBrew ||
                favouriteDetails.latestBrew) && (
                <div className="mt-5 border-t border-stone-100 pt-4 text-[10px] font-semibold text-stone-400">
                  {favouriteDetails.firstBrew && (
                    <span>
                      First brewed{' '}
                      {formatDate(
                        favouriteDetails
                          .firstBrew.date
                      )}
                    </span>
                  )}

                  {favouriteDetails.firstBrew &&
                    favouriteDetails.latestBrew && (
                      <span> · </span>
                    )}

                  {favouriteDetails.latestBrew && (
                    <span>
                      Latest{' '}
                      {formatDate(
                        favouriteDetails
                          .latestBrew.date
                      )}
                    </span>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
                Your Typical Recipe
              </p>

              <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6">
                <Metric
                  label="Method"
                  value={
                    favouriteDetails.topMethod ||
                    '—'
                  }
                />

                <Metric
                  label="Grinder"
                  value={
                    favouriteDetails.topGrinder ||
                    '—'
                  }
                />

                <Metric
                  label="Dose"
                  value={
                    favouriteDetails.typicalDose >
                    0
                      ? `${formatNumber(
                          favouriteDetails.typicalDose
                        )}g`
                      : '—'
                  }
                />

                <Metric
                  label="Yield"
                  value={
                    favouriteDetails.typicalYield >
                    0
                      ? `${formatNumber(
                          favouriteDetails.typicalYield
                        )}g`
                      : '—'
                  }
                />

                <Metric
                  label="Ratio"
                  value={
                    favouriteDetails.typicalRatio >
                    0
                      ? `1:${favouriteDetails.typicalRatio.toFixed(
                          1
                        )}`
                      : '—'
                  }
                />

                <Metric
                  label="Temperature"
                  value={
                    favouriteDetails.typicalTemperature >
                    0
                      ? `${formatNumber(
                          favouriteDetails.typicalTemperature
                        )}°C`
                      : '—'
                  }
                />

                <Metric
                  label="Brew Time"
                  value={
                    favouriteDetails.typicalBrewTime >
                    0
                      ? `${formatNumber(
                          favouriteDetails.typicalBrewTime
                        )}s`
                      : '—'
                  }
                />
              </div>
            </section>

            {favouriteDetails.bestBrew && (
              <section className="rounded-[2rem] border border-amber-100 bg-[#fdf8f3] p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-800/50">
                      Best Recorded Brew
                    </p>

                    <p className="mt-2 text-3xl font-black text-amber-950">
                      {
                        favouriteDetails
                          .bestBrew.rating
                      }
                      /5
                    </p>
                  </div>

                  <Icons.Star className="h-6 w-6 fill-current text-amber-500" />
                </div>

                <div className="mt-5 grid grid-cols-4 gap-3 border-t border-amber-100 pt-4">
                  <Metric
                    label="Dose"
                    value={`${formatNumber(
                      favouriteDetails.bestBrew
                        .dose
                    )}g`}
                  />

                  <Metric
                    label="Yield"
                    value={`${formatNumber(
                      favouriteDetails.bestBrew
                        .yield
                    )}g`}
                  />

                  <Metric
                    label="Ratio"
                    value={
                      getRatio(
                        favouriteDetails.bestBrew
                      )
                        ? `1:${getRatio(
                            favouriteDetails.bestBrew
                          )?.toFixed(1)}`
                        : '—'
                    }
                  />

                  <Metric
                    label="Time"
                    value={
                      favouriteDetails.bestBrew
                        .brewTime > 0
                        ? `${favouriteDetails.bestBrew.brewTime}s`
                        : '—'
                    }
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenBrew(
                        favouriteDetails.bestBrew as BrewLog
                      )
                    }
                    className="rounded-2xl border border-amber-200 bg-white py-3 text-[9px] font-black uppercase tracking-[0.16em] text-amber-900"
                  >
                    View Brew
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onBrewAgain(
                        favouriteDetails.bestBrew as BrewLog
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-2xl bg-amber-900 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-white"
                  >
                    <Icons.Copy className="h-3.5 w-3.5" />
                    Brew Again
                  </button>
                </div>
              </section>
            )}

            {dashboard.highestRatedCoffee &&
              dashboard.highestRatedCoffee
                .coffee.id !==
                favouriteDetails.coffee.id && (
                <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">
                    Highest Rated Coffee
                  </p>

                  <p className="mt-2 text-xl font-black text-stone-900 display-font">
                    {
                      dashboard
                        .highestRatedCoffee.coffee
                        .name
                    }
                  </p>

                  <p className="mt-1 text-xs font-semibold text-stone-400">
                    {
                      dashboard
                        .highestRatedCoffee
                        .brewCount
                    }{' '}
                    brews ·{' '}
                    {dashboard.highestRatedCoffee.averageRating.toFixed(
                      1
                    )}
                    /5 average
                  </p>

                  <p className="mt-4 text-[10px] leading-relaxed text-stone-500">
                    Favourite is based on the
                    coffee you brew most. Highest
                    Rated is shown separately and
                    requires at least 3 brews.
                  </p>
                </section>
              )}

            {favouriteDetails.highRated.length >
              0 && (
              <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
                  Higher Rated Brews
                </p>

                <p className="mt-1 text-xs font-medium text-stone-400">
                  {
                    favouriteDetails.highRated
                      .length
                  }{' '}
                  brews rated 4.5 or higher
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <Metric
                    label="Sweetness"
                    value={
                      favouriteDetails.sensory.sweetness.toFixed(
                        1
                      )
                    }
                  />

                  <Metric
                    label="Acidity"
                    value={
                      favouriteDetails.sensory.acidity.toFixed(
                        1
                      )
                    }
                  />

                  <Metric
                    label="Body"
                    value={
                      favouriteDetails.sensory.body.toFixed(
                        1
                      )
                    }
                  />

                  <Metric
                    label="Aftertaste"
                    value={
                      favouriteDetails.sensory.aftertaste.toFixed(
                        1
                      )
                    }
                  />
                </div>

                {favouriteDetails
                  .highRatedFlavours.length >
                  0 && (
                  <div className="mt-5 border-t border-stone-100 pt-4">
                    <p className="mb-3 text-[8px] font-black uppercase tracking-[0.18em] text-stone-400">
                      Most Recorded Flavour Groups
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {favouriteDetails.highRatedFlavours
                        .slice(0, 4)
                        .map(
                          ([name, count]) => (
                            <span
                              key={name}
                              className="rounded-full bg-stone-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-stone-600"
                            >
                              {name} · {count}
                            </span>
                          )
                        )}
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
                Coffee Usage
              </p>

              <div className="mt-5 grid grid-cols-2 gap-5">
                <Metric
                  label="Bag Size"
                  value={`${favouriteDetails.coffee.totalWeight}g`}
                />

                <Metric
                  label="Remaining"
                  value={`${favouriteDetails.coffee.remainingWeight}g`}
                />

                <Metric
                  label="Used"
                  value={`${Math.max(
                    0,
                    favouriteDetails.coffee
                      .totalWeight -
                      favouriteDetails.coffee
                        .remainingWeight
                  )}g`}
                />

                <Metric
                  label="Est. Brews Left"
                  value={
                    favouriteDetails.estimatedBrewsRemaining
                  }
                />
              </div>
            </section>
          </DetailShell>
        )}

      {detailView === 'best' && (
        <DetailShell
          eyebrow="Best Brews"
          title="What has worked well"
          onClose={() =>
            setDetailView(null)
          }
        >
          {bestBrewPatterns && (
            <section className="rounded-[2rem] border border-amber-100 bg-[#fdf8f3] p-6 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-800/50">
                Your Common Approach
              </p>

              <p className="mt-1 text-xs leading-relaxed text-amber-950/60">
                Median values across your 5
                highest-rated recorded brews.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6">
                <Metric
                  label="Method"
                  value={
                    bestBrewPatterns.method ||
                    '—'
                  }
                />

                <Metric
                  label="Dose"
                  value={
                    bestBrewPatterns.dose > 0
                      ? `${formatNumber(
                          bestBrewPatterns.dose
                        )}g`
                      : '—'
                  }
                />

                <Metric
                  label="Ratio"
                  value={
                    bestBrewPatterns.ratio > 0
                      ? `1:${bestBrewPatterns.ratio.toFixed(
                          1
                        )}`
                      : '—'
                  }
                />

                <Metric
                  label="Temperature"
                  value={
                    bestBrewPatterns.temperature >
                    0
                      ? `${formatNumber(
                          bestBrewPatterns.temperature
                        )}°C`
                      : '—'
                  }
                />

                <Metric
                  label="Brew Time"
                  value={
                    bestBrewPatterns.brewTime >
                    0
                      ? `${formatNumber(
                          bestBrewPatterns.brewTime
                        )}s`
                      : '—'
                  }
                />
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="px-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
                Highest Rated Brews
              </p>

              <p className="mt-1 text-xs text-stone-400">
                These are recorded outcomes, not
                claims that one variable caused
                the result.
              </p>
            </div>

            {dashboard.bestBrews.map(
              (log, index) => {
                const coffee =
                  getCoffeeForLog(
                    log,
                    coffees
                  );

                return (
                  <div
                    key={log.id}
                    className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-300">
                          #{index + 1} ·{' '}
                          {log.method}
                        </p>

                        <p className="mt-1 truncate text-lg font-black text-stone-900 display-font">
                          {coffee?.name ||
                            'Unknown Coffee'}
                        </p>

                        <p className="mt-1 truncate text-[10px] font-semibold text-stone-400">
                          {coffee?.roaster ||
                            'Roaster not recorded'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500">
                        <Icons.Star className="h-4 w-4 fill-current" />

                        <span className="text-sm font-black">
                          {log.rating}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-2 border-t border-stone-100 pt-4">
                      <Metric
                        label="Dose"
                        value={`${formatNumber(
                          log.dose
                        )}g`}
                      />

                      <Metric
                        label="Yield"
                        value={`${formatNumber(
                          log.yield
                        )}g`}
                      />

                      <Metric
                        label="Ratio"
                        value={
                          getRatio(log)
                            ? `1:${getRatio(
                                log
                              )?.toFixed(1)}`
                            : '—'
                        }
                      />

                      <Metric
                        label="Time"
                        value={
                          log.brewTime > 0
                            ? `${log.brewTime}s`
                            : '—'
                        }
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenBrew(log)
                        }
                        className="rounded-2xl border border-stone-200 bg-stone-50 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-stone-600"
                      >
                        View Brew
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onBrewAgain(log)
                        }
                        className="flex items-center justify-center gap-2 rounded-2xl bg-stone-900 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-white"
                      >
                        <Icons.Copy className="h-3.5 w-3.5" />
                        Brew Again
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </section>
        </DetailShell>
      )}

      {detailView === 'trends' && (
        <DetailShell
          eyebrow="Brewing Trends"
          title="How your brewing is changing"
          onClose={() =>
            setDetailView(null)
          }
        >
          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
              Last 30 Days
            </p>

            <div className="mt-5 grid grid-cols-2 gap-5">
              <Metric
                label="Brews"
                value={
                  dashboard.monthlyBrews
                }
                sublabel={`${dashboard.previousMonthlyBrews} previous 30 days`}
              />

              <Metric
                label="Change"
                value={
                  <ChangeValue
                    value={
                      dashboard.monthlyGrowth
                    }
                  />
                }
              />

              <Metric
                label="Coffees"
                value={
                  dashboard.monthlyCoffeeCount
                }
              />

              <Metric
                label="Methods"
                value={
                  dashboard.monthlyMethodCount
                }
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
              Brew Method Trends
            </p>

            <div className="mt-5 space-y-4">
              {dashboard.currentMethods
                .slice(0, 5)
                .map(([name, count]) => {
                  const percentage =
                    dashboard.current30.length >
                    0
                      ? Math.round(
                          (count /
                            dashboard.current30
                              .length) *
                            100
                        )
                      : 0;

                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-black text-stone-700">
                          {name}
                        </span>

                        <span className="text-[10px] font-black text-stone-400">
                          {count} brews ·{' '}
                          {percentage}%
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-stone-800"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
              Origin Trends
            </p>

            <div className="mt-5 space-y-3">
              {dashboard.currentOrigins
                .slice(0, 5)
                .map(([name, count]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between border-b border-stone-50 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-black text-stone-700">
                      {name}
                    </span>

                    <span className="text-[10px] font-black text-stone-400">
                      {count} brews
                    </span>
                  </div>
                ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
              Processing Trends
            </p>

            <div className="mt-5 space-y-3">
              {dashboard.currentProcesses
                .slice(0, 5)
                .map(([name, count]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between border-b border-stone-50 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-black text-stone-700">
                      {name}
                    </span>

                    <span className="text-[10px] font-black text-stone-400">
                      {count} brews
                    </span>
                  </div>
                ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
              Current Leaders
            </p>

            <div className="mt-5 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-wider text-stone-400">
                    Most Used Method
                  </p>

                  <p className="mt-1 text-sm font-black text-stone-900">
                    {dashboard.topMethod?.[0] ||
                      '—'}
                  </p>
                </div>

                {dashboard.topMethod && (
                  <ChangeValue
                    value={
                      dashboard.methodChange
                    }
                  />
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-wider text-stone-400">
                    Most Brewed Origin
                  </p>

                  <p className="mt-1 text-sm font-black text-stone-900">
                    {dashboard.topOrigin?.[0] ||
                      '—'}
                  </p>
                </div>

                {dashboard.topOrigin && (
                  <ChangeValue
                    value={
                      dashboard.originChange
                    }
                  />
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-wider text-stone-400">
                    Most Used Process
                  </p>

                  <p className="mt-1 text-sm font-black text-stone-900">
                    {dashboard.topProcess?.[0] ||
                      '—'}
                  </p>
                </div>

                {dashboard.topProcess && (
                  <ChangeValue
                    value={
                      dashboard.processChange
                    }
                  />
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-amber-100 bg-amber-50/50 p-6">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-800">
              About These Trends
            </p>

            <p className="mt-3 text-xs leading-relaxed text-stone-600">
              Brewprint reports what appears in
              your recorded history. A change in
              rating or recipe variable does not
              prove that one variable caused the
              result.
            </p>
          </section>
        </DetailShell>
      )}

      {detailView === 'usage' && (
        <DetailShell
          eyebrow="Coffee Usage"
          title="What you have and what you use"
          onClose={() =>
            setDetailView(null)
          }
        >
          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-5">
              <Metric
                label="Available"
                value={`${Math.round(
                  dashboard.totalRemaining
                )}g`}
              />

              <Metric
                label="Active Coffees"
                value={
                  dashboard.activeCoffees.length
                }
              />

              <Metric
                label="Used 30 Days"
                value={`${Math.round(
                  dashboard.coffeeUsed30Days
                )}g`}
              />

              <Metric
                label="Typical Dose"
                value={`${formatNumber(
                  dashboard.overallMedianDose
                )}g`}
              />
            </div>
          </section>

          <section className="space-y-3">
            <div className="px-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
                Current Coffees
              </p>

              <p className="mt-1 text-xs text-stone-400">
                Estimated brews use your median
                dose for each coffee where
                possible.
              </p>
            </div>

            {dashboard.coffeeStats
              .filter(
                item =>
                  item.coffee
                    .remainingWeight > 0
              )
              .sort(
                (a, b) =>
                  a.coffee.remainingWeight -
                  b.coffee.remainingWeight
              )
              .map(item => {
                const progress =
                  item.coffee.totalWeight > 0
                    ? Math.min(
                        100,
                        Math.max(
                          0,
                          (item.coffee
                            .remainingWeight /
                            item.coffee
                              .totalWeight) *
                            100
                        )
                      )
                    : 0;

                return (
                  <div
                    key={item.coffee.id}
                    className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-black text-stone-900 display-font">
                          {item.coffee.name}
                        </p>

                        <p className="mt-1 truncate text-[10px] font-semibold text-stone-400">
                          {item.coffee.roaster}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-black text-stone-900">
                          {
                            item.coffee
                              .remainingWeight
                          }
                          g
                        </p>

                        <p className="text-[8px] font-black uppercase tracking-wider text-stone-400">
                          remaining
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-amber-800"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-stone-100 pt-4">
                      <Metric
                        label="Brews"
                        value={item.brewCount}
                      />

                      <Metric
                        label="Typical Dose"
                        value={`${formatNumber(
                          item.medianDose
                        )}g`}
                      />

                      <Metric
                        label="Est. Left"
                        value={
                          item.estimatedBrewsRemaining
                        }
                      />
                    </div>
                  </div>
                );
              })}
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
              Usage By Origin
            </p>

            <div className="mt-5 space-y-3">
              {dashboard.currentOrigins
                .slice(0, 5)
                .map(([name, count]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between border-b border-stone-50 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-black text-stone-700">
                      {name}
                    </span>

                    <span className="text-[10px] font-black text-stone-400">
                      {count} brews
                    </span>
                  </div>
                ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
              Usage By Roaster
            </p>

            <div className="mt-5 space-y-3">
              {dashboard.currentRoasters
                .slice(0, 5)
                .map(([name, count]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between border-b border-stone-50 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-black text-stone-700">
                      {name}
                    </span>

                    <span className="text-[10px] font-black text-stone-400">
                      {count} brews
                    </span>
                  </div>
                ))}
            </div>
          </section>
        </DetailShell>
      )}
    </>
  );
};

export default HomeDashboard;