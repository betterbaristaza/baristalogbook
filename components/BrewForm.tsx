import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  BrewMethod,
  CoffeeBean,
  BrewLog,
} from '../types';

import { useEntitlements } from '../context/EntitlementContext';

const INITIAL_EQUIPMENT_DB = {
  GRINDERS: [
    'Niche Zero',
    'Fellow Ode Gen 2',
    'Comandante C40',
    'Baratza Encore',
    '1Zpresso J-Max',
    'Timemore C2',
    'Mahlkönig EK43',
    'Lagom P64',
    'Eureka Mignon',
  ],

  ESPRESSO_MACHINES: [
    'La Marzocco Linea Mini',
    'Breville Dual Boiler',
    'Rocket Apartamento',
    'Lelit Bianca',
    'Gaggia Classic Pro',
    'Flair 58',
    'Decent DE1',
    'Rancilio Silvia',
    'Sage Barista Express',
  ],

  POUR_OVER_BRANDS: [
    'Hario',
    'Kalita',
    'Chemex',
    'Fellow',
    'Origami',
    'Orea',
    'Cafec',
    'Hario Switch',
    'Clever',
  ],

  POUR_OVER_MODELS: {
    Hario: [
      'V60-01',
      'V60-02',
      'V60-03',
      'Mugen',
    ],
    Kalita: [
      'Wave 155',
      'Wave 185',
      '102 Dripper',
    ],
    Fellow: [
      'Stagg [X]',
      'Stagg [XF]',
    ],
    Orea: [
      'V3',
      'V3 MK2',
    ],
    Origami: [
      'Dripper S',
      'Dripper M',
    ],
    Cafec: [
      'Flower Dripper',
      'Deep 27',
    ],
    Chemex: [
      'Classic 3-Cup',
      'Classic 6-Cup',
      'Glass Handle 8-Cup',
    ],
    'Hario Switch': [
      'Size 02',
      'Size 03',
    ],
    Clever: [
      'Small',
      'Large',
    ],
  } as Record<string, string[]>,

  FILTER_PAPERS: [
    'Hario V60 Tabbed (Japan)',
    'Hario V60 Untabbed',
    'Cafec Abaca',
    'Cafec T-90 (Medium)',
    'Cafec T-92 (Light)',
    'Sibarist Fast',
    'Kalita White Wave',
    'Kalita Brown Wave',
    'Chemex Bonded',
    'Fellow Stagg [X] Paper',
    'Origami Cup Filter',
    'Melitta #2',
    'Melitta #4',
    'Abaca+ Shallow',
  ],

  AEROPRESS_STYLES: [
    'Standard (Upright)',
    'Inverted',
    'Bypass (Dilution)',
    'Espresso-style',
    'Cold Drip setup',
    'Hoffmann Style',
    'Adler Method',
    'WAC Winner Style',
  ],

  AEROPRESS_CAPS: [
    'Standard Plastic Cap',
    'Fellow Prismo',
    'AeroPress Flow Control Cap',
    'Joepresso',
    'PuckPuck Attachment',
    'Metal Mesh Filter',
    '2uul / 3rd Party',
  ],

  COLD_BREW_SYSTEMS: [
    'Toddy System',
    'Hario Mizudashi',
    'OXO Good Grips',
    'Bruer Cold Drip',
    'KitchenAid Cold Brew',
    'Filtron',
  ],

  FRENCH_PRESS_BRANDS: [
    'Bodum',
    'Espro',
    'Fellow Clara',
    'Hario',
    'Yama',
  ],

  AGITATION_METHODS: [
    'None',
    'Gentle Stir',
    'Aggressive Stir',
    'Swirl',
    'Break Crust',
    'Double Stir',
  ],

  DISTRIBUTION_TOOLS: [
    'None',
    'WDT (Needle Tool)',
    'OCD Spinning Tool',
    'Palm Distributor',
    'WDT + OCD',
  ],

  BASKETS: [
    'Stock',
    'VST 18g',
    'VST 20g',
    'IMS Precision',
    'Pullman 876',
  ],

  MOKA_POT_BRANDS: [
    'Bialetti',
    'Alessi',
    'E&B Lab',
    'Giannini',
    'Cuisinox',
    'Pezzetti',
  ],

  MOKA_POT_MODELS: {
    Bialetti: [
      'Moka Express (3-cup)',
      'Moka Express (6-cup)',
      'Brikka (2-cup)',
      'Venus (4-cup)',
      'Kitty',
      'Musa',
    ],
    Alessi: [
      '9090 (6-cup)',
      'Moka (3-cup)',
      'Pulcina (3-cup)',
    ],
    'E&B Lab': [
      'Moka Pot (Competition Filter)',
    ],
    Giannini: [
      'Giannina (1/3-cup)',
      'Giannina (3/6-cup)',
    ],
    Cuisinox: [
      'Libertà',
      'Roma',
    ],
    Pezzetti: [
      'Italexpress',
      'Bellexpress',
    ],
  } as Record<string, string[]>,

  WATER_START_TEMPS: [
    'Room Temp (20°C)',
    'Warm (60°C)',
    'Hot / Preheated (95°C)',
  ],

  FLAME_SETTINGS: [
    'Low',
    'Medium-Low',
    'Medium',
    'Medium-High',
  ],

  FLAVOR_GROUPS: [
    'Floral',
    'Fruity',
    'Nutty/Sweet',
    'Chocolatey',
    'Earthy',
  ],
};

const SENSORY_ATTRIBUTES = [
  {
    id: 'aroma',
    label: 'Aroma',
  },
  {
    id: 'acidity',
    label: 'Acidity',
  },
  {
    id: 'sweetness',
    label: 'Sweetness',
  },
  {
    id: 'bitterness',
    label: 'Bitterness',
  },
  {
    id: 'body',
    label: 'Body',
  },
  {
    id: 'aftertaste',
    label: 'Aftertaste',
  },
];

interface DynamicSelectProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  onAdd: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const DynamicSelect: React.FC<
  DynamicSelectProps
> = ({
  label,
  value,
  options,
  onSelect,
  onAdd,
  className = '',
  placeholder,
}) => {
  const [isAdding, setIsAdding] =
    useState(false);

  const [newValue, setNewValue] =
    useState('');

  const commitNewValue = () => {
    const cleaned = newValue.trim();

    if (!cleaned) {
      return;
    }

    onAdd(cleaned);
    setNewValue('');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <div className={className}>
        <label className="bp-label text-[var(--bp-muted)]">
          {label}
        </label>

        <div className="mt-2 grid grid-cols-[1fr_auto_auto]">
          <input
            type="text"
            autoFocus
            value={newValue}
            onChange={event =>
              setNewValue(
                event.target.value
              )
            }
            onKeyDown={event => {
              if (
                event.key === 'Enter'
              ) {
                event.preventDefault();
                commitNewValue();
              }
            }}
            className="bp-input rounded-r-none"
            placeholder={
              placeholder ||
              `Add ${label}`
            }
          />

          <button
            type="button"
            onClick={
              commitNewValue
            }
            className="border border-l-0 border-[var(--bp-line-strong)] bg-[var(--bp-orange)] px-4 text-[var(--bp-blue)]"
          >
            <span className="bp-label">
              Add
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewValue('');
            }}
            className="border border-l-0 border-[var(--bp-line-strong)] px-3 text-[var(--bp-muted)]"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="bp-label text-[var(--bp-muted)]">
        {label}
      </label>

      <select
        value={value}
        onChange={event => {
          if (
            event.target.value ===
            'ADD_NEW'
          ) {
            setIsAdding(true);
            return;
          }

          onSelect(
            event.target.value
          );
        }}
        className="bp-input mt-2"
      >
        {options.map(option => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

        <option value="ADD_NEW">
          + Other / Add New
        </option>
      </select>
    </div>
  );
};

interface BrewFormProps {
  coffee: CoffeeBean;
  onSave: (
    log: Partial<BrewLog>
  ) => void | Promise<void>;
  onCancel: () => void;
  initialData?: BrewLog;
  title?: string;
  isBrewAgain?: boolean;
}

const BrewForm: React.FC<
  BrewFormProps
> = ({
  coffee,
  onSave,
  onCancel,
  initialData,
  title,
  isBrewAgain = false,
}) => {
  const {
    isPro,
    loading: entitlementsLoading,
  } = useEntitlements();

  const [method, setMethod] =
    useState<BrewMethod>(
      initialData?.method ||
        BrewMethod.ESPRESSO
    );

  const [
    baristaName,
    setBaristaName,
  ] = useState(
    initialData?.baristaName || ''
  );

  const [site, setSite] = useState(
    initialData?.site || ''
  );

  const [
    waterType,
    setWaterType,
  ] = useState(
    initialData?.waterType || ''
  );

  const [db, setDb] =
    useState(INITIAL_EQUIPMENT_DB);

  const [isSaving, setIsSaving] =
    useState(false);

  const [dose, setDose] =
    useState<number | ''>(
      initialData?.dose ?? 18
    );

  const [
    yieldVal,
    setYieldVal,
  ] = useState<number | ''>(
    initialData?.yield ?? 36
  );

  const [time, setTime] =
    useState<number | ''>(
      initialData?.brewTime ?? 30
    );

  const [temp, setTemp] =
    useState<number | ''>(
      initialData?.waterTemp ?? 93
    );

  const [grinder, setGrinder] =
    useState(
      initialData?.grinder ||
        db.GRINDERS[0]
    );

  const [setting, setSetting] =
    useState(
      initialData?.grindSetting ||
        ''
    );

  const [rating, setRating] =
    useState(
      isBrewAgain
        ? 4
        : initialData?.rating ?? 4
    );

  const [notes, setNotes] =
    useState(
      isBrewAgain
        ? ''
        : initialData?.tastingNotes?.join(
            ', '
          ) || ''
    );

  const [
    processNotes,
    setProcessNotes,
  ] = useState(
    initialData?.processNotes || ''
  );

  const [
    brewImage,
    setBrewImage,
  ] = useState(
    isBrewAgain
      ? undefined
      : initialData?.brewImage
  );

  const [
    brewImageFile,
    setBrewImageFile,
  ] = useState<File>();

  const brewImageInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (
        brewImage?.startsWith(
          'blob:'
        )
      ) {
        URL.revokeObjectURL(
          brewImage
        );
      }
    };
  }, []);

  const [
    machineBrand,
    setMachineBrand,
  ] = useState(
    initialData?.machine ||
      db.ESPRESSO_MACHINES[0]
  );

  const [
    basketType,
    setBasketType,
  ] = useState(
    initialData?.basketType ||
      db.BASKETS[0]
  );

  const [distTool, setDistTool] =
    useState(
      initialData?.distributionTool ||
        db.DISTRIBUTION_TOOLS[0]
    );

  const [
    puckScreen,
    setPuckScreen,
  ] = useState(
    initialData?.puckScreen ||
      false
  );

  const [pressure, setPressure] =
    useState(
      initialData?.pressure ?? 9
    );

  const [cbSystem, setCbSystem] =
    useState(
      initialData?.coldBrewSystem ||
        db.COLD_BREW_SYSTEMS[0]
    );

  const [
    steepTimeCB,
    setSteepTimeCB,
  ] = useState(
    initialData?.steepTime ?? 16
  );

  const [
    bloomTime,
    setBloomTime,
  ] = useState(
    initialData?.bloomTime ?? 0
  );

  const [
    coldBrewType,
    setColdBrewType,
  ] = useState<
    'Concentrate' | 'Ready to Drink'
  >(
    initialData?.coldBrewType ||
      'Ready to Drink'
  );

  const [
    brewerBrand,
    setBrewerBrand,
  ] = useState(
    initialData?.brewerBrand ||
      db.POUR_OVER_BRANDS[0]
  );

  const [
    brewerModel,
    setBrewerModel,
  ] = useState(
    initialData?.brewer || ''
  );

  const [
    filterType,
    setFilterType,
  ] = useState(
    initialData?.filterType ||
      db.FILTER_PAPERS[0]
  );

  const [
    pulsesCount,
    setPulsesCount,
  ] = useState(
    initialData?.pourStructure
      ? parseInt(
          initialData.pourStructure
        )
      : 3
  );

  const [
    pourVolumes,
    setPourVolumes,
  ] = useState(
    initialData?.pourVolumes ||
      ''
  );

  const [
    aeroMethod,
    setAeroMethod,
  ] = useState(
    initialData?.aeroMethod ||
      db.AEROPRESS_STYLES[0]
  );

  const [
    filterCap,
    setFilterCap,
  ] = useState(
    initialData?.filterCapUsed ||
      db.AEROPRESS_CAPS[0]
  );

  const [
    steepTimeAP,
    setSteepTimeAP,
  ] = useState(
    initialData?.steepTime ??
      120
  );

  const [
    plungeTime,
    setPlungeTime,
  ] = useState(
    initialData?.plungeTime ??
      30
  );

  const [
    aeroPourVolumes,
    setAeroPourVolumes,
  ] = useState(
    initialData?.aeroPourVolumes ||
      ''
  );

  const [fpBrand, setFpBrand] =
    useState(
      initialData?.brewerBrand ||
        db.FRENCH_PRESS_BRANDS[0]
    );

  const [
    fpImmersionTime,
    setFpImmersionTime,
  ] = useState(
    initialData?.steepTime ??
      240
  );

  const [
    fpPlungeWait,
    setFpPlungeWait,
  ] = useState(
    initialData?.timeBeforePlunge ??
      30
  );

  const [
    fpAgitation,
    setFpAgitation,
  ] = useState(
    initialData?.agitation ||
      db.AGITATION_METHODS[0]
  );

  const [
    fpAgitationDuration,
    setFpAgitationDuration,
  ] = useState(
    initialData?.agitationDuration ??
      0
  );

  const [
    mokaBrand,
    setMokaBrand,
  ] = useState(
    initialData?.brewerBrand ||
      db.MOKA_POT_BRANDS[0]
  );

  const [
    mokaModel,
    setMokaModel,
  ] = useState(
    initialData?.mokaPotModel ||
      ''
  );

  const [
    waterStartTemp,
    setWaterStartTemp,
  ] = useState(
    initialData?.waterStartTemp ||
      db.WATER_START_TEMPS[0]
  );

  const [
    isAeropressFilterUsed,
    setIsAeropressFilterUsed,
  ] = useState(
    initialData
      ?.isAeropressFilterUsed ||
      false
  );

  const [
    flameControl,
    setFlameControl,
  ] = useState(
    initialData?.flameControl ||
      db.FLAME_SETTINGS[0]
  );

  const [sensory, setSensory] =
    useState({
      aroma: isBrewAgain
        ? 3
        : initialData?.aroma ?? 3,

      acidity: isBrewAgain
        ? 3
        : initialData?.acidity ?? 3,

      sweetness: isBrewAgain
        ? 3
        : initialData?.sweetness ??
          3,

      bitterness: isBrewAgain
        ? 3
        : initialData?.bitterness ??
          3,

      body: isBrewAgain
        ? 3
        : initialData?.body ?? 3,

      aftertaste: isBrewAgain
        ? 3
        : initialData?.aftertaste ??
          3,
    });

  const [
    selectedFlavorGroups,
    setSelectedFlavorGroups,
  ] = useState<string[]>(
    isBrewAgain
      ? []
      : initialData?.flavorGroups ||
          []
  );

  const addToList = (
    key: keyof typeof db,
    value: string
  ) => {
    setDb(previous => ({
      ...previous,
      [key]: [
        ...(previous[
          key
        ] as string[]),
        value,
      ],
    }));
  };

  const addToNestedList = (
    key:
      | 'POUR_OVER_MODELS'
      | 'MOKA_POT_MODELS',
    brand: string,
    value: string
  ) => {
    setDb(previous => ({
      ...previous,
      [key]: {
        ...previous[key],
        [brand]: [
          ...(previous[key][
            brand
          ] || []),
          value,
        ],
      },
    }));
  };

  const handleSensoryChange = (
    attribute: string,
    value: number
  ) => {
    setSensory(previous => ({
      ...previous,
      [attribute]: value,
    }));
  };

  const toggleFlavorGroup = (
    group: string
  ) => {
    setSelectedFlavorGroups(
      previous =>
        previous.includes(group)
          ? previous.filter(
              item =>
                item !== group
            )
          : [...previous, group]
    );
  };

  const handleBrewImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (entitlementsLoading || !isPro) {
      alert(
        'Brew photos are available with Brewprint Pro.'
      );

      event.target.value = '';
      return;
    }

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        'image/'
      )
    ) {
      alert(
        'Please select an image file.'
      );

      event.target.value = '';
      return;
    }

    if (
      file.size >
      15 * 1024 * 1024
    ) {
      alert(
        'Please select an image smaller than 15 MB.'
      );

      event.target.value = '';
      return;
    }

    if (
      brewImage?.startsWith(
        'blob:'
      )
    ) {
      URL.revokeObjectURL(
        brewImage
      );
    }

    setBrewImage(
      URL.createObjectURL(file)
    );

    setBrewImageFile(file);

    event.target.value = '';
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        coffeeId: coffee.id,
        baristaName,
        site,
        waterType,

        brewImage,

        brewImagePath:
          isBrewAgain
            ? undefined
            : initialData
                ?.brewImagePath,

        brewImageFile:
          isPro
            ? brewImageFile
            : undefined,

        date: new Date().toISOString(),

        method,
        grinder,
        grindSetting: setting,

        dose:
          dose === ''
            ? 0
            : dose,

        yield:
          yieldVal === ''
            ? 0
            : yieldVal,

        brewTime:
          method ===
          BrewMethod.COLD_BREW
            ? steepTimeCB
            : method ===
                BrewMethod.FRENCH_PRESS
              ? fpImmersionTime
              : time === ''
                ? 0
                : time,

        waterTemp:
          temp === ''
            ? 0
            : temp,

        rating,

        tastingNotes: notes
          .split(',')
          .map(note =>
            note.trim()
          )
          .filter(
            note => note !== ''
          ),

        processNotes,

        ...sensory,

        flavorGroups:
          selectedFlavorGroups,

        machine:
          method ===
          BrewMethod.ESPRESSO
            ? machineBrand
            : undefined,

        basketType:
          method ===
          BrewMethod.ESPRESSO
            ? basketType
            : undefined,

        distributionTool:
          method ===
          BrewMethod.ESPRESSO
            ? distTool
            : undefined,

        puckScreen:
          method ===
          BrewMethod.ESPRESSO
            ? puckScreen
            : undefined,

        pressure:
          method ===
          BrewMethod.ESPRESSO
            ? pressure
            : undefined,

        coldBrewSystem:
          method ===
          BrewMethod.COLD_BREW
            ? cbSystem
            : undefined,

        coldBrewType:
          method ===
          BrewMethod.COLD_BREW
            ? coldBrewType
            : undefined,

        steepTime:
          method ===
          BrewMethod.COLD_BREW
            ? steepTimeCB
            : method ===
                BrewMethod.AEROPRESS
              ? steepTimeAP
              : method ===
                  BrewMethod.FRENCH_PRESS
                ? fpImmersionTime
                : undefined,

        bloomTime:
          method ===
            BrewMethod.COLD_BREW ||
          method ===
            BrewMethod.POUR_OVER
            ? bloomTime
            : undefined,

        brewerBrand:
          method ===
          BrewMethod.POUR_OVER
            ? brewerBrand
            : method ===
                BrewMethod.FRENCH_PRESS
              ? fpBrand
              : method ===
                  BrewMethod.MOKA_POT
                ? mokaBrand
                : undefined,

        brewer:
          method ===
          BrewMethod.POUR_OVER
            ? brewerModel
            : method ===
                BrewMethod.MOKA_POT
              ? mokaModel
              : undefined,

        filterType:
          method ===
          BrewMethod.POUR_OVER
            ? filterType
            : undefined,

        pourStructure:
          method ===
          BrewMethod.POUR_OVER
            ? `${pulsesCount} pours`
            : undefined,

        pourVolumes:
          method ===
          BrewMethod.POUR_OVER
            ? pourVolumes
            : undefined,

        aeroMethod:
          method ===
          BrewMethod.AEROPRESS
            ? aeroMethod
            : undefined,

        filterCapUsed:
          method ===
          BrewMethod.AEROPRESS
            ? filterCap
            : undefined,

        plungeTime:
          method ===
          BrewMethod.AEROPRESS
            ? plungeTime
            : undefined,

        aeroPourVolumes:
          method ===
          BrewMethod.AEROPRESS
            ? aeroPourVolumes
            : undefined,

        timeBeforePlunge:
          method ===
          BrewMethod.FRENCH_PRESS
            ? fpPlungeWait
            : undefined,

        agitation:
          method ===
          BrewMethod.FRENCH_PRESS
            ? fpAgitation
            : undefined,

        agitationDuration:
          method ===
          BrewMethod.FRENCH_PRESS
            ? fpAgitationDuration
            : undefined,

        mokaPotModel:
          method ===
          BrewMethod.MOKA_POT
            ? mokaModel
            : undefined,

        waterStartTemp:
          method ===
          BrewMethod.MOKA_POT
            ? waterStartTemp
            : undefined,

        isAeropressFilterUsed:
          method ===
          BrewMethod.MOKA_POT
            ? isAeropressFilterUsed
            : undefined,

        flameControl:
          method ===
          BrewMethod.MOKA_POT
            ? flameControl
            : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const ratio =
    dose !== '' &&
    yieldVal !== '' &&
    dose > 0
      ? `1:${(
          yieldVal / dose
        ).toFixed(1)}`
      : '—';

  return (
    <form
      onSubmit={handleSubmit}
      className="h-[100dvh] w-full overflow-y-auto bg-[var(--bp-paper)] px-4 pb-28 sm:h-auto sm:max-h-[92vh] sm:max-w-2xl sm:border sm:border-[var(--bp-line)] sm:px-6 sm:pb-24 custom-scrollbar [&_input]:text-base [&_select]:text-base [&_textarea]:text-base sm:[&_input]:text-sm sm:[&_select]:text-sm sm:[&_textarea]:text-sm"
      style={{
        paddingTop:
          'calc(env(safe-area-inset-top) + 1rem)',
      }}
    >
      <header className="sticky top-0 z-20 -mx-4 mb-8 border-b border-[var(--bp-line)] bg-[var(--bp-paper)] px-4 pb-4 sm:-mx-6 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="bp-index">
              05 / BREW RECORD
            </p>

            <h2 className="bp-heading mt-1 text-2xl text-[var(--bp-blue)]">
              {title ||
                (
                  initialData
                    ? 'Edit Brew'
                    : 'Log Brew'
                )}
            </h2>

            <p className="bp-label mt-3 text-[var(--bp-orange)]">
              {coffee.roaster}
            </p>

            <p className="bp-coffee-name mt-1 truncate text-2xl text-[var(--bp-blue)]">
              {coffee.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="bp-button h-10 min-h-0 px-3"
          >
            Close
          </button>
        </div>
      </header>

      <div className="space-y-10">
        <section>
          <div className="mb-4">
            <p className="bp-index">
              05.01 / METHOD
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Brew Method
            </h3>
          </div>

          <div className="grid grid-cols-2 border border-[var(--bp-line)] sm:grid-cols-3">
            {Object.values(
              BrewMethod
            ).map(currentMethod => (
              <button
                key={currentMethod}
                type="button"
                onClick={() =>
                  setMethod(
                    currentMethod
                  )
                }
                className={`relative min-h-14 border border-[var(--bp-line)] px-2 py-3 text-center ${
                  method === currentMethod
                    ? 'bg-[var(--bp-paper-light)] text-[var(--bp-blue)]'
                    : 'text-[var(--bp-muted)]'
                }`}
              >
                {method ===
                  currentMethod && (
                  <span className="absolute inset-x-0 top-0 h-[2px] bg-[var(--bp-orange)]" />
                )}

                <span className="bp-label">
                  {currentMethod ===
                  BrewMethod.POUR_OVER
                    ? 'Filter'
                    : currentMethod}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="bp-index">
              05.02 / CONTEXT
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Brew Context
            </h3>
          </div>

          <div className="grid grid-cols-1 border border-[var(--bp-line)] sm:grid-cols-2">
            <div className="border-b border-[var(--bp-line)] p-4 sm:border-r">
              <label className="bp-label text-[var(--bp-muted)]">
                Barista
              </label>

              <input
                type="text"
                value={baristaName}
                onChange={event =>
                  setBaristaName(
                    event.target.value
                  )
                }
                className="bp-input mt-2"
                placeholder="Name"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Site
              </label>

              <input
                type="text"
                value={site}
                onChange={event =>
                  setSite(
                    event.target.value
                  )
                }
                className="bp-input mt-2"
                placeholder="Home, café or location"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4 sm:border-b-0 sm:border-r">
              <DynamicSelect
                label="Grinder"
                value={grinder}
                options={db.GRINDERS}
                onSelect={setGrinder}
                onAdd={value => {
                  addToList(
                    'GRINDERS',
                    value
                  );

                  setGrinder(value);
                }}
              />
            </div>

            <div className="p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Grind Setting
              </label>

              <input
                type="text"
                value={setting}
                onChange={event =>
                  setSetting(
                    event.target.value
                  )
                }
                className="bp-input mt-2"
                placeholder="18 clicks, 4.5..."
              />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="bp-index">
              05.03 / EQUIPMENT
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              {method} Setup
            </h3>
          </div>

          <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-4">
            {method ===
              BrewMethod.ESPRESSO && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DynamicSelect
                    label="Machine"
                    value={
                      machineBrand
                    }
                    options={
                      db.ESPRESSO_MACHINES
                    }
                    onSelect={
                      setMachineBrand
                    }
                    onAdd={value => {
                      addToList(
                        'ESPRESSO_MACHINES',
                        value
                      );

                      setMachineBrand(
                        value
                      );
                    }}
                  />

                  <DynamicSelect
                    label="Basket"
                    value={
                      basketType
                    }
                    options={
                      db.BASKETS
                    }
                    onSelect={
                      setBasketType
                    }
                    onAdd={value => {
                      addToList(
                        'BASKETS',
                        value
                      );

                      setBasketType(
                        value
                      );
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DynamicSelect
                    label="Distribution"
                    value={distTool}
                    options={
                      db.DISTRIBUTION_TOOLS
                    }
                    onSelect={
                      setDistTool
                    }
                    onAdd={value => {
                      addToList(
                        'DISTRIBUTION_TOOLS',
                        value
                      );

                      setDistTool(
                        value
                      );
                    }}
                  />

                  <div>
                    <label className="bp-label text-[var(--bp-muted)]">
                      Pressure
                    </label>

                    <input
                      type="number"
                      step="0.1"
                      value={pressure}
                      onChange={event =>
                        setPressure(
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      }
                      className="bp-input mt-2"
                    />
                  </div>
                </div>

                <label className="flex min-h-12 cursor-pointer items-center justify-between border border-[var(--bp-line)] px-4">
                  <span className="bp-label text-[var(--bp-blue)]">
                    Puck Screen
                  </span>

                  <input
                    type="checkbox"
                    checked={
                      puckScreen
                    }
                    onChange={event =>
                      setPuckScreen(
                        event.target
                          .checked
                      )
                    }
                    className="h-4 w-4"
                  />
                </label>
              </div>
            )}

            {method ===
              BrewMethod.POUR_OVER && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DynamicSelect
                    label="Brewer"
                    value={
                      brewerBrand
                    }
                    options={
                      db.POUR_OVER_BRANDS
                    }
                    onSelect={
                      setBrewerBrand
                    }
                    onAdd={value => {
                      addToList(
                        'POUR_OVER_BRANDS',
                        value
                      );

                      setBrewerBrand(
                        value
                      );
                    }}
                  />

                  <DynamicSelect
                    label="Model"
                    value={
                      brewerModel
                    }
                    options={
                      db
                        .POUR_OVER_MODELS[
                        brewerBrand
                      ] || []
                    }
                    onSelect={
                      setBrewerModel
                    }
                    onAdd={value => {
                      addToNestedList(
                        'POUR_OVER_MODELS',
                        brewerBrand,
                        value
                      );

                      setBrewerModel(
                        value
                      );
                    }}
                  />
                </div>

                <DynamicSelect
                  label="Filter Paper"
                  value={filterType}
                  options={
                    db.FILTER_PAPERS
                  }
                  onSelect={
                    setFilterType
                  }
                  onAdd={value => {
                    addToList(
                      'FILTER_PAPERS',
                      value
                    );

                    setFilterType(
                      value
                    );
                  }}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="bp-label text-[var(--bp-muted)]">
                      Bloom (s)
                    </label>

                    <input
                      type="number"
                      value={bloomTime}
                      onChange={event =>
                        setBloomTime(
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      }
                      className="bp-input mt-2"
                    />
                  </div>

                  <div>
                    <label className="bp-label text-[var(--bp-muted)]">
                      Pour Count
                    </label>

                    <input
                      type="number"
                      value={
                        pulsesCount
                      }
                      onChange={event =>
                        setPulsesCount(
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      }
                      className="bp-input mt-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="bp-label text-[var(--bp-muted)]">
                    Pour Volumes
                  </label>

                  <input
                    type="text"
                    value={
                      pourVolumes
                    }
                    onChange={event =>
                      setPourVolumes(
                        event.target
                          .value
                      )
                    }
                    className="bp-input mt-2"
                    placeholder="50, 70, 70, 60"
                  />
                </div>
              </div>
            )}

            {method ===
              BrewMethod.AEROPRESS && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DynamicSelect
                    label="Brew Style"
                    value={
                      aeroMethod
                    }
                    options={
                      db.AEROPRESS_STYLES
                    }
                    onSelect={
                      setAeroMethod
                    }
                    onAdd={value => {
                      addToList(
                        'AEROPRESS_STYLES',
                        value
                      );

                      setAeroMethod(
                        value
                      );
                    }}
                  />

                  <DynamicSelect
                    label="Filter Cap"
                    value={
                      filterCap
                    }
                    options={
                      db.AEROPRESS_CAPS
                    }
                    onSelect={
                      setFilterCap
                    }
                    onAdd={value => {
                      addToList(
                        'AEROPRESS_CAPS',
                        value
                      );

                      setFilterCap(
                        value
                      );
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="bp-label text-[var(--bp-muted)]">
                      Steep Time (s)
                    </label>

                    <input
                      type="number"
                      value={
                        steepTimeAP
                      }
                      onChange={event =>
                        setSteepTimeAP(
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      }
                      className="bp-input mt-2"
                    />
                  </div>

                  <div>
                    <label className="bp-label text-[var(--bp-muted)]">
                      Plunge Time (s)
                    </label>

                    <input
                      type="number"
                      value={
                        plungeTime
                      }
                      onChange={event =>
                        setPlungeTime(
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      }
                      className="bp-input mt-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="bp-label text-[var(--bp-muted)]">
                    Pour Volumes
                  </label>

                  <input
                    type="text"
                    value={
                      aeroPourVolumes
                    }
                    onChange={event =>
                      setAeroPourVolumes(
                        event.target
                          .value
                      )
                    }
                    className="bp-input mt-2"
                    placeholder="50 bloom, 200 fill"
                  />
                </div>
              </div>
            )}

            {method ===
              BrewMethod.FRENCH_PRESS && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DynamicSelect
                    label="Vessel Brand"
                    value={fpBrand}
                    options={
                      db.FRENCH_PRESS_BRANDS
                    }
                    onSelect={
                      setFpBrand
                    }
                    onAdd={value => {
                      addToList(
                        'FRENCH_PRESS_BRANDS',
                        value
                      );

                      setFpBrand(
                        value
                      );
                    }}
                  />

                  <div>
                    <label className="bp-label text-[var(--bp-muted)]">
                      Immersion (s)
                    </label>

                    <input
                      type="number"
                      value={
                        fpImmersionTime
                      }
                      onChange={event =>
                        setFpImmersionTime(
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      }
                      className="bp-input mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="bp-label text-[var(--bp-muted)]">
                      Plunge Wait (s)
                    </label>

                    <input
                      type="number"
                      value={
                        fpPlungeWait
                      }
                      onChange={event =>
                        setFpPlungeWait(
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      }
                      className="bp-input mt-2"
                    />
                  </div>

                  <DynamicSelect
                    label="Agitation"
                    value={
                      fpAgitation
                    }
                    options={
                      db.AGITATION_METHODS
                    }
                    onSelect={
                      setFpAgitation
                    }
                    onAdd={value => {
                      addToList(
                        'AGITATION_METHODS',
                        value
                      );

                      setFpAgitation(
                        value
                      );
                    }}
                  />
                </div>

                <div>
                  <label className="bp-label text-[var(--bp-muted)]">
                    Agitation Duration (s)
                  </label>

                  <input
                    type="number"
                    value={
                      fpAgitationDuration
                    }
                    onChange={event =>
                      setFpAgitationDuration(
                        Number(
                          event.target
                            .value
                        )
                      )
                    }
                    className="bp-input mt-2"
                  />
                </div>
              </div>
            )}

            {method ===
              BrewMethod.MOKA_POT && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DynamicSelect
                    label="Pot Brand"
                    value={
                      mokaBrand
                    }
                    options={
                      db.MOKA_POT_BRANDS
                    }
                    onSelect={
                      setMokaBrand
                    }
                    onAdd={value => {
                      addToList(
                        'MOKA_POT_BRANDS',
                        value
                      );

                      setMokaBrand(
                        value
                      );
                    }}
                  />

                  <DynamicSelect
                    label="Model / Size"
                    value={
                      mokaModel
                    }
                    options={
                      db
                        .MOKA_POT_MODELS[
                        mokaBrand
                      ] || []
                    }
                    onSelect={
                      setMokaModel
                    }
                    onAdd={value => {
                      addToNestedList(
                        'MOKA_POT_MODELS',
                        mokaBrand,
                        value
                      );

                      setMokaModel(
                        value
                      );
                    }}
                  />
                </div>

                <DynamicSelect
                  label="Water Start Temp"
                  value={
                    waterStartTemp
                  }
                  options={
                    db.WATER_START_TEMPS
                  }
                  onSelect={
                    setWaterStartTemp
                  }
                  onAdd={value => {
                    addToList(
                      'WATER_START_TEMPS',
                      value
                    );

                    setWaterStartTemp(
                      value
                    );
                  }}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DynamicSelect
                    label="Flame / Heat"
                    value={
                      flameControl
                    }
                    options={
                      db.FLAME_SETTINGS
                    }
                    onSelect={
                      setFlameControl
                    }
                    onAdd={value => {
                      addToList(
                        'FLAME_SETTINGS',
                        value
                      );

                      setFlameControl(
                        value
                      );
                    }}
                  />

                  <label className="flex min-h-12 cursor-pointer items-center justify-between border border-[var(--bp-line)] px-4">
                    <span className="bp-label text-[var(--bp-blue)]">
                      AeroPress Filter
                    </span>

                    <input
                      type="checkbox"
                      checked={
                        isAeropressFilterUsed
                      }
                      onChange={event =>
                        setIsAeropressFilterUsed(
                          event.target
                            .checked
                        )
                      }
                      className="h-4 w-4"
                    />
                  </label>
                </div>
              </div>
            )}

            {method ===
              BrewMethod.COLD_BREW && (
              <div className="space-y-5">
                <DynamicSelect
                  label="System"
                  value={cbSystem}
                  options={
                    db.COLD_BREW_SYSTEMS
                  }
                  onSelect={
                    setCbSystem
                  }
                  onAdd={value => {
                    addToList(
                      'COLD_BREW_SYSTEMS',
                      value
                    );

                    setCbSystem(
                      value
                    );
                  }}
                />

                <div className="grid grid-cols-2 border border-[var(--bp-line)]">
                  <button
                    type="button"
                    onClick={() =>
                      setColdBrewType(
                        'Ready to Drink'
                      )
                    }
                    className={`relative min-h-14 border-r border-[var(--bp-line)] ${
                      coldBrewType ===
                      'Ready to Drink'
                        ? 'bg-[var(--bp-paper)]'
                        : ''
                    }`}
                  >
                    {coldBrewType ===
                      'Ready to Drink' && (
                      <span className="absolute inset-x-0 top-0 h-[2px] bg-[var(--bp-orange)]" />
                    )}

                    <span className="bp-label">
                      Ready to Drink
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setColdBrewType(
                        'Concentrate'
                      )
                    }
                    className={`relative min-h-14 ${
                      coldBrewType ===
                      'Concentrate'
                        ? 'bg-[var(--bp-paper)]'
                        : ''
                    }`}
                  >
                    {coldBrewType ===
                      'Concentrate' && (
                      <span className="absolute inset-x-0 top-0 h-[2px] bg-[var(--bp-orange)]" />
                    )}

                    <span className="bp-label">
                      Concentrate
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="bp-index">
              05.04 / BREW PARAMETERS
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Recipe
            </h3>
          </div>

          <div className="grid grid-cols-2 border border-[var(--bp-line)] sm:grid-cols-4">
            <div className="border-b border-r border-[var(--bp-line)] p-4 sm:border-b-0">
              <label className="bp-label text-[var(--bp-muted)]">
                Dose
              </label>

              <input
                type="number"
                step="0.1"
                value={dose}
                onChange={event =>
                  setDose(
                    event.target
                      .value === ''
                      ? ''
                      : Number(
                          event.target
                            .value
                        )
                  )
                }
                className="bp-input mt-2"
              />
            </div>

            <div className="border-b border-[var(--bp-line)] p-4 sm:border-b-0 sm:border-r">
              <label className="bp-label text-[var(--bp-muted)]">
                Yield
              </label>

              <input
                type="number"
                step="0.1"
                value={yieldVal}
                onChange={event =>
                  setYieldVal(
                    event.target
                      .value === ''
                      ? ''
                      : Number(
                          event.target
                            .value
                        )
                  )
                }
                className="bp-input mt-2"
              />
            </div>

            <div className="border-r border-[var(--bp-line)] p-4">
              <p className="bp-label text-[var(--bp-muted)]">
                Ratio
              </p>

              <p className="bp-measurement mt-4 text-xl font-semibold text-[var(--bp-blue)]">
                {ratio}
              </p>
            </div>

            <div className="p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                {method ===
                BrewMethod.COLD_BREW
                  ? 'Steep Hrs'
                  : 'Time Sec'}
              </label>

              <input
                type="number"
                value={
                  method ===
                  BrewMethod.COLD_BREW
                    ? steepTimeCB
                    : method ===
                        BrewMethod.FRENCH_PRESS
                      ? fpImmersionTime
                      : time
                }
                onChange={event => {
                  const value =
                    event.target.value;

                  if (
                    method ===
                    BrewMethod.COLD_BREW
                  ) {
                    setSteepTimeCB(
                      value === ''
                        ? 0
                        : Number(
                            value
                          )
                    );

                    return;
                  }

                  if (
                    method ===
                    BrewMethod.FRENCH_PRESS
                  ) {
                    setFpImmersionTime(
                      value === ''
                        ? 0
                        : Number(
                            value
                          )
                    );

                    return;
                  }

                  setTime(
                    value === ''
                      ? ''
                      : Number(value)
                  );
                }}
                className="bp-input mt-2"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 border border-[var(--bp-line)] sm:grid-cols-2">
            <div className="border-b border-[var(--bp-line)] p-4 sm:border-b-0 sm:border-r">
              <label className="bp-label text-[var(--bp-muted)]">
                Water Temperature
              </label>

              <input
                type="number"
                value={temp}
                onChange={event =>
                  setTemp(
                    event.target
                      .value === ''
                      ? ''
                      : Number(
                          event.target
                            .value
                        )
                  )
                }
                className="bp-input mt-2"
              />
            </div>

            <div className="p-4">
              <label className="bp-label text-[var(--bp-muted)]">
                Water Type
              </label>

              <input
                type="text"
                value={waterType}
                onChange={event =>
                  setWaterType(
                    event.target.value
                  )
                }
                className="bp-input mt-2"
                placeholder="Filtered, TWW, custom recipe..."
              />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="bp-index">
              05.05 / PROCESS
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Method Notes
            </h3>
          </div>

          <textarea
            value={processNotes}
            onChange={event =>
              setProcessNotes(
                event.target.value
              )
            }
            className="bp-input min-h-36 resize-y"
            placeholder="Describe the brew technique, pours, agitation, flow changes or other useful steps."
          />
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="bp-index">
                05.06 / REFERENCE IMAGE
              </p>

              <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
                Brew Photo
              </h3>
            </div>

            <span
              className={`bp-label ${
                isPro
                  ? 'text-[var(--bp-muted)]'
                  : 'text-[var(--bp-orange)]'
              }`}
            >
              {isPro
                ? 'Optional'
                : 'Pro'}
            </span>
          </div>

          {entitlementsLoading ? (
            <div className="flex min-h-36 items-center justify-center border border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-6 text-center">
              <div>
                <p className="bp-label text-[var(--bp-muted)]">
                  Checking Pro access...
                </p>
              </div>
            </div>
          ) : isPro ? (
            <>
              <button
                type="button"
                onClick={() =>
                  brewImageInputRef.current?.click()
                }
                className="group relative flex min-h-36 w-full items-center justify-center overflow-hidden border border-[var(--bp-line)] bg-[var(--bp-paper-light)]"
              >
                {brewImage ? (
                  <>
                    <img
                      src={brewImage}
                      alt="Brew preview"
                      className="h-56 w-full object-cover"
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-[rgba(12,39,72,0.55)] opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="bp-label text-white">
                        Change image
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <p className="bp-label text-[var(--bp-blue)]">
                      Add Brew Photo
                    </p>

                    <p className="bp-code mt-2 text-[var(--bp-muted)]">
                      Take a photo or choose one from your device
                    </p>
                  </div>
                )}
              </button>

              <input
                ref={brewImageInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={
                  handleBrewImageUpload
                }
              />
            </>
          ) : (
            <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
              <div className="p-6 text-center">
                <p className="bp-label text-[var(--bp-orange)]">
                  Brewprint Pro
                </p>

                <p className="bp-heading mt-2 text-lg text-[var(--bp-blue)]">
                  Brew Photos
                </p>

                <p className="bp-code mx-auto mt-2 max-w-sm text-[var(--bp-muted)]">
                  Add a photo to each brew record with Brewprint Pro.
                </p>
              </div>

              {initialData?.brewImage && !isBrewAgain && (
                <div className="border-t border-[var(--bp-line)] px-5 py-4">
                  <p className="bp-code text-center text-[var(--bp-muted)]">
                    Your existing brew photo remains safely stored.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <p className="bp-index">
              05.07 / SENSORY
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Sensory Profile
            </h3>

            <p className="bp-code mt-1 text-[var(--bp-muted)]">
              Calibration scale / 1 to 5
            </p>
          </div>

          <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
            {SENSORY_ATTRIBUTES.map(
              (attribute, index) => {
                const value =
                  sensory[
                    attribute.id as keyof typeof sensory
                  ];

                return (
                  <div
                    key={
                      attribute.id
                    }
                    className={`p-4 ${
                      index <
                      SENSORY_ATTRIBUTES.length -
                        1
                        ? 'border-b border-[var(--bp-line)]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="bp-label text-[var(--bp-blue)]">
                        {
                          attribute.label
                        }
                      </span>

                      <span className="bp-measurement font-semibold text-[var(--bp-blue)]">
                        {value}/5
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-5 border border-[var(--bp-line)]">
                      {[
                        1,
                        2,
                        3,
                        4,
                        5,
                      ].map(
                        score => (
                          <button
                            key={
                              score
                            }
                            type="button"
                            onClick={() =>
                              handleSensoryChange(
                                attribute.id,
                                score
                              )
                            }
                            className={`relative h-9 ${
                              score <
                              5
                                ? 'border-r border-[var(--bp-line)]'
                                : ''
                            }`}
                            aria-label={`Set ${attribute.label} to ${score}`}
                          >
                            {value >=
                              score && (
                              <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[var(--bp-orange)]" />
                            )}

                            <span className="bp-code">
                              {score}
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="bp-index">
              05.08 / FLAVOUR
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Flavour Groups
            </h3>
          </div>

          <div className="grid grid-cols-2 border border-[var(--bp-line)] sm:grid-cols-3">
            {db.FLAVOR_GROUPS.map(
              group => (
                <button
                  key={group}
                  type="button"
                  onClick={() =>
                    toggleFlavorGroup(
                      group
                    )
                  }
                  className={`relative min-h-14 border border-[var(--bp-line)] px-3 ${
                    selectedFlavorGroups.includes(
                      group
                    )
                      ? 'bg-[var(--bp-paper-light)] text-[var(--bp-blue)]'
                      : 'text-[var(--bp-muted)]'
                  }`}
                >
                  {selectedFlavorGroups.includes(
                    group
                  ) && (
                    <span className="absolute inset-x-0 top-0 h-[2px] bg-[var(--bp-orange)]" />
                  )}

                  <span className="bp-label">
                    {group}
                  </span>
                </button>
              )
            )}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="bp-index">
              05.09 / TASTING NOTES
            </p>
          </div>

          <textarea
            value={notes}
            onChange={event =>
              setNotes(
                event.target.value
              )
            }
            className="bp-input min-h-28 resize-y"
            placeholder="Cherry, caramel, citrus..."
          />

          <p className="bp-code mt-2 text-[var(--bp-muted)]">
            Separate specific tasting notes with commas.
          </p>
        </section>

        <section>
          <div className="mb-4">
            <p className="bp-index">
              05.10 / OVERALL RATING
            </p>

            <h3 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
              Recipe Rating
            </h3>
          </div>

          <div className="grid grid-cols-5 border border-[var(--bp-line)]">
            {[1, 2, 3, 4, 5].map(
              score => (
                <button
                  key={score}
                  type="button"
                  onClick={() =>
                    setRating(score)
                  }
                  className={`relative min-h-16 ${
                    score < 5
                      ? 'border-r border-[var(--bp-line)]'
                      : ''
                  }`}
                >
                  {rating >=
                    score && (
                    <span className="absolute inset-x-0 top-0 h-[3px] bg-[var(--bp-orange)]" />
                  )}

                  <span className="bp-measurement text-xl font-semibold text-[var(--bp-blue)]">
                    {score}
                  </span>
                </button>
              )
            )}
          </div>
        </section>
      </div>

      <div
  className="-mx-4 mt-10 grid grid-cols-2 border-t border-[var(--bp-line-strong)] bg-[var(--bp-paper)] sm:-mx-6"
  style={{
    paddingBottom:
      'env(safe-area-inset-bottom)',
  }}
>
        <button
          type="button"
          onClick={onCancel}
          className="bp-label min-h-14 border-r border-[var(--bp-line)] px-4 text-[var(--bp-blue)]"
        >
          Discard
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="min-h-14 bg-[var(--bp-orange)] px-4 text-[var(--bp-blue)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="bp-label">
            {isSaving
              ? 'Saving...'
              : initialData &&
                  !isBrewAgain
                ? 'Update Brew'
                : 'Log Brew'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default BrewForm;