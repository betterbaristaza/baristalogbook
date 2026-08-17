import { supabase } from './supabaseClient';
import { BrewLog, BrewMethod } from '../types';
import { imageService } from './imageService';

interface BrewLogRow {
  id: string;
  user_id: string;
  coffee_id: string | null;
  brew_image: string | null;

  barista_name: string | null;
  site: string | null;

  brewed_at: string;
  method: string;

  grinder: string | null;
  grind_setting: string | null;

  dose: number | null;
  yield: number | null;
  brew_time: number | null;

  rating: number | null;
  tasting_notes: string[] | null;

  pressure: number | null;
  shot_result: string | null;
  machine: string | null;
  machine_brand: string | null;
  basket_type: string | null;
  distribution_tool: string | null;
  puck_screen: boolean | null;

  aeropress_model: string | null;
  aero_method: string | null;
  filter_cap_used: string | null;
  plunge_time: number | null;
  aero_pour_volumes: string | null;

  bloom_time: number | null;
  steep_time: number | null;
  agitation: string | null;
  agitation_duration: number | null;
  time_before_plunge: number | null;

  brewer: string | null;
  brewer_brand: string | null;
  filter_type: string | null;

  moka_pot_model: string | null;
  water_start_temp: string | null;
  aeropress_filter_used: boolean | null;
  flame_control: string | null;

  ratio: string | null;
  pour_structure: string | null;
  pour_volumes: string | null;

  water_temp: number | null;
  water_type: string | null;

  process_notes: string | null;

  cold_brew_type: string | null;
  cold_brew_system: string | null;

  aroma: number | null;
  acidity: number | null;
  sweetness: number | null;
  bitterness: number | null;
  body: number | null;
  aftertaste: number | null;

  flavor_groups: string[] | null;
}

const rowToBrewLog = async (
  row: BrewLogRow
): Promise<BrewLog> => {
  const brewImage = await imageService.createSignedUrl(
    row.brew_image
  );

  return {
  id: row.id,
  coffeeId: row.coffee_id ?? '',
  brewImage,
  brewImagePath: row.brew_image ?? undefined,
  baristaName: row.barista_name ?? undefined,
  site: row.site ?? undefined,

  date: row.brewed_at,
  method: row.method as BrewMethod,

  grinder: row.grinder ?? '',
  grindSetting: row.grind_setting ?? '',

  dose: Number(row.dose ?? 0),
  yield: Number(row.yield ?? 0),
  brewTime: Number(row.brew_time ?? 0),

  rating: Number(row.rating ?? 0),
  tastingNotes: row.tasting_notes ?? [],

  pressure: row.pressure !== null ? Number(row.pressure) : undefined,
  shotResult: row.shot_result as 'Pass' | 'Fail' | undefined,
  machine: row.machine ?? undefined,
  machineBrand: row.machine_brand ?? undefined,
  basketType: row.basket_type ?? undefined,
  distributionTool: row.distribution_tool ?? undefined,
  puckScreen: row.puck_screen ?? undefined,

  aeroPressModel: row.aeropress_model ?? undefined,
  aeroMethod: row.aero_method ?? undefined,
  filterCapUsed: row.filter_cap_used ?? undefined,
  plungeTime: row.plunge_time !== null ? Number(row.plunge_time) : undefined,
  aeroPourVolumes: row.aero_pour_volumes ?? undefined,

  bloomTime: row.bloom_time !== null ? Number(row.bloom_time) : undefined,
  steepTime: row.steep_time !== null ? Number(row.steep_time) : undefined,
  agitation: row.agitation ?? undefined,
  agitationDuration:
    row.agitation_duration !== null
      ? Number(row.agitation_duration)
      : undefined,
  timeBeforePlunge:
    row.time_before_plunge !== null
      ? Number(row.time_before_plunge)
      : undefined,

  brewer: row.brewer ?? undefined,
  brewerBrand: row.brewer_brand ?? undefined,
  filterType: row.filter_type ?? undefined,

  mokaPotModel: row.moka_pot_model ?? undefined,
  waterStartTemp: row.water_start_temp ?? undefined,
  isAeropressFilterUsed: row.aeropress_filter_used ?? undefined,
  flameControl: row.flame_control ?? undefined,

  ratio: row.ratio ?? undefined,
  pourStructure: row.pour_structure ?? undefined,
  pourVolumes: row.pour_volumes ?? undefined,

  waterTemp: row.water_temp !== null ? Number(row.water_temp) : undefined,
  waterType: row.water_type ?? undefined,

  processNotes: row.process_notes ?? undefined,

  coldBrewType:
    row.cold_brew_type as 'Concentrate' | 'Ready to Drink' | undefined,
  coldBrewSystem: row.cold_brew_system ?? undefined,

  aroma: Number(row.aroma ?? 3),
  acidity: Number(row.acidity ?? 3),
  sweetness: Number(row.sweetness ?? 3),
  bitterness: Number(row.bitterness ?? 3),
  body: Number(row.body ?? 3),
  aftertaste: Number(row.aftertaste ?? 3),

  flavorGroups: row.flavor_groups ?? [],
  };
};

const brewLogToRow = (
  log: BrewLog,
  userId: string
) => ({
  user_id: userId,
  coffee_id: log.coffeeId || null,
  brew_image:
    log.brewImagePath ||
    (log.brewImage?.startsWith('data:')
      ? log.brewImage
      : null),

  barista_name: log.baristaName || null,
  site: log.site || null,

  brewed_at: log.date,
  method: log.method,

  grinder: log.grinder || null,
  grind_setting: log.grindSetting || null,

  dose: log.dose,
  yield: log.yield,
  brew_time: log.brewTime,

  rating: log.rating,
  tasting_notes: log.tastingNotes || [],

  pressure: log.pressure ?? null,
  shot_result: log.shotResult || null,
  machine: log.machine || null,
  machine_brand: log.machineBrand || null,
  basket_type: log.basketType || null,
  distribution_tool: log.distributionTool || null,
  puck_screen: log.puckScreen ?? null,

  aeropress_model: log.aeroPressModel || null,
  aero_method: log.aeroMethod || null,
  filter_cap_used: log.filterCapUsed || null,
  plunge_time: log.plungeTime ?? null,
  aero_pour_volumes: log.aeroPourVolumes || null,

  bloom_time: log.bloomTime ?? null,
  steep_time: log.steepTime ?? null,
  agitation: log.agitation || null,
  agitation_duration: log.agitationDuration ?? null,
  time_before_plunge: log.timeBeforePlunge ?? null,

  brewer: log.brewer || null,
  brewer_brand: log.brewerBrand || null,
  filter_type: log.filterType || null,

  moka_pot_model: log.mokaPotModel || null,
  water_start_temp: log.waterStartTemp || null,
  aeropress_filter_used: log.isAeropressFilterUsed ?? null,
  flame_control: log.flameControl || null,

  ratio: log.ratio || null,
  pour_structure: log.pourStructure || null,
  pour_volumes: log.pourVolumes || null,

  water_temp: log.waterTemp ?? null,
  water_type: log.waterType || null,

  process_notes: log.processNotes || null,

  cold_brew_type: log.coldBrewType || null,
  cold_brew_system: log.coldBrewSystem || null,

  aroma: log.aroma,
  acidity: log.acidity,
  sweetness: log.sweetness,
  bitterness: log.bitterness,
  body: log.body,
  aftertaste: log.aftertaste,

  flavor_groups: log.flavorGroups || [],
});

export const brewLogService = {
  getAll: async (userId: string): Promise<BrewLog[]> => {
    const { data, error } = await supabase
      .from('brew_logs')
      .select('*')
      .eq('user_id', userId)
      .order('brewed_at', { ascending: false });

    if (error) {
      throw error;
    }

      return Promise.all(
      (data as BrewLogRow[]).map(rowToBrewLog)
    );
  },

  create: async (
    log: BrewLog,
    userId: string
  ): Promise<BrewLog> => {
    const { data, error } = await supabase
      .from('brew_logs')
      .insert(brewLogToRow(log, userId))
      .select()
      .single();

    if (error) {
      throw error;
    }

      return await rowToBrewLog(data as BrewLogRow);
  },

  update: async (
    log: BrewLog,
    userId: string
  ): Promise<BrewLog> => {
    const { data, error } = await supabase
      .from('brew_logs')
      .update(brewLogToRow(log, userId))
      .eq('id', log.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

      return await rowToBrewLog(data as BrewLogRow);
  },

  delete: async (
    logId: string,
    userId: string
  ): Promise<void> => {
    const { error } = await supabase
      .from('brew_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  },
};