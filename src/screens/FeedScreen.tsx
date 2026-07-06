import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Dimensions,
  Vibration,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GraduationCap,
  Trophy,
  BookOpen,
  User,
  Heart,
  Flame,
  MessageCircle,
  Share2,
  X,
  Send,
  FileText,
  Zap,
  Lightbulb
} from 'lucide-react-native';
import { useOhdabViewModel, OhdabPost, Comment } from '../hooks/useOhdabViewModel';
import NotebookPaper from '../components/NotebookPaper';

const { height: windowHeight } = Dimensions.get('window');

export const FeedScreen: React.FC = () => {
  const {
    allPosts,
    activePostIdForComments,
    commentsState,
    setCommentsActivePost,
    vote,
    react,
    submitComment
  } = useOhdabViewModel();

  const [feedHeight, setFeedHeight] = useState(windowHeight - 60); // Default offset
  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState<'home' | 'ranking'>('home');

  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to top when switching tabs
  useEffect(() => {
    if (allPosts.length > 0) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [activeTab, allPosts.length]);

  const handleSendComment = () => {
    if (commentText.trim()) {
      submitComment(commentText);
      setCommentText("");
    }
  };

  // Ranking calculation score
  const getRankingScore = (post: OhdabPost) => {
    return (post.voteAuthorFault + post.votePartnerFault) * 12 + post.sympathyCount * 7 + post.angerCount * 8;
  };

  // Determine sorted list
  const displayPosts = activeTab === 'home'
    ? allPosts
    : [...allPosts].sort((a, b) => getRankingScore(b) - getRankingScore(a));

  const renderPagingItem = ({ item, index }: { item: OhdabPost; index: number }) => {
    const rank = activeTab === 'ranking' ? index + 1 : undefined;
    const score = activeTab === 'ranking' ? getRankingScore(item) : undefined;

    return (
      <View style={{ height: feedHeight }} className="w-full justify-center">
        <OhdabPostCard
          post={item}
          onVote={(isAuthor) => vote(item.id, isAuthor)}
          onReactSympathy={() => react(item.id, true)}
          onReactAnger={() => react(item.id, false)}
          onOpenComments={() => setCommentsActivePost(item.id)}
          rank={rank}
          score={score}
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-lavender">
      {/* [상단 영역 : 네비게이션] - 유리 질감 절대 위치 탑 바 */}
      <View className="h-[60px] bg-white/75 border-b border-neutral-outline/30 flex-row justify-between items-center px-5 shadow-sm">
        <View className="flex-row items-center gap-1">
          <Text className="text-logo-title font-black text-brand-purple">오답연애</Text>
          <GraduationCap color="#21005D" size={18} strokeWidth={2.5} />
        </View>
        <View className="flex-row bg-neutral-outline/20 rounded-[30px] p-[3px]">
          <TouchableOpacity
            className={`px-3 py-1 rounded-[20px] ${activeTab === 'home' ? 'bg-white' : ''}`}
            onPress={() => setActiveTab('home')}
            activeOpacity={0.7}
          >
            <Text className={`text-tag-sub font-bold ${activeTab === 'home' ? 'text-brand-purple' : 'text-neutral-slate'}`}>
              홈
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-3 py-1 rounded-[20px] ${activeTab === 'ranking' ? 'bg-white' : ''}`}
            onPress={() => setActiveTab('ranking')}
            activeOpacity={0.7}
          >
            <Text className={`text-tag-sub font-bold ${activeTab === 'ranking' ? 'text-brand-purple' : 'text-neutral-slate'}`}>
              실시간 랭킹
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* [스와이프 피드 영역] */}
      <View 
        className="flex-1"
        onLayout={(e) => setFeedHeight(e.nativeEvent.layout.height)}
      >
        {displayPosts.length === 0 ? (
          <View className="flex-1 justify-center items-center py-24">
            <Text className="text-body-text text-neutral-slate">등록된 오답노트가 없습니다.</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={displayPosts}
            renderItem={renderPagingItem}
            keyExtractor={(item) => item.id}
            pagingEnabled={true}
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={feedHeight}
            snapToAlignment="start"
          />
        )}
      </View>

      {/* Commentary modal */}
      <Modal
        visible={activePostIdForComments !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentsActivePost(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-black/50 justify-end"
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setCommentsActivePost(null)}
          />
          <View 
            style={{ paddingBottom: Platform.OS === 'ios' ? 24 : 12 }} 
            className="bg-white rounded-t-[24px] max-h-[75%]"
          >
            <View className="flex-row justify-between items-center px-4 py-3.5">
              <Text className="text-logo-title font-bold text-neutral-charcoal">
                참견 및 위로 한마디 ({commentsState.length})
              </Text>
              <TouchableOpacity onPress={() => setCommentsActivePost(null)} className="p-1">
                <X color="#49454F" size={20} />
              </TouchableOpacity>
            </View>
            <View className="h-[1px] bg-neutral-outline/30" />

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
              {commentsState.length === 0 ? (
                <View className="py-12 items-center">
                  <Text className="text-body-text text-neutral-slate text-center">
                    아직 참견이 없습니다.{"\n"}따뜻한 위로를 건네보세요!
                  </Text>
                </View>
              ) : (
                commentsState.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              )}
            </ScrollView>

            <View className="h-[1px] bg-neutral-outline/30" />
            <View className="flex-row items-center p-2 bg-white">
              <TextInput
                className="flex-1 h-10 bg-[#F7F2FA] rounded-[20px] px-4 text-body-text text-neutral-charcoal mr-2"
                placeholder="참견 한마디로 연애 해독하기..."
                placeholderTextColor="#938F99"
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-brand-rose justify-center items-center pl-0.5"
                onPress={handleSendComment}
                activeOpacity={0.8}
              >
                <Send color="#FFFFFF" size={16} fill="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// --- OhdabPostCard Bento Grid & Flip Component ---
interface PostCardProps {
  post: OhdabPost;
  onVote: (isAuthor: boolean) => void;
  onReactSympathy: () => void;
  onReactAnger: () => void;
  onOpenComments: () => void;
  rank?: number;
  score?: number;
}

const OhdabPostCard: React.FC<PostCardProps> = ({
  post,
  onVote,
  onReactSympathy,
  onReactAnger,
  onOpenComments,
  rank,
  score
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalVotes = post.voteAuthorFault + post.votePartnerFault;
  const isVoted = post.userVoted !== 0;

  // 3D flip animations using Animated
  const flipAnim = useRef(new Animated.Value(isVoted ? 180 : 0)).current;

  // Synchronize state if database changes
  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: isVoted ? 180 : 0,
      duration: 350,
      useNativeDriver: true
    }).start();
  }, [isVoted, flipAnim]);

  const handleVoteCardPress = (isAuthor: boolean) => {
    if (isVoted) return;
    Vibration.vibrate(80);
    onVote(isAuthor);
  };

  // Rotation interpolations
  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg']
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg']
  });

  // Opacity interpolations to ensure no back-rendering issues on Android
  const frontOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0]
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1]
  });

  const getAvatar = () => {
    switch (post.avatarId) {
      case 'avatar_crayon_red': return <Text className="text-logo-title">😡</Text>;
      case 'avatar_crayon_yellow': return <Text className="text-logo-title">🤔</Text>;
      case 'avatar_crayon_blue': return <Text className="text-logo-title">😭</Text>;
      default: return <User color="#21005D" size={16} />;
    }
  };

  const getAvatarColor = () => {
    switch (post.avatarId) {
      case 'avatar_crayon_red': return '#FECDD3';
      case 'avatar_crayon_yellow': return '#FEF08A';
      case 'avatar_crayon_blue': return '#BFDBFE';
      default: return '#E8DEF8';
    }
  };

  const authorPercent = totalVotes > 0 ? Math.round(post.voteAuthorFault * 100 / totalVotes) : 0;
  const partnerPercent = totalVotes > 0 ? Math.round(post.votePartnerFault * 100 / totalVotes) : 0;

  // Render rank badge based on position
  const renderRankBadge = () => {
    if (rank === undefined) return null;
    let badgeBgBorder = "bg-brand-purple/4 border-brand-purple/15";
    let badgeText = `실시간 ${rank}위`;
    let iconColor = '#21005D';
    
    if (rank === 1) {
      badgeBgBorder = "bg-brand-yellow/10 border-brand-yellow";
      badgeText = `실시간 1위 오답`;
      iconColor = '#F59E0B';
    } else if (rank === 2) {
      badgeBgBorder = "bg-neutral-outline/10 border-neutral-outline";
      badgeText = `실시간 2위 오답`;
      iconColor = '#CAC4D0';
    } else if (rank === 3) {
      badgeBgBorder = "bg-brand-rose/8 border-[#FB7185]";
      badgeText = `실시간 3위 오답`;
      iconColor = '#FB7185';
    }

    return (
      <View className={`rounded-2xl px-4 py-2 border-[1.5px] flex-row justify-between items-center my-1 shadow-sm ${badgeBgBorder}`}>
        <View className="flex-row items-center gap-1.5">
          <Trophy color={iconColor} size={16} fill={rank <= 3 ? iconColor : 'none'} />
          <Text className="text-tag-sub font-bold text-brand-purple">{badgeText}</Text>
        </View>
        {score !== undefined && (
          <Text className="text-tag-sub font-black text-neutral-slate">공감지수 {score}점</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView 
      className="flex-1"
      contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 24, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 실시간 랭킹용 뱃지 */}
      {renderRankBadge()}

      {/* [중앙 영역 : 시선 집중 구간] */}
      <View className="items-center justify-center min-h-[180px] relative my-2.5">
        <Text className="text-hero-hook scale-[2.2] font-bold text-brand-rose self-center -mb-4">“</Text>
        <Text className="text-hero-hook font-extrabold text-[#1D1B20] text-center px-3">{post.hook}</Text>

        {/* 인터랙션 (점진적 공개) 화살표 버튼 */}
        <TouchableOpacity
          className="mt-3.5 bg-white/80 border border-white/50 rounded-[20px] px-3.5 py-1.5 shadow-sm flex-row items-center gap-1"
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <BookOpen color="#21005D" size={14} />
          <Text className="text-tag-sub font-bold text-brand-purple">
            {isExpanded ? '사연 접기 ▲' : '사연 더보기 ▼'}
          </Text>
        </TouchableOpacity>

        {/* 3단계 상세 사연 아코디언 */}
        {isExpanded && (
          <View className="w-full mt-4">
            <NotebookPaper>
              <View className="w-full">
                <View className="flex-row items-center gap-1 mb-0.5">
                  <FileText color="#49454F" size={14} />
                  <Text className="text-tag-sub font-bold text-neutral-slate">[사건의 발단]</Text>
                </View>
                <Text className="text-body-text text-neutral-charcoal/90">{post.stepIntro}</Text>
              </View>
              <View className="w-full mt-3">
                <View className="flex-row items-center gap-1 mb-0.5">
                  <Zap color="#F43F5E" fill="#F43F5E" size={14} />
                  <Text className="text-tag-sub font-bold text-brand-rose">[클라이맥스]</Text>
                </View>
                <Text className="text-body-text font-semibold text-[#1D1B20]">
                  {post.stepClimax}
                </Text>
              </View>
              <View className="w-full mt-3">
                <View className="flex-row items-center gap-1 mb-0.5">
                  <Lightbulb color="#49454F" size={14} />
                  <Text className="text-tag-sub font-bold text-neutral-slate">[나의 대처]</Text>
                </View>
                <Text className="text-body-text text-neutral-charcoal/90">{post.stepAction}</Text>
              </View>
            </NotebookPaper>
          </View>
        )}
      </View>

      {/* [하단 영역 : Bento Grid 위젯 레이아웃] */}
      <View className="gap-3 mt-2.5">
        {/* Row 1: 타일 1 (좌측 프로필) & 타일 2 (우측 태그) */}
        <View className="flex-row gap-3">
          {/* 타일 1: 익명 프로필 */}
          <View className="rounded-[20px] p-3 border-[1.5px] border-white/50 bg-white/70 shadow-sm flex-[1.2] flex-row items-center">
            <View style={{ backgroundColor: getAvatarColor() }} className="w-8 h-8 rounded-full justify-center items-center">
              {getAvatar()}
            </View>
            <View className="ml-2 flex-1">
              <Text className="text-widget-title font-bold text-neutral-charcoal" numberOfLines={1}>
                {post.nickname}
              </Text>
              {post.isUserPost && (
                <View className="bg-brand-rose/20 rounded px-1 py-0.5 mt-0.5 self-start">
                  <Text className="text-tag-sub font-bold text-brand-rose scale-[0.8] origin-left">작성자</Text>
                </View>
              )}
            </View>
          </View>

          {/* 타일 2: 가로 스크롤 해시태그 모음 */}
          <View className="rounded-[20px] p-3 border-[1.5px] border-white/50 bg-white/70 shadow-sm flex-1 justify-center items-center">
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <View className="flex-row items-center gap-1.5">
                {post.tags.split(',').map((tag, idx) => {
                  if (!tag.trim()) return null;
                  return (
                    <View key={idx} className="bg-white rounded-lg px-2 py-1.5 border border-neutral-outline/20">
                      <Text className="text-tag-sub font-bold text-brand-yellow">{tag}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Row 2: 타일 3 (중앙 3D 입체 투표 버튼) */}
        <View className="rounded-[20px] p-3 border-[1.5px] border-white/50 bg-white/70 shadow-sm p-4">
          <Text className="text-widget-title font-bold text-neutral-charcoal mb-2.5">📊 이 상황, 누구 과실이 더 큰가요?</Text>
          
          <View className="flex-row h-20 gap-3">
            {/* Card A: 내가 오답 */}
            <View className="flex-1 h-full relative">
              <Animated.View style={{ transform: [{ rotateY: frontRotate }], opacity: frontOpacity }} className="w-full h-full absolute backface-hidden">
                <TouchableOpacity
                  className="w-full h-full rounded-2xl border-[1.5px] items-center justify-center bg-white border-neutral-outline"
                  onPress={() => handleVoteCardPress(true)}
                  activeOpacity={0.8}
                >
                  <Text className="text-body-text font-bold text-neutral-charcoal">내가 오답</Text>
                  <Text className="text-tag-sub text-neutral-slate mt-0.5">자책/후회</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={{ transform: [{ rotateY: backRotate }], opacity: backOpacity }} className="w-full h-full absolute backface-hidden top-0 left-0 right-0 bottom-0">
                <View className="w-full h-full rounded-2xl bg-bg-container border-[1.5px] border-neutral-outline items-center justify-center">
                  <Text className={`text-tag-sub text-neutral-slate scale-[0.9] ${post.userVoted === 1 ? 'font-bold' : ''}`}>
                    내가 오답{post.userVoted === 1 ? " (내 투표)" : ""}
                  </Text>
                  <Text className="text-hero-hook font-black text-neutral-charcoal">{authorPercent}%</Text>
                  <Text className="text-tag-sub text-neutral-slate scale-[0.8]">{post.voteAuthorFault}표</Text>
                </View>
              </Animated.View>
            </View>

            {/* Card B: 상대가 대오답 */}
            <View className="flex-1 h-full relative">
              <Animated.View style={{ transform: [{ rotateY: frontRotate }], opacity: frontOpacity }} className="w-full h-full absolute backface-hidden">
                <TouchableOpacity
                  className="w-full h-full rounded-2xl border-[1.5px] items-center justify-center bg-brand-rose/10 border-brand-rose/30"
                  onPress={() => handleVoteCardPress(false)}
                  activeOpacity={0.8}
                >
                  <Text className="text-body-text font-bold text-brand-rose">상대 오답</Text>
                  <Text className="text-tag-sub text-brand-rose mt-0.5">상대방 과실 100%</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={{ transform: [{ rotateY: backRotate }], opacity: backOpacity }} className="w-full h-full absolute backface-hidden top-0 left-0 right-0 bottom-0">
                <View className="w-full h-full rounded-2xl bg-[#FFD8E4] border-[1.5px] border-brand-rose/40 items-center justify-center">
                  <Text className={`text-tag-sub text-brand-rose scale-[0.9] ${post.userVoted === 2 ? 'font-bold' : ''}`}>
                    상대 오답{post.userVoted === 2 ? " (내 투표)" : ""}
                  </Text>
                  <Text className="text-hero-hook font-black text-brand-rose">{partnerPercent}%</Text>
                  <Text className="text-tag-sub text-brand-rose scale-[0.8]">{post.votePartnerFault}표</Text>
                </View>
              </Animated.View>
            </View>
          </View>
        </View>

        {/* Row 3: 타일 4 (최하단 액션 버튼 배치) */}
        <View className="flex-row gap-2">
          {/* 토닥토닥 공감 */}
          <TouchableOpacity
            className="flex-1 rounded-[20px] bg-white/70 border-[1.5px] border-white/50 flex-row items-center justify-center py-3 shadow-sm gap-1"
            onPress={onReactSympathy}
            activeOpacity={0.7}
          >
            <Heart
              color={post.userReactedSympathy ? '#F43F5E' : '#49454F'}
              fill={post.userReactedSympathy ? '#F43F5E' : 'none'}
              size={16}
            />
            <Text className={`text-tag-sub font-bold ${post.userReactedSympathy ? 'text-brand-rose font-bold' : 'text-neutral-slate'}`}>
              토닥 {post.sympathyCount}
            </Text>
          </TouchableOpacity>

          {/* 혈압상승 분노 */}
          <TouchableOpacity
            className="flex-1 rounded-[20px] bg-white/70 border-[1.5px] border-white/50 flex-row items-center justify-center py-3 shadow-sm gap-1"
            onPress={onReactAnger}
            activeOpacity={0.7}
          >
            <Flame
              color={post.userReactedAnger ? '#F59E0B' : '#49454F'}
              fill={post.userReactedAnger ? '#F59E0B' : 'none'}
              size={16}
            />
            <Text className={`text-tag-sub font-bold ${post.userReactedAnger ? 'text-amber-500 font-bold' : 'text-neutral-slate'}`}>
              뒷목 {post.angerCount}
            </Text>
          </TouchableOpacity>

          {/* 참견하기 댓글 */}
          <TouchableOpacity
            className="flex-1 rounded-[20px] bg-white/70 border-[1.5px] border-white/50 flex-row items-center justify-center py-3 shadow-sm gap-1"
            onPress={onOpenComments}
            activeOpacity={0.7}
          >
            <MessageCircle color="#49454F" size={16} />
            <Text className="text-tag-sub font-bold text-neutral-slate">참견하기</Text>
          </TouchableOpacity>

          {/* 공유하기 */}
          <TouchableOpacity
            className="flex-1 rounded-[20px] bg-white/70 border-[1.5px] border-white/50 flex-row items-center justify-center py-3 shadow-sm gap-1"
            activeOpacity={0.7}
          >
            <Share2 color="#49454F" size={16} />
            <Text className="text-tag-sub font-bold text-neutral-slate">공유</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// --- CommentItem Child Component ---
const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
  const isCoach = comment.nickname.includes("코치");
  const itemBgClass = isCoach ? 'bg-brand-rose/12 border-brand-rose/30' : 'bg-[#F7F2FA] border-neutral-outline/20';
  const nicknameColorClass = isCoach ? 'text-brand-rose' : 'text-amber-500';

  return (
    <View className={`rounded-2xl border p-3 mb-3 ${itemBgClass}`}>
      <View className="flex-row justify-between items-center mb-1">
        <Text className={`text-body-text font-bold ${nicknameColorClass}`}>
          {comment.nickname}
        </Text>
        <Text className="text-tag-sub text-neutral-slate">참견</Text>
      </View>
      <Text className="text-body-text text-neutral-charcoal">{comment.text}</Text>
    </View>
  );
};

export default FeedScreen;
