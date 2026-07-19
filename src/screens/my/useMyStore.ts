import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OhdabPost, MockNotification } from '@app-types/ohdab';

interface MyState {
  userPosts: OhdabPost[];
  notifications: MockNotification[];
  voteCount: number;
  commentCount: number;
  initializeMy: () => Promise<void>;
  syncUserPosts: (allPosts: OhdabPost[]) => void;
  clearNotifications: () => Promise<void>;
  addNotification: (message: string) => Promise<void>;
  incrementVoteCount: () => Promise<void>;
  incrementCommentCount: () => Promise<void>;
}

const DEFAULT_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'notif_welcome',
    message:
      "🎉 '오답연애' 커뮤니티에 오신 것을 환영합니다! 연애 흑역사 오답노트를 작성해보세요.",
    timestamp: Date.now(),
    isRead: false,
  },
  {
    id: 'notif_tip',
    message:
      '🎓 오답연애 팁: 글 작성 시 AI 분석 기능을 사용하면 실명이나 지역을 자동으로 깔끔하게 가려줍니다.',
    timestamp: Date.now() - 10000,
    isRead: false,
  },
];

export const useMyStore = create<MyState>((set, get) => ({
  userPosts: [],
  notifications: [],
  voteCount: 0,
  commentCount: 0,

  initializeMy: async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem(
        '@ohdab_notifications',
      );
      const storedStats = await AsyncStorage.getItem('@ohdab_user_stats');

      let notifs: MockNotification[] = DEFAULT_NOTIFICATIONS;
      if (storedNotifications !== null) {
        notifs = JSON.parse(storedNotifications);
      } else {
        await AsyncStorage.setItem(
          '@ohdab_notifications',
          JSON.stringify(notifs),
        );
      }

      let votes = 0;
      let comms = 0;
      if (storedStats !== null) {
        const stats = JSON.parse(storedStats);
        votes = stats.voteCount || 0;
        comms = stats.commentCount || 0;
      }

      set({
        notifications: notifs,
        voteCount: votes,
        commentCount: comms,
      });
    } catch (e) {
      console.error('Failed to initialize my data:', e);
    }
  },

  syncUserPosts: allPosts => {
    set({ userPosts: allPosts.filter(p => p.isUserPost) });
  },

  clearNotifications: async () => {
    set({ notifications: [] });
    try {
      await AsyncStorage.setItem('@ohdab_notifications', JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear notifications:', e);
    }
  },

  addNotification: async message => {
    // Dynamic import/read of notifications to avoid closure problems
    let currentNotifs = get().notifications;
    try {
      const stored = await AsyncStorage.getItem('@ohdab_notifications');
      if (stored) {
        currentNotifs = JSON.parse(stored);
      }
    } catch (e) {
      console.log('Error reading notifications before append:', e);
    }

    const newNotif: MockNotification = {
      id: 'notif_' + Date.now(),
      message,
      timestamp: Date.now(),
      isRead: false,
    };

    const updated = [newNotif, ...currentNotifs].slice(0, 15);
    set({ notifications: updated });
    try {
      await AsyncStorage.setItem(
        '@ohdab_notifications',
        JSON.stringify(updated),
      );
    } catch (e) {
      console.error('Failed to save notification:', e);
    }
  },

  incrementVoteCount: async () => {
    const nextVotes = get().voteCount + 1;
    const comms = get().commentCount;
    set({ voteCount: nextVotes });
    try {
      await AsyncStorage.setItem(
        '@ohdab_user_stats',
        JSON.stringify({ voteCount: nextVotes, commentCount: comms }),
      );
    } catch (e) {
      console.error(e);
    }
  },

  incrementCommentCount: async () => {
    const votes = get().voteCount;
    const nextComms = get().commentCount + 1;
    set({ commentCount: nextComms });
    try {
      await AsyncStorage.setItem(
        '@ohdab_user_stats',
        JSON.stringify({ voteCount: votes, commentCount: nextComms }),
      );
    } catch (e) {
      console.error(e);
    }
  },
}));
