import React, { useMemo, useState } from 'react';

import { BrewLog, CoffeeBean } from '../types';
import { Icons } from '../constants';
import { ProGate } from './ProGate';

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

    <ProGate
  loadingFallback={
    <div className="min-h-48 border-b border-[var(--bp-line)] bg-[var(--bp-paper)] p-5">
      <div className="h-full animate-pulse">
        <div className="flex items-start justify-between gap-3">
          <div className="h-9 w-9 bg-[var(--bp-paper-dark)]" />
          <div className="h-3 w-20 bg-[var(--bp-paper-dark)]" />
        </div>

        <div className="mt-6 h-10 w-16 bg-[var(--bp-paper-dark)]" />
        <div className="mt-3 h-3 w-24 bg-[var(--bp-paper-dark)]" />

        <div className="mt-5 border-t border-[var(--bp-line)] pt-4">
          <div className="h-3 w-24 bg-[var(--bp-paper-dark)]" />
          <div className="mt-3 h-3 w-20 bg-[var(--bp-paper-dark)]" />
        </div>
      </div>
    </div>
  }
  fallback={
    <div className="min-h-48 border-b border-[var(--bp-line)] bg-[var(--bp-paper)] p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center border border-[var(--bp-line-strong)]">
          <Icons.Star className="h-4 w-4 text-[var(--bp-muted)]" />
        </span>

        <span className="bp-label text-[var(--bp-orange)]">
          Pro
        </span>
      </div>

      <h4 className="bp-heading mt-6 text-xl text-[var(--bp-blue)]">
        Best Brews
      </h4>

      <p className="mt-2 text-sm leading-relaxed text-[var(--bp-muted)]">
        Find patterns across your highest-rated brews.
      </p>

      <div className="mt-5 border-t border-[var(--bp-line)] pt-4">
        <p className="bp-label text-[var(--bp-muted)]">
          Brewprint Pro
        </p>

        <p className="bp-code mt-2 text-[var(--bp-blue)]">
          Upgrade access required
        </p>
      </div>
    </div>
  }
>
  <button
    type="button"
    onClick={() =>
      setDetailView('best')
    }
    className="min-h-48 w-full border-b border-[var(--bp-line)] bg-[var(--bp-paper)] p-5 text-left"
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
</ProGate>

    <ProGate
  loadingFallback={
    <div className="col-span-2 min-h-48 border-b border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-5">
      <div className="animate-pulse">
        <div className="h-3 w-32 bg-[var(--bp-paper-dark)]" />
        <div className="mt-4 h-10 w-20 bg-[var(--bp-paper-dark)]" />

        <div className="mt-5 grid grid-cols-3 border-t border-[var(--bp-line)] pt-4">
          <div className="h-8 border-r border-[var(--bp-line)]" />
          <div className="h-8 border-r border-[var(--bp-line)]" />
          <div className="h-8" />
        </div>
      </div>
    </div>
  }
  fallback={
    <div className="col-span-2 min-h-48 border-b border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="bp-label text-[var(--bp-orange)]">
            Pro
          </p>

          <h4 className="bp-heading mt-3 text-xl text-[var(--bp-blue)]">
            Brewing Trends
          </h4>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--bp-muted)]">
            Compare your recent brewing habits and see changes
            across methods, origins and processing styles.
          </p>
        </div>

        <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--bp-line-strong)]">
          <Icons.Book className="h-4 w-4 text-[var(--bp-muted)]" />
        </span>
      </div>

      <div className="mt-5 border-t border-[var(--bp-line)] pt-4">
        <p className="bp-label text-[var(--bp-muted)]">
          Brewprint Pro
        </p>

        <p className="bp-code mt-2 text-[var(--bp-blue)]">
          Trend analysis requires Pro
        </p>
      </div>
    </div>
  }
>
  <button
    type="button"
    onClick={() =>
      setDetailView('trends')
    }
    className="col-span-2 w-full border-b border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-5 text-left"
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
</ProGate>

      <ProGate
  loadingFallback={
    <div className="col-span-2 min-h-48 bg-[var(--bp-paper)] p-5">
      <div className="animate-pulse">
        <div className="h-3 w-28 bg-[var(--bp-paper-dark)]" />
        <div className="mt-4 h-10 w-28 bg-[var(--bp-paper-dark)]" />

        <div className="mt-5 grid grid-cols-2 border-t border-[var(--bp-line)] pt-4">
          <div className="h-8 border-r border-[var(--bp-line)]" />
          <div className="h-8" />
        </div>
      </div>
    </div>
  }
  fallback={
    <div className="col-span-2 bg-[var(--bp-paper)] p-5">
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

        <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--bp-line-strong)]">
          <Icons.Info className="h-4 w-4 text-[var(--bp-blue)]" />
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 border-t border-[var(--bp-line)]">
        <div className="border-r border-[var(--bp-line)] py-4 pr-4">
          <Metric
            label="Est. Brews"
            value={
              dashboard.totalEstimatedBrews
            }
          />
        </div>

        <div className="py-4 pl-4">
          <p className="bp-label text-[var(--bp-orange)]">
            Pro Analysis
          </p>

          <p className="bp-code mt-2 text-[var(--bp-muted)]">
            Usage patterns locked
          </p>
        </div>
      </div>
    </div>
  }
>
  <button
    type="button"
    onClick={() =>
      setDetailView('usage')
    }
    className="col-span-2 w-full bg-[var(--bp-paper)] p-5 text-left"
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
</ProGate>
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
      eyebrow="02.01 / FAVOURITE COFFEE"
      title={
        favouriteDetails.coffee.name
      }
      onClose={() =>
        setDetailView(null)
      }
    >
      <section className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
        <div className="border-b border-[var(--bp-line)] p-5">
          <p className="bp-label text-[var(--bp-orange)]">
            {
              favouriteDetails.coffee
                .roaster
            }
          </p>

          <h3 className="bp-coffee-name mt-2 text-3xl text-[var(--bp-blue)]">
            {
              favouriteDetails.coffee
                .name
            }
          </h3>
        </div>

        <div className="grid grid-cols-2">
          <div className="border-b border-r border-[var(--bp-line)] p-4">
            <Metric
              label="Origin"
              value={
                favouriteDetails.coffee
                  .origin || '—'
              }
            />
          </div>

          <div className="border-b border-[var(--bp-line)] p-4">
            <Metric
              label="Process"
              value={
                favouriteDetails.coffee
                  .process || '—'
              }
            />
          </div>

          <div className="border-r border-[var(--bp-line)] p-4">
            <Metric
              label="Brews"
              value={
                favouriteDetails.brewCount
              }
            />
          </div>

          <div className="p-4">
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
        </div>

        {(favouriteDetails.firstBrew ||
          favouriteDetails.latestBrew) && (
          <div className="border-t border-[var(--bp-line)] p-4">
            <p className="bp-code text-[var(--bp-muted)]">
              {favouriteDetails.firstBrew && (
                <>
                  FIRST{' '}
                  {formatDate(
                    favouriteDetails
                      .firstBrew.date
                  )}
                </>
              )}

              {favouriteDetails.firstBrew &&
                favouriteDetails.latestBrew && (
                  <> / </>
                )}

              {favouriteDetails.latestBrew && (
                <>
                  LATEST{' '}
                  {formatDate(
                    favouriteDetails
                      .latestBrew.date
                  )}
                </>
              )}
            </p>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3">
          <p className="bp-index">
            02.02 / TYPICAL RECIPE
          </p>

          <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Your Typical Recipe
          </h3>
        </div>

        <div className="grid grid-cols-2 border border-[var(--bp-line)]">
          <div className="border-b border-r border-[var(--bp-line)] p-4">
            <Metric
              label="Method"
              value={
                favouriteDetails.topMethod ||
                '—'
              }
            />
          </div>

          <div className="border-b border-[var(--bp-line)] p-4">
            <Metric
              label="Grinder"
              value={
                favouriteDetails.topGrinder ||
                '—'
              }
            />
          </div>

          <div className="border-b border-r border-[var(--bp-line)] p-4">
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
          </div>

          <div className="border-b border-[var(--bp-line)] p-4">
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
          </div>

          <div className="border-b border-r border-[var(--bp-line)] p-4">
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
          </div>

          <div className="border-b border-[var(--bp-line)] p-4">
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
          </div>

          <div className="col-span-2 p-4">
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
        </div>
      </section>

      {favouriteDetails.bestBrew && (
        <section>
          <div className="mb-3">
            <p className="bp-index">
              02.03 / BEST RECORDED BREW
            </p>
          </div>

          <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
            <div className="flex items-start justify-between border-b border-[var(--bp-line)] p-5">
              <div>
                <p className="bp-label text-[var(--bp-muted)]">
                  Rating
                </p>

                <p className="bp-measurement mt-2 text-4xl font-semibold text-[var(--bp-blue)]">
                  {
                    favouriteDetails
                      .bestBrew.rating
                  }
                  /5
                </p>
              </div>

              <Icons.Star className="h-6 w-6 fill-current text-[var(--bp-orange)]" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4">
              <div className="border-b border-r border-[var(--bp-line)] p-4 sm:border-b-0">
                <Metric
                  label="Dose"
                  value={`${formatNumber(
                    favouriteDetails.bestBrew
                      .dose
                  )}g`}
                />
              </div>

              <div className="border-b border-[var(--bp-line)] p-4 sm:border-b-0 sm:border-r">
                <Metric
                  label="Yield"
                  value={`${formatNumber(
                    favouriteDetails.bestBrew
                      .yield
                  )}g`}
                />
              </div>

              <div className="border-r border-[var(--bp-line)] p-4">
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
              </div>

              <div className="p-4">
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
            </div>

            <div className="grid grid-cols-2 border-t border-[var(--bp-line)]">
              <button
                type="button"
                onClick={() =>
                  onOpenBrew(
                    favouriteDetails.bestBrew as BrewLog
                  )
                }
                className="bp-label border-r border-[var(--bp-line)] px-4 py-4 text-[var(--bp-blue)]"
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

      {dashboard.highestRatedCoffee &&
        dashboard.highestRatedCoffee
          .coffee.id !==
          favouriteDetails.coffee.id && (
          <section className="border border-[var(--bp-line)] bg-[var(--bp-paper)]">
            <div className="border-b border-[var(--bp-line)] p-5">
              <p className="bp-index">
                02.04 / HIGHEST RATED
              </p>

              <h3 className="bp-coffee-name mt-2 text-2xl text-[var(--bp-blue)]">
                {
                  dashboard
                    .highestRatedCoffee.coffee
                    .name
                }
              </h3>

              <p className="bp-code mt-2 text-[var(--bp-muted)]">
                {
                  dashboard
                    .highestRatedCoffee
                    .brewCount
                }{' '}
                BREWS /{' '}
                {dashboard.highestRatedCoffee.averageRating.toFixed(
                  1
                )}
                /5 AVG
              </p>
            </div>

            <div className="p-5">
              <p className="text-sm leading-relaxed text-[var(--bp-muted)]">
                Favourite is based on the coffee you brew most.
                Highest Rated is calculated separately and requires
                at least 3 recorded brews.
              </p>
            </div>
          </section>
        )}

      {favouriteDetails.highRated.length >
        0 && (
        <section>
          <div className="mb-3">
            <p className="bp-index">
              02.05 / HIGHER RATED BREWS
            </p>

            <p className="bp-code mt-1 text-[var(--bp-muted)]">
              {
                favouriteDetails.highRated
                  .length
              }{' '}
              BREWS RATED 4.5 OR HIGHER
            </p>
          </div>

          <div className="grid grid-cols-2 border border-[var(--bp-line)]">
            <div className="border-b border-r border-[var(--bp-line)] p-4">
              <Metric
                label="Sweetness"
                value={
                  favouriteDetails.sensory.sweetness.toFixed(
                    1
                  )
                }
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4">
              <Metric
                label="Acidity"
                value={
                  favouriteDetails.sensory.acidity.toFixed(
                    1
                  )
                }
              />
            </div>

            <div className="border-r border-[var(--bp-line)] p-4">
              <Metric
                label="Body"
                value={
                  favouriteDetails.sensory.body.toFixed(
                    1
                  )
                }
              />
            </div>

            <div className="p-4">
              <Metric
                label="Aftertaste"
                value={
                  favouriteDetails.sensory.aftertaste.toFixed(
                    1
                  )
                }
              />
            </div>
          </div>

          {favouriteDetails
            .highRatedFlavours.length >
            0 && (
            <div className="border-x border-b border-[var(--bp-line)] p-4">
              <p className="bp-label text-[var(--bp-muted)]">
                Most Recorded Flavour Groups
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {favouriteDetails.highRatedFlavours
                  .slice(0, 4)
                  .map(
                    ([name, count]) => (
                      <span
                        key={name}
                        className="border border-[var(--bp-line)] px-3 py-2 bp-code text-[var(--bp-blue)]"
                      >
                        {name} / {count}
                      </span>
                    )
                  )}
              </div>
            </div>
          )}
        </section>
      )}

      <section>
        <div className="mb-3">
          <p className="bp-index">
            02.06 / COFFEE USAGE
          </p>
        </div>

        <div className="grid grid-cols-2 border border-[var(--bp-line)]">
          <div className="border-b border-r border-[var(--bp-line)] p-4">
            <Metric
              label="Bag Size"
              value={`${favouriteDetails.coffee.totalWeight}g`}
            />
          </div>

          <div className="border-b border-[var(--bp-line)] p-4">
            <Metric
              label="Remaining"
              value={`${favouriteDetails.coffee.remainingWeight}g`}
            />
          </div>

          <div className="border-r border-[var(--bp-line)] p-4">
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
          </div>

          <div className="p-4">
            <Metric
              label="Est. Brews Left"
              value={
                favouriteDetails.estimatedBrewsRemaining
              }
            />
          </div>
        </div>
      </section>
    </DetailShell>
  )}

      {detailView === 'best' && (
  <ProGate>
    <DetailShell
    eyebrow="03.01 / BEST BREWS"
    title="What has worked well"
    onClose={() =>
      setDetailView(null)
    }
  >
    {bestBrewPatterns && (
      <section>
        <div className="mb-3">
          <p className="bp-index">
            03.02 / COMMON APPROACH
          </p>

          <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Your Common Approach
          </h3>

          <p className="bp-code mt-1 text-[var(--bp-muted)]">
            Median values across your 5 highest-rated recorded brews.
          </p>
        </div>

        <div className="grid grid-cols-2 border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
          <div className="border-b border-r border-[var(--bp-line)] p-4">
            <Metric
              label="Method"
              value={
                bestBrewPatterns.method ||
                '—'
              }
            />
          </div>

          <div className="border-b border-[var(--bp-line)] p-4">
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
          </div>

          <div className="border-b border-r border-[var(--bp-line)] p-4">
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
          </div>

          <div className="border-b border-[var(--bp-line)] p-4">
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
          </div>

          <div className="col-span-2 p-4">
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
        </div>
      </section>
    )}

    <section>
      <div className="mb-4">
        <p className="bp-index">
          03.03 / HIGHEST RATED BREWS
        </p>

        <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
          Highest Rated Brews
        </h3>

        <p className="bp-code mt-1 text-[var(--bp-muted)]">
          Recorded outcomes only. This does not claim that one variable caused the result.
        </p>
      </div>

      <div className="space-y-4">
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
                className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]"
              >
                <div className="grid grid-cols-[1fr_auto] border-b border-[var(--bp-line)]">
                  <div className="min-w-0 p-5">
                    <p className="bp-label text-[var(--bp-orange)]">
                      #{index + 1} / {log.method}
                    </p>

                    <h4 className="bp-coffee-name mt-2 truncate text-2xl text-[var(--bp-blue)]">
                      {coffee?.name ||
                        'Unknown Coffee'}
                    </h4>

                    <p className="bp-code mt-1 truncate text-[var(--bp-muted)]">
                      {coffee?.roaster ||
                        'Roaster not recorded'}
                    </p>
                  </div>

                  <div className="flex min-w-[82px] flex-col items-center justify-center border-l border-[var(--bp-line)] px-4">
                    <Icons.Star className="h-4 w-4 fill-current text-[var(--bp-orange)]" />

                    <span className="bp-measurement mt-1 text-lg font-semibold text-[var(--bp-blue)]">
                      {log.rating}
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
                        log.dose
                      )}g`}
                    />
                  </div>

                  <div className="border-b border-[var(--bp-line)] p-4 sm:border-b-0 sm:border-r">
                    <Metric
                      label="Yield"
                      value={`${formatNumber(
                        log.yield
                      )}g`}
                    />
                  </div>

                  <div className="border-r border-[var(--bp-line)] p-4">
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
                  </div>

                  <div className="p-4">
                    <Metric
                      label="Time"
                      value={
                        log.brewTime > 0
                          ? `${log.brewTime}s`
                          : '—'
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 border-t border-[var(--bp-line)]">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenBrew(log)
                    }
                    className="bp-label border-r border-[var(--bp-line)] px-4 py-4 text-[var(--bp-blue)]"
                  >
                    View Brew
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onBrewAgain(log)
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
            );
          }
        )}
      </div>
    </section>
      </DetailShell>
  </ProGate>
)}

      {detailView === 'trends' && (
  <ProGate>
    <DetailShell
    eyebrow="04.01 / BREWING TRENDS"
    title="How your brewing is changing"
    onClose={() =>
      setDetailView(null)
    }
  >
    <section>
      <div className="mb-3">
        <p className="bp-index">
          04.02 / LAST 30 DAYS
        </p>

        <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
          Activity
        </h3>
      </div>

      <div className="grid grid-cols-2 border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
        <div className="border-b border-r border-[var(--bp-line)] p-4">
          <Metric
            label="Brews"
            value={
              dashboard.monthlyBrews
            }
            sublabel={`${dashboard.previousMonthlyBrews} previous 30 days`}
          />
        </div>

        <div className="border-b border-[var(--bp-line)] p-4">
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
        </div>

        <div className="border-r border-[var(--bp-line)] p-4">
          <Metric
            label="Coffees"
            value={
              dashboard.monthlyCoffeeCount
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

    <section>
      <div className="mb-3">
        <p className="bp-index">
          04.03 / METHOD TRENDS
        </p>

        <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
          Brew Methods
        </h3>
      </div>

      <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
        {dashboard.currentMethods
          .slice(0, 5)
          .map(([name, count], index) => {
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
              <div
                key={name}
                className={`p-4 ${
                  index <
                  Math.min(
                    dashboard.currentMethods.length,
                    5
                  ) -
                    1
                    ? 'border-b border-[var(--bp-line)]'
                    : ''
                }`}
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="bp-label text-[var(--bp-muted)]">
                      Method
                    </p>

                    <p className="bp-code mt-1 text-[var(--bp-blue)]">
                      {name}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="bp-measurement text-lg font-semibold text-[var(--bp-blue)]">
                      {percentage}%
                    </p>

                    <p className="bp-code text-[var(--bp-muted)]">
                      {count} BREWS
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-[3px] bg-[var(--bp-paper-dark)]">
                  <div
                    className="h-full bg-[var(--bp-orange)]"
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

    <section>
      <div className="mb-3">
        <p className="bp-index">
          04.04 / ORIGIN TRENDS
        </p>
      </div>

      <div className="border border-[var(--bp-line)] bg-[var(--bp-paper)]">
        {dashboard.currentOrigins
          .slice(0, 5)
          .map(([name, count], index) => (
            <div
              key={name}
              className={`flex items-center justify-between gap-4 p-4 ${
                index <
                Math.min(
                  dashboard.currentOrigins.length,
                  5
                ) -
                  1
                  ? 'border-b border-[var(--bp-line)]'
                  : ''
              }`}
            >
              <span className="bp-code text-[var(--bp-blue)]">
                {name}
              </span>

              <span className="bp-code text-[var(--bp-muted)]">
                {count} BREWS
              </span>
            </div>
          ))}
      </div>
    </section>

    <section>
      <div className="mb-3">
        <p className="bp-index">
          04.05 / PROCESSING TRENDS
        </p>
      </div>

      <div className="border border-[var(--bp-line)] bg-[var(--bp-paper)]">
        {dashboard.currentProcesses
          .slice(0, 5)
          .map(([name, count], index) => (
            <div
              key={name}
              className={`flex items-center justify-between gap-4 p-4 ${
                index <
                Math.min(
                  dashboard.currentProcesses.length,
                  5
                ) -
                  1
                  ? 'border-b border-[var(--bp-line)]'
                  : ''
              }`}
            >
              <span className="bp-code text-[var(--bp-blue)]">
                {name}
              </span>

              <span className="bp-code text-[var(--bp-muted)]">
                {count} BREWS
              </span>
            </div>
          ))}
      </div>
    </section>

    <section>
      <div className="mb-3">
        <p className="bp-index">
          04.06 / CURRENT LEADERS
        </p>
      </div>

      <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--bp-line)] p-4">
          <div>
            <p className="bp-label text-[var(--bp-muted)]">
              Most Used Method
            </p>

            <p className="bp-code mt-2 text-[var(--bp-blue)]">
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

        <div className="flex items-center justify-between gap-4 border-b border-[var(--bp-line)] p-4">
          <div>
            <p className="bp-label text-[var(--bp-muted)]">
              Most Brewed Origin
            </p>

            <p className="bp-code mt-2 text-[var(--bp-blue)]">
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

        <div className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="bp-label text-[var(--bp-muted)]">
              Most Used Process
            </p>

            <p className="bp-code mt-2 text-[var(--bp-blue)]">
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

    <section className="border border-[var(--bp-line)] bg-[var(--bp-paper)]">
      <div className="border-l-2 border-[var(--bp-orange)] p-5">
        <p className="bp-label text-[var(--bp-orange)]">
          About These Trends
        </p>

        <p className="mt-3 text-sm leading-relaxed text-[var(--bp-muted)]">
          BREWPRINT reports what appears in your recorded history.
          A change in rating or recipe variable does not prove that
          one variable caused the result.
        </p>
      </div>
    </section>
      </DetailShell>
  </ProGate>
)}
      {detailView === 'usage' && (
  <DetailShell
    eyebrow="05.01 / COFFEE USAGE"
    title="What you have and what you use"
    onClose={() =>
      setDetailView(null)
    }
  >
    <section>
      <div className="mb-3">
        <p className="bp-index">
          05.02 / STOCK SUMMARY
        </p>

        <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
          Current Coffee Position
        </h3>
      </div>

      <div className="grid grid-cols-2 border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
        <div className="border-b border-r border-[var(--bp-line)] p-4">
          <Metric
            label="Available"
            value={`${Math.round(
              dashboard.totalRemaining
            )}g`}
          />
        </div>

        <div className="border-b border-[var(--bp-line)] p-4">
          <Metric
            label="Active Coffees"
            value={
              dashboard.activeCoffees.length
            }
          />
        </div>

        <div className="border-r border-[var(--bp-line)] p-4">
          <Metric
            label="Used 30 Days"
            value={`${Math.round(
              dashboard.coffeeUsed30Days
            )}g`}
          />
        </div>

        <div className="p-4">
          <Metric
            label="Typical Dose"
            value={`${formatNumber(
              dashboard.overallMedianDose
            )}g`}
          />
        </div>
      </div>
    </section>

    <section>
      <div className="mb-4">
        <p className="bp-index">
          05.03 / CURRENT COFFEES
        </p>

        <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
          Current Coffees
        </h3>

        <p className="bp-code mt-1 text-[var(--bp-muted)]">
          Estimated brews use your median dose for each coffee where possible.
        </p>
      </div>

      <div className="space-y-4">
        {dashboard.coffeeStats
          .filter(
            item =>
              item.coffee.remainingWeight >
              0
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
                className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]"
              >
                <div className="grid grid-cols-[1fr_auto] border-b border-[var(--bp-line)]">
                  <div className="min-w-0 p-5">
                    <h4 className="bp-coffee-name truncate text-2xl text-[var(--bp-blue)]">
                      {item.coffee.name}
                    </h4>

                    <p className="bp-code mt-1 truncate text-[var(--bp-muted)]">
                      {item.coffee.roaster}
                    </p>
                  </div>

                  <div className="flex min-w-[96px] flex-col items-end justify-center border-l border-[var(--bp-line)] px-4">
                    <p className="bp-measurement text-xl font-semibold text-[var(--bp-blue)]">
                      {
                        item.coffee
                          .remainingWeight
                      }
                      g
                    </p>

                    <p className="bp-label mt-1 text-[var(--bp-muted)]">
                      Remaining
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="h-[3px] bg-[var(--bp-paper-dark)]">
                    <div
                      className="h-full bg-[var(--bp-orange)]"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-3 border-t border-[var(--bp-line)]">
                    <div className="border-r border-[var(--bp-line)] py-4 pr-3">
                      <Metric
                        label="Brews"
                        value={item.brewCount}
                      />
                    </div>

                    <div className="border-r border-[var(--bp-line)] px-3 py-4">
                      <Metric
                        label="Typical Dose"
                        value={`${formatNumber(
                          item.medianDose
                        )}g`}
                      />
                    </div>

                    <div className="py-4 pl-3">
                      <Metric
                        label="Est. Left"
                        value={
                          item.estimatedBrewsRemaining
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </section>

    <section>
      <div className="mb-3">
        <p className="bp-index">
          05.04 / USAGE BY ORIGIN
        </p>
      </div>

      <div className="border border-[var(--bp-line)] bg-[var(--bp-paper)]">
        {dashboard.currentOrigins
          .slice(0, 5)
          .map(([name, count], index) => (
            <div
              key={name}
              className={`flex items-center justify-between gap-4 p-4 ${
                index <
                Math.min(
                  dashboard.currentOrigins.length,
                  5
                ) -
                  1
                  ? 'border-b border-[var(--bp-line)]'
                  : ''
              }`}
            >
              <span className="bp-code text-[var(--bp-blue)]">
                {name}
              </span>

              <span className="bp-code text-[var(--bp-muted)]">
                {count} BREWS
              </span>
            </div>
          ))}
      </div>
    </section>

    <section>
      <div className="mb-3">
        <p className="bp-index">
          05.05 / USAGE BY ROASTER
        </p>
      </div>

      <div className="border border-[var(--bp-line)] bg-[var(--bp-paper)]">
        {dashboard.currentRoasters
          .slice(0, 5)
          .map(([name, count], index) => (
            <div
              key={name}
              className={`flex items-center justify-between gap-4 p-4 ${
                index <
                Math.min(
                  dashboard.currentRoasters.length,
                  5
                ) -
                  1
                  ? 'border-b border-[var(--bp-line)]'
                  : ''
              }`}
            >
              <span className="bp-code text-[var(--bp-blue)]">
                {name}
              </span>

              <span className="bp-code text-[var(--bp-muted)]">
                {count} BREWS
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