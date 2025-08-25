# Spider League Backend

A Node.js backend for the Spider League mobile app - a photo-based spider collecting and battling game.

## Features

### 🕷️ Core Functionality
- **Photo Analysis**: AI-powered spider identification and power calculation
- **User Management**: Registration, authentication, profiles with ELO ratings
- **Spider Collection**: Capture, collect, and manage spider teams
- **Real-time Battles**: Socket.io powered battle system with RNG mechanics
- **League System**: Regional leagues starting with Arizona

### 🏗️ Architecture
- **Express.js** REST API
- **MongoDB** with Mongoose ODM  
- **Socket.io** for real-time battles
- **JWT** authentication
- **Multer** for image uploads

### 📊 Power Calculation Algorithm
Spider power levels are calculated based on:
- **Size**: tiny (1x) → giant (2.2x multiplier)
- **Rarity**: common (1x) → legendary (2.5x multiplier)  
- **Danger Level**: 1-10 scale based on real-world toxicity
- **Photo Quality**: 1-10 AI-assessed image clarity
- **Species Confidence**: AI identification confidence percentage

### ⚔️ Battle System
- Real-time RNG-based combat
- Actions: Attack, Defend, Special Ability
- Critical hits, misses, and defensive counters
- ELO rating updates after each battle

### 🎯 API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/verify` - Verify JWT token

#### Spiders
- `POST /api/spiders/capture` - Upload and analyze spider photo
- `GET /api/spiders/collection` - Get user's spider collection
- `GET /api/spiders/:id` - Get detailed spider info
- `PATCH /api/spiders/:id/active` - Set spider active status

#### Battles
- `POST /api/battles/find-match` - Find ranked opponent
- `POST /api/battles/:id/start` - Start battle
- `POST /api/battles/:id/action` - Execute battle action
- `GET /api/battles/:id` - Get battle status

#### Users & Leagues  
- `GET /api/users/profile` - User profile
- `GET /api/users/leaderboard` - Regional rankings
- `GET /api/leagues/:region` - League information
- `POST /api/leagues/:region/join` - Join regional league

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. Start MongoDB (required)

4. Run the server:
```bash
npm start          # Production
npm run dev        # Development with nodemon
```

## Mock AI Analysis

For the prototype, spider identification uses a mock system with weighted rarity:
- Common species: 40% chance
- Uncommon: 30%  
- Rare: 20%
- Epic: 8%
- Legendary: 2%

In production, this would integrate with Google Vision API or a custom ML model.

## Regional Leagues (v0)

Starting with Arizona-only league featuring desert spiders:
- Black Widow (Epic, Danger: 9)
- Brown Recluse (Rare, Danger: 8)  
- Desert Tarantula (Legendary, Danger: 4)
- Jumping Spider (Common, Danger: 2)
- Wolf Spider (Uncommon, Danger: 3)

## Database Models

### User
- Authentication & profile data
- ELO rating & battle statistics
- Spider collection & active team
- Regional league membership

### Spider  
- AI analysis results & metadata
- Calculated power level & battle stats
- Capture location & photo data
- Battle history & experience

### Battle
- Real-time battle state
- Turn-by-turn action log
- ELO changes & battle results
- Socket.io integration for live updates

## Next Steps

- [ ] Integrate real AI vision API
- [ ] Add more regions (California, Texas, Florida)
- [ ] Implement tournament system
- [ ] Add spider abilities & special moves
- [ ] Create mobile push notifications
- [ ] Add social features (friends, chat)