
import React, { useState } from 'react';
import { BrewMethod, CoffeeBean, BrewLog } from '../types';

const INITIAL_EQUIPMENT_DB = {
  GRINDERS: ['Niche Zero', 'Fellow Ode Gen 2', 'Comandante C40', 'Baratza Encore', '1Zpresso J-Max', 'Timemore C2', 'Mahlkönig EK43', 'Lagom P64', 'Eureka Mignon'],
  ESPRESSO_MACHINES: ['La Marzocco Linea Mini', 'Breville Dual Boiler', 'Rocket Apartamento', 'Lelit Bianca', 'Gaggia Classic Pro', 'Flair 58', 'Decent DE1', 'Rancilio Silvia', 'Sage Barista Express'],
  POUR_OVER_BRANDS: ['Hario', 'Kalita', 'Chemex', 'Fellow', 'Origami', 'Orea', 'Cafec', 'Hario Switch', 'Clever'],
  POUR_OVER_MODELS: {
    'Hario': ['V60-01', 'V60-02', 'V60-03', 'Mugen'],
    'Kalita': ['Wave 155', 'Wave 185', '102 Dripper'],
    'Fellow': ['Stagg [X]', 'Stagg [XF]'],
    'Orea': ['V3', 'V3 MK2'],
    'Origami': ['Dripper S', 'Dripper M'],
    'Cafec': ['Flower Dripper', 'Deep 27'],
    'Chemex': ['Classic 3-Cup', 'Classic 6-Cup', 'Glass Handle 8-Cup'],
    'Hario Switch': ['Size 02', 'Size 03'],
    'Clever': ['Small', 'Large']
  } as Record<string, string[]>,
  FILTER_PAPERS: [
    'Hario V60 Tabbed (Japan)', 'Hario V60 Untabbed', 'Cafec Abaca', 'Cafec T-90 (Medium)', 
    'Cafec T-92 (Light)', 'Sibarist Fast', 'Kalita White Wave', 'Kalita Brown Wave', 
    'Chemex Bonded', 'Fellow Stagg [X] Paper', 'Origami Cup Filter', 'Melitta #2', 'Melitta #4', 'Abaca+ Shallow'
  ],
  AEROPRESS_STYLES: [
    'Standard (Upright)', 'Inverted', 'Bypass (Dilution)', 'Espresso-style', 
    'Cold Drip setup', 'Hoffmann Style', 'Adler Method', 'WAC Winner Style'
  ],
  AEROPRESS_CAPS: [
    'Standard Plastic Cap', 'Fellow Prismo', 'AeroPress Flow Control Cap', 
    'Joepresso', 'PuckPuck Attachment', 'Metal Mesh Filter', '2uul / 3rd Party'
  ],
  COLD_BREW_SYSTEMS: ['Toddy System', 'Hario Mizudashi', 'OXO Good Grips', 'Bruer Cold Drip', 'KitchenAid Cold Brew', 'Filtron'],
  FRENCH_PRESS_BRANDS: ['Bodum', 'Espro', 'Fellow Clara', 'Hario', 'Yama'],
  AGITATION_METHODS: ['None', 'Gentle Stir', 'Aggressive Stir', 'Swirl', 'Break Crust', 'Double Stir'],
  DISTRIBUTION_TOOLS: ['None', 'WDT (Needle Tool)', 'OCD Spinning Tool', 'Palm Distributor', 'WDT + OCD'],
  BASKETS: ['Stock', 'VST 18g', 'VST 20g', 'IMS Precision', 'Pullman 876'],
  MOKA_POT_BRANDS: ['Bialetti', 'Alessi', 'E&B Lab', 'Giannini', 'Cuisinox', 'Pezzetti'],
  MOKA_POT_MODELS: {
    'Bialetti': ['Moka Express (3-cup)', 'Moka Express (6-cup)', 'Brikka (2-cup)', 'Venus (4-cup)', 'Kitty', 'Musa'],
    'Alessi': ['9090 (6-cup)', 'Moka (3-cup)', 'Pulcina (3-cup)'],
    'E&B Lab': ['Moka Pot (Competition Filter)'],
    'Giannini': ['Giannina (1/3-cup)', 'Giannina (3/6-cup)'],
    'Cuisinox': ['Libertà', 'Roma'],
    'Pezzetti': ['Italexpress', 'Bellexpress']
  } as Record<string, string[]>,
  WATER_START_TEMPS: ['Room Temp (20°C)', 'Warm (60°C)', 'Hot / Preheated (95°C)'],
  FLAME_SETTINGS: ['Low', 'Medium-Low', 'Medium', 'Medium-High'],
  FLAVOR_GROUPS: [
    { name: 'Floral', icon: '🌸', color: 'bg-rose-50 text-rose-700 border-rose-100', activeColor: 'bg-rose-100' },
    { name: 'Fruity', icon: '🍒', color: 'bg-red-50 text-red-700 border-red-100', activeColor: 'bg-red-100' },
    { name: 'Nutty/Sweet', icon: '🥜', color: 'bg-amber-50 text-amber-700 border-amber-100', activeColor: 'bg-amber-100' },
    { name: 'Chocolatey', icon: '🍫', color: 'bg-stone-50 text-stone-700 border-stone-100', activeColor: 'bg-stone-200' },
    { name: 'Earthy', icon: '🌿', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', activeColor: 'bg-emerald-100' }
  ]
};

const SENSORY_ATTRIBUTES = [
  { id: 'aroma', label: 'Aroma', icon: '👃', color: 'text-rose-500', barColor: 'bg-rose-500' },
  { id: 'acidity', label: 'Acidity', icon: '🍋', color: 'text-orange-500', barColor: 'bg-orange-500' },
  { id: 'sweetness', label: 'Sweetness', icon: '🍬', color: 'text-yellow-500', barColor: 'bg-yellow-500' },
  { id: 'bitterness', label: 'Bitterness', icon: '🌿', color: 'text-green-600', barColor: 'bg-green-600' },
  { id: 'body', label: 'Body', icon: '☕', color: 'text-amber-700', barColor: 'bg-amber-700' },
  { id: 'aftertaste', label: 'Aftertaste', icon: '⏳', color: 'text-indigo-500', barColor: 'bg-indigo-500' }
];

interface DynamicSelectProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
  onAdd: (newVal: string) => void;
  className?: string;
  labelSize?: 'xs' | '10px' | '9px';
  labelColor?: string;
  placeholder?: string;
}

const DynamicSelect: React.FC<DynamicSelectProps> = ({ 
  label, value, options, onSelect, onAdd, className, labelSize = '9px', labelColor = 'text-stone-500', placeholder 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');

  const labelClasses = `block font-bold uppercase mb-1 ${labelColor} ${labelSize === '10px' ? 'text-[10px]' : labelSize === 'xs' ? 'text-xs' : 'text-[9px]'}`;

  if (isAdding) {
    return (
      <div className={className}>
        <label className={labelClasses}>{label}</label>
        <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
          <input
            type="text"
            autoFocus
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (newValue.trim()) {
                  onAdd(newValue.trim());
                  setIsAdding(false);
                  setNewValue('');
                }
              }
            }}
            className="flex-1 bg-white border border-amber-300 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
            placeholder={placeholder || `Add ${label}...`}
          />
          <button
            type="button"
            onClick={() => {
              if (newValue.trim()) {
                onAdd(newValue.trim());
                setIsAdding(false);
                setNewValue('');
              }
            }}
            className="px-3 bg-amber-800 text-white rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-md"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-3 bg-stone-100 text-stone-400 rounded-xl text-xs font-bold"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className={labelClasses}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value === 'ADD_NEW') {
              setIsAdding(true);
            } else {
              onSelect(e.target.value);
            }
          }}
          className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs font-bold appearance-none focus:border-amber-300 transition-colors cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="ADD_NEW" className="text-amber-700 font-black">+ Other / Add New...</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
        </div>
      </div>
    </div>
  );
};

interface BrewFormProps {
  coffee: CoffeeBean;
  onSave: (log: Partial<BrewLog>) => void;
  onCancel: () => void;
  initialData?: BrewLog;
  title?: string;
}

const BrewForm: React.FC<BrewFormProps> = ({ coffee, onSave, onCancel, initialData, title }) => {
  const [method, setMethod] = useState<BrewMethod>(initialData?.method || BrewMethod.ESPRESSO);
  const [baristaName, setBaristaName] = useState(initialData?.baristaName || '');
  const [db, setDb] = useState(INITIAL_EQUIPMENT_DB);
  
  // Shared
  const [dose, setDose] = useState(initialData?.dose ?? 18);
  const [yieldVal, setYieldVal] = useState(initialData?.yield ?? 36);
  const [time, setTime] = useState(initialData?.brewTime ?? 30);
  const [grinder, setGrinder] = useState(initialData?.grinder || db.GRINDERS[0]);
  const [setting, setSetting] = useState(initialData?.grindSetting || '');
  const [temp, setTemp] = useState(initialData?.waterTemp ?? 93);
  const [rating, setRating] = useState(initialData?.rating ?? 4);
  const [notes, setNotes] = useState(initialData?.tastingNotes?.join(', ') || '');
  const [processNotes, setProcessNotes] = useState(initialData?.processNotes || '');

  // Espresso specific
  const [machineBrand, setMachineBrand] = useState(initialData?.machine || db.ESPRESSO_MACHINES[0]);
  const [basketType, setBasketType] = useState(initialData?.basketType || db.BASKETS[0]);
  const [distTool, setDistTool] = useState(initialData?.distributionTool || db.DISTRIBUTION_TOOLS[0]);
  const [puckScreen, setPuckScreen] = useState(initialData?.puckScreen || false);
  const [pressure, setPressure] = useState(initialData?.pressure ?? 9);

  // Cold Brew specific
  const [cbSystem, setCbSystem] = useState(initialData?.coldBrewSystem || db.COLD_BREW_SYSTEMS[0]);
  const [steepTimeCB, setSteepTimeCB] = useState(initialData?.steepTime ?? 16);
  const [bloomTime, setBloomTime] = useState(initialData?.bloomTime ?? 0); 
  const [coldBrewType, setColdBrewType] = useState<'Concentrate' | 'Ready to Drink'>(initialData?.coldBrewType || 'Ready to Drink');

  // Pour Over specific
  const [brewerBrand, setBrewerBrand] = useState(initialData?.brewerBrand || db.POUR_OVER_BRANDS[0]);
  const [brewerModel, setBrewerModel] = useState(initialData?.brewer || '');
  const [filterType, setFilterType] = useState(initialData?.filterType || db.FILTER_PAPERS[0]);
  const [pulsesCount, setPulsesCount] = useState(initialData?.pourStructure ? parseInt(initialData.pourStructure) : 3);
  const [pourVolumes, setPourVolumes] = useState(initialData?.pourVolumes || '');

  // AeroPress specific
  const [aeroMethod, setAeroMethod] = useState(initialData?.aeroMethod || db.AEROPRESS_STYLES[0]);
  const [filterCap, setFilterCap] = useState(initialData?.filterCapUsed || db.AEROPRESS_CAPS[0]);
  const [steepTimeAP, setSteepTimeAP] = useState(initialData?.steepTime ?? 120);
  const [plungeTime, setPlungeTime] = useState(initialData?.plungeTime ?? 30);
  const [aeroPourVolumes, setAeroPourVolumes] = useState(initialData?.aeroPourVolumes || '');

  // French Press specific
  const [fpBrand, setFpBrand] = useState(initialData?.brewerBrand || db.FRENCH_PRESS_BRANDS[0]);
  const [fpImmersionTime, setFpImmersionTime] = useState(initialData?.steepTime ?? 240); 
  const [fpPlungeWait, setFpPlungeWait] = useState(initialData?.timeBeforePlunge ?? 30);
  const [fpAgitation, setFpAgitation] = useState(initialData?.agitation || db.AGITATION_METHODS[0]);
  const [fpAgitationDuration, setFpAgitationDuration] = useState(initialData?.agitationDuration ?? 0);

  // Moka Pot specific
  const [mokaBrand, setMokaBrand] = useState(initialData?.brewerBrand || db.MOKA_POT_BRANDS[0]);
  const [mokaModel, setMokaModel] = useState(initialData?.mokaPotModel || '');
  const [waterStartTemp, setWaterStartTemp] = useState(initialData?.waterStartTemp || db.WATER_START_TEMPS[0]);
  const [isAeropressFilterUsed, setIsAeropressFilterUsed] = useState(initialData?.isAeropressFilterUsed || false);
  const [flameControl, setFlameControl] = useState(initialData?.flameControl || db.FLAME_SETTINGS[0]);

  // Sensory Analysis
  const [sensory, setSensory] = useState({
    aroma: initialData?.aroma ?? 3,
    acidity: initialData?.acidity ?? 3,
    sweetness: initialData?.sweetness ?? 3,
    bitterness: initialData?.bitterness ?? 3,
    body: initialData?.body ?? 3,
    aftertaste: initialData?.aftertaste ?? 3
  });
  const [selectedFlavorGroups, setSelectedFlavorGroups] = useState<string[]>(initialData?.flavorGroups || []);

  // List Update Helpers
  const addToList = (key: keyof typeof db, value: string) => {
    setDb(prev => ({ ...prev, [key]: [...(prev[key] as string[]), value] }));
  };

  const addToNestedList = (key: 'POUR_OVER_MODELS' | 'MOKA_POT_MODELS', brand: string, value: string) => {
    setDb(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [brand]: [...(prev[key][brand] || []), value]
      }
    }));
  };

  const handleSensoryChange = (attr: string, value: number) => {
    setSensory(prev => ({ ...prev, [attr]: value }));
  };

  const toggleFlavorGroup = (group: string) => {
    setSelectedFlavorGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      coffeeId: coffee.id,
      baristaName,
      date: new Date().toISOString(),
      method,
      grinder,
      grindSetting: setting,
      dose,
      yield: yieldVal,
      brewTime: method === BrewMethod.COLD_BREW ? steepTimeCB : (method === BrewMethod.FRENCH_PRESS ? fpImmersionTime : time),
      waterTemp: temp,
      rating,
      tastingNotes: notes.split(',').map(n => n.trim()).filter(n => n !== ''),
      processNotes,
      
      ...sensory,
      flavorGroups: selectedFlavorGroups,

      // Espresso
      machine: method === BrewMethod.ESPRESSO ? machineBrand : undefined,
      basketType: method === BrewMethod.ESPRESSO ? basketType : undefined,
      distributionTool: method === BrewMethod.ESPRESSO ? distTool : undefined,
      puckScreen: method === BrewMethod.ESPRESSO ? puckScreen : undefined,
      pressure: method === BrewMethod.ESPRESSO ? pressure : undefined,

      // Cold Brew
      coldBrewSystem: method === BrewMethod.COLD_BREW ? cbSystem : undefined,
      coldBrewType: method === BrewMethod.COLD_BREW ? coldBrewType : undefined,
      steepTime: method === BrewMethod.COLD_BREW ? steepTimeCB : (method === BrewMethod.AEROPRESS ? steepTimeAP : (method === BrewMethod.FRENCH_PRESS ? fpImmersionTime : undefined)),
      bloomTime: (method === BrewMethod.COLD_BREW || method === BrewMethod.POUR_OVER) ? bloomTime : undefined,

      // Pour Over / French Press shared brand property
      brewerBrand: method === BrewMethod.POUR_OVER ? brewerBrand : (method === BrewMethod.FRENCH_PRESS ? fpBrand : (method === BrewMethod.MOKA_POT ? mokaBrand : undefined)),
      brewer: method === BrewMethod.POUR_OVER ? brewerModel : (method === BrewMethod.MOKA_POT ? mokaModel : undefined),
      filterType: method === BrewMethod.POUR_OVER ? filterType : undefined,
      pourStructure: method === BrewMethod.POUR_OVER ? `${pulsesCount} pours` : undefined,
      pourVolumes: method === BrewMethod.POUR_OVER ? pourVolumes : undefined,

      // AeroPress
      aeroMethod: method === BrewMethod.AEROPRESS ? aeroMethod : undefined,
      filterCapUsed: method === BrewMethod.AEROPRESS ? filterCap : undefined,
      plungeTime: method === BrewMethod.AEROPRESS ? plungeTime : undefined,
      aeroPourVolumes: method === BrewMethod.AEROPRESS ? aeroPourVolumes : undefined,

      // French Press specifics
      timeBeforePlunge: method === BrewMethod.FRENCH_PRESS ? fpPlungeWait : undefined,
      agitation: method === BrewMethod.FRENCH_PRESS ? fpAgitation : undefined,
      agitationDuration: method === BrewMethod.FRENCH_PRESS ? fpAgitationDuration : undefined,

      // Moka Pot specifics
      mokaPotModel: method === BrewMethod.MOKA_POT ? mokaModel : undefined,
      waterStartTemp: method === BrewMethod.MOKA_POT ? waterStartTemp : undefined,
      isAeropressFilterUsed: method === BrewMethod.MOKA_POT ? isAeropressFilterUsed : undefined,
      flameControl: method === BrewMethod.MOKA_POT ? flameControl : undefined,
    });
  };

  const ratio = dose > 0 ? `1:${(yieldVal / dose).toFixed(1)}` : '0';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[3rem] shadow-2xl border border-stone-100 max-w-xl mx-auto max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-300 custom-scrollbar">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-3xl font-black display-font text-stone-800">{title || (initialData ? 'Edit Brew' : 'Log Brew')}</h2>
          <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mt-1">{coffee.name}</p>
        </div>
        <button type="button" onClick={onCancel} className="p-3 bg-stone-50 rounded-full text-stone-400 hover:text-stone-800 transition-colors">✕</button>
      </div>

      <div className="flex bg-stone-100 p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
        {Object.values(BrewMethod).map(m => (
          <button 
            key={m} 
            type="button"
            onClick={() => setMethod(m)}
            className={`flex-none py-2 px-3 text-[9px] font-black uppercase tracking-tighter rounded-xl transition-all ${method === m ? 'bg-white text-amber-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
          >
            {m === BrewMethod.POUR_OVER ? 'Filter' : m}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <DynamicSelect
            label="Grinder"
            value={grinder}
            options={db.GRINDERS}
            onSelect={setGrinder}
            onAdd={(val) => { addToList('GRINDERS', val); setGrinder(val); }}
            labelSize="10px"
            labelColor="text-stone-400"
          />
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Grind Setting</label>
            <input type="text" value={setting} onChange={e => setSetting(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-amber-300 transition-colors" placeholder="e.g. 18 clicks" />
          </div>
        </div>

        <div className="p-6 bg-amber-50/20 rounded-[2rem] border border-amber-100/50 space-y-4 animate-in fade-in duration-500">
          <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-800 rounded-full"></span> {method} Toolkit
          </h4>

          {method === BrewMethod.ESPRESSO && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DynamicSelect
                  label="Machine"
                  value={machineBrand}
                  options={db.ESPRESSO_MACHINES}
                  onSelect={setMachineBrand}
                  onAdd={(val) => { addToList('ESPRESSO_MACHINES', val); setMachineBrand(val); }}
                />
                <DynamicSelect
                  label="Basket"
                  value={basketType}
                  options={db.BASKETS}
                  onSelect={setBasketType}
                  onAdd={(val) => { addToList('BASKETS', val); setBasketType(val); }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DynamicSelect
                  label="Distribution"
                  value={distTool}
                  options={db.DISTRIBUTION_TOOLS}
                  onSelect={setDistTool}
                  onAdd={(val) => { addToList('DISTRIBUTION_TOOLS', val); setDistTool(val); }}
                />
                <div className="flex flex-col justify-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={puckScreen} onChange={e => setPuckScreen(e.target.checked)} className="w-4 h-4 text-amber-800 border-stone-300 rounded focus:ring-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 group-hover:text-amber-800 transition-colors">Puck Screen?</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {method === BrewMethod.POUR_OVER && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DynamicSelect
                  label="Brewer"
                  value={brewerBrand}
                  options={db.POUR_OVER_BRANDS}
                  onSelect={setBrewerBrand}
                  onAdd={(val) => { addToList('POUR_OVER_BRANDS', val); setBrewerBrand(val); }}
                />
                <DynamicSelect
                  label="Model"
                  value={brewerModel}
                  options={db.POUR_OVER_MODELS[brewerBrand] || []}
                  onSelect={setBrewerModel}
                  onAdd={(val) => { addToNestedList('POUR_OVER_MODELS', brewerBrand, val); setBrewerModel(val); }}
                />
              </div>
              <DynamicSelect
                label="Filter Paper"
                value={filterType}
                options={db.FILTER_PAPERS}
                onSelect={setFilterType}
                onAdd={(val) => { addToList('FILTER_PAPERS', val); setFilterType(val); }}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Bloom (s)</label>
                  <input type="number" value={bloomTime} onChange={e => setBloomTime(Number(e.target.value))} className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs font-bold" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Pours (Count)</label>
                  <input type="number" value={pulsesCount} onChange={e => setPulsesCount(Number(e.target.value))} className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Volumes (g sequence)</label>
                <input type="text" value={pourVolumes} onChange={e => setPourVolumes(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs font-bold" placeholder="e.g. 50, 70, 70, 60" />
              </div>
            </div>
          )}

          {method === BrewMethod.AEROPRESS && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DynamicSelect
                  label="Brew Style"
                  value={aeroMethod}
                  options={db.AEROPRESS_STYLES}
                  onSelect={setAeroMethod}
                  onAdd={(val) => { addToList('AEROPRESS_STYLES', val); setAeroMethod(val); }}
                />
                <DynamicSelect
                  label="Filter Cap"
                  value={filterCap}
                  options={db.AEROPRESS_CAPS}
                  onSelect={setFilterCap}
                  onAdd={(val) => { addToList('AEROPRESS_CAPS', val); setFilterCap(val); }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Steep Time (s)</label>
                  <input type="number" value={steepTimeAP} onChange={e => setSteepTimeAP(Number(e.target.value))} className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs font-bold" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Plunge Time (s)</label>
                  <input type="number" value={plungeTime} onChange={e => setPlungeTime(Number(e.target.value))} className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Volumes (g sequence)</label>
                <input type="text" value={aeroPourVolumes} onChange={e => setAeroPourVolumes(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs font-bold" placeholder="e.g. 50 (bloom), 200 (fill)" />
              </div>
            </div>
          )}

          {method === BrewMethod.FRENCH_PRESS && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DynamicSelect
                  label="Vessel Brand"
                  value={fpBrand}
                  options={db.FRENCH_PRESS_BRANDS}
                  onSelect={setFpBrand}
                  onAdd={(val) => { addToList('FRENCH_PRESS_BRANDS', val); setFpBrand(val); }}
                />
                <div>
                  <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Immersion (s)</label>
                  <input type="number" value={fpImmersionTime} onChange={e => setFpImmersionTime(Number(e.target.value))} className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Plunge Wait (s)</label>
                  <input type="number" value={fpPlungeWait} onChange={e => setFpPlungeWait(Number(e.target.value))} className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs font-bold" placeholder="Time after break crust" />
                </div>
                <DynamicSelect
                  label="Agitation Type"
                  value={fpAgitation}
                  options={db.AGITATION_METHODS}
                  onSelect={setFpAgitation}
                  onAdd={(val) => { addToList('AGITATION_METHODS', val); setFpAgitation(val); }}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-stone-500 uppercase mb-1">Agitation Duration (s)</label>
                <input type="number" value={fpAgitationDuration} onChange={e => setFpAgitationDuration(Number(e.target.value))} className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs font-bold" />
              </div>
            </div>
          )}

          {method === BrewMethod.MOKA_POT && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DynamicSelect
                  label="Pot Brand"
                  value={mokaBrand}
                  options={db.MOKA_POT_BRANDS}
                  onSelect={setMokaBrand}
                  onAdd={(val) => { addToList('MOKA_POT_BRANDS', val); setMokaBrand(val); }}
                />
                <DynamicSelect
                  label="Model / Size"
                  value={mokaModel}
                  options={db.MOKA_POT_MODELS[mokaBrand] || []}
                  onSelect={setMokaModel}
                  onAdd={(val) => { addToNestedList('MOKA_POT_MODELS', mokaBrand, val); setMokaModel(val); }}
                />
              </div>
              <DynamicSelect
                label="Water Start Temp"
                value={waterStartTemp}
                options={db.WATER_START_TEMPS}
                onSelect={setWaterStartTemp}
                onAdd={(val) => { addToList('WATER_START_TEMPS', val); setWaterStartTemp(val); }}
              />
              <div className="grid grid-cols-2 gap-4">
                <DynamicSelect
                  label="Flame / Heat"
                  value={flameControl}
                  options={db.FLAME_SETTINGS}
                  onSelect={setFlameControl}
                  onAdd={(val) => { addToList('FLAME_SETTINGS', val); setFlameControl(val); }}
                />
                <div className="flex flex-col justify-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={isAeropressFilterUsed} onChange={e => setIsAeropressFilterUsed(e.target.checked)} className="w-4 h-4 text-amber-800 border-stone-300 rounded focus:ring-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 group-hover:text-amber-800 transition-colors">Paper Filter Hack?</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {method === BrewMethod.COLD_BREW && (
            <div className="space-y-4">
              <DynamicSelect
                label="System"
                value={cbSystem}
                options={db.COLD_BREW_SYSTEMS}
                onSelect={setCbSystem}
                onAdd={(val) => { addToList('COLD_BREW_SYSTEMS', val); setCbSystem(val); }}
              />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={coldBrewType === 'Ready to Drink'} onChange={() => setColdBrewType('Ready to Drink')} className="w-4 h-4 text-amber-800" />
                  <span className="text-[10px] font-black uppercase text-stone-500">RTD</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={coldBrewType === 'Concentrate'} onChange={() => setColdBrewType('Concentrate')} className="w-4 h-4 text-amber-800" />
                  <span className="text-[10px] font-black uppercase text-stone-500">Concentrate</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 p-6 bg-stone-50 rounded-[2rem] border border-stone-100">
          <div>
            <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 text-center">Dose (g)</label>
            <input type="number" step="0.1" value={dose} onChange={e => setDose(Number(e.target.value))} className="w-full bg-white border border-stone-200 rounded-xl p-3 text-center text-sm font-black outline-none focus:border-amber-300 transition-colors" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 text-center">Yield (g)</label>
            <input type="number" step="1" value={yieldVal} onChange={e => setYieldVal(Number(e.target.value))} className="w-full bg-white border border-stone-200 rounded-xl p-3 text-center text-sm font-black outline-none focus:border-amber-300 transition-colors" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5 text-center">Ratio</label>
            <div className="w-full bg-amber-100/50 border border-amber-200 rounded-xl p-3 text-center text-sm font-black text-amber-900">{ratio}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Water Temp (°C)</label>
            <input type="number" value={temp} onChange={e => setTemp(Number(e.target.value))} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-amber-300 transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
              {method === BrewMethod.COLD_BREW ? 'Steep (Hrs)' : 'Total Time (s)'}
            </label>
            <input 
              type="number" 
              value={method === BrewMethod.COLD_BREW ? steepTimeCB : (method === BrewMethod.FRENCH_PRESS ? fpImmersionTime : time)} 
              onChange={e => {
                const val = Number(e.target.value);
                if (method === BrewMethod.COLD_BREW) setSteepTimeCB(val);
                else if (method === BrewMethod.FRENCH_PRESS) setFpImmersionTime(val);
                else setTime(val);
              }} 
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-amber-300 transition-colors" 
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Method Notes / Process Steps</label>
          <textarea value={processNotes} onChange={e => setProcessNotes(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm h-32 font-medium outline-none focus:border-amber-300 transition-colors" placeholder="Describe your technique..."></textarea>
        </div>

        {/* Sensory Analysis Section - Light Refined Aesthetic */}
        <div className="p-7 bg-stone-50 rounded-[3rem] border border-stone-100 space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-stone-800 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-800 rounded-full"></span> Sensory Profile
            </h4>
            <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest">Calibration Scale</span>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {SENSORY_ATTRIBUTES.map(attr => (
              <div key={attr.id} className="flex flex-col gap-2.5 group">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2 group-hover:text-stone-800 transition-colors">
                    <span className="text-sm grayscale-[0.5] group-hover:grayscale-0 transition-all">{attr.icon}</span> {attr.label}
                  </span>
                  <span className={`text-[10px] font-black ${attr.color}`}>
                    {sensory[attr.id as keyof typeof sensory]}/5
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button 
                      key={v}
                      type="button"
                      onClick={() => handleSensoryChange(attr.id, v)}
                      className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${sensory[attr.id as keyof typeof sensory] >= v ? attr.barColor : 'bg-stone-200'}`}
                      aria-label={`Set ${attr.label} to ${v}`}
                    ></button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-stone-200">
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 text-center">Primary Flavor Categories</label>
            <div className="flex flex-wrap justify-center gap-2.5">
              {db.FLAVOR_GROUPS.map(group => (
                <button
                  key={group.name}
                  type="button"
                  onClick={() => toggleFlavorGroup(group.name)}
                  className={`px-4 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all duration-300 ${
                    selectedFlavorGroups.includes(group.name) 
                    ? `${group.color} scale-105 shadow-xl shadow-amber-900/5` 
                    : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200 hover:text-stone-600'
                  }`}
                >
                  <span className="text-sm">{group.icon}</span> {group.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Specific Taste Notes (Comma separated)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm h-20 font-medium outline-none focus:border-amber-300 transition-colors" placeholder="Cherry, Caramel, Bright..."></textarea>
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 pt-6">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Overall Recipe Rating</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(star => (
              <button key={star} type="button" onClick={() => setRating(star)} className={`transition-all ${rating >= star ? 'text-amber-500 scale-110' : 'text-stone-200 hover:text-stone-300'}`}>
                <svg className="w-9 h-9 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4 sticky bottom-0 bg-white/95 backdrop-blur-sm py-4 border-t border-stone-100 mt-2 z-10">
        <button type="button" onClick={onCancel} className="flex-1 py-4 bg-stone-100 text-stone-500 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-stone-200 transition-all">Discard</button>
        <button type="submit" className="flex-1 py-4 bg-stone-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-stone-900/20 active:scale-[0.98]">{title || (initialData ? 'Update Brew' : 'Log Brew')}</button>
      </div>
    </form>
  );
};

export default BrewForm;
