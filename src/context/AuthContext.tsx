import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppUser, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isSupabaseLive: boolean;
  loginWithEmail: (email: string, password?: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, name: string, role: UserRole, password?: string) => Promise<{ error?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loginAsDemo: (role: 'student' | 'landlord') => void;
  updateUsername: (newName: string) => Promise<{ error?: string }>;
  checkUsernameAvailable: (newName: string) => Promise<{ available: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'hfxrentals_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to detect Halifax university emails
  const detectStudentAffiliation = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase() || '';
    if (domain.includes('dal.ca')) return 'Dalhousie';
    if (domain.includes('smu.ca')) return "Saint Mary's";
    if (domain.includes('msvu.ca')) return 'MSVU';
    if (domain.includes('nscad.ca')) return 'NSCAD';
    if (domain.includes('nscc.ca')) return 'NSCC';
    return undefined;
  };

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Live Supabase Auth
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const email = session.user.email || '';
          const affiliation = detectStudentAffiliation(email);
          setUser({
            id: session.user.id,
            email,
            name: session.user.user_metadata?.full_name || email.split('@')[0],
            role: (session.user.user_metadata?.role as UserRole) || (affiliation ? 'student' : 'renter'),
            avatarUrl: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            universityAffiliation: affiliation as any,
            isVerifiedStudent: Boolean(affiliation),
            hasFastPassVerified: false
          });
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const email = session.user.email || '';
          const affiliation = detectStudentAffiliation(email);
          setUser({
            id: session.user.id,
            email,
            name: session.user.user_metadata?.full_name || email.split('@')[0],
            role: (session.user.user_metadata?.role as UserRole) || (affiliation ? 'student' : 'renter'),
            avatarUrl: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            universityAffiliation: affiliation as any,
            isVerifiedStudent: Boolean(affiliation),
            hasFastPassVerified: false
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Local demo mode using localStorage
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, password?: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'temporary-password'
      });
      if (error) return { error: error.message };
      return {};
    } else {
      // Mock login
      const affiliation = detectStudentAffiliation(email);
      const newUser: AppUser = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0].replace('.', ' '),
        role: affiliation ? 'student' : 'renter',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        universityAffiliation: affiliation as any,
        isVerifiedStudent: Boolean(affiliation),
        hasFastPassVerified: true
      };
      setUser(newUser);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
      return {};
    }
  };

  const signUpWithEmail = async (email: string, name: string, role: UserRole, password?: string) => {
    const affiliation = detectStudentAffiliation(email);
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password: password || 'temporary-password',
        options: {
          data: {
            full_name: name,
            role: affiliation ? 'student' : role
          }
        }
      });
      if (error) return { error: error.message };
      return {};
    } else {
      const newUser: AppUser = {
        id: `user-${Date.now()}`,
        email,
        name,
        role: affiliation ? 'student' : role,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        universityAffiliation: affiliation as any,
        isVerifiedStudent: Boolean(affiliation),
        hasFastPassVerified: true
      };
      setUser(newUser);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
      return {};
    }
  };

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } else {
      // Demo Google login
      const googleUser: AppUser = {
        id: 'google-user-123',
        email: 'alex.halifax@gmail.com',
        name: 'Alex MacDonald',
        role: 'renter',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        hasFastPassVerified: true
      };
      setUser(googleUser);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(googleUser));
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setUser(null);
  };

  const loginAsDemo = (demoRole: 'student' | 'landlord') => {
    let demoUser: AppUser;
    if (demoRole === 'student') {
      demoUser = {
        id: 'demo-student-01',
        email: 'liam.fraser@dal.ca',
        name: 'Liam Fraser',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
        universityAffiliation: 'Dalhousie',
        isVerifiedStudent: true,
        hasFastPassVerified: true
      };
    } else {
      demoUser = {
        id: 'demo-landlord-01',
        email: 'macleod.rentals@halifaxflats.ca',
        name: 'Robert MacLeod',
        role: 'landlord',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        hasFastPassVerified: true
      };
    }
    setUser(demoUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoUser));
  };

  const checkUsernameAvailable = async (newName: string): Promise<{ available: boolean; error?: string }> => {
    const trimmed = newName.trim();
    if (!trimmed) {
      return { available: false, error: 'Username cannot be blank' };
    }
    if (trimmed.length < 3) {
      return { available: false, error: 'Username must be at least 3 characters' };
    }
    if (trimmed.length > 32) {
      return { available: false, error: 'Username cannot exceed 32 characters' };
    }

    // If matches the active user's existing name, it's available for them
    if (user && user.name.toLowerCase() === trimmed.toLowerCase()) {
      return { available: true };
    }

    // 1. Check live Supabase database if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .ilike('full_name', trimmed);

        if (error) {
          console.warn('Error checking username in Supabase', error);
        } else if (data && data.length > 0) {
          const takenByOther = data.some(p => p.id !== user?.id);
          if (takenByOther) {
            return {
              available: false,
              error: `Username "${trimmed}" is already taken by another account.`
            };
          }
        }
      } catch (err) {
        console.warn('Supabase username check exception', err);
      }
    }

    // 2. Check local mock database names
    const existingLocalNames = [
      'Liam Chen',
      'Sarah MacDonald',
      'Robert MacLeod',
      'Maya Patel',
      'Marcus Thompson',
      'Chloe Cormier',
      'Tariq Al-Mansoor',
      'Elena Rostova',
      'Heather Langille',
      'David Ross',
      'Michael Henderson'
    ];

    const isMockTaken = existingLocalNames.some(
      n => n.toLowerCase() === trimmed.toLowerCase() && (!user || user.name.toLowerCase() !== n.toLowerCase())
    );

    if (isMockTaken) {
      return {
        available: false,
        error: `Username "${trimmed}" is already taken. Please choose a different username.`
      };
    }

    return { available: true };
  };

  const updateUsername = async (newName: string): Promise<{ error?: string }> => {
    const trimmed = newName.trim();
    if (!trimmed) {
      return { error: 'Username cannot be blank' };
    }
    if (!user) {
      return { error: 'No user is currently signed in' };
    }

    // If identical to current name, no-op
    if (user.name === trimmed) {
      return {};
    }

    // Enforce uniqueness check
    const check = await checkUsernameAvailable(trimmed);
    if (!check.available) {
      return { error: check.error || 'Username is already taken' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: trimmed })
          .eq('id', user.id);

        if (profileError) {
          // Check for PostgreSQL unique constraint code 23505
          if (
            profileError.code === '23505' ||
            profileError.message?.includes('duplicate') ||
            profileError.message?.includes('unique')
          ) {
            return { error: `Username "${trimmed}" is already taken. Please choose a unique name.` };
          }
          console.warn('Could not update profile in Supabase', profileError);
          return { error: profileError.message || 'Failed to update username' };
        }

        await supabase.auth.updateUser({
          data: { full_name: trimmed }
        });
      } catch (err: any) {
        console.warn('Could not sync name update to Supabase', err);
        return { error: err?.message || 'Database error occurred while updating username' };
      }
    }

    const updatedUser: AppUser = {
      ...user,
      name: trimmed
    };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));

    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSupabaseLive: isSupabaseConfigured,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogle,
        logout,
        loginAsDemo,
        updateUsername,
        checkUsernameAvailable
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
