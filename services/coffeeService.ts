import { supabase } from './supabaseClient';
import { CoffeeBean, RoastLevel } from '../types';
import { imageService } from './imageService';

interface CoffeeRow {
  id: string;
  user_id: string;

  name: string;
  roaster: string;

  roaster_location: string | null;
  roaster_url: string | null;

  origin: string;
  region: string | null;
  farm: string | null;
  producer: string | null;

  process: string;
  varietal: string | null;
  altitude: string | null;
  terroir: string | null;
  harvest_season: string | null;

  roast_level: string;
  roast_date: string | null;
  purchase_date: string | null;

  remaining_weight: number;
  total_weight: number;

  price: number | null;

  bag_tasting_notes: string[] | null;
  personal_notes: string | null;

  bag_image: string | null;
  label_image: string | null;
}

const rowToCoffee = async (
  row: CoffeeRow
): Promise<CoffeeBean> => {
  const [bagImage, labelImage] = await Promise.all([
    imageService.createSignedUrl(row.bag_image),
    imageService.createSignedUrl(row.label_image),
  ]);

  return {
    id: row.id,
    name: row.name,
    roaster: row.roaster,
    roasterLocation: row.roaster_location ?? undefined,
    roasterURL: row.roaster_url ?? undefined,

    origin: row.origin,
    region: row.region ?? undefined,
    farm: row.farm ?? undefined,
    producer: row.producer ?? undefined,

    process: row.process,
    varietal: row.varietal ?? undefined,
    altitude: row.altitude ?? undefined,
    terroir: row.terroir ?? undefined,
    harvestSeason: row.harvest_season ?? undefined,

    roastLevel: row.roast_level as RoastLevel,
    roastDate: row.roast_date ?? undefined,
    purchaseDate: row.purchase_date ?? '',

    remainingWeight: Number(row.remaining_weight),
    totalWeight: Number(row.total_weight),

    price: row.price !== null ? Number(row.price) : undefined,

    bagTastingNotes: row.bag_tasting_notes ?? [],
    personalNotes: row.personal_notes ?? '',

    bagImage,
    labelImage,
    bagImagePath: row.bag_image ?? undefined,
    labelImagePath: row.label_image ?? undefined,
  };
};

const coffeeToRow = (
  coffee: CoffeeBean,
  userId: string
) => ({
  user_id: userId,

  name: coffee.name,
  roaster: coffee.roaster,

  roaster_location: coffee.roasterLocation || null,
  roaster_url: coffee.roasterURL || null,

  origin: coffee.origin,
  region: coffee.region || null,
  farm: coffee.farm || null,
  producer: coffee.producer || null,

  process: coffee.process,
  varietal: coffee.varietal || null,
  altitude: coffee.altitude || null,
  terroir: coffee.terroir || null,
  harvest_season: coffee.harvestSeason || null,

  roast_level: coffee.roastLevel,
  roast_date: coffee.roastDate || null,
  purchase_date: coffee.purchaseDate || null,

  remaining_weight: coffee.remainingWeight,
  total_weight: coffee.totalWeight,

  price: coffee.price ?? null,

  bag_tasting_notes: coffee.bagTastingNotes || [],
  personal_notes: coffee.personalNotes || '',

  bag_image:
    coffee.bagImagePath ||
    (coffee.bagImage?.startsWith('data:')
      ? coffee.bagImage
      : null),

  label_image:
    coffee.labelImagePath ||
    (coffee.labelImage?.startsWith('data:')
      ? coffee.labelImage
      : null),
});

export const coffeeService = {
  getAll: async (userId: string): Promise<CoffeeBean[]> => {
    const { data, error } = await supabase
      .from('coffees')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

      return Promise.all(
      (data as CoffeeRow[]).map(rowToCoffee)
    );
  },

  create: async (
    coffee: CoffeeBean,
    userId: string
  ): Promise<CoffeeBean> => {
    const { data, error } = await supabase
      .from('coffees')
      .insert(coffeeToRow(coffee, userId))
      .select()
      .single();

    if (error) {
      throw error;
    }

      return await rowToCoffee(data as CoffeeRow);
  },

  update: async (
    coffee: CoffeeBean,
    userId: string
  ): Promise<CoffeeBean> => {
    const { data, error } = await supabase
      .from('coffees')
      .update(coffeeToRow(coffee, userId))
      .eq('id', coffee.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

      return await rowToCoffee(data as CoffeeRow);
  },

  delete: async (
    coffeeId: string,
    userId: string
  ): Promise<void> => {
    const { error } = await supabase
      .from('coffees')
      .delete()
      .eq('id', coffeeId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  },
};