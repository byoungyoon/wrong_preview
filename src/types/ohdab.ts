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
