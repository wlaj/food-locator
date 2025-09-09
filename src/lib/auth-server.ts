import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';

export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = await createClient();
  
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

export async function getCurrentUserRole(): Promise<{ user: User | null; role: string | null; isAdmin: boolean }> {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null, role: null, isAdmin: false };
  }
  
  const role = await getUserRole(user.id);
  return { user, role, isAdmin: role === 'admin' };
}

export async function requireAdmin() {
  const { user, isAdmin } = await getCurrentUserRole();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
  
  return user;
}