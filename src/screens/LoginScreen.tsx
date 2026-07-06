import React from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Heart } from 'lucide-react-native';
import { useOhdabViewModel } from '../hooks/useOhdabViewModel';

export const LoginScreen: React.FC = () => {
  const {
    signInWithGoogle,
    signInWithApple
  } = useOhdabViewModel();

  return (
    <SafeAreaView className="flex-1 bg-[#C2C4F2] justify-center items-center p-6">
      <View className="bg-[#E9EAF7] rounded-[36px] p-8 w-full max-w-[340px] items-center shadow-lg">

        {/* Envelope with Heart Logo badge */}
        <View className="mb-8 relative items-center justify-center h-14 w-14">
          <Mail color="#21005D" size={48} strokeWidth={1.5} />
          <View className="absolute bottom-[-2px] right-[-2px] bg-[#E9EAF7] rounded-full p-0.5 shadow-sm">
            <Heart color="#F43F5E" fill="#F43F5E" size={16} />
          </View>
        </View>

        {/* Multi-line Title header */}
        <View className="mb-6 items-center justify-center h-24">
          <Text className="text-hero-hook font-black text-brand-purple text-center scale-[1.5] leading-7">
            오답연애{"\n"}오답노트
          </Text>
        </View>

        {/* Subtext description */}
        <Text className="text-widget-title text-neutral-slate text-center mb-8">
          사소한 오해부터 아찔한 흑역사까지,{"\n"}나만의 오답노트를 안전하게 기록해보세요.
        </Text>

        {/* Google Button */}
        <TouchableOpacity
          className="w-full h-14 rounded-full flex-row items-center justify-center bg-white border border-[#E2E8F0] shadow-sm mb-3 px-4"
          onPress={signInWithGoogle}
          activeOpacity={0.8}
        >
          <Text className="text-logo-title font-bold text-[#4285F4] mr-2">G</Text>
          <Text className="text-body-text font-bold text-slate-800">Google로 계속하기</Text>
        </TouchableOpacity>

        {/* Apple Button */}
        <TouchableOpacity
          className="w-full h-14 rounded-full flex-row items-center justify-center bg-black shadow-sm px-4"
          onPress={signInWithApple}
          activeOpacity={0.8}
        >
          <Text className="text-logo-title text-white mr-2"></Text>
          <Text className="text-body-text font-bold text-white">Apple로 계속하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
