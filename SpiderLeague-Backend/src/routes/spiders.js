const express = require('express');
const multer = require('multer');
const Spider = require('../models/Spider');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { analyzeSpiderImage } = require('../utils/spiderAnalysis');
const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload and analyze spider photo
router.post('/capture', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Convert buffer to base64 for storage
    const imageBase64 = req.file.buffer.toString('base64');
    
    // Analyze spider image with AI (mock implementation for now)
    const analysisResult = await analyzeSpiderImage(imageBase64);
    
    if (!analysisResult.success) {
      return res.status(400).json({ 
        error: 'Could not identify spider in image. Please try again with a clearer photo.' 
      });
    }

    // Create new spider record
    const spider = new Spider({
      owner: req.userId,
      species: analysisResult.species,
      commonName: analysisResult.commonName,
      scientificName: analysisResult.scientificName,
      image: `data:${req.file.mimetype};base64,${imageBase64}`,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        state: 'Arizona' // Default for v0
      },
      confidence: analysisResult.confidence,
      size: {
        estimated: analysisResult.size.estimated,
        category: analysisResult.size.category
      },
      rarity: analysisResult.rarity,
      dangerLevel: analysisResult.dangerLevel,
      photoQuality: analysisResult.photoQuality
    });

    await spider.save();

    // Add spider to user's collection
    await User.findByIdAndUpdate(req.userId, {
      $push: { spidersCollected: spider._id }
    });

    res.status(201).json({
      message: 'Spider captured successfully!',
      spider: {
        id: spider._id,
        name: spider.name,
        species: spider.species,
        commonName: spider.commonName,
        powerLevel: spider.powerLevel,
        rarity: spider.rarity,
        size: spider.size.category,
        confidence: spider.confidence,
        stats: {
          attack: spider.attack,
          defense: spider.defense,
          speed: spider.speed,
          health: spider.health
        }
      }
    });

  } catch (error) {
    console.error('Spider capture error:', error);
    res.status(500).json({ 
      error: 'Failed to process spider image. Please try again.' 
    });
  }
});

// Get user's spider collection
router.get('/collection', authenticateToken, async (req, res) => {
  try {
    const spiders = await Spider.find({ owner: req.userId })
      .sort({ captureDate: -1 });

    res.json({
      spiders: spiders.map(spider => ({
        id: spider._id,
        name: spider.name,
        species: spider.species,
        commonName: spider.commonName,
        powerLevel: spider.powerLevel,
        rarity: spider.rarity,
        size: spider.size.category,
        captureDate: spider.captureDate,
        isActive: spider.isActive,
        level: spider.level,
        experience: spider.experience,
        battlesWon: spider.battlesWon,
        battlesLost: spider.battlesLost,
        winRate: spider.winRate,
        stats: {
          attack: spider.attack,
          defense: spider.defense,
          speed: spider.speed,
          health: spider.health
        },
        image: spider.image
      }))
    });

  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve spider collection' 
    });
  }
});

// Get single spider details
router.get('/:spiderId', authenticateToken, async (req, res) => {
  try {
    const spider = await Spider.findOne({
      _id: req.params.spiderId,
      owner: req.userId
    });

    if (!spider) {
      return res.status(404).json({ error: 'Spider not found' });
    }

    res.json({
      spider: {
        id: spider._id,
        name: spider.name,
        species: spider.species,
        commonName: spider.commonName,
        scientificName: spider.scientificName,
        powerLevel: spider.powerLevel,
        rarity: spider.rarity,
        size: spider.size,
        dangerLevel: spider.dangerLevel,
        confidence: spider.confidence,
        photoQuality: spider.photoQuality,
        captureDate: spider.captureDate,
        location: spider.location,
        isActive: spider.isActive,
        level: spider.level,
        experience: spider.experience,
        battlesWon: spider.battlesWon,
        battlesLost: spider.battlesLost,
        totalBattles: spider.totalBattles,
        winRate: spider.winRate,
        abilities: spider.abilities,
        stats: {
          attack: spider.attack,
          defense: spider.defense,
          speed: spider.speed,
          health: spider.health
        },
        image: spider.image
      }
    });

  } catch (error) {
    console.error('Get spider error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve spider details' 
    });
  }
});

// Activate/deactivate spider for battles
router.patch('/:spiderId/active', authenticateToken, async (req, res) => {
  try {
    const { active } = req.body;
    const spider = await Spider.findOne({
      _id: req.params.spiderId,
      owner: req.userId
    });

    if (!spider) {
      return res.status(404).json({ error: 'Spider not found' });
    }

    const user = await User.findById(req.userId);
    
    if (active && user.activeSpiders.length >= 6) {
      return res.status(400).json({ 
        error: 'Maximum 6 active spiders allowed' 
      });
    }

    spider.isActive = active;
    await spider.save();

    if (active) {
      await User.findByIdAndUpdate(req.userId, {
        $addToSet: { activeSpiders: spider._id }
      });
    } else {
      await User.findByIdAndUpdate(req.userId, {
        $pull: { activeSpiders: spider._id }
      });
    }

    res.json({
      message: `Spider ${active ? 'activated' : 'deactivated'} successfully`,
      spider: {
        id: spider._id,
        name: spider.name,
        isActive: spider.isActive
      }
    });

  } catch (error) {
    console.error('Update spider active status error:', error);
    res.status(500).json({ 
      error: 'Failed to update spider status' 
    });
  }
});

// Rename spider
router.patch('/:spiderId/name', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    const spider = await Spider.findOneAndUpdate(
      { _id: req.params.spiderId, owner: req.userId },
      { name: name.trim() },
      { new: true }
    );

    if (!spider) {
      return res.status(404).json({ error: 'Spider not found' });
    }

    res.json({
      message: 'Spider renamed successfully',
      spider: {
        id: spider._id,
        name: spider.name
      }
    });

  } catch (error) {
    console.error('Rename spider error:', error);
    res.status(500).json({ 
      error: 'Failed to rename spider' 
    });
  }
});

module.exports = router;