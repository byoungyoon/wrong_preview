import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OhdabPost, Comment } from '@app-types/ohdab';
import { useMyStore } from '@screens/my/useMyStore';

interface FeedState {
  allPosts: OhdabPost[];
  comments: Comment[];
  activePostIdForComments: string | null;
  commentsState: Comment[];
  initializeFeed: () => Promise<void>;
  setCommentsActivePost: (postId: string | null) => void;
  addPost: (post: OhdabPost) => Promise<void>;
  addComment: (comment: Comment) => Promise<void>;
  vote: (postId: string, isAuthorFault: boolean) => Promise<void>;
  react: (postId: string, isSympathy: boolean) => Promise<void>;
  submitComment: (text: string) => Promise<void>;
}

const DEFAULT_POSTS: OhdabPost[] = [
  {
    id: 'ohdab_post_2026_001',
    nickname: '서정적인_팩폭러',
    avatarId: 'avatar_crayon_red',
    tags: '#회피형_잠수함,#눈물의_가스라이팅',
    hook: '잠수 타고 일주일 뒤에 멀쩡히 프사 바꾼 X',
    stepIntro:
      '연애한 지 200일쯤 되었을 때, 갑자기 연락이 서서히 줄어들더니 사소한 말다툼 후에 전화를 아예 안 받기 시작했어요.',
    stepClimax:
      '3일 동안 사고라도 난 줄 알고 피가 마르며 걱정했는데, 일주일 뒤 카톡을 보니 제 커플링 사진은 다 내리고 지 방에서 찍은 거울 셀카로 프사가 바뀌었더라고요. 완전 황당했습니다.',
    stepAction:
      '전화 50통 걸고 문자 남겼는데 카톡 차단당했어요. 내가 무슨 죽을죄를 지었나 자책하다가 친구들 위로를 듣고 겨우 제정신으로 돌아왔습니다.',
    voteAuthorFault: 14,
    votePartnerFault: 542,
    sympathyCount: 320,
    angerCount: 890,
    timestamp: Date.now() - 3600000 * 24,
    userVoted: 0,
    userReactedSympathy: false,
    userReactedAnger: false,
    isUserPost: false,
  },
  {
    id: 'ohdab_post_2026_002',
    nickname: '매운맛_잠봉뵈르',
    avatarId: 'avatar_crayon_yellow',
    tags: '#가성비_집착러,#소심끝판왕',
    hook: '생일 선물로 편의점 1+1 쿠폰 보내준 내 남친',
    stepIntro:
      '제 남친은 평소에도 데이트 비용을 1원 단위까지 더치페이하고 가성비 밥집만 고집했어요. 그래도 아끼는 모습이 귀엽다고 넘겼습니다.',
    stepClimax:
      '드디어 대망의 제 생일날! 기대하던 고급 데이트까진 아니어도 선물은 내심 기대했는데 카톡으로 편의점 컵라면 1+1 모바일 쿠폰 한 장 보내더군요.',
    stepAction:
      "웃으면서 '고마워 자기도 하나 먹어~' 했더니, '응, 어차피 1+1이니까 하나는 내 몫이지'라고 정색하며 가져가서 먹었습니다.",
    voteAuthorFault: 5,
    votePartnerFault: 621,
    sympathyCount: 450,
    angerCount: 920,
    timestamp: Date.now() - 3600000 * 12,
    userVoted: 0,
    userReactedSympathy: false,
    userReactedAnger: false,
    isUserPost: false,
  },
  {
    id: 'ohdab_post_2026_003',
    nickname: '환승이별_장인킬러',
    avatarId: 'avatar_crayon_blue',
    tags: '#환승이별_장인,#눈물의_가스라이팅',
    hook: '이별 통보 다음 날 내 친한 동기 인스타에 뜬 손',
    stepIntro:
      "3년 사귄 전 남친이랑 권태기가 와서 삐걱거리던 중이었어요. 남친은 늘 '우리 사이엔 더 이상 신뢰가 없어'라며 모든 걸 제 탓으로 돌렸죠.",
    stepClimax:
      '울면서 헤어지자고 카톡이 왔길래 미안해하고 있었는데, 다음 날 제 대학 동기 여사친 인스타 스토리에 커플 운동화 인증샷 and 전 남친 손이 올라왔습니다. 물어보니 한 달 전부터 썸을 타던 중이더군요.',
    stepAction:
      "여사친 and 전 남친에게 동시에 전화를 걸었으나 '이미 지나간 일인데 왜 구질구질하게 구냐'는 가스라이팅 답변만 얻어맞고 차단당했습니다.",
    voteAuthorFault: 2,
    votePartnerFault: 891,
    sympathyCount: 512,
    angerCount: 1100,
    timestamp: Date.now() - 3600000 * 2,
    userVoted: 0,
    userReactedSympathy: false,
    userReactedAnger: false,
    isUserPost: false,
  },
];

const DEFAULT_COMMENTS: Comment[] = [
  {
    id: 1,
    postId: 'ohdab_post_2026_001',
    nickname: '익명 1',
    text: '잠수는 인성 문제입니다. 백번천번 글쓴이 잘못 없음!!',
    timestamp: Date.now() - 3600000 * 23,
  },
  {
    id: 2,
    postId: 'ohdab_post_2026_001',
    nickname: '익명 2',
    text: '와... 프사 바꾼 건 진짜 소름이네요. 방출 축하드립니다.',
    timestamp: Date.now() - 3600000 * 22,
  },
  {
    id: 3,
    postId: 'ohdab_post_2026_001',
    nickname: '익명 3',
    text: '저도 똑같이 당해봄. 회피형은 절대로 사람 안 바뀝니다.',
    timestamp: Date.now() - 3600000 * 21,
  },
  {
    id: 4,
    postId: 'ohdab_post_2026_002',
    nickname: '익명 1',
    text: '1+1 하나는 지 몫ㅋㅋㅋㅋㅋㅋ 장난하냐 진짜ㅋㅋㅋㅋㅋㅋㅋㅋ',
    timestamp: Date.now() - 3600000 * 11,
  },
  {
    id: 5,
    postId: 'ohdab_post_2026_002',
    nickname: '익명 2',
    text: '이런 사람도 연애를 하는데 왜 나는 솔로일까...',
    timestamp: Date.now() - 3600000 * 10,
  },
  {
    id: 6,
    postId: 'ohdab_post_2026_003',
    nickname: '익명 1',
    text: '상대방이 역대급 개쓰레기네요. 방생해주셔서 감사합니다.',
    timestamp: Date.now() - 3600000 * 1,
  },
];

const updateCommentsStateHelper = (
  comments: Comment[],
  postId: string | null,
) => {
  if (!postId) return [];
  const activeComments = comments.filter(c => c.postId === postId);
  return activeComments.sort((a, b) => a.timestamp - b.timestamp);
};

export const useFeedStore = create<FeedState>((set, get) => ({
  allPosts: [],
  comments: [],
  activePostIdForComments: null,
  commentsState: [],

  initializeFeed: async () => {
    try {
      const storedPosts = await AsyncStorage.getItem('@ohdab_posts');
      const storedComments = await AsyncStorage.getItem('@ohdab_comments');

      let posts: OhdabPost[] = DEFAULT_POSTS;
      if (storedPosts !== null) {
        posts = JSON.parse(storedPosts);
      } else {
        await AsyncStorage.setItem('@ohdab_posts', JSON.stringify(posts));
      }

      let comms: Comment[] = DEFAULT_COMMENTS;
      if (storedComments !== null) {
        comms = JSON.parse(storedComments);
      } else {
        await AsyncStorage.setItem('@ohdab_comments', JSON.stringify(comms));
      }

      set({
        allPosts: posts,
        comments: comms,
        commentsState: updateCommentsStateHelper(
          comms,
          get().activePostIdForComments,
        ),
      });

      // Synchronize initial posts inside my store
      useMyStore.getState().syncUserPosts(posts);
    } catch (e) {
      console.error('Failed to initialize feed data:', e);
    }
  },

  setCommentsActivePost: postId => {
    set({
      activePostIdForComments: postId,
      commentsState: updateCommentsStateHelper(get().comments, postId),
    });
  },

  addPost: async newPost => {
    const updatedPosts = [newPost, ...get().allPosts];
    set({ allPosts: updatedPosts });
    useMyStore.getState().syncUserPosts(updatedPosts);
    try {
      await AsyncStorage.setItem('@ohdab_posts', JSON.stringify(updatedPosts));
    } catch (e) {
      console.error('Failed to save posts:', e);
    }
  },

  addComment: async newComment => {
    const updatedComments = [newComment, ...get().comments];
    set({
      comments: updatedComments,
      commentsState: updateCommentsStateHelper(
        updatedComments,
        get().activePostIdForComments,
      ),
    });
    try {
      await AsyncStorage.setItem(
        '@ohdab_comments',
        JSON.stringify(updatedComments),
      );
    } catch (e) {
      console.error('Failed to save comments:', e);
    }
  },

  vote: async (postId, isAuthorFault) => {
    const { allPosts } = get();
    const postIndex = allPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    const post = allPosts[postIndex];
    if (post.userVoted !== 0) return; // Already voted

    const updatedPost = {
      ...post,
      voteAuthorFault: post.voteAuthorFault + (isAuthorFault ? 1 : 0),
      votePartnerFault: post.votePartnerFault + (!isAuthorFault ? 1 : 0),
      userVoted: isAuthorFault ? 1 : 2,
    };

    const nextPosts = [...allPosts];
    nextPosts[postIndex] = updatedPost;
    set({ allPosts: nextPosts });
    useMyStore.getState().syncUserPosts(nextPosts);

    try {
      await AsyncStorage.setItem('@ohdab_posts', JSON.stringify(nextPosts));
      await useMyStore.getState().incrementVoteCount();
    } catch (e) {
      console.error(e);
    }

    if (post.isUserPost) {
      const voteType = isAuthorFault ? '글쓴이 오답' : '상대 오답';
      await useMyStore
        .getState()
        .addNotification(
          `누군가 당신의 오답노트에 '${voteType}' 표를 던졌습니다!`,
        );
    }
  },

  react: async (postId, isSympathy) => {
    const { allPosts } = get();
    const postIndex = allPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    const post = allPosts[postIndex];

    const updatedPost = { ...post };
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
    set({ allPosts: nextPosts });
    useMyStore.getState().syncUserPosts(nextPosts);

    try {
      await AsyncStorage.setItem('@ohdab_posts', JSON.stringify(nextPosts));
    } catch (e) {
      console.error(e);
    }

    const shouldNotify =
      post.isUserPost &&
      ((isSympathy && !post.userReactedSympathy) ||
        (!isSympathy && !post.userReactedAnger));

    if (shouldNotify) {
      const reactionType = isSympathy ? "'토닥토닥' 공감" : "'혈압 상승' 분노";
      await useMyStore
        .getState()
        .addNotification(
          `당신의 오답노트에 새로운 ${reactionType} 반응이 달렸습니다!`,
        );
    }
  },

  submitComment: async text => {
    const { activePostIdForComments, comments } = get();
    if (!activePostIdForComments || !text.trim()) return;

    const authorOfPost = get().allPosts.find(
      p => p.id === activePostIdForComments,
    );
    const postComments = comments.filter(
      c => c.postId === activePostIdForComments,
    );

    let commenterName = '익명 1';
    if (authorOfPost?.isUserPost) {
      commenterName = '작성자';
    } else {
      const uniqueCommenters = Array.from(
        new Set(postComments.map(c => c.nickname)),
      ).filter(n => n.startsWith('익명'));
      commenterName = `익명 ${uniqueCommenters.length + 1}`;
    }

    const newComment: Comment = {
      id: Date.now(),
      postId: activePostIdForComments,
      nickname: commenterName,
      text: text,
      timestamp: Date.now(),
    };

    const nextComments = [newComment, ...comments];
    set({
      comments: nextComments,
      commentsState: updateCommentsStateHelper(
        nextComments,
        activePostIdForComments,
      ),
    });

    try {
      await AsyncStorage.setItem(
        '@ohdab_comments',
        JSON.stringify(nextComments),
      );
      await useMyStore.getState().incrementCommentCount();
    } catch (e) {
      console.error(e);
    }

    if (authorOfPost?.isUserPost) {
      await useMyStore
        .getState()
        .addNotification(
          `누군가 당신의 오답노트에 한마디 남겼습니다: "${text}"`,
        );
    }
  },
}));
