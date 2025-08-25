import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Spider, Battle, League } from '../types';

const BASE_URL = 'http://localhost:3000/api';

class ApiService {
  private token: string | null = null;

  async initialize() {
    this.token = await AsyncStorage.getItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = response.token;
    await AsyncStorage.setItem('token', response.token);
    return response;
  }

  async register(username: string, email: string, password: string, region = 'arizona'): Promise<{ user: User; token: string }> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, region }),
    });

    this.token = response.token;
    await AsyncStorage.setItem('token', response.token);
    return response;
  }

  async verifyToken(): Promise<{ user: User }> {
    return await this.request('/auth/verify');
  }

  async logout() {
    this.token = null;
    await AsyncStorage.removeItem('token');
  }

  // Spiders
  async captureSpider(imageUri: string, latitude?: number, longitude?: number, address?: string): Promise<{ spider: Spider }> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'spider.jpg',
    } as any);

    if (latitude) formData.append('latitude', latitude.toString());
    if (longitude) formData.append('longitude', longitude.toString());
    if (address) formData.append('address', address);

    const response = await fetch(`${BASE_URL}/spiders/capture`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Spider capture failed');
    }

    return await response.json();
  }

  async getSpiderCollection(): Promise<{ spiders: Spider[] }> {
    return await this.request('/spiders/collection');
  }

  async getSpider(spiderId: string): Promise<{ spider: Spider }> {
    return await this.request(`/spiders/${spiderId}`);
  }

  async setSpiderActive(spiderId: string, active: boolean): Promise<{ spider: Spider }> {
    return await this.request(`/spiders/${spiderId}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
  }

  async renameSpider(spiderId: string, name: string): Promise<{ spider: Spider }> {
    return await this.request(`/spiders/${spiderId}/name`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  }

  // Battles
  async findMatch(spiderId: string): Promise<{ battle: Battle }> {
    return await this.request('/battles/find-match', {
      method: 'POST',
      body: JSON.stringify({ spiderId }),
    });
  }

  async startBattle(battleId: string): Promise<{ battle: Battle }> {
    return await this.request(`/battles/${battleId}/start`, {
      method: 'POST',
    });
  }

  async executeBattleAction(battleId: string, action: 'attack' | 'defend' | 'special'): Promise<any> {
    return await this.request(`/battles/${battleId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async getBattle(battleId: string): Promise<{ battle: Battle }> {
    return await this.request(`/battles/${battleId}`);
  }

  // Users
  async getUserProfile(): Promise<{ profile: User }> {
    return await this.request('/users/profile');
  }

  async updateProfile(updates: { avatar?: string; region?: string }): Promise<{ profile: User }> {
    return await this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getLeaderboard(region = 'arizona', limit = 50): Promise<any> {
    return await this.request(`/users/leaderboard?region=${region}&limit=${limit}`);
  }

  async getBattleHistory(page = 1, limit = 20): Promise<any> {
    return await this.request(`/users/battles?page=${page}&limit=${limit}`);
  }

  async getUserStats(): Promise<any> {
    return await this.request('/users/stats');
  }

  // Leagues
  async getLeague(region: string): Promise<{ league: League }> {
    return await this.request(`/leagues/${region}`);
  }

  async joinLeague(region: string): Promise<{ user: User }> {
    return await this.request(`/leagues/${region}/join`, {
      method: 'POST',
    });
  }

  async getLeagueRankings(region: string, page = 1, limit = 50): Promise<any> {
    return await this.request(`/leagues/${region}/rankings?page=${page}&limit=${limit}`);
  }

  async getLeagueActivity(region: string, limit = 20): Promise<any> {
    return await this.request(`/leagues/${region}/activity?limit=${limit}`);
  }
}

export const apiService = new ApiService();