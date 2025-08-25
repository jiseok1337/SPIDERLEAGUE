import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { demoApiService as apiService } from '../services/demo-api';
import { User, League } from '../types';

interface HomeScreenProps {
  user: User;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function HomeScreen({ user, onNavigate, onLogout }: HomeScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [league, setLeague] = useState<League | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [leagueResponse, statsResponse] = await Promise.all([
        apiService.getLeague(user.region),
        apiService.getUserStats(),
      ]);
      setLeague(leagueResponse.league);
      setStats(statsResponse);
    } catch (error: any) {
      console.error('Failed to load data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getRankColor = (rank: string) => {
    const colors: { [key: string]: string } = {
      'Bronze': '#cd7f32',
      'Silver': '#c0c0c0',
      'Gold': '#ffd700',
      'Platinum': '#e5e4e2',
      'Diamond': '#b9f2ff',
      'Master': '#ff6b35',
    };
    return colors[rank] || '#cccccc';
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>🕷️ Spider League</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* User Profile Card */}
      <View style={styles.profileCard}>
        <Text style={styles.username}>{user.username}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.rankText, { color: getRankColor(user.rank) }]}>
              {user.rank}
            </Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.eloRating}</Text>
            <Text style={styles.statLabel}>ELO Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>
        <View style={styles.battleStats}>
          <Text style={styles.battleText}>
            {user.wins}W • {user.losses}L • {user.totalBattles} Total Battles
          </Text>
        </View>
      </View>

      {/* League Info */}
      {league && (
        <View style={styles.leagueCard}>
          <Text style={styles.cardTitle}>{league.name}</Text>
          <Text style={styles.leagueDescription}>{league.description}</Text>
          <View style={styles.leagueStats}>
            <Text style={styles.leagueText}>
              Rank #{league.userPosition} of {league.totalPlayers} players
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.leagueButton}
            onPress={() => onNavigate('leaderboard')}
          >
            <Text style={styles.leagueButtonText}>View Leaderboard</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Stats */}
      {stats && (
        <View style={styles.quickStats}>
          <Text style={styles.cardTitle}>Your Collection</Text>
          <View style={styles.statsGrid}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{stats.spiderStats.total}</Text>
              <Text style={styles.quickStatLabel}>Spiders</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{stats.spiderStats.avgPowerLevel}</Text>
              <Text style={styles.quickStatLabel}>Avg Power</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{stats.battleStats.longestWinStreak}</Text>
              <Text style={styles.quickStatLabel}>Win Streak</Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => onNavigate('camera')}
        >
          <Text style={styles.actionButtonText}>📸 Capture Spider</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => onNavigate('collection')}
          >
            <Text style={styles.secondaryButtonText}>🕸️ Collection</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => onNavigate('battle')}
          >
            <Text style={styles.secondaryButtonText}>⚔️ Battle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#ff6b35',
    fontSize: 16,
  },
  profileCard: {
    backgroundColor: '#2a2a2a',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 4,
  },
  battleStats: {
    alignItems: 'center',
  },
  battleText: {
    color: '#cccccc',
    fontSize: 14,
  },
  leagueCard: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  leagueDescription: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 12,
  },
  leagueStats: {
    marginBottom: 12,
  },
  leagueText: {
    color: '#ff6b35',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leagueButton: {
    backgroundColor: '#3a3a3a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  leagueButtonText: {
    color: '#ff6b35',
    fontWeight: 'bold',
  },
  quickStats: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 4,
  },
  actionButtons: {
    padding: 20,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#ff6b35',
  },
  secondaryButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    flex: 1,
    marginHorizontal: 6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#ff6b35',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
  },
});