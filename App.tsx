import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { Flame, PenTool, User } from 'lucide-react-native';

import { useStore } from '@store/useStore';
import { useToastStore } from '@store/useToastStore';
import FeedScreen from '@screens/feed/FeedScreen';
import WriteScreen from '@screens/write/WriteScreen';
import MyScreen from '@screens/my/MyScreen';
import LoginScreen from '@screens/login/LoginScreen';

// Types for Navigation Param Lists
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Write: undefined;
  My: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// --- Custom Tab Bar Component ---
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <SafeAreaView
      edges={['bottom']}
      className="bg-white border-t border-neutral-outline/30 shadow-lg"
    >
      <View className="flex-row h-14 items-center">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Lucide icons and labels for each tab item
          let IconComponent: React.ComponentType<any> = Flame;
          let labelText = '';
          if (route.name === 'Feed') {
            IconComponent = Flame;
            labelText = '오답 피드';
          } else if (route.name === 'Write') {
            IconComponent = PenTool;
            labelText = '노트 작성';
          } else if (route.name === 'My') {
            IconComponent = User;
            labelText = '내 정보';
          }

          const iconColor = isFocused ? '#F43F5E' : '#49454F';
          const iconSize = isFocused ? 22 : 20;
          const labelColorClass = isFocused
            ? 'text-brand-rose'
            : 'text-neutral-slate';

          return (
            <TouchableOpacity
              key={route.key}
              className="flex-1 items-center justify-center py-1.5"
              onPress={onPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <View className="mb-0.5">
                <IconComponent color={iconColor} size={iconSize} />
              </View>
              <Text className={`text-tag-sub font-bold ${labelColorClass}`}>
                {labelText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// --- Tab Navigator Group ---
function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={CustomTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Write" component={WriteScreen} />
      <Tab.Screen name="My" component={MyScreen} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const session = useStore(state => state.session);
  const initializeAuth = useStore(state => state.initializeAuth);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  return (
    <View className="flex-1 bg-bg-lavender">
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="#FEF7FF"
      />

      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!session ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <Stack.Screen name="Main" component={MainTabNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Floating toast overlay */}
      <ToastNotification />
    </View>
  );
}

const ToastNotification: React.FC = () => {
  const toastMessage = useToastStore(state => state.toastMessage);
  const clearToast = useToastStore(state => state.clearToast);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <View
      className="absolute left-5 right-5 bottom-[90px] items-center z-[9999]"
      pointerEvents="none"
    >
      <View className="bg-[#31111D] rounded-[24px] px-5 py-3 shadow-md">
        <Text className="text-white text-[13px] font-bold text-center">
          {toastMessage}
        </Text>
      </View>
    </View>
  );
};

export default function App() {
  return <AppContent />;
}
