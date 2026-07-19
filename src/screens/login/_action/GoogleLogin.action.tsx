import React from 'react';
import { Text, TouchableOpacity, View, Linking } from 'react-native';
import GoogleIcon from '../_component/GoogleIcon';
import { supabase } from '@api/supabaseClient';
import { useToastStore } from '@store/useToastStore';
import { useStore } from '@store/useStore';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';

export default function GoogleLoginAction() {
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
        if (await InAppBrowser.isAvailable()) {
          const result = await InAppBrowser.openAuth(
            data.url,
            'wrongpreview://login-callback',
            {
              ephemeralWebSession: false,
              showTitle: false,
              enableUrlBarHiding: true,
              enableDefaultShare: false,
            },
          );

          if (result.type === 'success' && result.url) {
            await useStore.getState().handleOpenURL(result.url);
          }
        } else {
          await Linking.openURL(data.url);
        }
      }
    } catch (e: any) {
      console.error('Google Sign In Error:', e.message);

      useToastStore.getState().showToast('구글 로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <TouchableOpacity
      className="w-full max-w-[310px] h-[56px] rounded-full flex-row items-center justify-center bg-white border border-[#E2E8F0] shadow-sm mb-3.5 px-6"
      onPress={signInWithGoogle}
      activeOpacity={0.8}
    >
      <View className="mr-3">
        <GoogleIcon />
      </View>
      <Text className="text-[15px] font-bold text-slate-800">
        Google로 계속하기
      </Text>
    </TouchableOpacity>
  );
}
