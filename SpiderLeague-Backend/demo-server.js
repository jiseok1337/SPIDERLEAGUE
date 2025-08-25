const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory data store for demo
let users = [];
let spiders = [];
let battles = [];
let nextId = 1;

// Mock spider database for demo
const spiderTypes = [
  { species: 'black-widow', commonName: 'Black Widow', scientificName: 'Latrodectus mactans', rarity: 'epic', dangerLevel: 9 },
  { species: 'jumping-spider', commonName: 'Jumping Spider', scientificName: 'Phidippus audax', rarity: 'common', dangerLevel: 2 },
  { species: 'wolf-spider', commonName: 'Wolf Spider', scientificName: 'Lycosidae family', rarity: 'uncommon', dangerLevel: 3 },
  { species: 'tarantula', commonName: 'Desert Tarantula', scientificName: 'Aphonopelma chalcodes', rarity: 'legendary', dangerLevel: 4 }
];

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, region = 'arizona' } = req.body;
  
  const existingUser = users.find(u => u.email === email || u.username === username);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const user = {
    id: nextId++,
    username,
    email,
    region,
    eloRating: 1200,
    rank: 'Bronze',
    totalBattles: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    spidersCollected: 0,
    activeSpiders: []
  };

  users.push(user);
  
  res.status(201).json({
    message: 'User registered successfully',
    token: 'demo-token-' + user.id,
    user
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({
    message: 'Login successful',
    token: 'demo-token-' + user.id,
    user
  });
});

app.get('/api/auth/verify', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const userId = token?.replace('demo-token-', '');
  const user = users.find(u => u.id == userId);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.json({ user });
});

// Spider routes
app.post('/api/spiders/capture', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const userId = token?.replace('demo-token-', '');
  const user = users.find(u => u.id == userId);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Mock spider analysis
  const randomSpider = spiderTypes[Math.floor(Math.random() * spiderTypes.length)];
  const powerLevel = Math.floor(Math.random() * 200) + 50;
  
  const spider = {
    id: nextId++,
    name: `${randomSpider.commonName} #${Math.floor(Math.random() * 1000)}`,
    species: randomSpider.species,
    commonName: randomSpider.commonName,
    scientificName: randomSpider.scientificName,
    powerLevel,
    rarity: randomSpider.rarity,
    size: { category: ['tiny', 'small', 'medium', 'large'][Math.floor(Math.random() * 4)] },
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

  spiders.push({ ...spider, ownerId: user.id });
  user.spidersCollected++;

  res.status(201).json({
    message: 'Spider captured successfully!',
    spider
  });
});

app.get('/api/spiders/collection', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const userId = token?.replace('demo-token-', '');
  const user = users.find(u => u.id == userId);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userSpiders = spiders.filter(s => s.ownerId == userId);
  res.json({ spiders: userSpiders });
});

// User routes
app.get('/api/users/profile', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const userId = token?.replace('demo-token-', '');
  const user = users.find(u => u.id == userId);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userSpiders = spiders.filter(s => s.ownerId == userId);
  user.activeSpiders = userSpiders.filter(s => s.isActive).slice(0, 6);
  
  res.json({ profile: user });
});

app.get('/api/users/stats', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const userId = token?.replace('demo-token-', '');
  const user = users.find(u => u.id == userId);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userSpiders = spiders.filter(s => s.ownerId == userId);
  const avgPowerLevel = userSpiders.length > 0 ? 
    Math.round(userSpiders.reduce((sum, s) => sum + s.powerLevel, 0) / userSpiders.length) : 0;

  res.json({
    userStats: {
      username: user.username,
      rank: user.rank,
      eloRating: user.eloRating,
      totalBattles: user.totalBattles,
      wins: user.wins,
      losses: user.losses,
      winRate: user.winRate,
      joinedDaysAgo: 0
    },
    spiderStats: {
      total: userSpiders.length,
      avgPowerLevel,
      strongestSpider: userSpiders.length > 0 ? {
        name: userSpiders[0].name,
        species: userSpiders[0].species,
        powerLevel: userSpiders[0].powerLevel
      } : null
    },
    battleStats: {
      recentWins: 0,
      recentLosses: 0,
      avgBattleDuration: 0,
      longestWinStreak: 0
    }
  });
});

// League routes
app.get('/api/leagues/:region', (req, res) => {
  res.json({
    league: {
      region: req.params.region,
      name: 'Arizona Desert League',
      description: 'Battle with desert spiders in the harsh Arizona wilderness',
      totalPlayers: users.length,
      userPosition: 1,
      topPlayers: users.slice(0, 10).map((user, index) => ({
        position: index + 1,
        username: user.username,
        eloRating: user.eloRating,
        rank: user.rank,
        winRate: user.winRate
      }))
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Demo Spider League API is running' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🕷️ Spider League Demo API running on port ${PORT}`);
  console.log('📱 Ready for React Native app connection!');
});

module.exports = app;