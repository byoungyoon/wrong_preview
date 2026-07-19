import { create } from 'zustand';
import { OhdabPost, Comment } from '@app-types/ohdab';
import { useFeedStore } from '@screens/feed/useFeedStore';
import { useMyStore } from '@screens/my/useMyStore';
import { useToastStore } from '@store/useToastStore';

interface WriteState {
  draftIntro: string;
  draftClimax: string;
  draftAction: string;
  selectedTags: Set<string>;
  draftNickname: string;
  generateRandomNickname: () => void;
  updateDraftIntro: (val: string) => void;
  updateDraftClimax: (val: string) => void;
  updateDraftAction: (val: string) => void;
  toggleTag: (tag: string) => void;
  submitPost: () => Promise<void>;
}

const adjectives = [
  '매운맛',
  '서정적인',
  '바삭한',
  '폭주하는',
  '소심한',
  '억울한',
  '말랑말랑한',
  '고뇌하는',
  '눈물의',
  '화끈한',
];

const nouns = [
  '잠봉뵈르',
  '팩폭러',
  '프로오답러',
  '고구마수집가',
  '눈물왕',
  '쿠쿠다스',
  '라떼감별사',
  '치즈핫도그',
  '피자덕후',
];

export const useWriteStore = create<WriteState>((set, get) => ({
  draftIntro: '',
  draftClimax: '',
  draftAction: '',
  selectedTags: new Set<string>(),
  draftNickname: '',

  generateRandomNickname: () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    set({ draftNickname: `${adj}_${noun}` });
  },

  updateDraftIntro: val => set({ draftIntro: val }),
  updateDraftClimax: val => set({ draftClimax: val }),
  updateDraftAction: val => set({ draftAction: val }),

  toggleTag: tag => {
    const next = new Set(get().selectedTags);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    set({ selectedTags: next });
  },

  submitPost: async () => {
    const {
      draftIntro,
      draftClimax,
      draftAction,
      selectedTags,
      draftNickname,
      generateRandomNickname,
    } = get();

    const intro = draftIntro;
    const climax = draftClimax;
    const action = draftAction;
    const tagsString = Array.from(selectedTags).join(',');
    const hook = climax.length > 25 ? climax.slice(0, 25) + '...' : climax;

    if (!intro.trim() || !climax.trim() || !action.trim()) {
      useToastStore.getState().showToast('내용을 비워둘 수 없습니다.');
      return;
    }

    if (selectedTags.size === 0) {
      useToastStore
        .getState()
        .showToast('최소 1개의 오답 태그를 선택해 주세요.');
      return;
    }

    const newPost: OhdabPost = {
      id: 'ohdab_post_user_' + Date.now(),
      nickname: draftNickname,
      avatarId: 'avatar_crayon_user',
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
      isUserPost: true,
    };

    // Add post to feed store
    await useFeedStore.getState().addPost(newPost);

    // Save custom mock advice as initial comment by 오답 코치
    const LOCAL_COACH_ADVICE = [
      '발단부터 대처까지 전형적인 오답입니다. 다음번엔 차단당하기 전에 먼저 속마음을 솔직하게 털어놓아 대화를 시도해보는 건 어떨까요?',
      '혼자 자책하고 밤새 괴로워할 문제가 아닙니다. 일방적으로 잠수타며 프사를 바꾸는 무책임한 상대는 그 자체로 거대한 오답이니, 얼른 훌훌 털어버리세요!',
      '클라이맥스 대목을 보니 안타까운 마음이 듭니다. 매달리는 대처는 상대방의 가스라이팅을 가중시킬 뿐입니다. 이제 당당하게 마음을 비우는 것이 정답입니다.',
      '이건 피차 과실 비율을 따지기 힘든 오답이네요. 지나간 흑역사는 잊고, 이번 오답노트를 발판 삼아 다음 연애에선 더 성숙한 정답을 찾아가시길 응원합니다.',
      '구차하게 부재중 전화를 남기며 매달릴 이유가 전혀 없는 사안이었습니다. 상대방의 회피 성향을 명확히 인지하시고, 나 자신을 더 아끼는 정답 연애를 시작하세요!',
    ];
    const randomAdvice =
      LOCAL_COACH_ADVICE[Math.floor(Math.random() * LOCAL_COACH_ADVICE.length)];

    const coachComment: Comment = {
      id: Date.now() + 1,
      postId: newPost.id,
      nickname: '🎓_오답연애_코치',
      text: randomAdvice,
      timestamp: Date.now() + 100,
    };

    await useFeedStore.getState().addComment(coachComment);

    useToastStore
      .getState()
      .showToast('나의 아찔한 오답노트가 성공적으로 등록되었습니다!');

    // Reset draft fields
    set({
      draftIntro: '',
      draftClimax: '',
      draftAction: '',
      selectedTags: new Set(),
    });
    generateRandomNickname();

    // Trigger dopamine retention push message in 4 seconds
    setTimeout(async () => {
      const retentionMessage = `📈 내 오답노트 '${hook}' 글이 실시간 주간 베스트 오답 TOP 3에 올랐습니다!`;

      await useMyStore.getState().addNotification(retentionMessage);
      useToastStore
        .getState()
        .showToast(
          `새로운 알림이 도착했습니다: 내 글이 베스트 오답 TOP 3 진입!`,
        );
    }, 4000);
  },
}));
