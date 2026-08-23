import React, {
  useMemo,
  useState,
} from 'react';

import {
  BrewLog,
  CoffeeBean,
} from '../types';

interface AnalyticsViewProps {
  brewLogs: BrewLog[];
  coffees: CoffeeBean[];
  onBack: () => void;
}

type TimeRange =
  | '30d'
  | '3m'
  | '6m'
  | '1y'
  | 'all';

const DAY_MS = 24 * 60 * 60 * 1000;

const average = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (total, value) => total + value,
      0
    ) / values.length
  );
};

const median = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const middle = Math.floor(
    sorted.length / 2
  );

  if (sorted.length % 2 === 0) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;
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

const getRatio = (log: BrewLog) => {
  if (
    log.dose <= 0 ||
    log.yield <= 0
  ) {
    return null;
  }

  return log.yield / log.dose;
};

const frequencyMap = (
  values: Array<
    string | undefined | null
  >
) => {
  const map = new Map<
    string,
    number
  >();

  values.forEach(value => {
    const cleaned = value?.trim();

    if (!cleaned) {
      return;
    }

    map.set(
      cleaned,
      (map.get(cleaned) || 0) + 1
    );
  });

  return [...map.entries()].sort(
    (a, b) => b[1] - a[1]
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
    <div>
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-stone-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-stone-900">
        {value}
      </p>

      {sublabel && (
        <p className="mt-1 text-[9px] font-medium text-stone-400">
          {sublabel}
        </p>
      )}
    </div>
  );
};

const Leaderboard: React.FC<{
  title: string;
  items: Array<[string, number]>;
  total: number;
}> = ({
  title,
  items,
  total,
}) => {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
        {title}
      </h3>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <p className="text-xs text-stone-400">
            No data recorded in this
            period.
          </p>
        ) : (
          items
            .slice(0, 5)
            .map(
              ([name, count], index) => {
                const percentage =
                  total > 0
                    ? Math.round(
                        (count / total) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={name}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="text-[10px] font-black text-stone-200">
                          {index + 1}
                        </span>

                        <span className="truncate text-xs font-black text-stone-700">
                          {name}
                        </span>
                      </div>

                      <span className="shrink-0 text-[9px] font-black text-stone-400">
                        {count} ·{' '}
                        {percentage}%
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-stone-800"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )
        )}
      </div>
    </section>
  );
};

const AnalyticsView: React.FC<
  AnalyticsViewProps
> = ({
  brewLogs,
  coffees,
  onBack,
}) => {
  const [timeRange, setTimeRange] =
    useState<TimeRange>('3m');

  const stats = useMemo(() => {
    const now = new Date();

    const rangeStart = (() => {
      switch (timeRange) {
        case '30d':
          return new Date(
            now.getTime() -
              30 * DAY_MS
          );

        case '3m':
          return new Date(
            now.getTime() -
              90 * DAY_MS
          );

        case '6m':
          return new Date(
            now.getTime() -
              180 * DAY_MS
          );

        case '1y':
          return new Date(
            now.getTime() -
              365 * DAY_MS
          );

        case 'all':
        default:
          return null;
      }
    })();

    const logs = [...brewLogs]
      .filter(log => {
        if (!rangeStart) {
          return true;
        }

        return (
          new Date(log.date) >=
          rangeStart
        );
      })
      .sort(
        (a, b) =>
          new Date(
            b.date
          ).getTime() -
          new Date(
            a.date
          ).getTime()
      );

    const getCoffee = (
      coffeeId: string
    ) => {
      return coffees.find(
        coffee =>
          coffee.id === coffeeId
      );
    };

    const ratings = logs
      .map(log => log.rating)
      .filter(value => value > 0);

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
          typeof value ===
            'number' &&
          value > 0
      );

    const ratios = logs
      .map(getRatio)
      .filter(
        (value): value is number =>
          value !== null
      );

    const totalDose = doses.reduce(
      (total, value) =>
        total + value,
      0
    );

    const uniqueCoffeeIds =
      new Set(
        logs
          .map(log => log.coffeeId)
          .filter(Boolean)
      );

    const methods = frequencyMap(
      logs.map(log => log.method)
    );

    const origins = frequencyMap(
      logs.map(
        log =>
          getCoffee(log.coffeeId)
            ?.origin
      )
    );

    const processes = frequencyMap(
      logs.map(
        log =>
          getCoffee(log.coffeeId)
            ?.process
      )
    );

    const roasters = frequencyMap(
      logs.map(
        log =>
          getCoffee(log.coffeeId)
            ?.roaster
      )
    );

    const roastLevels = frequencyMap(
      logs.map(
        log =>
          getCoffee(log.coffeeId)
            ?.roastLevel
      )
    );

    const coffeesUsed =
      frequencyMap(
        logs.map(
          log =>
            getCoffee(log.coffeeId)
              ?.name
        )
      );

    const flavorGroups =
      frequencyMap(
        logs.flatMap(
          log =>
            log.flavorGroups || []
        )
      );

    const sensory = {
      aroma: average(
        logs.map(log => log.aroma)
      ),
      acidity: average(
        logs.map(
          log => log.acidity
        )
      ),
      sweetness: average(
        logs.map(
          log => log.sweetness
        )
      ),
      bitterness: average(
        logs.map(
          log => log.bitterness
        )
      ),
      body: average(
        logs.map(log => log.body)
      ),
      aftertaste: average(
        logs.map(
          log => log.aftertaste
        )
      ),
    };

    const methodStats =
      methods.map(
        ([method, count]) => {
          const methodLogs =
            logs.filter(
              log =>
                log.method === method
            );

          const methodRatings =
            methodLogs
              .map(
                log => log.rating
              )
              .filter(
                value => value > 0
              );

          const methodRatios =
            methodLogs
              .map(getRatio)
              .filter(
                (
                  value
                ): value is number =>
                  value !== null
              );

          const methodTemps =
            methodLogs
              .map(
                log =>
                  log.waterTemp
              )
              .filter(
                (
                  value
                ): value is number =>
                  typeof value ===
                    'number' &&
                  value > 0
              );

          return {
            method,
            count,
            avgRating:
              average(
                methodRatings
              ),
            medianDose: median(
              methodLogs
                .map(
                  log =>
                    log.dose
                )
                .filter(
                  value =>
                    value > 0
                )
            ),
            medianRatio:
              median(
                methodRatios
              ),
            medianTemp:
              median(methodTemps),
            medianTime: median(
              methodLogs
                .map(
                  log =>
                    log.brewTime
                )
                .filter(
                  value =>
                    value > 0
                )
            ),
          };
        }
      );

    const highestRatedMethods =
      [...methodStats]
        .filter(
          item => item.count >= 3
        )
        .sort(
          (a, b) =>
            b.avgRating -
            a.avgRating
        );

    const coffeeRatings =
      [...uniqueCoffeeIds]
        .map(coffeeId => {
          const coffee =
            getCoffee(coffeeId);

          const coffeeLogs =
            logs.filter(
              log =>
                log.coffeeId ===
                coffeeId
            );

          const coffeeRatings =
            coffeeLogs
              .map(
                log => log.rating
              )
              .filter(
                value => value > 0
              );

          return {
            coffee,
            count:
              coffeeLogs.length,
            avgRating:
              average(
                coffeeRatings
              ),
          };
        })
        .filter(
          item =>
            item.coffee &&
            item.count >= 3
        )
        .sort(
          (a, b) =>
            b.avgRating -
            a.avgRating
        );

    return {
      logs,
      totalBrews: logs.length,
      totalDose,
      uniqueCoffees:
        uniqueCoffeeIds.size,
      averageRating:
        average(ratings),
      medianDose:
        median(doses),
      medianYield:
        median(yields),
      medianRatio:
        median(ratios),
      medianBrewTime:
        median(brewTimes),
      medianTemperature:
        median(temperatures),

      methods,
      origins,
      processes,
      roasters,
      roastLevels,
      coffeesUsed,
      flavorGroups,

      sensory,

      methodStats,
      highestRatedMethods,
      coffeeRatings,
    };
  }, [
    brewLogs,
    coffees,
    timeRange,
  ]);

  const rangeLabel = {
    '30d': 'Last 30 Days',
    '3m': 'Last 3 Months',
    '6m': 'Last 6 Months',
    '1y': 'Last Year',
    all: 'All Time',
  }[timeRange];

  if (brewLogs.length === 0) {
    return (
      <div className="animate-in fade-in duration-500 py-24 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-amber-50 text-amber-800">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2"
            />
          </svg>
        </div>

        <h3 className="mb-2 text-2xl font-bold display-font">
          Brewing Analytics
        </h3>

        <p className="mx-auto mb-8 max-w-xs text-sm font-medium text-stone-400">
          Start logging brews to build your
          personal brewing history.
        </p>

        <button
          onClick={onBack}
          className="text-sm font-bold text-amber-800 underline underline-offset-4"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-10">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 transition-colors hover:text-stone-800"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>

          Back
        </button>

        <div className="text-right">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-800">
            Brewprint
          </p>

          <h2 className="text-2xl font-black text-stone-900 display-font">
            Analytics
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1 rounded-2xl bg-stone-100 p-1">
        {[
          {
            id: '30d',
            label: '30D',
          },
          {
            id: '3m',
            label: '3M',
          },
          {
            id: '6m',
            label: '6M',
          },
          {
            id: '1y',
            label: '1Y',
          },
          {
            id: 'all',
            label: 'All',
          },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              setTimeRange(
                item.id as TimeRange
              )
            }
            className={`rounded-xl py-2.5 text-[9px] font-black uppercase tracking-wider transition-all ${
              timeRange === item.id
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="rounded-[2.5rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">
              Overview
            </p>

            <p className="mt-1 text-xs font-medium text-stone-400">
              {rangeLabel}
            </p>
          </div>

          <span className="rounded-full bg-stone-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-stone-500">
            {stats.totalBrews}{' '}
            brews
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-7">
          <Metric
            label="Total Brews"
            value={stats.totalBrews}
          />

          <Metric
            label="Coffees"
            value={
              stats.uniqueCoffees
            }
          />

          <Metric
            label="Avg Rating"
            value={
              stats.averageRating > 0
                ? stats.averageRating.toFixed(
                    1
                  )
                : '—'
            }
            sublabel="Recorded ratings"
          />

          <Metric
            label="Coffee Used"
            value={`${(
              stats.totalDose /
              1000
            ).toFixed(2)} kg`}
            sublabel="Dry coffee dose"
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-amber-100 bg-[#fdf8f3] p-6 shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-800/50">
          Typical Brew
        </p>

        <p className="mt-1 text-xs text-amber-950/60">
          Median values across the selected
          period.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-7">
          <Metric
            label="Dose"
            value={
              stats.medianDose > 0
                ? `${formatNumber(
                    stats.medianDose
                  )}g`
                : '—'
            }
          />

          <Metric
            label="Yield"
            value={
              stats.medianYield > 0
                ? `${formatNumber(
                    stats.medianYield
                  )}g`
                : '—'
            }
          />

          <Metric
            label="Ratio"
            value={
              stats.medianRatio > 0
                ? `1:${stats.medianRatio.toFixed(
                    1
                  )}`
                : '—'
            }
          />

          <Metric
            label="Temperature"
            value={
              stats.medianTemperature >
              0
                ? `${formatNumber(
                    stats.medianTemperature
                  )}°C`
                : '—'
            }
          />

          <Metric
            label="Brew Time"
            value={
              stats.medianBrewTime > 0
                ? `${formatNumber(
                    stats.medianBrewTime
                  )}s`
                : '—'
            }
          />
        </div>
      </section>

      <div className="space-y-4">
        <div className="px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">
            Coffee Choices
          </p>

          <p className="mt-1 text-xs text-stone-400">
            What appears most often in your
            recorded brewing.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Leaderboard
            title="Origins"
            items={stats.origins}
            total={stats.totalBrews}
          />

          <Leaderboard
            title="Processes"
            items={stats.processes}
            total={stats.totalBrews}
          />

          <Leaderboard
            title="Roasters"
            items={stats.roasters}
            total={stats.totalBrews}
          />

          <Leaderboard
            title="Roast Levels"
            items={stats.roastLevels}
            total={stats.totalBrews}
          />
        </div>
      </div>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
            Method Performance
          </p>

          <p className="mt-1 text-xs text-stone-400">
            Ratings and typical recipe values
            for each brew method.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {stats.methodStats.map(
            item => (
              <div
                key={item.method}
                className="border-b border-stone-100 pb-5 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-stone-800">
                      {item.method}
                    </p>

                    <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-stone-400">
                      {item.count}{' '}
                      {item.count === 1
                        ? 'brew'
                        : 'brews'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-wider text-stone-400">
                      Avg Rating
                    </p>

                    <p className="mt-1 text-lg font-black text-amber-700">
                      {item.avgRating >
                      0
                        ? item.avgRating.toFixed(
                            1
                          )
                        : '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-3">
                  <Metric
                    label="Dose"
                    value={
                      item.medianDose >
                      0
                        ? `${formatNumber(
                            item.medianDose
                          )}g`
                        : '—'
                    }
                  />

                  <Metric
                    label="Ratio"
                    value={
                      item.medianRatio >
                      0
                        ? `1:${item.medianRatio.toFixed(
                            1
                          )}`
                        : '—'
                    }
                  />

                  <Metric
                    label="Temp"
                    value={
                      item.medianTemp >
                      0
                        ? `${formatNumber(
                            item.medianTemp
                          )}°`
                        : '—'
                    }
                  />

                  <Metric
                    label="Time"
                    value={
                      item.medianTime >
                      0
                        ? `${formatNumber(
                            item.medianTime
                          )}s`
                        : '—'
                    }
                  />
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {stats.highestRatedMethods.length >
        0 && (
        <section className="rounded-[2rem] border border-amber-100 bg-amber-50/40 p-6">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-800">
            Highest Rated Methods
          </p>

          <p className="mt-1 text-xs text-stone-500">
            Only methods with at least 3
            recorded brews are included.
          </p>

          <div className="mt-5 space-y-3">
            {stats.highestRatedMethods
              .slice(0, 3)
              .map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item.method
                    }
                    className="flex items-center justify-between rounded-2xl border border-amber-100 bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-amber-800/30">
                        {index + 1}
                      </span>

                      <div>
                        <p className="text-xs font-black text-stone-800">
                          {
                            item.method
                          }
                        </p>

                        <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-stone-400">
                          {
                            item.count
                          }{' '}
                          brews
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-black text-amber-800">
                      {item.avgRating.toFixed(
                        1
                      )}
                    </span>
                  </div>
                )
              )}
          </div>
        </section>
      )}

      {stats.coffeeRatings.length >
        0 && (
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
            Highest Rated Coffees
          </p>

          <p className="mt-1 text-xs text-stone-400">
            Minimum 3 brews per coffee.
          </p>

          <div className="mt-5 space-y-4">
            {stats.coffeeRatings
              .slice(0, 5)
              .map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item.coffee
                        ?.id
                    }
                    className="flex items-center justify-between gap-4 border-b border-stone-50 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-[10px] font-black text-stone-200">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-stone-800">
                          {
                            item.coffee
                              ?.name
                          }
                        </p>

                        <p className="mt-0.5 truncate text-[9px] font-medium text-stone-400">
                          {
                            item.coffee
                              ?.roaster
                          }{' '}
                          ·{' '}
                          {
                            item.count
                          }{' '}
                          brews
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-black text-amber-700">
                      {item.avgRating.toFixed(
                        1
                      )}
                    </span>
                  </div>
                )
              )}
          </div>
        </section>
      )}

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
              Sensory Profile
            </p>

            <p className="mt-1 text-xs text-stone-400">
              Average sensory scores for
              the selected period.
            </p>
          </div>

          <span className="text-[8px] font-black uppercase tracking-wider text-stone-300">
            {stats.totalBrews}{' '}
            brews
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {[
            {
              label: 'Aroma',
              value:
                stats.sensory
                  .aroma,
            },
            {
              label: 'Acidity',
              value:
                stats.sensory
                  .acidity,
            },
            {
              label: 'Sweetness',
              value:
                stats.sensory
                  .sweetness,
            },
            {
              label: 'Bitterness',
              value:
                stats.sensory
                  .bitterness,
            },
            {
              label: 'Body',
              value:
                stats.sensory.body,
            },
            {
              label: 'Aftertaste',
              value:
                stats.sensory
                  .aftertaste,
            },
          ].map(item => (
            <div
              key={item.label}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
                <span className="text-stone-400">
                  {item.label}
                </span>

                <span className="text-stone-800">
                  {item.value.toFixed(
                    1
                  )}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-amber-800"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        (item.value /
                          5) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {stats.flavorGroups.length >
        0 && (
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
            Recorded Flavour Groups
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {stats.flavorGroups
              .slice(0, 8)
              .map(
                ([name, count]) => (
                  <span
                    key={name}
                    className="rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-stone-600"
                  >
                    {name} ·{' '}
                    {count}
                  </span>
                )
              )}
          </div>
        </section>
      )}

      <section className="rounded-[2rem] border border-amber-100 bg-amber-50/40 p-6">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-800">
          Reading Your Data
        </p>

        <p className="mt-3 text-xs leading-relaxed text-stone-600">
          These analytics describe patterns in
          your recorded brews. A higher rating
          beside a method, temperature, ratio or
          other variable does not prove that the
          variable caused the better result.
        </p>
      </section>
    </div>
  );
};

export default AnalyticsView;