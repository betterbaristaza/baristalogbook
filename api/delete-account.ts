import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase server credentials are not configured');

    return res.status(500).json({
      error: 'Account deletion is not configured',
    });
  }

  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  const accessToken = authorization.slice(7);

  const admin = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(accessToken);

    if (userError || !user) {
      return res.status(401).json({
        error: 'Invalid session',
      });
    }

    const userId = user.id;

    const deleteStorageSection = async (
      section: 'coffees' | 'brews'
    ) => {
      const { data: folders, error: folderError } =
        await admin.storage
          .from('logbook-images')
          .list(`${userId}/${section}`);

      if (folderError) {
        throw folderError;
      }

      if (!folders?.length) {
        return;
      }

      const paths: string[] = [];

      for (const folder of folders) {
        const folderPath = `${userId}/${section}/${folder.name}`;

        const { data: files, error: fileError } =
          await admin.storage
            .from('logbook-images')
            .list(folderPath);

        if (fileError) {
          throw fileError;
        }

        for (const file of files ?? []) {
          paths.push(`${folderPath}/${file.name}`);
        }
      }

      if (paths.length > 0) {
        const { error: removeError } =
          await admin.storage
            .from('logbook-images')
            .remove(paths);

        if (removeError) {
          throw removeError;
        }
      }
    };

    await deleteStorageSection('brews');
    await deleteStorageSection('coffees');

    const { error: brewLogsError } = await admin
      .from('brew_logs')
      .delete()
      .eq('user_id', userId);

    if (brewLogsError) {
      throw brewLogsError;
    }

    const { error: coffeesError } = await admin
      .from('coffees')
      .delete()
      .eq('user_id', userId);

    if (coffeesError) {
      throw coffeesError;
    }

    const { error: profileError } = await admin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      throw profileError;
    }

    const { error: authError } =
      await admin.auth.admin.deleteUser(userId);

    if (authError) {
      throw authError;
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error('Account deletion error:', error);

    return res.status(500).json({
      error: 'Unable to delete account',
    });
  }
}