// Demo API service that works without backend
import { User, Spider, Battle, League } from '../types';

// Mock data
const mockUsers: User[] = [
  {
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
  }
];

const mockSpiders: Spider[] = [
  {
    id: '1',
    name: 'Desert Widow #247',
    species: 'black-widow',
    commonName: 'Black Widow',
    scientificName: 'Latrodectus mactans',
    powerLevel: 145,
    rarity: 'epic',
    size: { estimated: 15, category: 'medium' },
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
    rarity: 'common',
    size: { estimated: 8, category: 'small' },
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
  },
  {
    id: '3',
    name: 'Desert Tarantula #001',
    species: 'tarantula',
    commonName: 'Desert Tarantula',
    scientificName: 'Aphonopelma chalcodes',
    powerLevel: 220,
    rarity: 'legendary',
    size: { estimated: 45, category: 'giant' },
    confidence: 95,
    captureDate: new Date().toISOString(),
    isActive: true,
    level: 5,
    experience: 400,
    battlesWon: 7,
    battlesLost: 1,
    winRate: 88,
    stats: { attack: 55, defense: 44, speed: 66, health: 88 },
    image: 'data:image/jpeg;base64,demo'
  }
];

class DemoApiService {
  private token: string | null = null;

  async initialize() {
    // Demo initialization
    return Promise.resolve();
  }

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const user = mockUsers[0];
    this.token = 'demo-token';
    
    return { user, token: this.token };
  }

  async register(username: string, email: string, password: string, region = 'arizona'): Promise<{ user: User; token: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const user = { ...mockUsers[0], username, email };
    this.token = 'demo-token';
    
    return { user, token: this.token };
  }

  async verifyToken(): Promise<{ user: User }> {
    return { user: mockUsers[0] };
  }

  async logout() {
    this.token = null;
  }

  // Spiders
  async captureSpider(imageUri: string, latitude?: number, longitude?: number, address?: string): Promise<{ spider: Spider }> {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI analysis

    const spiderTypes = [
      { species: 'black-widow', commonName: 'Black Widow', scientificName: 'Latrodectus mactans', rarity: 'epic' as const },
      { species: 'jumping-spider', commonName: 'Jumping Spider', scientificName: 'Phidippus audax', rarity: 'common' as const },
      { species: 'wolf-spider', commonName: 'Wolf Spider', scientificName: 'Lycosidae family', rarity: 'uncommon' as const },
      { species: 'tarantula', commonName: 'Desert Tarantula', scientificName: 'Aphonopelma chalcodes', rarity: 'legendary' as const }
    ];

    const randomSpider = spiderTypes[Math.floor(Math.random() * spiderTypes.length)];
    const powerLevel = Math.floor(Math.random() * 200) + 50;
    
    const spider: Spider = {
      id: Date.now().toString(),
      name: `${randomSpider.commonName} #${Math.floor(Math.random() * 1000)}`,
      species: randomSpider.species,
      commonName: randomSpider.commonName,
      scientificName: randomSpider.scientificName,
      powerLevel,
      rarity: randomSpider.rarity,
      size: { 
        estimated: Math.floor(Math.random() * 40) + 5,
        category: ['tiny', 'small', 'medium', 'large', 'giant'][Math.floor(Math.random() * 5)] as any
      },
      confidence: 80 + Math.floor(Math.random() * 20),
      captureDate: new Date().toISOString(),
      isActive: false,
      level: 1,
      experience: 0,
      battlesWon: 0,
      battlesLost: 0,
      winRate: 0,
      stats: {
        attack: Math.floor(powerLevel * 0.25),
        defense: Math.floor(powerLevel * 0.2),
        speed: Math.floor(powerLevel * 0.3),
        health: Math.floor(powerLevel * 0.4)
      },
      image: 'data:image/jpeg;base64,demo'
    };

    return { spider };
  }

  async getSpiderCollection(): Promise<{ spiders: Spider[] }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { spiders: mockSpiders };
  }

  async getSpider(spiderId: string): Promise<{ spider: Spider }> {
    const spider = mockSpiders.find(s => s.id === spiderId) || mockSpiders[0];
    return { spider };
  }

  async setSpiderActive(spiderId: string, active: boolean): Promise<{ spider: Spider }> {
    const spider = mockSpiders.find(s => s.id === spiderId) || mockSpiders[0];
    spider.isActive = active;
    return { spider };
  }

  async renameSpider(spiderId: string, name: string): Promise<{ spider: Spider }> {
    const spider = mockSpiders.find(s => s.id === spiderId) || mockSpiders[0];
    spider.name = name;
    return { spider };
  }

  // Users
  async getUserProfile(): Promise<{ profile: User }> {
    const user = mockUsers[0];
    user.activeSpiders = mockSpiders.filter(s => s.isActive);
    return { profile: user };
  }

  async getUserStats(): Promise<any> {
    return {
      userStats: mockUsers[0],
      spiderStats: {
        total: mockSpiders.length,
        avgPowerLevel: Math.round(mockSpiders.reduce((sum, s) => sum + s.powerLevel, 0) / mockSpiders.length),
        strongestSpider: mockSpiders.reduce((strongest, spider) => 
          spider.powerLevel > strongest.powerLevel ? spider : strongest
        )
      },
      battleStats: {
        recentWins: 5,
        recentLosses: 2,
        avgBattleDuration: 45,
        longestWinStreak: 3
      }
    };
  }

  async getLeaderboard(region = 'arizona', limit = 50): Promise<any> {
    return {
      leaderboard: [
        { position: 1, username: 'DesertKing', eloRating: 1847, rank: 'Diamond', winRate: 78 },
        { position: 2, username: 'SpiderMaster', eloRating: 1623, rank: 'Platinum', winRate: 72 },
        { position: 3, username: 'ArizonaAce', eloRating: 1456, rank: 'Gold', winRate: 68 },
        { position: 23, username: 'SpiderHunter', eloRating: 1347, rank: 'Silver', winRate: 67 }
      ],
      region,
      userPosition: 23,
      totalPlayers: 247
    };
  }

  // Leagues
  async getLeague(region: string): Promise<{ league: League }> {
    return {
      league: {
        region,
        name: 'Arizona Desert League',
        description: 'Battle with desert spiders in the harsh Arizona wilderness',
        totalPlayers: 247,
        userPosition: 23,
        topPlayers: [
          { position: 1, username: 'DesertKing', eloRating: 1847, rank: 'Diamond', winRate: 78 },
          { position: 2, username: 'SpiderMaster', eloRating: 1623, rank: 'Platinum', winRate: 72 },
          { position: 3, username: 'ArizonaAce', eloRating: 1456, rank: 'Gold', winRate: 68 }
        ]
      }
    };
  }

  // Battle system (mock)
  async findMatch(spiderId: string): Promise<{ battle: Battle }> {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const battle: Battle = {
      battleId: 'demo-battle-' + Date.now(),
      status: 'waiting',
      opponent: {
        username: 'DesertRival',
        eloRating: 1325,
        rank: 'Silver'
      },
      opponentSpider: mockSpiders[1],
      yourSpider: mockSpiders.find(s => s.id === spiderId) || mockSpiders[0]
    };

    return { battle };
  }
}

export const demoApiService = new DemoApiService();