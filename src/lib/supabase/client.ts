/**
 * Zero-dependency Native Supabase REST & Auth Client
 * Connects directly to Supabase via standard Fetch API.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export interface SupabaseAuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  user: SupabaseAuthUser;
}

export const supabaseRest = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,

  async signInWithEmail(email: string, password: string): Promise<{ session?: SupabaseSession; error?: string }> {
    if (!isSupabaseConfigured) {
      return { error: "Supabase credentials not configured in environment." };
    }
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error_description || data.msg || "Authentication failed." };
      }
      return { session: data };
    } catch (err: any) {
      return { error: err.message || "Network error." };
    }
  },

  async signUpWithEmail(email: string, password: string): Promise<{ user?: SupabaseAuthUser; error?: string }> {
    if (!isSupabaseConfigured) {
      return { error: "Supabase credentials not configured in environment." };
    }
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error_description || data.msg || "Signup failed." };
      }
      return { user: data.user || data };
    } catch (err: any) {
      return { error: err.message || "Network error." };
    }
  },

  async syncUserData(accessToken: string, payload: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: false, error: "Supabase not configured." };
    }
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.message || "Failed to sync progress." };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Sync network error." };
    }
  },
};
