const express = require('express');
const User = require('../models/User');
const Spider = require('../models/Spider');
const Battle = require('../models/Battle');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('spidersCollected', 'name species powerLevel rarity captureDate')
      .populate('activeSpiders', 'name species powerLevel rarity attack defense speed health');

    res.json({
      profile: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        region: user.region,
        eloRating: user.eloRating,
        rank: user.rank,
        totalBattles: user.totalBattles,
        wins: user.wins,
        losses: user.losses,
        winRate: user.winRate,
        spidersCollected: user.spidersCollected.length,
        activeSpiders: user.activeSpiders,
        achievements: user.achievements,
        joinedAt: user.joinedAt,
        lastActive: user.lastActive
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve profile' 
    });
  }
});

// Update user profile
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const { avatar, region } = req.body;
    const updates = {};

    if (avatar) updates.avatar = avatar;
    if (region && ['arizona', 'california', 'texas', 'florida', 'global'].includes(region)) {
      updates.region = region;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, select: 'username email avatar region eloRating rank' }
    );

    res.json({
      message: 'Profile updated successfully',
      profile: user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile' 
    });
  }
});

// Get leaderboard
router.get('/leaderboard', optionalAuth, async (req, res) => {
  try {
    const { region = 'arizona', limit = 50 } = req.query;
    
    const query = region === 'global' ? {} : { region };
    
    const leaderboard = await User.find(query)
      .select('username eloRating rank totalBattles wins losses region')
      .sort({ eloRating: -1 })
      .limit(parseInt(limit));

    // Add rank position
    const leaderboardWithPositions = leaderboard.map((user, index) => ({
      position: index + 1,
      username: user.username,
      eloRating: user.eloRating,
      rank: user.rank,
      totalBattles: user.totalBattles,
      wins: user.wins,
      losses: user.losses,
      winRate: user.totalBattles > 0 ? Math.round((user.wins / user.totalBattles) * 100) : 0,
      region: user.region
    }));

    // If user is authenticated, include their position
    let userPosition = null;
    if (req.userId) {
      const userIndex = leaderboard.findIndex(u => u._id.equals(req.userId));
      userPosition = userIndex >= 0 ? userIndex + 1 : null;
    }

    res.json({
      leaderboard: leaderboardWithPositions,
      region,
      userPosition,
      totalPlayers: await User.countDocuments(query)
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve leaderboard' 
    });
  }
});

// Get user's battle history
router.get('/battles', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const battles = await Battle.find({
      $or: [
        { 'player1.user': req.userId },
        { 'player2.user': req.userId }
      ]
    })
    .populate([
      { path: 'player1.user', select: 'username rank' },
      { path: 'player2.user', select: 'username rank' },
      { path: 'player1.spider', select: 'name species' },
      { path: 'player2.spider', select: 'name species' }
    ])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const battleHistory = battles.map(battle => {
      const isPlayer1 = battle.player1.user._id.equals(req.userId);
      const opponent = isPlayer1 ? battle.player2.user : battle.player1.user;
      const userSpider = isPlayer1 ? battle.player1.spider : battle.player2.spider;
      const opponentSpider = isPlayer1 ? battle.player2.spider : battle.player1.spider;
      
      let result = 'loss';
      if (battle.winner) {
        result = battle.winner.equals(req.userId) ? 'win' : 'loss';
      }

      return {
        battleId: battle.battleId,
        opponent: opponent.username,
        opponentRank: opponent.rank,
        result,
        userSpider: {
          name: userSpider.name,
          species: userSpider.species
        },
        opponentSpider: {
          name: opponentSpider.name,
          species: opponentSpider.species
        },
        duration: battle.duration,
        eloChange: isPlayer1 ? battle.eloChanges?.player1Change : battle.eloChanges?.player2Change,
        battleDate: battle.createdAt,
        battleType: battle.battleType
      };
    });

    const totalBattles = await Battle.countDocuments({
      $or: [
        { 'player1.user': req.userId },
        { 'player2.user': req.userId }
      ]
    });

    res.json({
      battles: battleHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalBattles,
        pages: Math.ceil(totalBattles / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get battle history error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve battle history' 
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const spiders = await Spider.find({ owner: req.userId });

    // Calculate spider statistics
    const spiderStats = {
      total: spiders.length,
      byRarity: {},
      bySpecies: {},
      avgPowerLevel: 0,
      strongestSpider: null
    };

    let totalPowerLevel = 0;
    let strongestPower = 0;

    spiders.forEach(spider => {
      // Count by rarity
      spiderStats.byRarity[spider.rarity] = (spiderStats.byRarity[spider.rarity] || 0) + 1;
      
      // Count by species
      spiderStats.bySpecies[spider.species] = (spiderStats.bySpecies[spider.species] || 0) + 1;
      
      // Calculate average power level
      totalPowerLevel += spider.powerLevel;
      
      // Find strongest spider
      if (spider.powerLevel > strongestPower) {
        strongestPower = spider.powerLevel;
        spiderStats.strongestSpider = {
          name: spider.name,
          species: spider.species,
          powerLevel: spider.powerLevel
        };
      }
    });

    spiderStats.avgPowerLevel = spiders.length > 0 ? Math.round(totalPowerLevel / spiders.length) : 0;

    // Get recent battle statistics
    const recentBattles = await Battle.find({
      $or: [
        { 'player1.user': req.userId },
        { 'player2.user': req.userId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10);

    const battleStats = {
      recentWins: recentBattles.filter(b => b.winner && b.winner.equals(req.userId)).length,
      recentLosses: recentBattles.filter(b => b.winner && !b.winner.equals(req.userId)).length,
      avgBattleDuration: 0,
      longestWinStreak: calculateWinStreak(recentBattles, req.userId)
    };

    if (recentBattles.length > 0) {
      const totalDuration = recentBattles.reduce((sum, battle) => sum + (battle.duration || 0), 0);
      battleStats.avgBattleDuration = Math.round(totalDuration / recentBattles.length / 1000); // in seconds
    }

    res.json({
      userStats: {
        username: user.username,
        rank: user.rank,
        eloRating: user.eloRating,
        totalBattles: user.totalBattles,
        wins: user.wins,
        losses: user.losses,
        winRate: user.winRate,
        joinedDaysAgo: Math.floor((Date.now() - user.joinedAt) / (1000 * 60 * 60 * 24))
      },
      spiderStats,
      battleStats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve statistics' 
    });
  }
});

// Helper function to calculate win streak
function calculateWinStreak(battles, userId) {
  let streak = 0;
  
  for (const battle of battles) {
    if (battle.winner && battle.winner.equals(userId)) {
      streak++;
    } else if (battle.winner) {
      break; // Streak broken by loss
    }
  }
  
  return streak;
}

module.exports = router;