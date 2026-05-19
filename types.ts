
export enum BrewMethod {
  ESPRESSO = 'Espresso',
  POUR_OVER = 'Filter/Pour Over',
  AEROPRESS = 'AeroPress',
  FRENCH_PRESS = 'French Press',
  COLD_BREW = 'Cold Brew',
  MOKA_POT = 'Moka Pot'
}

export enum RoastLevel {
  LIGHT = 'Light',
  MEDIUM_LIGHT = 'Medium-Light',
  MEDIUM = 'Medium',
  MEDIUM_DARK = 'Medium-Dark',
  DARK = 'Dark'
}

export interface UserProfile {
  name: string;
  role: string;
  defaultMethod: string;
  defaultGrinder: string;
  defaultBrewer: string;
}

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  coffeeName: string;
  roasterName: string;
  method: BrewMethod;
  recipe: string;
  likes: number;
  isLiked: boolean;
  timestamp: string;
  image?: string;
}

export interface CoffeeBean {
  id: string;
  name: string;
  roaster: string;
  roasterLocation?: string;
  roasterURL?: string;
  origin: string;
  region?: string;
  farm?: string;
  producer?: string;
  process: string;
  varietal?: string;
  altitude?: string;
  terroir?: string;
  harvestSeason?: string;
  roastLevel: RoastLevel;
  roastDate?: string;
  purchaseDate: string;
  remainingWeight: number;
  totalWeight: number;
  price?: number;
  bagTastingNotes?: string[];
  personalNotes: string;
  bagImage?: string;
  labelImage?: string;
}

export interface BrewLog {
  id: string;
  coffeeId: string;
  baristaName?: string;
  site?: string;
  date: string;
  method: BrewMethod;
  grinder: string;
  grindSetting: string;
  dose: number; 
  yield: number;
  brewTime: number; 
  rating: number; 
  tastingNotes: string[];
  
  // Method Specifics
  pressure?: number;
  shotResult?: 'Pass' | 'Fail';
  machine?: string;
  machineBrand?: string;
  basketType?: string;
  distributionTool?: string;
  puckScreen?: boolean;
  
  aeroPressModel?: string;
  aeroMethod?: string; 
  filterCapUsed?: string;
  plungeTime?: number;
  aeroPourVolumes?: string;
  
  bloomTime?: number;
  steepTime?: number; 
  agitation?: string; 
  agitationDuration?: number; 
  timeBeforePlunge?: number; 
  
  brewer?: string; 
  brewerBrand?: string;
  filterType?: string;
  
  // Moka Pot Specifics
  mokaPotModel?: string;
  waterStartTemp?: string;
  isAeropressFilterUsed?: boolean;
  flameControl?: string;
  
  ratio?: string;
  pourStructure?: string; 
  pourVolumes?: string;   
  waterTemp?: number;
  waterType?: string;
  processNotes?: string;  
  coldBrewType?: 'Concentrate' | 'Ready to Drink';
  coldBrewSystem?: string;

  // Sensory Analysis (1-5 scale)
  aroma: number;
  acidity: number;
  sweetness: number;
  bitterness: number;
  body: number;
  aftertaste: number;

  // Flavor Categories
  flavorGroups: string[];
}

export interface WeeklySummary {
  id: string;
  name: string;
  weekStartDate: string;
  weekEndDate: string;
  primaryGrinder: string;
  primaryBrewer: string;
  totalBrews: number;
  avgDose: number;
  avgRatio: string;
  avgBrewTime: number;
  avgTasteScore: number;
  coffeesUsedCount: number;
  bestBrews: string;
  problemsObserved: string;
}
