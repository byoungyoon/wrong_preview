import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '@store/useStore';
import GoogleLoginAction from './_action/GoogleLogin.action';
import AppleIcon from './_component/AppleIcon';

export const LoginScreen: React.FC = () => {
  const signInWithApple = useStore(state => state.signInWithApple);

  return (
    <SafeAreaView className="flex-1 bg-[#FAF9FE] justify-between items-center">
      <View className="w-full px-6 pt-16 items-center">
        <Text className="text-[42px] font-black text-[#21005D] tracking-wider mb-5">
          오답연애
        </Text>
        <Text className="text-[14px] text-neutral-slate/80 text-center font-medium leading-6">
          사소한 오해부터 아찔한 흑역사까지,{'\n'}나만의 오답노트를 안전하게
          기록해보세요.
        </Text>
      </View>

      <View className="flex-1" />

      <View className="w-full px-8 pb-12 items-center">
        <GoogleLoginAction />

        <TouchableOpacity
          className="w-full max-w-[310px] h-[56px] rounded-full flex-row items-center justify-center bg-[#111111] shadow-md mb-8 px-6"
          onPress={signInWithApple}
          activeOpacity={0.8}
        >
          <View className="mr-3">
            <AppleIcon />
          </View>
          <Text className="text-[15px] font-bold text-white">
            Apple로 계속하기
          </Text>
        </TouchableOpacity>

        <Text className="text-[11px] text-neutral-slate/40 text-center font-normal px-4 leading-4">
          로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
