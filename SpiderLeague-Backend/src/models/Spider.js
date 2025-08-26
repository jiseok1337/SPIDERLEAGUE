const mongoose = require('mongoose');

const spiderSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: function() {
      return `${this.species} #${Math.floor(Math.random() * 1000)}`;
    }
  },
  species: {
    type: String,
    required: true
  },
  commonName: {
    type: String,
    required: true
  },
  scientificName: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true // Base64 encoded image or URL to stored image
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    state: {
      type: String,
      default: 'Arizona'
    }
  },
  captureDate: {
    type: Date,
    default: Date.now
  },
  
  // AI Analysis Results
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  size: {
    estimated: {
      type: Number, // in mm
      required: true
    },
    category: {
      type: String,
      enum: ['tiny', 'small', 'medium', 'large', 'giant'],
      required: true
    }
  },
  
  // Power Calculation Factors
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    required: true
  },
  dangerLevel: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  photoQuality: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  
  // Battle Stats (calculated from above factors)
  powerLevel: {
    type: Number,
    required: true
  },
  attack: {
    type: Number,
    required: true
  },
  defense: {
    type: Number,
    required: true
  },
  speed: {
    type: Number,
    required: true
  },
  health: {
    type: Number,
    required: true
  },
  
  // Special Abilities
  abilities: [{
    name: String,
    description: String,
    type: {
      type: String,
      enum: ['passive', 'active', 'ultimate']
    }
  }],
  
  // Battle History
  battlesWon: {
    type: Number,
    default: 0
  },
  battlesLost: {
    type: Number,
    default: 0
  },
  totalBattles: {
    type: Number,
    default: 0
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: false
  },
  experience: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Calculate power level based on various factors
spiderSchema.methods.calculatePowerLevel = function() {
  const sizeMultiplier = {
    'tiny': 1,
    'small': 1.2,
    'medium': 1.5,
    'large': 1.8,
    'giant': 2.2
  };
  
  const rarityMultiplier = {
    'common': 1,
    'uncommon': 1.3,
    'rare': 1.6,
    'epic': 2.0,
    'legendary': 2.5
  };
  
  const basePower = 50;
  const sizeFactor = sizeMultiplier[this.size.category] || 1;
  const rarityFactor = rarityMultiplier[this.rarity] || 1;
  const dangerFactor = (this.dangerLevel / 10) + 0.5;
  const qualityFactor = (this.photoQuality / 10) + 0.5;
  const confidenceFactor = (this.confidence / 100) + 0.5;
  
  this.powerLevel = Math.round(
    basePower * sizeFactor * rarityFactor * dangerFactor * qualityFactor * confidenceFactor
  );
  
  // Calculate individual stats based on power level and spider characteristics
  const variation = () => Math.random() * 0.4 + 0.8; // 0.8-1.2 multiplier
  
  this.attack = Math.round(this.powerLevel * 0.25 * variation());
  this.defense = Math.round(this.powerLevel * 0.2 * variation());
  this.speed = Math.round(this.powerLevel * 0.3 * variation());
  this.health = Math.round(this.powerLevel * 0.4 * variation());
  
  return this.powerLevel;
};

// Calculate win rate
spiderSchema.virtual('winRate').get(function() {
  if (this.totalBattles === 0) return 0;
  return Math.round((this.battlesWon / this.totalBattles) * 100);
});

// Pre-save hook to calculate power level
spiderSchema.pre('save', function(next) {
  // Mongoose's isModified accepts a single path; passing an array always returns
  // false. This meant power level wouldn't update when any of these fields
  // changed. Check each relevant path individually instead.
  if (
    this.isNew ||
    this.isModified('size') ||
    this.isModified('rarity') ||
    this.isModified('dangerLevel') ||
    this.isModified('photoQuality') ||
    this.isModified('confidence')
  ) {
    this.calculatePowerLevel();
  }
  next();
});

module.exports = mongoose.model('Spider', spiderSchema);