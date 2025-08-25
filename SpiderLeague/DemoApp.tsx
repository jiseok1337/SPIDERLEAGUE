import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Alert } from 'react-native';

// Mock data for demo
const mockUser = {
  id: '1',
  username: 'SpiderHunter',
  email: 'demo@spiderleague.com',
  region: 'arizona',
  eloRating: 1347,
  rank: 'Silver',
  totalBattles: 12,
  wins: 8,
  losses: 4,
  winRate: 67,
  spidersCollected: 15,
  activeSpiders: []
};

const mockSpiders = [
  {
    id: '1',
    name: 'Desert Widow #247',
    species: 'black-widow',
    commonName: 'Black Widow',
    scientificName: 'Latrodectus mactans',
    powerLevel: 145,
    rarity: 'epic' as const,
    size: { category: 'medium' as const },
    confidence: 92,
    captureDate: new Date().toISOString(),
    isActive: true,
    level: 3,
    experience: 150,
    battlesWon: 3,
    battlesLost: 1,
    winRate: 75,
    stats: { attack: 36, defense: 29, speed: 44, health: 58 },
    image: 'data:image/jpeg;base64,demo'
  },
  {
    id: '2',
    name: 'Jumper #891',
    species: 'jumping-spider',
    commonName: 'Jumping Spider',
    scientificName: 'Phidippus audax',
    powerLevel: 67,
    rarity: 'common' as const,
    size: { category: 'small' as const },
    confidence: 87,
    captureDate: new Date().toISOString(),
    isActive: false,
    level: 1,
    experience: 20,
    battlesWon: 0,
    battlesLost: 0,
    winRate: 0,
    stats: { attack: 17, defense: 13, speed: 20, health: 27 },
    image: 'data:image/jpeg;base64,demo'
  }
];

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import CollectionScreen from './src/screens/CollectionScreen';

type Screen = 'login' | 'register' | 'home' | 'camera' | 'collection' | 'battle' | 'leaderboard';

export default function DemoApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState(mockUser);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentScreen('home');
    Alert.alert('Demo Login', 'Successfully logged in with demo data! 🕷️');
  };

  const handleRegister = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentScreen('home');
    Alert.alert('Demo Register', 'Successfully registered with demo data! Welcome to Spider League! 🕷️');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('login');
    Alert.alert('Demo Logout', 'Logged out of demo mode');
  };

  const handleNavigation = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleSpiderCapture = (spider: any) => {
    Alert.alert(
      'Demo Spider Captured! 🕷️',
      `You found a ${spider?.commonName || 'Desert Spider'}!\nPower Level: ${Math.floor(Math.random() * 200) + 50}\nRarity: ${['common', 'uncommon', 'rare', 'epic'][Math.floor(Math.random() * 4)]}`,
      [
        { text: 'View Collection', onPress: () => setCurrentScreen('collection') },
        { text: 'Capture More', onPress: () => setCurrentScreen('camera') },
        { text: 'Go Home', onPress: () => setCurrentScreen('home') },
      ]
    );
  };

  const handleSpiderSelect = (spider: any) => {
    Alert.alert(
      spider.name,
      `${spider.commonName}\nPower Level: ${spider.powerLevel}\nRarity: ${spider.rarity}\n\nStats:\n⚔️ Attack: ${spider.stats.attack}\n🛡️ Defense: ${spider.stats.defense}\n⚡ Speed: ${spider.stats.speed}\n❤️ Health: ${spider.stats.health}`,
      [{ text: 'Close' }]
    );
  };

  // Mock API service for demo
  const mockApiService = {
    login: async () => ({ user: mockUser, token: 'demo-token' }),
    register: async () => ({ user: mockUser, token: 'demo-token' }),
    getSpiderCollection: async () => ({ spiders: mockSpiders }),
    getUserStats: async () => ({
      userStats: mockUser,
      spiderStats: {
        total: mockSpiders.length,
        avgPowerLevel: 106,
        strongestSpider: mockSpiders[0]
      },
      battleStats: {
        recentWins: 3,
        recentLosses: 1,
        longestWinStreak: 3
      }
    }),
    getLeague: async () => ({
      league: {
        region: 'arizona',
        name: 'Arizona Desert League',
        description: 'Battle with desert spiders in the harsh Arizona wilderness',
        totalPlayers: 247,
        userPosition: 23
      }
    })
  };

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
        return isLoggedIn ? (
          <HomeScreen
            user={user}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
          />
        ) : null;
      
      case 'camera':
        return (
          <CameraScreen
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
        Alert.alert('Demo Battle System', 'Battle system would connect players for real-time combat! ⚔️\n\n• Find opponents by ELO rating\n• Real-time RNG-based combat\n• Attack, Defend, Special abilities\n• ELO updates after battle');
        setCurrentScreen('home');
        return null;
      
      case 'leaderboard':
        Alert.alert('Demo Leaderboard', 'Arizona Desert League Rankings! 🏆\n\n1. DesertKing - 1847 ELO\n2. SpiderMaster - 1623 ELO\n3. ArizonaAce - 1456 ELO\n...\n23. SpiderHunter - 1347 ELO (You)');
        setCurrentScreen('home');
        return null;
      
      default:
        return isLoggedIn ? (
          <HomeScreen
            user={user}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
          />
        ) : null;
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
    backgroundColor: '#1a1a1a',
  },
});