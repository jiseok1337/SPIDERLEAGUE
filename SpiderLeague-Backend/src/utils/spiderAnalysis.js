// Mock AI spider analysis - in production this would use Google Vision API or custom ML model
const spiderDatabase = {
  'black-widow': {
    commonName: 'Black Widow',
    scientificName: 'Latrodectus mactans',
    rarity: 'epic',
    dangerLevel: 9,
    avgSize: 15,
    habitat: 'dark corners, woodpiles'
  },
  'brown-recluse': {
    commonName: 'Brown Recluse',
    scientificName: 'Loxosceles reclusa',
    rarity: 'rare',
    dangerLevel: 8,
    avgSize: 12,
    habitat: 'secluded areas, closets'
  },
  'tarantula': {
    commonName: 'Desert Tarantula',
    scientificName: 'Aphonopelma chalcodes',
    rarity: 'legendary',
    dangerLevel: 4,
    avgSize: 40,
    habitat: 'desert, burrows'
  },
  'jumping-spider': {
    commonName: 'Jumping Spider',
    scientificName: 'Phidippus audax',
    rarity: 'common',
    dangerLevel: 2,
    avgSize: 8,
    habitat: 'plants, walls'
  },
  'wolf-spider': {
    commonName: 'Wolf Spider',
    scientificName: 'Lycosidae family',
    rarity: 'uncommon',
    dangerLevel: 3,
    avgSize: 18,
    habitat: 'ground, grass'
  },
  'orb-weaver': {
    commonName: 'Garden Orb Weaver',
    scientificName: 'Araneus diadematus',
    rarity: 'common',
    dangerLevel: 1,
    avgSize: 14,
    habitat: 'gardens, webs'
  },
  'house-spider': {
    commonName: 'Common House Spider',
    scientificName: 'Parasteatoda tepidariorum',
    rarity: 'common',
    dangerLevel: 1,
    avgSize: 6,
    habitat: 'indoors, corners'
  }
};

const analyzeSpiderImage = async (imageBase64) => {
  try {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock analysis - randomly select a spider type with weighted probability
    const spiderTypes = Object.keys(spiderDatabase);
    const rarityWeights = {
      'common': 0.4,
      'uncommon': 0.3,
      'rare': 0.2,
      'epic': 0.08,
      'legendary': 0.02
    };

    // Weighted random selection based on rarity
    const random = Math.random();
    let cumulativeWeight = 0;
    let selectedSpider = 'house-spider'; // fallback

    for (const spiderType of spiderTypes) {
      const spider = spiderDatabase[spiderType];
      cumulativeWeight += rarityWeights[spider.rarity];
      if (random <= cumulativeWeight) {
        selectedSpider = spiderType;
        break;
      }
    }

    const spider = spiderDatabase[selectedSpider];
    
    // Calculate confidence based on "photo quality"
    const baseConfidence = 75 + Math.random() * 20; // 75-95%
    const confidence = Math.round(Math.max(60, Math.min(98, baseConfidence)));

    // Calculate photo quality score (affects power level)
    const photoQuality = Math.round(5 + Math.random() * 4); // 5-9 range

    // Estimate size with some variation
    const sizeVariation = 0.7 + Math.random() * 0.6; // 0.7-1.3 multiplier
    const estimatedSize = Math.round(spider.avgSize * sizeVariation);
    
    // Determine size category
    let sizeCategory;
    if (estimatedSize < 5) sizeCategory = 'tiny';
    else if (estimatedSize < 12) sizeCategory = 'small';
    else if (estimatedSize < 20) sizeCategory = 'medium';
    else if (estimatedSize < 35) sizeCategory = 'large';
    else sizeCategory = 'giant';

    return {
      success: true,
      species: selectedSpider,
      commonName: spider.commonName,
      scientificName: spider.scientificName,
      confidence,
      size: {
        estimated: estimatedSize,
        category: sizeCategory
      },
      rarity: spider.rarity,
      dangerLevel: spider.dangerLevel,
      photoQuality,
      habitat: spider.habitat,
      analysisTime: Date.now()
    };

  } catch (error) {
    console.error('Spider analysis error:', error);
    return {
      success: false,
      error: 'Analysis failed',
      confidence: 0
    };
  }
};

// Calculate power level bonus for rare captures in specific locations
const getLocationBonus = (latitude, longitude) => {
  // Arizona desert regions get small bonus for certain species
  const desertRegions = [
    { lat: 33.4484, lng: -112.0740, bonus: 1.1 }, // Phoenix
    { lat: 32.2217, lng: -110.9265, bonus: 1.15 }, // Tucson
    { lat: 35.2137, lng: -113.5841, bonus: 1.2 }   // Remote desert
  ];

  for (const region of desertRegions) {
    const distance = Math.sqrt(
      Math.pow(latitude - region.lat, 2) + Math.pow(longitude - region.lng, 2)
    );
    
    if (distance < 0.5) { // Within ~50km
      return region.bonus;
    }
  }
  
  return 1.0; // No bonus
};

// Get species information for educational purposes
const getSpiderInfo = (species) => {
  const spider = spiderDatabase[species];
  if (!spider) return null;

  return {
    commonName: spider.commonName,
    scientificName: spider.scientificName,
    habitat: spider.habitat,
    dangerLevel: spider.dangerLevel,
    avgSize: spider.avgSize,
    rarity: spider.rarity,
    facts: getSpiderFacts(species)
  };
};

const getSpiderFacts = (species) => {
  const facts = {
    'black-widow': [
      'Female black widows are much larger than males',
      'Their venom is 15 times stronger than a rattlesnake',
      'Only the female bite is dangerous to humans'
    ],
    'brown-recluse': [
      'Has a violin-shaped marking on its back',
      'Prefers dark, undisturbed areas',
      'Bites are rare but can cause necrotic wounds'
    ],
    'tarantula': [
      'Can live up to 30 years in the wild',
      'Sheds their skin as they grow',
      'Despite their reputation, their bite is less painful than a bee sting'
    ],
    'jumping-spider': [
      'Has excellent vision and can see in color',
      'Can jump up to 6 times their body length',
      'Often curious and will turn to look at humans'
    ]
  };

  return facts[species] || ['Fascinating arachnid with unique characteristics'];
};

module.exports = {
  analyzeSpiderImage,
  getLocationBonus,
  getSpiderInfo,
  spiderDatabase
};