import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Sparkles,
  RefreshCw,
  Pin,
  FileText,
  Zap,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react-native';
import { useWriteStore } from './useWriteStore';

export const WriteScreen: React.FC = () => {
  const {
    draftIntro,
    draftClimax,
    draftAction,
    selectedTags,
    draftNickname,
    generateRandomNickname,
    updateDraftIntro,
    updateDraftClimax,
    updateDraftAction,
    toggleTag,
    submitPost,
  } = useWriteStore();

  useEffect(() => {
    if (!draftNickname) {
      generateRandomNickname();
    }
  }, [draftNickname, generateRandomNickname]);

  const availableTags = [
    '#회피형_잠수함',
    '#가성비_집착러',
    '#눈물의_가스라이팅',
    '#환승이별_장인',
    '#질투의_화신',
    '#전애인_염탐러',
    '#소심끝판왕',
    '#연락두절_잠수교',
    '#비밀번호_털이범',
    '#유령_이별',
  ];

  // Rotation animation for nickname refresh
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const handleRefreshNickname = () => {
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
    generateRandomNickname();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView className="flex-1 bg-bg-lavender">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Heading Banner */}
          <View className="bg-white rounded-[24px] border border-neutral-outline/20 p-4 mb-4">
            <View className="flex-row items-start">
              <View className="mr-3 mt-0.5">
                <Sparkles color="#F59E0B" size={24} fill="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-logo-title font-bold text-neutral-charcoal">
                  구조화된 연애 오답노트 적기
                </Text>
                <Text className="text-tag-sub text-neutral-slate mt-1">
                  줄글 대신 3단계 양식으로 적어 가독성을 높입니다. AI 분석을
                  실행하면 실명/회사 등이 마스킹 처리되고, 오답 훈수 코멘트가
                  자동 발행됩니다.
                </Text>
              </View>
            </View>
          </View>

          {/* Pseudo-Anonymous Nickname Combination */}
          <View className="bg-white rounded-[24px] border border-neutral-outline/15 p-4 flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-tag-sub text-neutral-slate">
                임시 부여된 닉네임
              </Text>
              <Text className="text-logo-title font-bold text-brand-rose mt-0.5">
                {draftNickname}
              </Text>
            </View>
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-[#F7F2FA] justify-center items-center"
              onPress={handleRefreshNickname}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <RefreshCw color="#21005D" size={16} />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Structured 3 Steps */}
          <View className="mb-4">
            {/* Step 1 */}
            <OhdabInputField
              label="1단계: [사건의 발단]"
              placeholder="예: 연애한 지 200일쯤 되었을 때, 갑자기 상대가 사소한 연락에도 짜증을 부리기 시작하더니..."
              value={draftIntro}
              onChangeText={updateDraftIntro}
              IconComponent={FileText}
              iconColor="#49454F"
            />

            {/* Step 2 */}
            <OhdabInputField
              label="2단계: [클라이맥스]"
              placeholder="예: 갑자기 약속을 일방적으로 파토 내고 잠수를 타더니 일주일 뒤 멀쩡히 프사가 바뀌었습니다."
              value={draftClimax}
              onChangeText={updateDraftClimax}
              IconComponent={Zap}
              iconColor="#F43F5E"
            />

            {/* Step 3 */}
            <OhdabInputField
              label="3단계: [나의 대처]"
              placeholder="예: 내가 무슨 잘못을 했나 밤새 자책하면서 부재중 전화를 10통 남기고 매달렸어요."
              value={draftAction}
              onChangeText={updateDraftAction}
              IconComponent={Lightbulb}
              iconColor="#49454F"
            />
          </View>

          {/* Tag Selector */}
          <View className="flex-row items-center gap-1.5 mb-2.5">
            <Pin color="#21005D" size={14} />
            <Text className="text-body-text font-bold text-neutral-charcoal">
              필수 오답 태그 선택 (중복 가능)
            </Text>
          </View>
          <View className="flex-row flex-wrap mb-4">
            {availableTags.map(tag => {
              const isSelected = selectedTags.has(tag);
              const tagBgClass = isSelected
                ? 'bg-brand-rose'
                : 'bg-[#F7F2FA] border border-neutral-outline/20';
              const tagTextClass = isSelected
                ? 'text-white'
                : 'text-neutral-slate';

              return (
                <TouchableOpacity
                  key={tag}
                  className={`py-2.5 px-3 rounded-xl mr-1.5 mb-2 items-center justify-center min-w-[31%] ${tagBgClass}`}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.8}
                >
                  <Text className={`text-tag-sub font-bold ${tagTextClass}`}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Register Submit Button */}
          <TouchableOpacity
            className="bg-brand-rose rounded-2xl py-[15px] items-center justify-center flex-row gap-1.5"
            onPress={submitPost}
            activeOpacity={0.8}
          >
            <CheckCircle2 color="#FFFFFF" size={16} />
            <Text className="text-logo-title font-bold text-white">
              오답노트 등록하기
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- OhdabInputField Child Component ---
interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (val: string) => void;
  IconComponent?: React.ComponentType<any>;
  iconColor?: string;
}

const OhdabInputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  IconComponent,
  iconColor,
}) => {
  return (
    <View className="mb-3.5">
      <View className="flex-row items-center gap-1.5 mb-1.5">
        {IconComponent && (
          <IconComponent color={iconColor || '#21005D'} size={14} />
        )}
        <Text className="text-body-text font-semibold text-neutral-charcoal">
          {label}
        </Text>
      </View>
      <TextInput
        className="bg-white border border-neutral-outline/30 rounded-xl h-[100px] px-3 py-2.5 text-body-text text-neutral-charcoal"
        placeholder={placeholder}
        placeholderTextColor="rgba(73, 69, 79, 0.4)"
        multiline={true}
        numberOfLines={4}
        value={value}
        onChangeText={onChangeText}
        textAlignVertical="top"
      />
    </View>
  );
};

export default WriteScreen;
