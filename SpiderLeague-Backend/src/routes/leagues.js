const express = require('express');
const User = require('../models/User');
const Battle = require('../models/Battle');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get league information for a region
router.get('/:region', authenticateToken, async (req, res) => {
  try {
    const { region } = req.params;
    const validRegions = ['arizona', 'california', 'texas', 'florida', 'global'];
    
    if (!validRegions.includes(region)) {
      return res.status(400).json({ error: 'Invalid region' });
    }

    const query = region === 'global' ? {} : { region };

    // Get top players in the region
    const topPlayers = await User.find(query)
      .select('username eloRating rank totalBattles wins losses')
      .sort({ eloRating: -1 })
      .limit(10);

    // Get total players count
    const totalPlayers = await User.countDocuments(query);

    // Get recent battles in the region
    const recentBattles = await Battle.find({ region })
      .populate([
        { path: 'player1.user', select: 'username rank' },
        { path: 'player2.user', select: 'username rank' },
        { path: 'winner', select: 'username' }
      ])
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate league statistics
    const leagueStats = await calculateLeagueStats(region);

    // Find user's position in the region
    let userPosition = null;
    if (req.userId) {
      const userRank = await User.countDocuments({
        ...query,
        eloRating: { $gt: (await User.findById(req.userId)).eloRating }
      });
      userPosition = userRank + 1;
    }

    res.json({
      league: {
        region,
        name: getRegionName(region),
        description: getRegionDescription(region),
        totalPlayers,
        userPosition,
        topPlayers: topPlayers.map((player, index) => ({
          position: index + 1,
          username: player.username,
          eloRating: player.eloRating,
          rank: player.rank,
          winRate: player.totalBattles > 0 ? Math.round((player.wins / player.totalBattles) * 100) : 0
        })),
        recentBattles: recentBattles.map(battle => ({
          battleId: battle.battleId,
          player1: battle.player1.user.username,
          player2: battle.player2.user.username,
          winner: battle.winner ? battle.winner.username : 'Draw',
          duration: battle.duration,
          battleDate: battle.createdAt
        })),
        stats: leagueStats
      }
    });

  } catch (error) {
    console.error('Get league error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve league information' 
    });
  }
});

// Join a league (change user's region)
router.post('/:region/join', authenticateToken, async (req, res) => {
  try {
    const { region } = req.params;
    const validRegions = ['arizona', 'california', 'texas', 'florida'];
    
    if (!validRegions.includes(region)) {
      return res.status(400).json({ error: 'Invalid region' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { region },
      { new: true, select: 'username region eloRating rank' }
    );

    res.json({
      message: `Successfully joined ${getRegionName(region)} league`,
      user: {
        username: user.username,
        region: user.region,
        eloRating: user.eloRating,
        rank: user.rank
      }
    });

  } catch (error) {
    console.error('Join league error:', error);
    res.status(500).json({ 
      error: 'Failed to join league' 
    });
  }
});

// Get league rankings with pagination
router.get('/:region/rankings', authenticateToken, async (req, res) => {
  try {
    const { region } = req.params;
    const { page = 1, limit = 50, rank } = req.query;
    
    const validRegions = ['arizona', 'california', 'texas', 'florida', 'global'];
    
    if (!validRegions.includes(region)) {
      return res.status(400).json({ error: 'Invalid region' });
    }

    const query = region === 'global' ? {} : { region };
    
    // Add rank filter if specified
    if (rank) {
      query.rank = rank;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const players = await User.find(query)
      .select('username eloRating rank totalBattles wins losses lastActive')
      .sort({ eloRating: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPlayers = await User.countDocuments(query);

    const rankings = players.map((player, index) => ({
      position: skip + index + 1,
      username: player.username,
      eloRating: player.eloRating,
      rank: player.rank,
      totalBattles: player.totalBattles,
      winRate: player.totalBattles > 0 ? Math.round((player.wins / player.totalBattles) * 100) : 0,
      lastActive: player.lastActive,
      isOnline: Date.now() - player.lastActive < 5 * 60 * 1000 // 5 minutes
    }));

    res.json({
      rankings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalPlayers,
        pages: Math.ceil(totalPlayers / parseInt(limit))
      },
      region,
      regionName: getRegionName(region)
    });

  } catch (error) {
    console.error('Get rankings error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve rankings' 
    });
  }
});

// Get league activity feed
router.get('/:region/activity', authenticateToken, async (req, res) => {
  try {
    const { region } = req.params;
    const { limit = 20 } = req.query;

    const battles = await Battle.find({ region })
      .populate([
        { path: 'player1.user', select: 'username rank' },
        { path: 'player2.user', select: 'username rank' },
        { path: 'winner', select: 'username rank' }
      ])
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const activities = battles.map(battle => ({
      type: 'battle_completed',
      battleId: battle.battleId,
      participants: [
        { username: battle.player1.user.username, rank: battle.player1.user.rank },
        { username: battle.player2.user.username, rank: battle.player2.user.rank }
      ],
      winner: battle.winner ? {
        username: battle.winner.username,
        rank: battle.winner.rank
      } : null,
      duration: battle.duration,
      eloChanges: battle.eloChanges,
      timestamp: battle.createdAt
    }));

    res.json({
      activities,
      region,
      regionName: getRegionName(region)
    });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve league activity' 
    });
  }
});

// Helper functions
function getRegionName(region) {
  const regionNames = {
    'arizona': 'Arizona Desert League',
    'california': 'California Coastal League',
    'texas': 'Texas Lone Star League',
    'florida': 'Florida Everglades League',
    'global': 'Global Championship League'
  };
  return regionNames[region] || region;
}

function getRegionDescription(region) {
  const descriptions = {
    'arizona': 'Battle with desert spiders in the harsh Arizona wilderness',
    'california': 'Compete along the diverse California coast',
    'texas': 'Everything is bigger in Texas, including the spiders!',
    'florida': 'Navigate the mysterious Florida swamplands',
    'global': 'The ultimate championship for elite trainers worldwide'
  };
  return descriptions[region] || 'Regional spider league';
}

async function calculateLeagueStats(region) {
  try {
    const query = region === 'global' ? {} : { region };
    
    // Get rank distribution
    const rankCounts = await User.aggregate([
      { $match: query },
      { $group: { _id: '$rank', count: { $sum: 1 } } }
    ]);

    const rankDistribution = {};
    rankCounts.forEach(rank => {
      rankDistribution[rank._id] = rank.count;
    });

    // Get average ELO
    const avgEloResult = await User.aggregate([
      { $match: query },
      { $group: { _id: null, avgElo: { $avg: '$eloRating' } } }
    ]);

    const avgElo = avgEloResult.length > 0 ? Math.round(avgEloResult[0].avgElo) : 1200;

    // Get battle statistics for the region
    const battleStats = await Battle.aggregate([
      { $match: { region: region === 'global' ? { $exists: true } : region } },
      {
        $group: {
          _id: null,
          totalBattles: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          completedBattles: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const battles = battleStats.length > 0 ? battleStats[0] : {
      totalBattles: 0,
      avgDuration: 0,
      completedBattles: 0
    };

    return {
      rankDistribution,
      averageElo: avgElo,
      totalBattles: battles.totalBattles,
      avgBattleDuration: Math.round(battles.avgDuration / 1000), // in seconds
      completionRate: battles.totalBattles > 0 ? Math.round((battles.completedBattles / battles.totalBattles) * 100) : 0
    };

  } catch (error) {
    console.error('Calculate league stats error:', error);
    return {
      rankDistribution: {},
      averageElo: 1200,
      totalBattles: 0,
      avgBattleDuration: 0,
      completionRate: 0
    };
  }
}

module.exports = router;