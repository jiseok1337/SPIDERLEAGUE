const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  region: {
    type: String,
    enum: ['arizona', 'california', 'texas', 'florida', 'global'],
    default: 'arizona'
  },
  eloRating: {
    type: Number,
    default: 1200
  },
  rank: {
    type: String,
    default: 'Bronze'
  },
  totalBattles: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  spidersCollected: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spider'
  }],
  activeSpiders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spider',
    validate: {
      validator: function(array) {
        return array.length <= 6; // Max 6 active spiders
      },
      message: 'Cannot have more than 6 active spiders'
    }
  }],
  achievements: [{
    name: String,
    description: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Calculate win rate
userSchema.virtual('winRate').get(function() {
  if (this.totalBattles === 0) return 0;
  return Math.round((this.wins / this.totalBattles) * 100);
});

// Update rank based on ELO
userSchema.methods.updateRank = function() {
  const elo = this.eloRating;
  if (elo < 1000) this.rank = 'Bronze';
  else if (elo < 1200) this.rank = 'Silver';
  else if (elo < 1500) this.rank = 'Gold';
  else if (elo < 1800) this.rank = 'Platinum';
  else if (elo < 2100) this.rank = 'Diamond';
  else this.rank = 'Master';
};

module.exports = mongoose.model('User', userSchema);