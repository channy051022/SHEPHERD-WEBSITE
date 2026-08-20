import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Real client or null
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const DEFAULT_ADMIN_EMAIL = 'admin@shepherd.app';
export const DEFAULT_ADMIN_PASSWORD = 'ShepherdAdmin2026!';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  fullName?: string;
  isLocalDemo?: boolean;
}

const LOCAL_ADMIN_STORAGE_KEY = 'biblenote_admin_session';

/**
 * Sign in admin user using Supabase Auth, or fallback demo auth
 */
export async function signInAdmin(email: string, password: string): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (error) {
        // If remote user not found or wrong password, also test if it matches default demo credentials
        if (
          (normalizedEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() || normalizedEmail === 'admin@biblenote.com') && 
          password === DEFAULT_ADMIN_PASSWORD
        ) {
          const fallbackUser: AdminUser = {
            id: 'local-admin-shepherd',
            email: normalizedEmail,
            role: 'admin',
            fullName: 'Shepherd Administrator (Local Override)',
            isLocalDemo: true
          };
          localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(fallbackUser));
          return { success: true, user: fallbackUser };
        }

        return { success: false, message: error.message };
      }

      if (data.user) {
        const adminUser: AdminUser = {
          id: data.user.id,
          email: data.user.email || normalizedEmail,
          role: 'admin',
          fullName: data.user.user_metadata?.full_name || 'Administrator',
          isLocalDemo: false
        };
        localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      }
    } catch (err: unknown) {
      console.warn('Supabase auth network error, checking demo credentials:', err);
    }
  }

  // Fallback / Offline / Demo Auth check
  if (
    (normalizedEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() || normalizedEmail === 'admin@biblenote.com' || normalizedEmail === 'admin@shepherd.com') && 
    (password === DEFAULT_ADMIN_PASSWORD || password === 'admin' || password === 'admin123')
  ) {
    const demoUser: AdminUser = {
      id: 'demo-admin-id-1',
      email: normalizedEmail,
      role: 'admin',
      fullName: 'Shepherd Administrator (Local Mode)',
      isLocalDemo: true
    };
    localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(demoUser));
    return { success: true, user: demoUser };
  }

  return { success: false, message: 'Invalid admin email or password. Please try again.' };
}

/**
 * Sign out current admin user
 */
export async function signOutAdmin(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    }
  }
  localStorage.removeItem(LOCAL_ADMIN_STORAGE_KEY);
}

/**
 * Get current active admin session
 */
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const adminUser: AdminUser = {
          id: data.session.user.id,
          email: data.session.user.email || DEFAULT_ADMIN_EMAIL,
          role: 'admin',
          fullName: data.session.user.user_metadata?.full_name || 'Administrator',
          isLocalDemo: false
        };
        return adminUser;
      }
    } catch (err) {
      console.warn('Error reading supabase session:', err);
    }
  }

  try {
    const stored = localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AdminUser;
    }
  } catch {
    // ignore
  }

  return null;
}

export interface DownloadEventPayload {
  id?: number | string;
  platform: string;
  user_agent?: string;
  referrer?: string;
  app_version: string;
  user_email?: string | null;
  created_at: string;
}

/**
 * Log download event to Supabase download_events table with user email
 */
export async function trackDownloadEvent(
  platform = 'android', 
  appVersion = '1.0.1', 
  userEmail?: string
): Promise<DownloadEventPayload> {
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  const referrer = typeof document !== 'undefined' ? document.referrer : '';

  const eventData: DownloadEventPayload = {
    platform,
    user_agent: userAgent,
    referrer: referrer || 'direct',
    app_version: appVersion,
    user_email: userEmail ? userEmail.trim().toLowerCase() : null,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('download_events').insert([eventData]);
      if (error) {
        console.warn('Supabase download event logging notice:', error.message);
      }

      // If user provided email, also automatically ensure they are subscribed for updates
      if (userEmail) {
        await subscribeEmail(userEmail, 'download_modal');
      }

      // Increment download counter on active release
      try {
        await supabase.rpc('increment_downloads', { release_version: appVersion });
      } catch {
        // ignore if RPC not created
      }
    } catch (err) {
      console.warn('Failed to send download event to Supabase:', err);
    }
  } else {
    // Local persistence
    try {
      const localEvents: DownloadEventPayload[] = JSON.parse(localStorage.getItem('biblenote_download_events') || '[]');
      localEvents.unshift(eventData);
      localStorage.setItem('biblenote_download_events', JSON.stringify(localEvents.slice(0, 500)));
      if (userEmail) {
        await subscribeEmail(userEmail, 'download_modal');
      }
    } catch {
      // ignore
    }
  }

  return eventData;
}

/**
 * Fetch actual download events from Supabase or localStorage (No mock/dummy items)
 */
export async function fetchDownloadEvents(): Promise<DownloadEventPayload[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('download_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        return data as DownloadEventPayload[];
      }
    } catch (err) {
      console.warn('Failed to fetch download events from Supabase:', err);
    }
  }

  try {
    const localEvents = JSON.parse(localStorage.getItem('biblenote_download_events') || '[]');
    if (Array.isArray(localEvents)) {
      return localEvents;
    }
  } catch {
    // ignore
  }

  return [];
}

export interface SubscriberItem {
  id?: number | string;
  email: string;
  source: string;
  is_active?: boolean;
  created_at: string;
}

/**
 * Submit subscriber email to Supabase subscribers table
 */
export async function subscribeEmail(email: string, source = 'landing_page'): Promise<{ success: boolean; message: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('subscribers').insert([
        { email: cleanEmail, source }
      ]);

      if (error) {
        if (error.code === '23505') {
          // Already subscribed
          return { success: true, message: 'You are registered for release updates! 🎉' };
        }
        return { success: false, message: error.message || 'Subscription failed. Please try again.' };
      }

      return { success: true, message: 'Thank you! You will receive future APK updates. ✨' };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      return { success: false, message: errorMessage };
    }
  } else {
    // Simulated local persistence for development & preview
    try {
      const localSubs: SubscriberItem[] = JSON.parse(localStorage.getItem('biblenote_subscribers') || '[]');
      if (!localSubs.some((s) => s.email === cleanEmail)) {
        localSubs.unshift({ email: cleanEmail, source, created_at: new Date().toISOString() });
        localStorage.setItem('biblenote_subscribers', JSON.stringify(localSubs));
      }
    } catch {
      // ignore
    }

    return { 
      success: true, 
      message: 'Thank you! You will receive future APK updates. ✨' 
    };
  }
}

/**
 * Fetch actual subscribers from Supabase or localStorage (No mock/dummy items)
 */
export async function fetchSubscribers(): Promise<SubscriberItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as SubscriberItem[];
      }
    } catch (err) {
      console.warn('Failed to fetch subscribers from Supabase:', err);
    }
  }

  try {
    const localSubs = JSON.parse(localStorage.getItem('biblenote_subscribers') || '[]');
    if (Array.isArray(localSubs)) {
      return localSubs.map((item, idx) => 
        typeof item === 'string' 
          ? { id: idx + 1, email: item, source: 'landing_page', created_at: new Date().toISOString() } 
          : { id: item.id || idx + 1, source: 'landing_page', ...item }
      );
    }
  } catch {
    // ignore
  }

  return [];
}
