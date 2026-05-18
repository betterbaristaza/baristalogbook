
import React, { useState, useEffect } from 'react';
import { CoffeeBean, BrewLog, RoastLevel, BrewMethod, WeeklySummary, SocialPost, UserProfile } from './types';
import { Icons } from './constants';
import CoffeeCard from './components/CoffeeCard';
import BrewForm from './components/BrewForm';
import CoffeeBeanForm from './components/CoffeeBeanForm';
import GrindReference from './components/GrindReference';
import AnalyticsView from './components/AnalyticsView';
import { storage } from './services/storageService';

const SENSORY_METADATA = [
  { id: 'aroma', label: 'Aroma', icon: '👃', color: '#f43f5e' },
  { id: 'acidity', label: 'Acidity', icon: '🍋', color: '#f97316' },
  { id: 'sweetness', label: 'Sweetness', icon: '🍬', color: '#eab308' },
  { id: 'bitterness', label: 'Bitterness', icon: '🌿', color: '#16a34a' },
  { id: 'body', label: 'Body', icon: '☕', color: '#92400e' },
  { id: 'aftertaste', label: 'Aftertaste', icon: '⏳', color: '#6366f1' }
];

const FLAVOR_GROUP_STYLING: Record<string, string> = {
  'Floral': 'bg-rose-50 text-rose-700 border-rose-100',
  'Fruity': 'bg-red-50 text-red-700 border-red-100',
  'Nutty/Sweet': 'bg-amber-50 text-amber-700 border-amber-100',
  'Chocolatey': 'bg-stone-50 text-stone-700 border-stone-100',
  'Earthy': 'bg-emerald-50 text-emerald-700 border-emerald-100'
};

const MOCK_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 's1',
    authorId: 'u1',
    authorName: 'James Hoffmann',
    authorHandle: '@jimseven',
    authorAvatar: 'https://i.pravatar.cc/150?u=james',
    coffeeName: 'Koji Supernatural',
    roasterName: 'Elika Coffee',
    method: BrewMethod.POUR_OVER,
    recipe: '15g / 250g • 2:45 total • V60',
    likes: 1242,
    isLiked: true,
    timestamp: '2h ago',
    image: 'https://images.unsplash.com/photo-1544787210-2213d2429f3d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 's2',
    authorId: 'u2',
    authorName: 'Morgan Eckroth',
    authorHandle: '@morgandrinkscoffee',
    authorAvatar: 'https://i.pravatar.cc/150?u=morgan',
    coffeeName: 'Midnight Oil',
    roasterName: 'Onyx Coffee Lab',
    method: BrewMethod.ESPRESSO,
    recipe: '18g in / 36g out • 30s • 9 bars',
    likes: 856,
    isLiked: false,
    timestamp: '5h ago',
    image: 'https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?auto=format&fit=crop&q=80&w=600'
  }
];

const MOCK_SUMMARIES = {
  weekly: {
    totalBrews: 14,
    avgTaste: 4.2,
    topMethod: BrewMethod.POUR_OVER,
    favoriteBean: 'Ethiopia Sidamo'
  },
  monthly: {
    totalBrews: 58,
    avgTaste: 3.9,
    topMethod: BrewMethod.ESPRESSO,
    favoriteBean: 'Kenya SL28'
  }
};

const RadarChart: React.FC<{ log: BrewLog }> = ({ log }) => {
  const size = 130;
  const center = size / 2;
  const radius = size * 0.35;
  const points = [
    log.aroma || 3,
    log.acidity || 3,
    log.sweetness || 3,
    log.bitterness || 3,
    log.body || 3,
    log.aftertaste || 3
  ];

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / points.length - Math.PI / 2;
    const r = (value / 5) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const pathData = points.map((v, i) => {
    const coords = getCoordinates(i, v);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  const gridLevels = [1, 2, 3, 4, 5];

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {gridLevels.map(level => (
          <polygon
            key={level}
            points={[0,1,2,3,4,5].map((_, i) => {
              const coords = getCoordinates(i, level);
              return `${coords.x},${coords.y}`;
            }).join(' ')}
            fill="none"
            stroke="#f1f1f1"
            strokeWidth="1"
          />
        ))}
        {points.map((_, i) => {
          const end = getCoordinates(i, 5);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="#f5f5f5"
              strokeWidth="1"
            />
          );
        })}
        <polygon
          points={pathData}
          fill="rgba(146, 64, 14, 0.08)"
          stroke="#92400e"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="animate-in fade-in duration-1000"
        />
        {points.map((v, i) => {
          const coords = getCoordinates(i, v);
          return (
            <circle
              key={i}
              cx={coords.x}
              cy={coords.y}
              r="2.5"
              fill="#92400e"
            />
          );
        })}
        {SENSORY_METADATA.map((meta, i) => {
          const pos = getCoordinates(i, 6.2);
          return (
            <g key={meta.id}>
              <text x={pos.x} y={pos.y} fontSize="12" textAnchor="middle" dominantBaseline="middle">{meta.icon}</text>
              <text x={pos.x} y={pos.y + 12} fontSize="7" fontWeight="900" textAnchor="middle" dominantBaseline="middle" fill={meta.color} className="uppercase tracking-tighter">{meta.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const INITIAL_COFFEES: CoffeeBean[] = [
  {
    id: '1',
    name: 'Ethiopia Sidamo',
    roaster: 'Proud Mary',
    origin: 'Ethiopia',
    process: 'Washed',
    roastLevel: RoastLevel.LIGHT,
    purchaseDate: '2024-03-01',
    remainingWeight: 180,
    totalWeight: 250,
    personalNotes: 'Floral and tea-like.'
  }
];

const App: React.FC = () => {
  const [coffees, setCoffees] = useState<CoffeeBean[]>(() => {
    const saved = storage.getCoffees();
    return saved && saved.length > 0 ? saved : INITIAL_COFFEES;
  });
  const [brewLogs, setBrewLogs] = useState<BrewLog[]>(() => {
    return storage.getBrewLogs() || [];
  });

  // Sync to localStorage
  useEffect(() => {
    storage.saveCoffees(coffees);
  }, [coffees]);

  useEffect(() => {
    storage.saveBrewLogs(brewLogs);
  }, [brewLogs]);

  const [activeTab, setActiveTab] = useState<'home' | 'journal' | 'library' | 'grind' | 'community' | 'analytics'>('home');
  
  const [showBeanForm, setShowBeanForm] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<CoffeeBean | null>(null);
  const [editingLog, setEditingLog] = useState<BrewLog | null>(null);
  const [prefillLog, setPrefillLog] = useState<BrewLog | null>(null);
  const [showBrewFlow, setShowBrewFlow] = useState(false);
  const [brewFlowStep, setBrewFlowStep] = useState<'select' | 'new-bean' | 'brew'>('select');
  const [selectedCoffee, setSelectedCoffee] = useState<CoffeeBean | null>(null);

  const handleSaveBean = (bean: CoffeeBean) => {
    setCoffees(prev => {
      const exists = prev.find(c => c.id === bean.id);
      if (exists) {
        return prev.map(c => c.id === bean.id ? bean : c);
      }
      return [bean, ...prev];
    });
    
    if (brewFlowStep === 'new-bean') {
      setSelectedCoffee(bean);
      setBrewFlowStep('brew');
    } else {
      setShowBeanForm(false);
      setEditingCoffee(null);
    }
  };

  const handleDeleteCoffee = (id: string) => {
    if (window.confirm('Are you sure you want to delete this coffee? All associated brew logs will remain but might look incomplete.')) {
      setCoffees(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSaveBrew = (log: Partial<BrewLog>) => {
    if (editingLog) {
      const updatedLog = { ...editingLog, ...log } as BrewLog;
      setBrewLogs(prev => prev.map(l => l.id === editingLog.id ? updatedLog : l));
      setEditingLog(null);
    } else {
      const newLog = { 
        ...log, 
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        aroma: log.aroma || 3,
        acidity: log.acidity || 3,
        sweetness: log.sweetness || 3,
        bitterness: log.bitterness || 3,
        body: log.body || 3,
        aftertaste: log.aftertaste || 3,
        flavorGroups: log.flavorGroups || []
      } as BrewLog;
      
      setBrewLogs(prev => [newLog, ...prev]);
      setCoffees(prev => prev.map(c => 
        c.id === log.coffeeId 
          ? { ...c, remainingWeight: Math.max(0, c.remainingWeight - (log.dose || 0)) } 
          : c
      ));
    }

    setShowBrewFlow(false);
    setBrewFlowStep('select');
    setSelectedCoffee(null);
    setPrefillLog(null);
  };

  const handleDeleteLog = (id: string) => {
    if (window.confirm('Delete this brew log permanently?')) {
      setBrewLogs(prev => prev.filter(l => l.id !== id));
    }
  };

  const startBrewCapture = () => {
    setEditingLog(null);
    setPrefillLog(null);
    setBrewFlowStep('select');
    setShowBrewFlow(true);
  };

  return (
    <div className="min-h-screen pb-32 flex flex-col bg-[#fdfcfb]">
      <header className="bg-white border-b border-stone-100 sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold display-font text-stone-800">Barista <span className="text-amber-800">JournalPro</span></h1>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 overflow-hidden ring-2 ring-white shadow-sm">
            <img src="https://i.pravatar.cc/150?u=me" alt="Avatar" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6">
        {activeTab === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Welcome back,</p>
              <h2 className="text-4xl font-bold text-stone-800 display-font">Alexander</h2>
            </div>

            {/* Summaries Section - Refined Light Aesthetic */}
            <section className="space-y-6">
              <div className="flex justify-between items-end">
                <h3 className="text-xs font-black uppercase tracking-widest text-stone-500">Activity Summaries</h3>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="text-[10px] font-bold text-amber-800 underline underline-offset-4 hover:text-amber-600 transition-colors"
                >
                  Full Analytics
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
                <div className="flex-none w-64 bg-white p-7 rounded-[2.5rem] border border-stone-100 shadow-sm transition-all hover:border-amber-200">
                  <div className="flex justify-between items-start mb-6">
                    <span className="p-3 bg-amber-50 text-amber-800 rounded-2xl shadow-sm"><Icons.Book className="w-5 h-5" /></span>
                    <span className="text-[9px] font-black uppercase bg-stone-800 text-white px-2 py-0.5 rounded-md shadow-sm">This Week</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[9px] font-bold text-stone-400 uppercase">Brews</p><p className="text-xl font-black text-stone-800">{MOCK_SUMMARIES.weekly.totalBrews}</p></div>
                    <div><p className="text-[9px] font-bold text-stone-400 uppercase">Avg Taste</p><p className="text-xl font-black text-stone-800">{MOCK_SUMMARIES.weekly.avgTaste}/5</p></div>
                    <div className="col-span-2 pt-2 border-t border-stone-50"><p className="text-[9px] font-bold text-stone-400 uppercase mb-1">Top Method</p><p className="text-xs font-black text-amber-900">{MOCK_SUMMARIES.weekly.topMethod}</p></div>
                  </div>
                </div>

                {/* Monthly Insight - Updated Background to Light Crema/Amber Refined Aesthetic */}
                <div className="flex-none w-64 bg-[#fdf8f3] p-7 rounded-[2.5rem] border border-amber-100 shadow-sm transition-all hover:border-amber-300">
                  <div className="flex justify-between items-start mb-6">
                    <span className="p-3 bg-white text-amber-800 rounded-2xl shadow-md border border-amber-50"><Icons.Star className="w-5 h-5" /></span>
                    <span className="text-[9px] font-black uppercase bg-amber-800 text-white px-2 py-0.5 rounded-md shadow-sm">Monthly</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[9px] font-bold text-amber-800/40 uppercase">Total Brews</p><p className="text-xl font-black text-amber-950">{MOCK_SUMMARIES.monthly.totalBrews}</p></div>
                    <div><p className="text-[9px] font-bold text-amber-800/40 uppercase">Growth</p><p className="text-xl font-black text-emerald-600">+12%</p></div>
                    <div className="col-span-2 pt-2 border-t border-amber-100/50"><p className="text-[9px] font-bold text-amber-800/40 uppercase mb-1">Star Roast</p><p className="text-xs font-black text-amber-900">{MOCK_SUMMARIES.monthly.favoriteBean}</p></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Social News Feed */}
            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-stone-500">Social News Feed</h3>
              <div className="space-y-8">
                {MOCK_SOCIAL_POSTS.map(post => (
                  <div key={post.id} className="bg-white rounded-[3rem] overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full border border-stone-100" />
                        <div>
                          <p className="text-sm font-black text-stone-800">{post.authorName}</p>
                          <p className="text-[10px] text-stone-400 font-bold">{post.authorHandle}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-stone-300 uppercase">{post.timestamp}</span>
                    </div>
                    {post.image && (
                      <div className="aspect-square relative overflow-hidden bg-stone-100">
                        <img src={post.image} alt="Coffee" className="w-full h-full object-cover" />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-lg">
                           <p className="text-[9px] font-black text-stone-800 uppercase tracking-widest">{post.method}</p>
                        </div>
                      </div>
                    )}
                    <div className="p-7 space-y-4">
                      <div>
                        <h4 className="text-lg font-black text-stone-800 mb-0.5">{post.coffeeName}</h4>
                        <p className="text-[10px] text-amber-800 font-black uppercase tracking-widest">{post.roasterName}</p>
                      </div>
                      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100/50">
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Recipe Traced</p>
                        <p className="text-xs font-bold text-stone-700">{post.recipe}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-4">
                          <button className={`flex items-center gap-1.5 transition-colors ${post.isLiked ? 'text-rose-500' : 'text-stone-300 hover:text-stone-400'}`}>
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            <span className="text-xs font-black">{post.likes}</span>
                          </button>
                          <button className="text-stone-300 hover:text-stone-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                          </button>
                        </div>
                        <button className="p-2 bg-stone-50 text-stone-400 rounded-full hover:text-stone-800 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView brewLogs={brewLogs} coffees={coffees} onBack={() => setActiveTab('home')} />
        )}

        {activeTab === 'journal' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-stone-800 display-font">Daily Journal</h2>
              <button onClick={startBrewCapture} className="bg-amber-800 text-white p-4 px-6 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-900/20 active:scale-95 transition-all">
                <Icons.Plus className="w-4 h-4" /> Capture Brew
              </button>
            </div>
            {brewLogs.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-stone-200">
                <Icons.Coffee className="w-16 h-16 text-stone-100 mx-auto mb-4" />
                <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">Your journal is empty</p>
                <button onClick={startBrewCapture} className="mt-4 text-amber-800 font-bold text-sm underline underline-offset-4">Log your first calibration</button>
              </div>
            ) : (
              <div className="space-y-6">
                {brewLogs.map(log => {
                  const coffee = coffees.find(c => c.id === log.coffeeId);
                  return (
                    <div key={log.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-stone-100 hover:border-amber-200 transition-all group relative overflow-hidden">
                      <div className="flex justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="text-[9px] uppercase font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">{log.method}</span>
                            {log.machine && <span className="text-[9px] uppercase font-bold text-stone-500 bg-stone-50 px-2 py-0.5 rounded-md">{log.machine}</span>}
                            {log.brewerBrand && <span className="text-[9px] uppercase font-bold text-stone-500 bg-stone-50 px-2 py-0.5 rounded-md">{log.brewerBrand} {log.brewer}</span>}
                          </div>
                          <h3 className="font-bold text-2xl text-stone-800 leading-tight">{coffee?.name || 'Unknown Blend'}</h3>
                          <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-2 flex flex-wrap items-center gap-2">
                             {log.grinder} • <span className="text-amber-700">{log.grindSetting}</span>
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-3">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setEditingLog(log); setPrefillLog(null); setSelectedCoffee(coffee || null); setShowBrewFlow(true); setBrewFlowStep('brew'); }}
                              className="p-1.5 bg-stone-50 text-stone-400 hover:text-amber-800 rounded-lg border border-stone-100 hover:border-amber-200 transition-all shadow-sm"
                              title="Edit Brew"
                            >
                              <Icons.Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => { setPrefillLog(log); setEditingLog(null); setSelectedCoffee(coffee || null); setShowBrewFlow(true); setBrewFlowStep('brew'); }}
                              className="p-1.5 bg-stone-50 text-stone-400 hover:text-amber-800 rounded-lg border border-stone-100 hover:border-amber-200 transition-all shadow-sm"
                              title="Duplicate Brew"
                            >
                              <Icons.Copy className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteLog(log.id)}
                              className="p-1.5 bg-rose-50 text-rose-300 hover:text-rose-600 rounded-lg border border-rose-100 hover:border-rose-200 transition-all shadow-sm"
                              title="Delete Brew"
                            >
                              <Icons.Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[10px] text-stone-300 font-black uppercase tracking-tighter">{new Date(log.date).toLocaleDateString()}</p>
                          <div className="flex gap-0.5 text-amber-500 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Icons.Star key={i} className={`w-3.5 h-3.5 ${i < log.rating ? 'fill-current' : 'text-stone-100'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8 bg-stone-50/40 p-6 rounded-[2.5rem] border border-stone-100/50">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="flex flex-col bg-white p-3 rounded-2xl border border-stone-100/80 shadow-sm"><p className="text-[9px] text-stone-400 font-black uppercase mb-1">Dose</p><p className="font-black text-stone-800 text-sm">{log.dose}g</p></div>
                          <div className="flex flex-col bg-white p-3 rounded-2xl border border-stone-100/80 shadow-sm"><p className="text-[9px] text-stone-400 font-black uppercase mb-1">Yield</p><p className="font-black text-stone-800 text-sm">{log.yield}g</p></div>
                          <div className="flex flex-col bg-white p-3 rounded-2xl border border-stone-100/80 shadow-sm"><p className="text-[9px] text-stone-400 font-black uppercase mb-1">Time</p><p className="font-black text-stone-800 text-sm">{log.brewTime}s</p></div>
                          <div className="flex flex-col bg-white p-3 rounded-2xl border border-stone-100/80 shadow-sm"><p className="text-[9px] text-stone-400 font-black uppercase mb-1">Temp</p><p className="font-black text-stone-800 text-sm">{log.waterTemp}°C</p></div>
                        </div>
                        <div className="flex flex-col items-center justify-center"><RadarChart log={log} /></div>
                      </div>
                      {log.flavorGroups && log.flavorGroups.length > 0 && (
                        <div className="flex flex-wrap gap-2.5 mb-6">
                          {log.flavorGroups.map(group => (
                            <span key={group} className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest shadow-sm ${FLAVOR_GROUP_STYLING[group] || 'bg-stone-50 text-stone-500 border-stone-100'}`}>{group}</span>
                          ))}
                        </div>
                      )}
                      {log.processNotes && (
                        <div className="mb-6 p-5 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                          <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-1.5">Method Notes</p>
                          <p className="text-xs text-stone-600 leading-relaxed font-medium whitespace-pre-wrap italic">"{log.processNotes}"</p>
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
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-stone-800 display-font">Coffee Library</h2>
              <button 
                onClick={() => { setEditingCoffee(null); setShowBeanForm(true); }} 
                className="bg-stone-900 text-white p-4 px-6 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-stone-900/10"
              >
                <Icons.Plus className="w-4 h-4" /> Add Bean
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {coffees.map(coffee => (
                <CoffeeCard 
                  key={coffee.id} 
                  coffee={coffee} 
                  onClick={(c) => { setSelectedCoffee(c); setBrewFlowStep('brew'); setShowBrewFlow(true); }} 
                  onEdit={(c) => { setEditingCoffee(c); setShowBeanForm(true); }}
                  onDelete={(c) => handleDeleteCoffee(c.id)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'grind' && <GrindReference />}

        {activeTab === 'community' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-12 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-amber-800">
                <Icons.Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold display-font mb-2">Community Feed</h3>
              <p className="text-stone-400 text-sm font-medium mb-8">Coming soon: Share your calibration recipes with baristas worldwide.</p>
              <button className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest opacity-50 cursor-not-allowed">Join Waitlist</button>
           </div>
        )}
      </main>

      {/* MODALS */}
      {showBrewFlow && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-6 overflow-y-auto">
          {brewFlowStep === 'select' && (
            <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-2xl font-black text-stone-800 display-font">Select Roast</h3>
                   <p className="text-xs text-stone-400 font-medium">Which bean are we calibrating today?</p>
                </div>
                <button 
                  onClick={() => { setShowBrewFlow(false); setEditingLog(null); setPrefillLog(null); }} 
                  className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-stone-800 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto mb-8 pr-2 custom-scrollbar">
                {coffees.map(c => (
                  <button key={c.id} onClick={() => { setSelectedCoffee(c); setBrewFlowStep('brew'); }} className="w-full text-left p-5 rounded-[1.5rem] border border-stone-100 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex justify-between items-center group">
                    <div>
                      <p className="font-black text-stone-800 group-hover:text-amber-900">{c.name}</p>
                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">{c.roaster}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-1 rounded-md">{c.remainingWeight}g</span>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setBrewFlowStep('new-bean')} className="w-full py-5 border-2 border-dashed border-stone-200 text-stone-400 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] hover:border-amber-400 hover:text-amber-800 hover:bg-amber-50/30 transition-all">+ Register New Bean</button>
            </div>
          )}
          {brewFlowStep === 'new-bean' && <CoffeeBeanForm onSave={handleSaveBean} onCancel={() => setBrewFlowStep('select')} />}
          {brewFlowStep === 'brew' && selectedCoffee && (
            <BrewForm 
              coffee={selectedCoffee} 
              initialData={(editingLog || prefillLog) || undefined} 
              title={editingLog ? 'Update Entry' : (prefillLog ? 'Duplicate Recipe' : 'Log Brew')}
              onSave={handleSaveBrew} 
              onCancel={() => { setShowBrewFlow(false); setEditingLog(null); setPrefillLog(null); }} 
            />
          )}
        </div>
      )}

      {showBeanForm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-6 overflow-y-auto">
          <CoffeeBeanForm initialData={editingCoffee || undefined} onSave={handleSaveBean} onCancel={() => { setShowBeanForm(false); setEditingCoffee(null); }} />
        </div>
      )}

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md bg-stone-900/90 backdrop-blur-xl border border-white/10 px-4 py-5 flex justify-around items-center z-50 rounded-[3rem] shadow-2xl">
        {[
          { id: 'home', icon: <Icons.Coffee className="w-6 h-6" />, label: 'Home' },
          { id: 'journal', icon: <Icons.Book className="w-6 h-6" />, label: 'Journal' },
          { id: 'library', icon: <Icons.Search className="w-6 h-6" />, label: 'Library' },
          { id: 'community', icon: <Icons.Users className="w-6 h-6" />, label: 'Community' }
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center gap-1.5 transition-all group ${activeTab === item.id || (activeTab === 'analytics' && item.id === 'home') ? 'text-amber-400' : 'text-stone-500 hover:text-stone-300'}`}>
            <div className={`p-2.5 rounded-2xl transition-all ${activeTab === item.id || (activeTab === 'analytics' && item.id === 'home') ? 'bg-amber-400/10 scale-110 shadow-inner' : 'group-hover:bg-white/5'}`}>{item.icon}</div>
            <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${activeTab === item.id || (activeTab === 'analytics' && item.id === 'home') ? 'opacity-100' : 'opacity-40'}`}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
