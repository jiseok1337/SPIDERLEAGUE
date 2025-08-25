const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  battleId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'battle_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
  },
  
  // Battle participants
  player1: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    spider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Spider',
      required: true
    },
    health: Number,
    actions: [{
      turn: Number,
      action: String,
      damage: Number,
      timestamp: Date
    }]
  },
  
  player2: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    spider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Spider',
      required: true
    },
    health: Number,
    actions: [{
      turn: Number,
      action: String,
      damage: Number,
      timestamp: Date
    }]
  },
  
  // Battle state
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'abandoned'],
    default: 'waiting'
  },
  
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  loser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Battle metadata
  region: {
    type: String,
    default: 'arizona'
  },
  
  battleType: {
    type: String,
    enum: ['ranked', 'casual', 'tournament'],
    default: 'ranked'
  },
  
  currentTurn: {
    type: Number,
    default: 1
  },
  
  maxTurns: {
    type: Number,
    default: 20
  },
  
  turnTimeLimit: {
    type: Number,
    default: 30000 // 30 seconds in milliseconds
  },
  
  // ELO changes
  eloChanges: {
    player1Change: Number,
    player2Change: Number
  },
  
  // Battle log for replay
  battleLog: [{
    turn: Number,
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: String,
    damage: Number,
    result: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Duration tracking
  startTime: Date,
  endTime: Date,
  duration: Number, // in milliseconds
  
}, {
  timestamps: true
});

// Calculate battle duration
battleSchema.methods.calculateDuration = function() {
  if (this.startTime && this.endTime) {
    this.duration = this.endTime - this.startTime;
  }
  return this.duration;
};

// Start battle method
battleSchema.methods.startBattle = function() {
  this.status = 'active';
  this.startTime = new Date();
  
  // Set initial health for both spiders
  this.player1.health = this.player1.spider.health;
  this.player2.health = this.player2.spider.health;
};

// End battle method
battleSchema.methods.endBattle = function(winnerId) {
  this.status = 'completed';
  this.endTime = new Date();
  this.winner = winnerId;
  this.loser = winnerId.equals(this.player1.user) ? this.player2.user : this.player1.user;
  this.calculateDuration();
};

// Calculate ELO changes using standard ELO formula
battleSchema.methods.calculateEloChanges = function(player1Elo, player2Elo, winner) {
  const K = 32; // ELO K-factor
  
  const expectedScore1 = 1 / (1 + Math.pow(10, (player2Elo - player1Elo) / 400));
  const expectedScore2 = 1 / (1 + Math.pow(10, (player1Elo - player2Elo) / 400));
  
  const actualScore1 = winner.equals(this.player1.user) ? 1 : 0;
  const actualScore2 = winner.equals(this.player2.user) ? 1 : 0;
  
  const player1Change = Math.round(K * (actualScore1 - expectedScore1));
  const player2Change = Math.round(K * (actualScore2 - expectedScore2));
  
  this.eloChanges = {
    player1Change,
    player2Change
  };
  
  return this.eloChanges;
};

// Add action to battle log
battleSchema.methods.addAction = function(playerId, action, damage, result) {
  this.battleLog.push({
    turn: this.currentTurn,
    player: playerId,
    action,
    damage: damage || 0,
    result,
    timestamp: new Date()
  });
};

// Get battle summary
battleSchema.virtual('summary').get(function() {
  return {
    battleId: this.battleId,
    status: this.status,
    winner: this.winner,
    duration: this.duration,
    turns: this.battleLog.length,
    eloChanges: this.eloChanges
  };
});

module.exports = mongoose.model('Battle', battleSchema);