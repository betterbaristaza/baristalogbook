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
      <p className="bp-label text-[var(--bp-muted)]">
        {label}
      </p>

      <p className="bp-measurement mt-2 text-2xl font-semibold text-[var(--bp-blue)]">
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

const Leaderboard: React.FC<{
  index: string;
  title: string;
  items: Array<[string, number]>;
  total: number;
}> = ({
  index,
  title,
  items,
  total,
}) => {
  return (
    <section className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
      <div className="border-b border-[var(--bp-line)] px-4 py-3">
        <p className="bp-index">
          {index}
        </p>

        <h3 className="bp-heading mt-1 text-base text-[var(--bp-blue)]">
          {title}
        </h3>
      </div>

      <div>
        {items.length === 0 ? (
          <p className="p-4 text-sm text-[var(--bp-muted)]">
            No data recorded in this period.
          </p>
        ) : (
          items
            .slice(0, 5)
            .map(
              ([name, count], itemIndex) => {
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
                    className={`grid grid-cols-[36px_1fr_auto] items-center gap-3 px-4 py-3 ${
                      itemIndex <
                      Math.min(
                        items.length,
                        5
                      ) -
                        1
                        ? 'border-b border-[var(--bp-line)]'
                        : ''
                    }`}
                  >
                    <span className="bp-code text-[var(--bp-muted)]">
                      {String(
                        itemIndex + 1
                      ).padStart(2, '0')}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--bp-blue)]">
                        {name}
                      </p>

                      <div className="mt-2 h-[2px] bg-[var(--bp-line)]">
                        <div
                          className="h-full bg-[var(--bp-blue)]"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="bp-measurement text-sm font-semibold text-[var(--bp-blue)]">
                        {count}
                      </p>

                      <p className="bp-code text-[var(--bp-muted)]">
                        {percentage}%
                      </p>
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
      <section className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
        <div className="border-b border-[var(--bp-line)] p-5">
          <p className="bp-index">
            04 / ANALYTICS
          </p>

          <h1 className="bp-heading mt-2 text-3xl text-[var(--bp-blue)]">
            Brewing Analytics
          </h1>
        </div>

        <div className="p-5">
          <p className="max-w-md text-sm leading-relaxed text-[var(--bp-muted)]">
            Start logging brews to build your personal brewing history and reveal patterns across coffees, methods and sensory results.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex min-h-14 w-full items-center justify-between border-t border-[var(--bp-line)] bg-[var(--bp-orange)] px-5 text-[var(--bp-blue)]"
        >
          <span className="bp-label">
            Back to Home
          </span>

          <span
            aria-hidden="true"
            className="bp-code text-lg"
          >
            →
          </span>
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="border-b border-[var(--bp-line)] pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="bp-index">
              04 / ANALYTICS
            </p>

            <h1 className="bp-heading mt-2 text-3xl text-[var(--bp-blue)]">
              Brewing Analytics
            </h1>

            <p className="bp-code mt-2 max-w-md text-[var(--bp-muted)]">
              Patterns across your recorded coffees, recipes and results.
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

      <section>
        <div className="mb-3">
          <p className="bp-index">
            04.01 / RANGE
          </p>
        </div>

        <div className="grid grid-cols-5 border border-[var(--bp-line)]">
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
              label: 'ALL',
            },
          ].map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setTimeRange(
                  item.id as TimeRange
                )
              }
              className={`relative min-h-12 px-2 bp-label ${
                index < 4
                  ? 'border-r border-[var(--bp-line)]'
                  : ''
              } ${
                timeRange === item.id
                  ? 'bg-[var(--bp-paper-light)] text-[var(--bp-blue)]'
                  : 'bg-[var(--bp-paper)] text-[var(--bp-muted)]'
              }`}
            >
              {timeRange === item.id && (
                <span className="absolute inset-x-0 top-0 h-[2px] bg-[var(--bp-orange)]" />
              )}

              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="bp-index">
              04.02 / OVERVIEW
            </p>

            <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              {rangeLabel}
            </h2>
          </div>

          <span className="bp-code text-[var(--bp-muted)]">
            {stats.totalBrews}{' '}
            {stats.totalBrews === 1
              ? 'BREW'
              : 'BREWS'}
          </span>
        </div>

        <div className="grid grid-cols-2 border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
          <div className="border-b border-r border-[var(--bp-line)] p-4">
            <Metric
              label="Total Brews"
              value={stats.totalBrews}
            />
          </div>

          <div className="border-b border-[var(--bp-line)] p-4">
            <Metric
              label="Coffees"
              value={
                stats.uniqueCoffees
              }
            />
          </div>

          <div className="border-r border-[var(--bp-line)] p-4">
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
          </div>

          <div className="p-4">
            <Metric
              label="Coffee Used"
              value={`${(
                stats.totalDose /
                1000
              ).toFixed(2)} kg`}
              sublabel="Dry coffee dose"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="bp-index">
            04.03 / TYPICAL BREW
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Median Recipe
          </h2>

          <p className="bp-code mt-1 text-[var(--bp-muted)]">
            Median values across the selected period.
          </p>
        </div>

        <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
          <div className="grid grid-cols-2 border-b border-[var(--bp-line)]">
            <div className="border-r border-[var(--bp-line)] p-4">
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
            </div>

            <div className="p-4">
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
            </div>
          </div>

          <div className="grid grid-cols-3">
            <div className="border-r border-[var(--bp-line)] p-4">
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
            </div>

            <div className="border-r border-[var(--bp-line)] p-4">
              <Metric
                label="Temp"
                value={
                  stats.medianTemperature >
                  0
                    ? `${formatNumber(
                        stats.medianTemperature
                      )}°C`
                    : '—'
                }
              />
            </div>

            <div className="p-4">
              <Metric
                label="Time"
                value={
                  stats.medianBrewTime > 0
                    ? `${formatNumber(
                        stats.medianBrewTime
                      )}s`
                    : '—'
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="bp-index">
            04.04 / COFFEE CHOICES
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Recorded Patterns
          </h2>

          <p className="bp-code mt-1 text-[var(--bp-muted)]">
            What appears most often in your brewing records.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Leaderboard
            index="04.04A"
            title="Origins"
            items={stats.origins}
            total={stats.totalBrews}
          />

          <Leaderboard
            index="04.04B"
            title="Processes"
            items={stats.processes}
            total={stats.totalBrews}
          />

          <Leaderboard
            index="04.04C"
            title="Roasters"
            items={stats.roasters}
            total={stats.totalBrews}
          />

          <Leaderboard
            index="04.04D"
            title="Roast Levels"
            items={stats.roastLevels}
            total={stats.totalBrews}
          />
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="bp-index">
            04.05 / METHOD PERFORMANCE
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Method Comparison
          </h2>

          <p className="bp-code mt-1 text-[var(--bp-muted)]">
            Ratings and typical recipe values for each brew method.
          </p>
        </div>

        <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
          {stats.methodStats.length ===
          0 ? (
            <p className="p-4 text-sm text-[var(--bp-muted)]">
              No method data recorded in this period.
            </p>
          ) : (
            stats.methodStats.map(
              (item, index) => (
                <div
                  key={item.method}
                  className={`${
                    index <
                    stats.methodStats
                      .length -
                      1
                      ? 'border-b border-[var(--bp-line)]'
                      : ''
                  }`}
                >
                  <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[var(--bp-line)] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--bp-blue)]">
                        {item.method}
                      </p>

                      <p className="bp-code mt-1 text-[var(--bp-muted)]">
                        {item.count}{' '}
                        {item.count === 1
                          ? 'BREW'
                          : 'BREWS'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="bp-label text-[var(--bp-muted)]">
                        Avg Rating
                      </p>

                      <p className="bp-measurement mt-1 text-xl font-semibold text-[var(--bp-orange)]">
                        {item.avgRating >
                        0
                          ? item.avgRating.toFixed(
                              1
                            )
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4">
                    <div className="border-r border-[var(--bp-line)] p-3">
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
                    </div>

                    <div className="border-r border-[var(--bp-line)] p-3">
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
                    </div>

                    <div className="border-r border-[var(--bp-line)] p-3">
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
                    </div>

                    <div className="p-3">
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
                </div>
              )
            )
          )}
        </div>
      </section>

      {stats.highestRatedMethods.length >
        0 && (
        <section>
          <div className="mb-3">
            <p className="bp-index">
              04.06 / TOP METHODS
            </p>

            <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Highest Rated Methods
            </h2>

            <p className="bp-code mt-1 text-[var(--bp-muted)]">
              Minimum three recorded brews per method.
            </p>
          </div>

          <div className="border border-[var(--bp-line)]">
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
                    className={`grid grid-cols-[42px_1fr_auto] items-center gap-3 bg-[var(--bp-paper-light)] px-4 py-3 ${
                      index <
                      Math.min(
                        stats
                          .highestRatedMethods
                          .length,
                        3
                      ) -
                        1
                        ? 'border-b border-[var(--bp-line)]'
                        : ''
                    }`}
                  >
                    <span className="bp-measurement text-sm font-semibold text-[var(--bp-orange)]">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        '0'
                      )}
                    </span>

                    <div>
                      <p className="text-sm font-semibold text-[var(--bp-blue)]">
                        {
                          item.method
                        }
                      </p>

                      <p className="bp-code mt-1 text-[var(--bp-muted)]">
                        {
                          item.count
                        }{' '}
                        BREWS
                      </p>
                    </div>

                    <p className="bp-measurement text-xl font-semibold text-[var(--bp-blue)]">
                      {item.avgRating.toFixed(
                        1
                      )}
                    </p>
                  </div>
                )
              )}
          </div>
        </section>
      )}

      {stats.coffeeRatings.length >
        0 && (
        <section>
          <div className="mb-3">
            <p className="bp-index">
              04.07 / TOP COFFEES
            </p>

            <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Highest Rated Coffees
            </h2>

            <p className="bp-code mt-1 text-[var(--bp-muted)]">
              Minimum three recorded brews per coffee.
            </p>
          </div>

          <div className="border border-[var(--bp-line)]">
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
                    className={`grid grid-cols-[42px_1fr_auto] items-center gap-3 bg-[var(--bp-paper-light)] px-4 py-3 ${
                      index <
                      Math.min(
                        stats
                          .coffeeRatings
                          .length,
                        5
                      ) -
                        1
                        ? 'border-b border-[var(--bp-line)]'
                        : ''
                    }`}
                  >
                    <span className="bp-code text-[var(--bp-muted)]">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        '0'
                      )}
                    </span>

                    <div className="min-w-0">
                      <p className="bp-coffee-name truncate text-xl text-[var(--bp-blue)]">
                        {
                          item.coffee
                            ?.name
                        }
                      </p>

                      <p className="bp-code mt-1 truncate text-[var(--bp-muted)]">
                        {
                          item.coffee
                            ?.roaster
                        }{' '}
                        /{' '}
                        {
                          item.count
                        }{' '}
                        BREWS
                      </p>
                    </div>

                    <p className="bp-measurement text-xl font-semibold text-[var(--bp-blue)]">
                      {item.avgRating.toFixed(
                        1
                      )}
                    </p>
                  </div>
                )
              )}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="bp-index">
              04.08 / SENSORY
            </p>

            <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Sensory Profile
            </h2>

            <p className="bp-code mt-1 text-[var(--bp-muted)]">
              Average scores for the selected period.
            </p>
          </div>

          <span className="bp-code text-[var(--bp-muted)]">
            {stats.totalBrews}{' '}
            BREWS
          </span>
        </div>

        <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
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
          ].map((item, index) => (
            <div
              key={item.label}
              className={`grid grid-cols-[100px_1fr_42px] items-center gap-3 px-4 py-3 ${
                index < 5
                  ? 'border-b border-[var(--bp-line)]'
                  : ''
              }`}
            >
              <span className="bp-label text-[var(--bp-muted)]">
                {item.label}
              </span>

              <div className="h-[3px] bg-[var(--bp-line)]">
                <div
                  className="h-full bg-[var(--bp-orange)]"
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

              <span className="bp-measurement text-right text-sm font-semibold text-[var(--bp-blue)]">
                {item.value.toFixed(
                  1
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      {stats.flavorGroups.length >
        0 && (
        <section>
          <div className="mb-3">
            <p className="bp-index">
              04.09 / FLAVOUR
            </p>

            <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Recorded Flavour Groups
            </h2>
          </div>

          <div className="flex flex-wrap border-l border-t border-[var(--bp-line)]">
            {stats.flavorGroups
              .slice(0, 8)
              .map(
                ([name, count]) => (
                  <div
                    key={name}
                    className="border-b border-r border-[var(--bp-line)] bg-[var(--bp-paper-light)] px-3 py-2"
                  >
                    <span className="bp-code text-[var(--bp-blue)]">
                      {name}
                    </span>

                    <span className="bp-measurement ml-2 text-sm font-semibold text-[var(--bp-orange)]">
                      {count}
                    </span>
                  </div>
                )
              )}
          </div>
        </section>
      )}

      <section className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
        <div className="border-b border-[var(--bp-line)] p-4">
          <p className="bp-index">
            04.10 / INTERPRETATION
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Reading Your Data
          </h2>
        </div>

        <p className="p-4 text-sm leading-relaxed text-[var(--bp-muted)]">
          These analytics describe patterns in your recorded brews. A higher rating beside a method, temperature, ratio or other variable does not prove that the variable caused the better result.
        </p>
      </section>
    </div>
  );
};

export default AnalyticsView;
