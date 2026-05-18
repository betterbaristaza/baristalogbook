
import React, { useMemo } from 'react';
import { BrewLog, CoffeeBean } from '../types';
import { Icons } from '../constants';

interface AnalyticsViewProps {
  brewLogs: BrewLog[];
  coffees: CoffeeBean[];
  onBack: () => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ brewLogs, coffees, onBack }) => {
  const stats = useMemo(() => {
    if (brewLogs.length === 0) return null;

    // Helper to get coffee by ID
    const getCoffee = (id: string) => coffees.find(c => c.id === id);

    // Leaderboard Calculators
    const frequencyMap = (logs: BrewLog[], keyFn: (log: BrewLog) => string | undefined) => {
      const map: Record<string, number> = {};
      logs.forEach(log => {
        const key = keyFn(log);
        if (key) map[key] = (map[key] || 0) + 1;
      });
      return Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    };

    const topBeans = frequencyMap(brewLogs, (log) => getCoffee(log.coffeeId)?.name);
    const topRoasters = frequencyMap(brewLogs, (log) => getCoffee(log.coffeeId)?.roaster);
    const topOrigins = frequencyMap(brewLogs, (log) => getCoffee(log.coffeeId)?.origin);

    // Method Distribution
    const methods: Record<string, number> = {};
    brewLogs.forEach(log => {
      methods[log.method] = (methods[log.method] || 0) + 1;
    });

    // Sensory Averages
    const avgSensory = {
      aroma: brewLogs.reduce((acc, log) => acc + (log.aroma || 0), 0) / brewLogs.length,
      acidity: brewLogs.reduce((acc, log) => acc + (log.acidity || 0), 0) / brewLogs.length,
      sweetness: brewLogs.reduce((acc, log) => acc + (log.sweetness || 0), 0) / brewLogs.length,
      bitterness: brewLogs.reduce((acc, log) => acc + (log.bitterness || 0), 0) / brewLogs.length,
      body: brewLogs.reduce((acc, log) => acc + (log.body || 0), 0) / brewLogs.length,
      aftertaste: brewLogs.reduce((acc, log) => acc + (log.aftertaste || 0), 0) / brewLogs.length,
    };

    const totalDose = brewLogs.reduce((acc, log) => acc + (log.dose || 0), 0);

    return {
      totalBrews: brewLogs.length,
      totalBeans: coffees.length,
      totalDoseKg: (totalDose / 1000).toFixed(2),
      avgRating: (brewLogs.reduce((acc, log) => acc + (log.rating || 0), 0) / brewLogs.length).toFixed(1),
      topBeans,
      topRoasters,
      topOrigins,
      methods: Object.entries(methods).sort((a, b) => b[1] - a[1]),
      avgSensory
    };
  }, [brewLogs, coffees]);

  if (!stats) {
    return (
      <div className="animate-in fade-in duration-500 py-24 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-amber-800">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2" /></svg>
        </div>
        <h3 className="text-2xl font-bold display-font mb-2">Calibration Insights</h3>
        <p className="text-stone-400 text-sm font-medium mb-8 max-w-xs mx-auto">Start logging your brews in the journal to unlock your personal barista analytics.</p>
        <button onClick={onBack} className="text-amber-800 font-bold text-sm underline underline-offset-4">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10 pb-10">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg> Back
        </button>
        <h2 className="text-2xl font-bold display-font text-stone-800">Analytics <span className="text-amber-800">Hub</span></h2>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Grid Summaries */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm">
          <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Total Brews</p>
          <p className="text-3xl font-black text-stone-800">{stats.totalBrews}</p>
          <div className="mt-2 text-[8px] font-bold text-emerald-500 uppercase">↑ Lifetime Volume</div>
        </div>
        <div className="bg-[#fdf8f3] p-6 rounded-[2.5rem] border border-amber-100 shadow-sm">
          <p className="text-[9px] font-black text-amber-800/40 uppercase tracking-widest mb-1">Avg Rating</p>
          <p className="text-3xl font-black text-amber-950">{stats.avgRating}</p>
          <div className="mt-2 text-[8px] font-bold text-amber-800 uppercase">/ 5.0 Calibration</div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm">
          <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Coffee Traced</p>
          <p className="text-3xl font-black text-stone-800">{stats.totalDoseKg}<span className="text-sm ml-1 text-stone-400">kg</span></p>
          <div className="mt-2 text-[8px] font-bold text-stone-400 uppercase">Dry Dose Weight</div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm">
          <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Beans Logged</p>
          <p className="text-3xl font-black text-stone-800">{stats.totalBeans}</p>
          <div className="mt-2 text-[8px] font-bold text-stone-400 uppercase">Unique Batches</div>
        </div>
      </div>

      {/* Sensory Fingerprint */}
      <section className="bg-white p-8 rounded-[3rem] border border-stone-100 shadow-sm space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black text-stone-800 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-800 rounded-full"></span> Sensory Trends
          </h3>
          <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest">Global Averages</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            {[
              { label: 'Aroma', value: stats.avgSensory.aroma, color: 'bg-rose-500' },
              { label: 'Acidity', value: stats.avgSensory.acidity, color: 'bg-orange-500' },
              { label: 'Sweetness', value: stats.avgSensory.sweetness, color: 'bg-yellow-500' },
              { label: 'Bitterness', value: stats.avgSensory.bitterness, color: 'bg-green-600' },
              { label: 'Body', value: stats.avgSensory.body, color: 'bg-amber-700' },
              { label: 'Aftertaste', value: stats.avgSensory.aftertaste, color: 'bg-indigo-500' }
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                  <span className="text-stone-400">{item.label}</span>
                  <span className="text-stone-800">{item.value.toFixed(1)}</span>
                </div>
                <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                  <div 
                    className={`${item.color} h-full rounded-full transition-all duration-1000`} 
                    style={{ width: `${(item.value / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center bg-stone-50/50 p-6 rounded-[2.5rem] border border-stone-100/50">
            {/* Simple Radial visualization (Placeholder for chart) */}
            <div className="text-center">
              <p className="text-[9px] font-black text-stone-300 uppercase mb-4 tracking-widest">Calibration Balance</p>
              <div className="w-24 h-24 rounded-full border-8 border-amber-800/10 flex items-center justify-center relative">
                 <div className="text-xl font-black text-amber-900">{((stats.avgSensory.sweetness + stats.avgSensory.acidity) / 2).toFixed(1)}</div>
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-800 rounded-full animate-pulse shadow-sm"></div>
              </div>
              <p className="text-[8px] font-black text-amber-800 uppercase mt-4">Sweet/Acid Index</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboards */}
      <div className="space-y-8">
        <h3 className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-2 px-2">
           Leaderboards <span className="h-px bg-stone-100 flex-1"></span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Beans */}
          <div className="bg-white p-7 rounded-[3rem] border border-stone-100 shadow-sm space-y-5">
            <h4 className="text-[10px] font-black text-stone-800 uppercase tracking-widest mb-2">Top Beans</h4>
            {stats.topBeans.map(([name, count], i) => (
              <div key={name} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-stone-200">{i + 1}</span>
                  <p className="text-sm font-bold text-stone-700 group-hover:text-amber-800 transition-colors">{name}</p>
                </div>
                <span className="text-[10px] font-black bg-stone-50 text-stone-400 px-2 py-0.5 rounded-md">{count}x</span>
              </div>
            ))}
          </div>

          {/* Top Roasters */}
          <div className="bg-white p-7 rounded-[3rem] border border-stone-100 shadow-sm space-y-5">
            <h4 className="text-[10px] font-black text-stone-800 uppercase tracking-widest mb-2">Top Roasters</h4>
            {stats.topRoasters.map(([name, count], i) => (
              <div key={name} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-stone-200">{i + 1}</span>
                  <p className="text-sm font-bold text-stone-700 group-hover:text-amber-800 transition-colors">{name}</p>
                </div>
                <span className="text-[10px] font-black bg-stone-50 text-stone-400 px-2 py-0.5 rounded-md">{count}x</span>
              </div>
            ))}
          </div>

          {/* Top Origins */}
          <div className="bg-white p-7 rounded-[3rem] border border-stone-100 shadow-sm space-y-5">
            <h4 className="text-[10px] font-black text-stone-800 uppercase tracking-widest mb-2">Top Origins</h4>
            {stats.topOrigins.map(([name, count], i) => (
              <div key={name} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-stone-200">{i + 1}</span>
                  <p className="text-sm font-bold text-stone-700 group-hover:text-amber-800 transition-colors">{name}</p>
                </div>
                <span className="text-[10px] font-black bg-stone-50 text-stone-400 px-2 py-0.5 rounded-md">{count}x</span>
              </div>
            ))}
          </div>

          {/* Method Mix */}
          <div className="bg-white p-7 rounded-[3rem] border border-stone-100 shadow-sm space-y-5">
            <h4 className="text-[10px] font-black text-stone-800 uppercase tracking-widest mb-2">Method Mix</h4>
            <div className="space-y-4">
              {stats.methods.map(([method, count]) => (
                <div key={method} className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-stone-400">{method}</span>
                    <span className="text-amber-800">{count} brews</span>
                  </div>
                  <div className="h-1 w-full bg-stone-50 rounded-full overflow-hidden">
                    <div 
                      className="bg-stone-800 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(count / stats.totalBrews) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
