import React, { createContext, useContext, useState, useEffect } from 'react';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../api/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

// --- Interfaces ---

export interface OhdabPost {
  id: string;
  nickname: string;
  avatarId: string;
  tags: string; // Comma separated tags
  hook: string;
  stepIntro: string;
  stepClimax: string;
  stepAction: string;
  voteAuthorFault: number;
  votePartnerFault: number;
  sympathyCount: number;
  angerCount: number;
  timestamp: number;
  userVoted: number; // 0: None, 1: Author Fault, 2: Partner Fault
  userReactedSympathy: boolean;
  userReactedAnger: boolean;
  isUserPost: boolean;
}

export interface Comment {
  id: number;
  postId: string;
  nickname: string;
  text: string;
  timestamp: number;
}

export interface MockNotification {
  id: string;
  message: string;
  timestamp: number;
  isRead: boolean;
}

interface OhdabViewModelType {
  allPosts: OhdabPost[];
  userPosts: OhdabPost[];
  activePostIdForComments: string | null;
  commentsState: Comment[];
  draftIntro: string;
  draftClimax: string;
  draftAction: string;
  selectedTags: Set<string>;
  draftNickname: string;
  voteCount: number;
  commentCount: number;
  notifications: MockNotification[];
  toastMessage: string | null;
  showToast: (message: string) => void;
  clearToast: () => void;
  generateRandomNickname: () => void;
  updateDraftIntro: (val: string) => void;
  updateDraftClimax: (val: string) => void;
  updateDraftAction: (val: string) => void;
  toggleTag: (tag: string) => void;
  setCommentsActivePost: (postId: string | null) => void;
  submitPost: () => Promise<void>;
  vote: (postId: string, isAuthorFault: boolean) => Promise<void>;
  react: (postId: string, isSympathy: boolean) => Promise<void>;
  submitComment: (text: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  session: Session | null;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

const OhdabContext = createContext<OhdabViewModelType | undefined>(undefined);

// --- Lists for pseudonyms ---
const adjectives = ["매운맛", "서정적인", "바삭한", "폭주하는", "소심한", "억울한", "말랑말랑한", "고뇌하는", "눈물의", "화끈한"];
const nouns = ["잠봉뵈르", "팩폭러", "프로오답러", "고구마수집가", "눈물왕", "쿠쿠다스", "라떼감별사", "치즈핫도그", "피자덕후"];

// --- Mock Data ---
const DEFAULT_POSTS: OhdabPost[] = [
  {
    id: "ohdab_post_2026_001",
    nickname: "서정적인_팩폭러",
    avatarId: "avatar_crayon_red",
    tags: "#회피형_잠수함,#눈물의_가스라이팅",
    hook: "잠수 타고 일주일 뒤에 멀쩡히 프사 바꾼 X",
    stepIntro: "연애한 지 200일쯤 되었을 때, 갑자기 연락이 서서히 줄어들더니 사소한 말다툼 후에 전화를 아예 안 받기 시작했어요.",
    stepClimax: "3일 동안 사고라도 난 줄 알고 피가 마르며 걱정했는데, 일주일 뒤 카톡을 보니 제 커플링 사진은 다 내리고 지 방에서 찍은 거울 셀카로 프사가 바뀌었더라고요. 완전 황당했습니다.",
    stepAction: "전화 50통 걸고 문자 남겼는데 카톡 차단당했어요. 내가 무슨 죽을죄를 지었나 자책하다가 친구들 위로를 듣고 겨우 제정신으로 돌아왔습니다.",
    voteAuthorFault: 14,
    votePartnerFault: 542,
    sympathyCount: 320,
    angerCount: 890,
    timestamp: Date.now() - 3600000 * 24, // 1 day ago
    userVoted: 0,
    userReactedSympathy: false,
    userReactedAnger: false,
    isUserPost: false
  },
  {
    id: "ohdab_post_2026_002",
    nickname: "매운맛_잠봉뵈르",
    avatarId: "avatar_crayon_yellow",
    tags: "#가성비_집착러,#소심끝판왕",
    hook: "생일 선물로 편의점 1+1 쿠폰 보내준 내 남친",
    stepIntro: "제 남친은 평소에도 데이트 비용을 1원 단위까지 더치페이하고 가성비 밥집만 고집했어요. 그래도 아끼는 모습이 귀엽다고 넘겼습니다.",
    stepClimax: "드디어 대망의 제 생일날! 기대하던 고급 데이트까진 아니어도 선물은 내심 기대했는데 카톡으로 편의점 컵라면 1+1 모바일 쿠폰 한 장 보내더군요.",
    stepAction: "웃으면서 '고마워 자기도 하나 먹어~' 했더니, '응, 어차피 1+1이니까 하나는 내 몫이지'라고 정색하며 가져가서 먹었습니다.",
    voteAuthorFault: 5,
    votePartnerFault: 621,
    sympathyCount: 450,
    angerCount: 920,
    timestamp: Date.now() - 3600000 * 12, // 12 hours ago
    userVoted: 0,
    userReactedSympathy: false,
    userReactedAnger: false,
    isUserPost: false
  },
  {
    id: "ohdab_post_2026_003",
    nickname: "환승이별_장인킬러",
    avatarId: "avatar_crayon_blue",
    tags: "#환승이별_장인,#눈물의_가스라이팅",
    hook: "이별 통보 다음 날 내 친한 동기 인스타에 뜬 손",
    stepIntro: "3년 사귄 전 남친이랑 권태기가 와서 삐걱거리던 중이었어요. 남친은 늘 '우리 사이엔 더 이상 신뢰가 없어'라며 모든 걸 제 탓으로 돌렸죠.",
    stepClimax: "울면서 헤어지자고 카톡이 왔길래 미안해하고 있었는데, 다음 날 제 대학 동기 여사친 인스타 스토리에 커플 운동화 인증샷 and 전 남친 손이 올라왔습니다. 물어보니 한 달 전부터 썸을 타던 중이더군요.",
    stepAction: "여사친과 전 남친에게 동시에 전화를 걸었으나 '이미 지나간 일인데 왜 구질구질하게 구냐'는 가스라이팅 답변만 얻어맞고 차단당했습니다.",
    voteAuthorFault: 2,
    votePartnerFault: 891,
    sympathyCount: 512,
    angerCount: 1100,
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    userVoted: 0,
    userReactedSympathy: false,
    userReactedAnger: false,
    isUserPost: false
  }
];

const DEFAULT_COMMENTS: Comment[] = [
  { id: 1, postId: "ohdab_post_2026_001", nickname: "익명 1", text: "잠수는 인성 문제입니다. 백번천번 글쓴이 잘못 없음!!", timestamp: Date.now() - 3600000 * 23 },
  { id: 2, postId: "ohdab_post_2026_001", nickname: "익명 2", text: "와... 프사 바꾼 건 진짜 소름이네요. 방출 축하드립니다.", timestamp: Date.now() - 3600000 * 22 },
  { id: 3, postId: "ohdab_post_2026_001", nickname: "익명 3", text: "저도 똑같이 당해봄. 회피형은 절대로 사람 안 바뀝니다.", timestamp: Date.now() - 3600000 * 21 },
  { id: 4, postId: "ohdab_post_2026_002", nickname: "익명 1", text: "1+1 하나는 지 몫ㅋㅋㅋㅋㅋㅋ 장난하냐 진짜ㅋㅋㅋㅋㅋㅋㅋㅋ", timestamp: Date.now() - 3600000 * 11 },
  { id: 5, postId: "ohdab_post_2026_002", nickname: "익명 2", text: "이런 사람도 연애를 하는데 왜 나는 솔로일까...", timestamp: Date.now() - 3600000 * 10 },
  { id: 6, postId: "ohdab_post_2026_003", nickname: "익명 1", text: "상대가 역대급 개쓰레기네요. 방생해주셔서 감사합니다.", timestamp: Date.now() - 3600000 * 1 }
];

const DEFAULT_NOTIFICATIONS: MockNotification[] = [
  { id: "notif_welcome", message: "🎉 '오답연애' 커뮤니티에 오신 것을 환영합니다! 연애 흑역사 오답노트를 작성해보세요.", timestamp: Date.now(), isRead: false },
  { id: "notif_tip", message: "🎓 오답연애 팁: 글 작성 시 AI 분석 기능을 사용하면 실명이나 지역을 자동으로 깔끔하게 가려줍니다.", timestamp: Date.now() - 10000, isRead: false }
];

export const OhdabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication States
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Database States
  const [allPosts, setAllPosts] = useState<OhdabPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [voteCount, setVoteCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  // Active commentary state
  const [activePostIdForComments, setActivePostIdForComments] = useState<string | null>(null);
  const [commentsState, setCommentsState] = useState<Comment[]>([]);

  // Draft States
  const [draftIntro, setDraftIntro] = useState("");
  const [draftClimax, setDraftClimax] = useState("");
  const [draftAction, setDraftAction] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [draftNickname, setDraftNickname] = useState("");



  // Toast / Snackbar Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper function to trigger Toast
  const showToast = (message: string) => {
    setToastMessage(message);
  };
  const clearToast = () => {
    setToastMessage(null);
  };

  // Authentication Effects
  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Deep Link Handling for OAuth Callback
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
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
              console.error('Failed to set session from deep link:', error.message);
              showToast('로그인 세션 설정에 실패했습니다.');
            } else if (data?.session) {
              showToast('성공적으로 로그인되었습니다!');
            }
          }
        }
      }
    };

    const linkSubscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      linkSubscription.remove();
    };
  }, []);

  // OAuth Providers methods
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'wrongpreview://login-callback',
        },
      });
      if (error) throw error;
      if (data?.url) {
        await Linking.openURL(data.url);
      }
    } catch (e: any) {
      console.error('Google Sign In Error:', e.message);
      showToast('구글 로그인 중 오류가 발생했습니다.');
    }
  };

  const signInWithApple = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'wrongpreview://login-callback',
        },
      });
      if (error) throw error;
      if (data?.url) {
        await Linking.openURL(data.url);
      }
    } catch (e: any) {
      console.error('Apple Sign In Error:', e.message);
      showToast('애플 로그인 중 오류가 발생했습니다.');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showToast('로그아웃되었습니다.');
    } catch (e: any) {
      console.error('Sign Out Error:', e.message);
      showToast('로그아웃 중 오류가 발생했습니다.');
    }
  };

  // Generate temporary pseudonyms
  const generateRandomNickname = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    setDraftNickname(`${adj}_${noun}`);
  };

  // Prepopulate or load database state on launch
  useEffect(() => {
    const initializeData = async () => {
      try {
        const storedPosts = await AsyncStorage.getItem('@ohdab_posts');
        const storedComments = await AsyncStorage.getItem('@ohdab_comments');
        const storedNotifications = await AsyncStorage.getItem('@ohdab_notifications');
        const storedStats = await AsyncStorage.getItem('@ohdab_user_stats');

        if (storedPosts !== null) {
          setAllPosts(JSON.parse(storedPosts));
        } else {
          setAllPosts(DEFAULT_POSTS);
          await AsyncStorage.setItem('@ohdab_posts', JSON.stringify(DEFAULT_POSTS));
        }

        if (storedComments !== null) {
          setComments(JSON.parse(storedComments));
        } else {
          setComments(DEFAULT_COMMENTS);
          await AsyncStorage.setItem('@ohdab_comments', JSON.stringify(DEFAULT_COMMENTS));
        }

        if (storedNotifications !== null) {
          setNotifications(JSON.parse(storedNotifications));
        } else {
          setNotifications(DEFAULT_NOTIFICATIONS);
          await AsyncStorage.setItem('@ohdab_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
        }

        if (storedStats !== null) {
          const stats = JSON.parse(storedStats);
          setVoteCount(stats.voteCount || 0);
          setCommentCount(stats.commentCount || 0);
        }

        generateRandomNickname();
      } catch (e) {
        console.error("Failed to initialize offline database:", e);
      }
    };
    initializeData();
  }, []);

  // Update commentsState when active post or overall comments change
  useEffect(() => {
    if (activePostIdForComments) {
      const activeComments = comments.filter(c => c.postId === activePostIdForComments);
      // Sort comments by timestamp (earlier comments first)
      activeComments.sort((a, b) => a.timestamp - b.timestamp);
      setCommentsState(activeComments);
    } else {
      setCommentsState([]);
    }
  }, [activePostIdForComments, comments]);

  // Persists posts
  const savePosts = async (newPosts: OhdabPost[]) => {
    setAllPosts(newPosts);
    try {
      await AsyncStorage.setItem('@ohdab_posts', JSON.stringify(newPosts));
    } catch (e) {
      console.error(e);
    }
  };

  // Persists comments
  const saveComments = async (newComments: Comment[]) => {
    setComments(newComments);
    try {
      await AsyncStorage.setItem('@ohdab_comments', JSON.stringify(newComments));
    } catch (e) {
      console.error(e);
    }
  };

  // Persists notifications
  const saveNotifications = async (newNotifs: MockNotification[]) => {
    setNotifications(newNotifs);
    try {
      await AsyncStorage.setItem('@ohdab_notifications', JSON.stringify(newNotifs));
    } catch (e) {
      console.error(e);
    }
  };

  // Persists stats
  const saveStats = async (votes: number, comms: number) => {
    setVoteCount(votes);
    setCommentCount(comms);
    try {
      await AsyncStorage.setItem('@ohdab_user_stats', JSON.stringify({ voteCount: votes, commentCount: comms }));
    } catch (e) {
      console.error(e);
    }
  };

  const updateDraftIntro = (val: string) => setDraftIntro(val);
  const updateDraftClimax = (val: string) => setDraftClimax(val);
  const updateDraftAction = (val: string) => setDraftAction(val);

  const toggleTag = (tag: string) => {
    const next = new Set(selectedTags);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    setSelectedTags(next);
  };

  const setCommentsActivePost = (postId: string | null) => {
    setActivePostIdForComments(postId);
  };

  const submitPost = async () => {
    const nickname = draftNickname;
    const tagsString = Array.from(selectedTags).join(",");
    const intro = draftIntro;
    const climax = draftClimax;
    const action = draftAction;
    const hook = climax.length > 25 ? climax.slice(0, 25) + "..." : climax;

    if (!intro.trim() || !climax.trim() || !action.trim()) {
      showToast("내용을 비워둘 수 없습니다.");
      return;
    }

    if (selectedTags.size === 0) {
      showToast("최소 1개의 오답 태그를 선택해 주세요.");
      return;
    }

    const newPost: OhdabPost = {
      id: "ohdab_post_user_" + Date.now(),
      nickname,
      avatarId: "avatar_crayon_user",
      tags: tagsString,
      hook,
      stepIntro: intro,
      stepClimax: climax,
      stepAction: action,
      voteAuthorFault: 0,
      votePartnerFault: 0,
      sympathyCount: 0,
      angerCount: 0,
      timestamp: Date.now(),
      userVoted: 0,
      userReactedSympathy: false,
      userReactedAnger: false,
      isUserPost: true
    };

    const updatedPosts = [newPost, ...allPosts];
    await savePosts(updatedPosts);

    // Save custom mock advice as initial comment by 오답 코치
    const LOCAL_COACH_ADVICE = [
      "발단부터 대처까지 전형적인 오답입니다. 다음번엔 차단당하기 전에 먼저 속마음을 솔직하게 털어놓아 대화를 시도해보는 건 어떨까요?",
      "혼자 자책하고 밤새 괴로워할 문제가 아닙니다. 일방적으로 잠수타며 프사를 바꾸는 무책임한 상대는 그 자체로 거대한 오답이니, 얼른 훌훌 털어버리세요!",
      "클라이맥스 대목을 보니 안타까운 마음이 듭니다. 매달리는 대처는 상대방의 가스라이팅을 가중시킬 뿐입니다. 이제 당당하게 마음을 비우는 것이 정답입니다.",
      "이건 피차 과실 비율을 따지기 힘든 오답이네요. 지나간 흑역사는 잊고, 이번 오답노트를 발판 삼아 다음 연애에선 더 성숙한 정답을 찾아가시길 응원합니다.",
      "구차하게 부재중 전화를 남기며 매달릴 이유가 전혀 없는 사안이었습니다. 상대방의 회피 성향을 명확히 인지하시고, 나 자신을 더 아끼는 정답 연애를 시작하세요!"
    ];
    const randomAdvice = LOCAL_COACH_ADVICE[Math.floor(Math.random() * LOCAL_COACH_ADVICE.length)];

    const coachComment: Comment = {
      id: Date.now() + 1,
      postId: newPost.id,
      nickname: "🎓_오답연애_코치",
      text: randomAdvice,
      timestamp: Date.now() + 100
    };
    await saveComments([coachComment, ...comments]);

    showToast("나의 아찔한 오답노트가 성공적으로 등록되었습니다!");
    
    // Reset draft fields
    setDraftIntro("");
    setDraftClimax("");
    setDraftAction("");
    setSelectedTags(new Set());
    generateRandomNickname();

    // Trigger dopamine retention push message in 4 seconds
    setTimeout(async () => {
      const retentionMessage = `📈 내 오답노트 '${hook}' 글이 실시간 주간 베스트 오답 TOP 3에 올랐습니다!`;
      
      // Load current notifications directly to prevent closures issues
      const currentNotifsStr = await AsyncStorage.getItem('@ohdab_notifications');
      const currentNotifs: MockNotification[] = currentNotifsStr ? JSON.parse(currentNotifsStr) : [];
      
      const newNotif: MockNotification = {
        id: "notif_" + Date.now(),
        message: retentionMessage,
        timestamp: Date.now(),
        isRead: false
      };
      
      const updatedNotifs = [newNotif, ...currentNotifs].slice(0, 15);
      await saveNotifications(updatedNotifs);
      showToast(`새로운 알림이 도착했습니다: 내 글이 베스트 오답 TOP 3 진입!`);
    }, 4000);
  };

  const vote = async (postId: string, isAuthorFault: boolean) => {
    const postIndex = allPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    const post = allPosts[postIndex];
    if (post.userVoted !== 0) return; // Already voted

    const updatedPost = {
      ...post,
      voteAuthorFault: post.voteAuthorFault + (isAuthorFault ? 1 : 0),
      votePartnerFault: post.votePartnerFault + (!isAuthorFault ? 1 : 0),
      userVoted: isAuthorFault ? 1 : 2
    };

    const nextPosts = [...allPosts];
    nextPosts[postIndex] = updatedPost;
    await savePosts(nextPosts);
    await saveStats(voteCount + 1, commentCount);

    if (post.isUserPost) {
      const voteType = isAuthorFault ? "글쓴이 오답" : "상대 오답";
      const newNotif: MockNotification = {
        id: "notif_" + Date.now(),
        message: `누군가 당신의 오답노트에 '${voteType}' 표를 던졌습니다!`,
        timestamp: Date.now(),
        isRead: false
      };
      await saveNotifications([newNotif, ...notifications].slice(0, 15));
    }
  };

  const react = async (postId: string, isSympathy: boolean) => {
    const postIndex = allPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    const post = allPosts[postIndex];

    let updatedPost = { ...post };
    if (isSympathy) {
      const active = !post.userReactedSympathy;
      updatedPost.sympathyCount += active ? 1 : -1;
      updatedPost.userReactedSympathy = active;
    } else {
      const active = !post.userReactedAnger;
      updatedPost.angerCount += active ? 1 : -1;
      updatedPost.userReactedAnger = active;
    }

    const nextPosts = [...allPosts];
    nextPosts[postIndex] = updatedPost;
    await savePosts(nextPosts);

    // Send notifications if user post
    const shouldNotify = post.isUserPost && (
      (isSympathy && !post.userReactedSympathy) || 
      (!isSympathy && !post.userReactedAnger)
    );

    if (shouldNotify) {
      const reactionType = isSympathy ? "'토닥토닥' 공감" : "'혈압 상승' 분노";
      const newNotif: MockNotification = {
        id: "notif_" + Date.now(),
        message: `당신의 오답노트에 새로운 ${reactionType} 반응이 달렸습니다!`,
        timestamp: Date.now(),
        isRead: false
      };
      await saveNotifications([newNotif, ...notifications].slice(0, 15));
    }
  };

  const submitComment = async (text: string) => {
    if (!activePostIdForComments || !text.trim()) return;

    const authorOfPost = allPosts.find(p => p.id === activePostIdForComments);
    const postComments = comments.filter(c => c.postId === activePostIdForComments);
    
    let commenterName = "익명 1";
    if (authorOfPost?.isUserPost) {
      commenterName = "작성자";
    } else {
      const uniqueCommenters = Array.from(new Set(postComments.map(c => c.nickname))).filter(n => n.startsWith("익명"));
      commenterName = `익명 ${uniqueCommenters.length + 1}`;
    }

    const newComment: Comment = {
      id: Date.now(),
      postId: activePostIdForComments,
      nickname: commenterName,
      text: text,
      timestamp: Date.now()
    };

    const nextComments = [newComment, ...comments];
    await saveComments(nextComments);
    await saveStats(voteCount, commentCount + 1);

    if (authorOfPost?.isUserPost) {
      const newNotif: MockNotification = {
        id: "notif_" + Date.now(),
        message: `누군가 당신의 오답노트에 한마디 남겼습니다: "${text}"`,
        timestamp: Date.now(),
        isRead: false
      };
      await saveNotifications([newNotif, ...notifications].slice(0, 15));
    }
  };

  const clearNotifications = async () => {
    await saveNotifications([]);
  };

  const userPosts = allPosts.filter(p => p.isUserPost);

  return (
    <OhdabContext.Provider
      value={{
        allPosts,
        userPosts,
        activePostIdForComments,
        commentsState,
        draftIntro,
        draftClimax,
        draftAction,
        selectedTags,
        draftNickname,
        voteCount,
        commentCount,
        notifications,
        toastMessage,
        showToast,
        clearToast,
        generateRandomNickname,
        updateDraftIntro,
        updateDraftClimax,
        updateDraftAction,
        toggleTag,
        setCommentsActivePost,
        submitPost,
        vote,
        react,
        submitComment,
        clearNotifications,
        session,
        user,
        signInWithGoogle,
        signInWithApple,
        signOut
      }}
    >
      {children}
    </OhdabContext.Provider>
  );
};

export const useOhdabViewModel = () => {
  const context = useContext(OhdabContext);
  if (context === undefined) {
    throw new Error('useOhdabViewModel must be used within an OhdabProvider');
  }
  return context;
};
