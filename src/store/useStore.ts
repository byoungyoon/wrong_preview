import { create } from 'zustand';
import { supabase } from '@api/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { Linking } from 'react-native';
import { useToastStore } from './useToastStore';

interface AuthState {
  session: Session | null;
  user: User | null;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => () => void;
  handleOpenURL: (url: string) => Promise<void>;
}

export const useStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  setSession: session => set({ session }),
  setUser: user => set({ user }),
  signInWithApple: async () => {
    try {
      // Mock Apple sign in for demonstration
      useToastStore.getState().showToast('Apple 로그인이 진행 중입니다...');
    } catch (e: any) {
      console.error('Apple Sign In Error:', e.message);
      useToastStore
        .getState()
        .showToast('Apple 로그인 중 오류가 발생했습니다.');
    }
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ session: null, user: null });
      useToastStore.getState().showToast('로그아웃되었습니다.');
    } catch (e: any) {
      console.error('Sign Out Error:', e.message);
      useToastStore.getState().showToast('로그아웃 중 오류가 발생했습니다.');
    }
  },
  handleOpenURL: async (url: string) => {
    if (url && url.includes('login-callback')) {
      const parts = url.split('#');
      if (parts.length > 1) {
        const hash = parts[1];
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            console.error(
              'Failed to set session from deep link:',
              error.message,
            );
            useToastStore
              .getState()
              .showToast('로그인 세션 설정에 실패했습니다.');
          } else if (data?.session) {
            useToastStore.getState().showToast('성공적으로 로그인되었습니다!');
          }
        }
      }
    }
  },
  initializeAuth: () => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      set({ session: initialSession, user: initialSession?.user ?? null });
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      set({ session: currentSession, user: currentSession?.user ?? null });
    });

    // 3. Handle deep linking for OAuth
    const handleDeepLink = async (event: { url: string }) => {
      await get().handleOpenURL(event.url);
    };

    const linkSubscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.unsubscribe();
      linkSubscription.remove();
    };
  },
}));
