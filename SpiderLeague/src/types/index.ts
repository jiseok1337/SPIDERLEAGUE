export interface User {
  id: string;
  username: string;
  email: string;
  region: string;
  eloRating: number;
  rank: string;
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  spidersCollected: number;
  activeSpiders: Spider[];
}

export interface Spider {
  id: string;
  name: string;
  species: string;
  commonName: string;
  scientificName: string;
  powerLevel: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  size: {
    estimated: number;
    category: 'tiny' | 'small' | 'medium' | 'large' | 'giant';
  };
  confidence: number;
  captureDate: string;
  isActive: boolean;
  level: number;
  experience: number;
  battlesWon: number;
  battlesLost: number;
  winRate: number;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    health: number;
  };
  image: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface Battle {
  battleId: string;
  status: 'waiting' | 'active' | 'completed';
  opponent: {
    username: string;
    eloRating: number;
    rank: string;
  };
  opponentSpider: Spider;
  yourSpider: Spider;
  currentTurn?: number;
  maxTurns?: number;
  player1Health?: number;
  player2Health?: number;
  battleEnded?: boolean;
  winner?: 'player1' | 'player2';
  eloChanges?: {
    player1Change: number;
    player2Change: number;
  };
}

export interface League {
  region: string;
  name: string;
  description: string;
  totalPlayers: number;
  userPosition: number | null;
  topPlayers: Array<{
    position: number;
    username: string;
    eloRating: number;
    rank: string;
    winRate: number;
  }>;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, region?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}