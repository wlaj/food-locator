import { createClient } from '@/lib/supabase/client';

export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.role;
}

export async function isUserAdmin(userId?: string): Promise<boolean> {
  if (!userId) return false;
  
  const role = await getUserRole(userId);
  return role === 'admin';
}

export async function checkCurrentUserIsAdmin(): Promise<boolean> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  return await isUserAdmin(user.id);
}