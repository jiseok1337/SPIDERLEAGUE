const express = require('express');
const Battle = require('../models/Battle');
const User = require('../models/User');
const Spider = require('../models/Spider');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Find a match for ranked battle
router.post('/find-match', authenticateToken, async (req, res) => {
  try {
    const { spiderId } = req.body;
    
    if (!spiderId) {
      return res.status(400).json({ error: 'Spider ID is required' });
    }

    // Verify user owns the spider and it's active
    const userSpider = await Spider.findOne({
      _id: spiderId,
      owner: req.userId,
      isActive: true
    });

    if (!userSpider) {
      return res.status(400).json({ 
        error: 'Spider not found or not active' 
      });
    }

    const user = await User.findById(req.userId);
    const userElo = user.eloRating;

    // Find opponents within ELO range (±200 points)
    const eloRange = 200;
    const minElo = userElo - eloRange;
    const maxElo = userElo + eloRange;

    const potentialOpponents = await User.find({
      _id: { $ne: req.userId },
      eloRating: { $gte: minElo, $lte: maxElo },
      region: user.region,
      activeSpiders: { $exists: true, $not: { $size: 0 } }
    }).populate('activeSpiders');

    if (potentialOpponents.length === 0) {
      return res.status(404).json({ 
        error: 'No opponents found in your ELO range. Try again later.' 
      });
    }

    // Randomly select opponent and their spider
    const opponent = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];
    const opponentSpider = opponent.activeSpiders[Math.floor(Math.random() * opponent.activeSpiders.length)];

    // Create battle
    const battle = new Battle({
      player1: {
        user: req.userId,
        spider: spiderId,
        health: userSpider.health
      },
      player2: {
        user: opponent._id,
        spider: opponentSpider._id,
        health: opponentSpider.health
      },
      region: user.region,
      battleType: 'ranked'
    });

    await battle.save();

    res.json({
      message: 'Match found!',
      battle: {
        battleId: battle.battleId,
        opponent: {
          username: opponent.username,
          eloRating: opponent.eloRating,
          rank: opponent.rank
        },
        opponentSpider: {
          name: opponentSpider.name,
          species: opponentSpider.species,
          powerLevel: opponentSpider.powerLevel,
          stats: {
            attack: opponentSpider.attack,
            defense: opponentSpider.defense,
            speed: opponentSpider.speed,
            health: opponentSpider.health
          }
        },
        yourSpider: {
          name: userSpider.name,
          species: userSpider.species,
          powerLevel: userSpider.powerLevel,
          stats: {
            attack: userSpider.attack,
            defense: userSpider.defense,
            speed: userSpider.speed,
            health: userSpider.health
          }
        }
      }
    });

  } catch (error) {
    console.error('Find match error:', error);
    res.status(500).json({ 
      error: 'Failed to find match. Please try again.' 
    });
  }
});

// Start a battle
router.post('/:battleId/start', authenticateToken, async (req, res) => {
  try {
    const battle = await Battle.findOne({ 
      battleId: req.params.battleId 
    }).populate([
      { path: 'player1.user', select: 'username eloRating' },
      { path: 'player2.user', select: 'username eloRating' },
      { path: 'player1.spider', select: 'name species attack defense speed health' },
      { path: 'player2.spider', select: 'name species attack defense speed health' }
    ]);

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    // Verify user is part of this battle
    if (!battle.player1.user._id.equals(req.userId) && !battle.player2.user._id.equals(req.userId)) {
      return res.status(403).json({ error: 'Not authorized for this battle' });
    }

    if (battle.status !== 'waiting') {
      return res.status(400).json({ error: 'Battle already started or completed' });
    }

    battle.startBattle();
    await battle.save();

    res.json({
      message: 'Battle started!',
      battle: {
        battleId: battle.battleId,
        status: battle.status,
        currentTurn: battle.currentTurn,
        maxTurns: battle.maxTurns,
        turnTimeLimit: battle.turnTimeLimit,
        player1: {
          username: battle.player1.user.username,
          spider: battle.player1.spider.name,
          health: battle.player1.health,
          maxHealth: battle.player1.spider.health
        },
        player2: {
          username: battle.player2.user.username,
          spider: battle.player2.spider.name,
          health: battle.player2.health,
          maxHealth: battle.player2.spider.health
        }
      }
    });

  } catch (error) {
    console.error('Start battle error:', error);
    res.status(500).json({ 
      error: 'Failed to start battle' 
    });
  }
});

// Execute battle turn (simplified RNG system)
router.post('/:battleId/action', authenticateToken, async (req, res) => {
  try {
    const { action } = req.body; // 'attack', 'defend', 'special'
    
    const battle = await Battle.findOne({ 
      battleId: req.params.battleId 
    }).populate([
      { path: 'player1.spider', select: 'name attack defense speed health' },
      { path: 'player2.spider', select: 'name attack defense speed health' }
    ]);

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    if (battle.status !== 'active') {
      return res.status(400).json({ error: 'Battle is not active' });
    }

    // Determine if user is player1 or player2
    const isPlayer1 = battle.player1.user.equals(req.userId);
    const isPlayer2 = battle.player2.user.equals(req.userId);

    if (!isPlayer1 && !isPlayer2) {
      return res.status(403).json({ error: 'Not authorized for this battle' });
    }

    // Execute battle turn with RNG
    const battleResult = executeBattleTurn(battle, isPlayer1 ? 1 : 2, action);
    
    // Update battle log
    battle.addAction(req.userId, action, battleResult.damage, battleResult.result);

    // Update health
    if (isPlayer1) {
      battle.player2.health = Math.max(0, battle.player2.health - battleResult.damage);
    } else {
      battle.player1.health = Math.max(0, battle.player1.health - battleResult.damage);
    }

    // Check for battle end
    if (battle.player1.health <= 0 || battle.player2.health <= 0 || battle.currentTurn >= battle.maxTurns) {
      const winnerId = battle.player1.health > battle.player2.health ? battle.player1.user : battle.player2.user;
      battle.endBattle(winnerId);
      
      // Update ELO ratings
      const player1User = await User.findById(battle.player1.user);
      const player2User = await User.findById(battle.player2.user);
      
      const eloChanges = battle.calculateEloChanges(
        player1User.eloRating,
        player2User.eloRating,
        winnerId
      );

      // Update user stats
      player1User.eloRating += eloChanges.player1Change;
      player1User.totalBattles += 1;
      if (winnerId.equals(battle.player1.user)) {
        player1User.wins += 1;
      } else {
        player1User.losses += 1;
      }
      player1User.updateRank();
      await player1User.save();

      player2User.eloRating += eloChanges.player2Change;
      player2User.totalBattles += 1;
      if (winnerId.equals(battle.player2.user)) {
        player2User.wins += 1;
      } else {
        player2User.losses += 1;
      }
      player2User.updateRank();
      await player2User.save();

      // Update spider stats
      const winningSpider = winnerId.equals(battle.player1.user) ? battle.player1.spider : battle.player2.spider;
      const losingSpider = winnerId.equals(battle.player1.user) ? battle.player2.spider : battle.player1.spider;

      await Spider.findByIdAndUpdate(winningSpider._id, {
        $inc: { battlesWon: 1, totalBattles: 1, experience: 50 }
      });

      await Spider.findByIdAndUpdate(losingSpider._id, {
        $inc: { battlesLost: 1, totalBattles: 1, experience: 20 }
      });
    } else {
      battle.currentTurn += 1;
    }

    await battle.save();

    res.json({
      battleResult: {
        action,
        damage: battleResult.damage,
        result: battleResult.result,
        currentTurn: battle.currentTurn,
        player1Health: battle.player1.health,
        player2Health: battle.player2.health,
        battleEnded: battle.status === 'completed',
        winner: battle.winner ? (battle.winner.equals(battle.player1.user) ? 'player1' : 'player2') : null,
        eloChanges: battle.eloChanges
      }
    });

  } catch (error) {
    console.error('Battle action error:', error);
    res.status(500).json({ 
      error: 'Failed to execute battle action' 
    });
  }
});

// Get battle status
router.get('/:battleId', authenticateToken, async (req, res) => {
  try {
    const battle = await Battle.findOne({ 
      battleId: req.params.battleId 
    }).populate([
      { path: 'player1.user', select: 'username eloRating rank' },
      { path: 'player2.user', select: 'username eloRating rank' },
      { path: 'player1.spider', select: 'name species powerLevel attack defense speed health' },
      { path: 'player2.spider', select: 'name species powerLevel attack defense speed health' }
    ]);

    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    // Verify user has access to this battle
    if (!battle.player1.user._id.equals(req.userId) && !battle.player2.user._id.equals(req.userId)) {
      return res.status(403).json({ error: 'Not authorized to view this battle' });
    }

    res.json({
      battle: {
        battleId: battle.battleId,
        status: battle.status,
        currentTurn: battle.currentTurn,
        maxTurns: battle.maxTurns,
        startTime: battle.startTime,
        endTime: battle.endTime,
        duration: battle.duration,
        winner: battle.winner,
        player1: {
          user: battle.player1.user,
          spider: battle.player1.spider,
          health: battle.player1.health
        },
        player2: {
          user: battle.player2.user,
          spider: battle.player2.spider,
          health: battle.player2.health
        },
        battleLog: battle.battleLog,
        eloChanges: battle.eloChanges
      }
    });

  } catch (error) {
    console.error('Get battle status error:', error);
    res.status(500).json({ 
      error: 'Failed to get battle status' 
    });
  }
});

// Battle turn execution logic (RNG-based)
function executeBattleTurn(battle, playerNumber, action) {
  const attacker = playerNumber === 1 ? battle.player1.spider : battle.player2.spider;
  const defender = playerNumber === 1 ? battle.player2.spider : battle.player1.spider;

  let damage = 0;
  let result = '';

  switch (action) {
    case 'attack':
      // Base damage with RNG
      const baseDamage = attacker.attack * (0.8 + Math.random() * 0.4); // 80-120% of attack
      const defense = defender.defense * (0.8 + Math.random() * 0.4);
      damage = Math.max(1, Math.round(baseDamage - defense * 0.5));
      result = 'Attack hit';
      
      // Critical hit chance (10%)
      if (Math.random() < 0.1) {
        damage = Math.round(damage * 1.5);
        result = 'Critical hit!';
      }
      
      // Miss chance (5%)
      if (Math.random() < 0.05) {
        damage = 0;
        result = 'Attack missed';
      }
      break;
      
    case 'defend':
      // Defensive stance - reduce incoming damage for next turn
      damage = Math.round(attacker.attack * 0.3); // Counter-attack
      result = 'Defensive counter';
      break;
      
    case 'special':
      // Special ability - higher damage but less accurate
      const specialDamage = attacker.attack * (1.2 + Math.random() * 0.6); // 120-180% damage
      damage = Math.max(1, Math.round(specialDamage - defender.defense * 0.3));
      result = 'Special ability';
      
      // Higher miss chance (15%)
      if (Math.random() < 0.15) {
        damage = 0;
        result = 'Special ability missed';
      }
      break;
      
    default:
      damage = Math.round(attacker.attack * 0.5);
      result = 'Basic attack';
  }

  return { damage, result };
}

module.exports = router;