import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { apiService } from './src/services/api';
import { demoApiService as apiService } from './src/services/demo-api';
import { User, Spider } from './src/types';
import LoadingOverlay from './src/components/LoadingOverlay';
import { colors } from './src/theme';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import DemoCameraScreen from './src/screens/DemoCameraScreen';
import CollectionScreen from './src/screens/CollectionScreen';

type Screen = 'login' | 'register' | 'home' | 'camera' | 'collection' | 'battle' | 'leaderboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await apiService.initialize();
      
      // Demo mode - skip token check
      // const token = await AsyncStorage.getItem('token');
      // if (token) {
      //   try {
      //     const response = await apiService.verifyToken();
      //     setUser(response.user);
      //     setCurrentScreen('home');
      //   } catch (error) {
      //     await AsyncStorage.removeItem('token');
      //   }
      // }
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentScreen('home');
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    setCurrentScreen('home');
  };

  const handleLogout = async () => {
    await apiService.logout();
    setUser(null);
    setCurrentScreen('login');
  };

  const handleNavigation = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleSpiderCapture = (spider: Spider) => {
    Alert.alert(
      'Spider Added to Collection! 🕷️',
      `${spider.name} has been added to your collection.`,
      [
        { text: 'View Collection', onPress: () => setCurrentScreen('collection') },
        { text: 'Capture More', onPress: () => setCurrentScreen('camera') },
        { text: 'Go Home', onPress: () => setCurrentScreen('home') },
      ]
    );
  };

  const handleSpiderSelect = (spider: Spider) => {
    Alert.alert(
      spider.name,
      `${spider.commonName}\nPower Level: ${spider.powerLevel}\nRarity: ${spider.rarity}\n\nStats:\n⚔️ Attack: ${spider.stats.attack}\n🛡️ Defense: ${spider.stats.defense}\n⚡ Speed: ${spider.stats.speed}\n❤️ Health: ${spider.stats.health}`,
      [{ text: 'Close' }]
    );
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            onSwitchToRegister={() => setCurrentScreen('register')}
          />
        );
      
      case 'register':
        return (
          <RegisterScreen
            onRegister={handleRegister}
            onSwitchToLogin={() => setCurrentScreen('login')}
          />
        );
      
      case 'home':
        return user ? (
          <HomeScreen
            user={user}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
          />
        ) : null;
      
      case 'camera':
        return (
          <DemoCameraScreen
            onCapture={handleSpiderCapture}
            onBack={() => setCurrentScreen('home')}
          />
        );
      
      case 'collection':
        return (
          <CollectionScreen
            onBack={() => setCurrentScreen('home')}
            onSpiderSelect={handleSpiderSelect}
          />
        );
      
      case 'battle':
        // TODO: Implement battle screen
        Alert.alert('Battle System', 'Battle system coming soon! 🚧');
        setCurrentScreen('home');
        return null;
      
      case 'leaderboard':
        // TODO: Implement leaderboard screen
        Alert.alert('Leaderboard', 'Leaderboard coming soon! 🏆');
        setCurrentScreen('home');
        return null;
      
      default:
        return (
          <HomeScreen
            user={user!}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
