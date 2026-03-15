import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';

import HomeScreen from './src/screens/HomeScreen';
import PlatformScreen from './src/screens/PlatformScreen';
import AddReportScreen from './src/screens/AddReportScreen';
import RecordDetailsScreen from './src/screens/RecordDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6C63FF',
    background: '#1a1a2e',
    card: '#16213e',
    text: '#ffffff',
    border: '#0f3460',
  },
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Phones') {
            iconName = focused ? 'call' : 'call-outline';
          } else if (route.name === 'Instagram') {
            iconName = focused ? 'logo-instagram' : 'logo-instagram';
          } else if (route.name === 'WhatsApp') {
            iconName = focused ? 'logo-whatsapp' : 'logo-whatsapp';
          } else if (route.name === 'Telegram') {
            iconName = focused ? 'paper-plane' : 'paper-plane-outline';
          } else if (route.name === 'Add') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#16213e',
          borderTopColor: '#0f3460',
        },
        headerStyle: {
          backgroundColor: '#16213e',
        },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ title: 'Главная', headerShown: false }}
      />
      <Tab.Screen 
        name="Phones" 
        options={{ title: 'Телефоны' }}
      >
        {() => <PlatformScreen platform="phone" />}
      </Tab.Screen>
      <Tab.Screen 
        name="Add" 
        component={AddReportScreen} 
        options={{ 
          title: 'Добавить',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#6C63FF',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              shadowColor: '#6C63FF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <Ionicons name="add" size={32} color="#fff" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen 
        name="Instagram" 
        options={{ title: 'Instagram' }}
      >
        {() => <PlatformScreen platform="instagram" />}
      </Tab.Screen>
      <Tab.Screen 
        name="WhatsApp" 
        options={{ title: 'WhatsApp' }}
      >
        {() => <PlatformScreen platform="whatsapp" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isLoading, t } = useLanguage();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#16213e' },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={HomeTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="RecordDetails" 
          component={RecordDetailsScreen}
          options={{ title: t('recordDetails.comments') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
