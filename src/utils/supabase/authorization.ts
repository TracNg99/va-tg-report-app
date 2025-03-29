// import supabase from './client';
import { createClient } from '@supabase/supabase-js';

export default async function isAuthenticated(token: string) {
  // Using supabase-js getUser function to validate the token without exposing supbase project secret key

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  // If signed in user found for the provided token, signal that the token is valid.
  if (user) {
    return { data: user!.id };
  }

  return;
}
