import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Crown,
  Trophy,
  Bell,
  FolderOpen,
  Folder,
  CheckCircle,
  Pin,
  PenTool,
  Heart,
  MessageCircle,
  GraduationCap
} from 'lucide-react-native';
import { useOhdabViewModel, OhdabPost } from '../hooks/useOhdabViewModel';

interface BadgeData {
  name: string;
  desc: string;
  IconComponent: React.ComponentType<any>;
  isUnlocked: boolean;
  iconColor: string;
}

export const MyScreen: React.FC = () => {
  const {
    userPosts,
    notifications,
    voteCount,
    commentCount,
    clearNotifications,
    user,
    signOut
  } = useOhdabViewModel();

  const [selectedPostForCard, setSelectedPostForCard] = useState<OhdabPost | null>(null);

  // Mask user email for privacy (PII Protection)
  const maskEmail = (email?: string) => {
    if (!email) return '이메일 정보 없음';
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;
    if (local.length <= 2) {
      return `${local.slice(0, 1)}*@${domain}`;
    }
    return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
  };

  // Karma points calculation:
  // Post: 100pts, Comment: 50pts, Vote: 20pts
  const karmaPoints = (userPosts.length * 100) + (commentCount * 50) + (voteCount * 20);

  const getLevelTitle = () => {
    if (karmaPoints < 100) return "뉴비 오답러";
    if (karmaPoints < 300) return "연애 분석생";
    if (karmaPoints < 600) return "프로 공감러";
    return "연애 오답 코치";
  };

  const badges: BadgeData[] = [
    { name: "첫 발걸음", desc: "첫 오답노트 작성", IconComponent: PenTool, iconColor: '#21005D', isUnlocked: userPosts.length > 0 },
    { name: "정답 판독기", desc: "3회 이상 투표 참여", IconComponent: CheckCircle, iconColor: '#FB7185', isUnlocked: voteCount >= 3 },
    { name: "프로 공감러", desc: "5회 이상 투표 참여", IconComponent: Heart, iconColor: '#F43F5E', isUnlocked: voteCount >= 5 },
    { name: "마당발 참견러", desc: "댓글 1회 이상 작성", IconComponent: MessageCircle, iconColor: '#49454F', isUnlocked: commentCount >= 1 },
    { name: "핵인싸 코치", desc: "총 카르마 300점 돌파", IconComponent: GraduationCap, iconColor: '#F59E0B', isUnlocked: karmaPoints >= 300 }
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg-lavender">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* 1. Profile Dashboard */}
        <View className="bg-white rounded-[24px] border border-neutral-outline/15 p-4 mb-5 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-brand-yellow/15 border-2 border-brand-yellow justify-center items-center">
              <Crown color="#F59E0B" size={28} fill="#F59E0B" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-tag-sub text-neutral-slate">{maskEmail(user?.email)}</Text>
              <Text className="text-logo-title font-bold text-neutral-charcoal">{getLevelTitle()}</Text>
              <View className="bg-brand-yellow/12 rounded-lg px-2 py-1 self-start mt-1.5">
                <Text className="text-tag-sub font-bold text-brand-yellow">카르마 점수: {karmaPoints}P</Text>
              </View>
            </View>
          </View>

          <View className="h-[1px] bg-neutral-outline/20 my-4" />

          <View className="flex-row items-center gap-1.5 mb-2.5">
            <Trophy color="#F59E0B" size={16} fill="#F59E0B" />
            <Text className="text-body-text font-bold text-neutral-charcoal">내가 획득한 디지털 배지</Text>
          </View>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex-row">
            {badges.map((badge) => (
              <BadgeItem key={badge.name} badge={badge} />
            ))}
          </ScrollView>
        </View>

        {/* 2. Notification Center */}
        <View className="bg-white rounded-[24px] border border-neutral-outline/15 p-4 mb-5 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <Bell color="#F43F5E" size={18} fill="#F43F5E" />
              <Text className="text-logo-title font-bold text-neutral-charcoal">실시간 공감 및 알림 피드</Text>
            </View>
            {notifications.length > 0 && (
              <TouchableOpacity onPress={clearNotifications} activeOpacity={0.7}>
                <Text className="text-tag-sub font-bold text-neutral-slate">전체 삭제</Text>
              </TouchableOpacity>
            )}
          </View>

          {notifications.length === 0 ? (
            <View className="py-4 items-center">
              <Text className="text-tag-sub text-neutral-slate text-center">
                도착한 알림이 없습니다. 사연을 작성하거나 투표하면 여기에 실시간 피드백이 전송됩니다!
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {notifications.map((notif) => (
                <View key={notif.id} className="flex-row items-center bg-[#F7F2FA] border border-neutral-outline/15 rounded-xl p-3">
                  <View className="w-2 h-2 rounded-full bg-brand-rose mr-2.5" />
                  <Text className="flex-1 text-tag-sub text-neutral-charcoal">{notif.message}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 3. User's Written Notes List */}
        <View className="flex-row items-center gap-1.5 mb-2 px-0.5">
          <FolderOpen color="#49454F" size={16} />
          <Text className="text-logo-title font-bold text-neutral-charcoal">
            내가 등록한 연애 오답노트 ({userPosts.length})
          </Text>
        </View>

        {userPosts.length === 0 ? (
          <View className="bg-white rounded-[24px] border border-neutral-outline/15 p-4 mb-5 shadow-sm items-center py-8">
            <View className="mb-2">
              <Folder color="#49454F" size={48} strokeWidth={1.5} />
            </View>
            <Text className="text-body-text text-neutral-slate mt-2">아직 작성된 오답노트가 없습니다.</Text>
          </View>
        ) : (
          userPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              className="bg-white rounded-2xl border border-neutral-outline/15 p-4 flex-row justify-between items-center mb-2.5 shadow-sm"
              onPress={() => setSelectedPostForCard(post)}
              activeOpacity={0.8}
            >
              <View className="flex-1 pr-3">
                <Text className="text-body-text font-bold text-neutral-charcoal" numberOfLines={1}>
                  {post.hook}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-tag-sub text-neutral-slate">
                    투표: {post.voteAuthorFault + post.votePartnerFault}회 참여
                  </Text>
                  <View className="w-[3px] h-[3px] rounded-full bg-neutral-slate mx-1.5" />
                  <Text className="text-tag-sub text-neutral-slate">
                    공감: {post.sympathyCount}
                  </Text>
                </View>
              </View>
              <View className="bg-brand-rose/12 rounded-lg px-2.5 py-1.5">
                <Text className="text-tag-sub font-bold text-brand-rose">채점 카드</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* 4. Log Out Button */}
        <TouchableOpacity
          className="mt-6 border border-neutral-outline rounded-2xl py-3.5 items-center justify-center bg-white/50 active:bg-white"
          onPress={signOut}
          activeOpacity={0.7}
        >
          <Text className="text-body-text font-bold text-[#E53935]">로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 4. Grading Card Dialog */}
      {selectedPostForCard && (
        <GradingCardDialog
          post={selectedPostForCard}
          onDismiss={() => setSelectedPostForCard(null)}
        />
      )}
    </SafeAreaView>
  );
};

// --- BadgeItem Child Component ---
const BadgeItem: React.FC<{ badge: BadgeData }> = ({ badge }) => {
  const cardClasses = badge.isUnlocked
    ? "bg-[#F7F2FA] border-brand-yellow/50"
    : "bg-[#F7F2FA]/50 border-neutral-outline/15";
  const iconBgClasses = badge.isUnlocked
    ? "bg-brand-yellow/15"
    : "bg-transparent";
  const iconOpacityClasses = badge.isUnlocked
    ? "opacity-100"
    : "opacity-40";
  const nameColorClasses = badge.isUnlocked
    ? "text-neutral-charcoal"
    : "text-[#938F99]";

  const IconComponent = badge.IconComponent;

  return (
    <View className={`w-24 h-[114px] rounded-xl border p-2 items-center justify-center mr-2.5 ${cardClasses}`}>
      <View className={`w-10 h-10 rounded-full justify-center items-center ${iconBgClasses} ${iconOpacityClasses}`}>
        <IconComponent color={badge.iconColor} size={20} fill={badge.isUnlocked ? badge.iconColor : 'none'} />
      </View>
      <Text className={`text-tag-sub font-bold text-center mt-1.5 ${nameColorClasses}`}>
        {badge.name}
      </Text>
      <Text className="text-tag-sub text-neutral-slate text-center mt-0.5" numberOfLines={2}>
        {badge.desc}
      </Text>
    </View>
  );
};

// --- GradingCardDialog Child Component ---
interface DialogProps {
  post: OhdabPost;
  onDismiss: () => void;
}

const GradingCardDialog: React.FC<DialogProps> = ({ post, onDismiss }) => {
  const totalVotes = post.voteAuthorFault + post.votePartnerFault;
  const partnerFaultPercent = totalVotes > 0 ? Math.round(post.votePartnerFault * 100 / totalVotes) : 0;
  const authorFaultPercent = totalVotes > 0 ? Math.round(post.voteAuthorFault * 100 / totalVotes) : 0;

  const getVerdictGrade = () => {
    if (partnerFaultPercent >= 90) return "F -";
    if (partnerFaultPercent >= 70) return "D";
    if (partnerFaultPercent >= 50) return "C";
    return "B +";
  };

  const getVerdictText = () => {
    if (partnerFaultPercent >= 90) {
      return "상대방의 과실이 90% 이상인 '우주급 오답'으로 최종 채점되었습니다. 인연 탈출이 강력 권장되는 등급입니다.";
    }
    if (partnerFaultPercent >= 70) {
      return "상대방 과실 70% 돌파! 상대의 심각한 결함이 있는 불합격 연애 사례로 채점되었습니다.";
    }
    if (partnerFaultPercent >= 50) {
      return "쌍방 과실 존! 애매모호한 과실 비율이므로 서로 오답 노트를 돌려봐야 합니다.";
    }
    return "내가 자책할 부분이 있는 '나의 자가 오답' 성향이 크다고 채점되었습니다.";
  };

  return (
    <Modal transparent={true} animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="w-full max-h-[90%] bg-bg-paper rounded-2xl border-2 border-red-500 p-5 relative overflow-hidden">
          {/* Transparent Background Checkmark stamp */}
          <Text className="absolute right-12 top-[60px] text-hero-hook scale-[8.0] font-bold text-red-500/5 z-0" pointerEvents="none">✓</Text>

          <ScrollView contentContainerStyle={{ zIndex: 10 }} showsVerticalScrollIndicator={false}>
            {/* Test Paper Header */}
            <View className="flex-row items-center justify-center gap-1.5">
              <GraduationCap color="#EF4444" size={18} />
              <Text className="text-logo-title font-bold text-slate-800 text-center">연애 오답 시험 채점표</Text>
            </View>
            <Text className="text-tag-sub text-slate-600 text-center mt-1">제출자 닉네임: {post.nickname}</Text>

            <View className="h-[1px] bg-slate-300 my-4" />

            {/* Grading Details Row */}
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-1 pr-2.5">
                <View className="flex-row items-center gap-1 mb-1">
                  <Pin color="#EF4444" size={12} />
                  <Text className="text-tag-sub font-bold text-red-500">핵심 흑역사 훅:</Text>
                </View>
                <Text className="text-logo-title font-extrabold text-slate-800 leading-[18px]">"{post.hook}"</Text>
              </View>

              {/* Red Stamp circle */}
              <View className="w-20 h-20 rounded-full border-[3px] border-red-500 justify-center items-center">
                <Text className="text-hero-hook font-black text-red-500">{getVerdictGrade()}</Text>
                <Text className="text-tag-sub font-bold text-red-500 mt-0.5 scale-[0.8]">오답 판정</Text>
              </View>
            </View>

            {/* Results Details block */}
            <View className="bg-slate-100 rounded-xl border border-slate-200 p-3.5 mb-6">
              <Text className="text-widget-title font-bold text-slate-700 mb-2">최종 대중 과실 비율</Text>
              <View className="flex-row justify-between mb-2.5">
                <Text className="text-body-text font-black text-red-500">상대방 과실: {partnerFaultPercent}%</Text>
                <Text className="text-body-text font-semibold text-slate-500">나의 과실: {authorFaultPercent}%</Text>
              </View>
              <Text className="text-tag-sub text-slate-600">{getVerdictText()}</Text>
            </View>

            {/* Share action */}
            <TouchableOpacity className="bg-[#E1306C] rounded-xl py-3.5 items-center mb-2" activeOpacity={0.8}>
              <Text className="text-body-text font-bold text-white">인스타그램 스토리 공유하기</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity className="border border-slate-500 rounded-xl py-3 items-center" onPress={onDismiss} activeOpacity={0.8}>
              <Text className="text-body-text font-bold text-slate-700">창 닫기</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default MyScreen;
