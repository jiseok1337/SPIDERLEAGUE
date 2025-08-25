# 🕷️ Spider League

A mobile app prototype where users collect spiders by taking photos, build teams, and battle other players in regional leagues. Built with React Native (Expo) frontend and Node.js/Express backend with MongoDB.

## 🎯 Core Concept

- **Photo-based Collection**: Users capture spiders in the wild using their phone camera
- **AI Analysis**: Each photo is analyzed to determine species, power level, and rarity
- **Team Building**: Collect and manage teams of up to 6 active spiders
- **Real-time Battles**: Battle other players using RNG-based combat system
- **Regional Leagues**: Compete in regional leagues with ELO ranking system

## 📱 App Features

### User System
- **Registration/Login** with JWT authentication
- **Profile Management** with ELO rating and battle statistics
- **Regional League** membership (starting with Arizona)

### Spider Collection
- **Camera Integration** for capturing spider photos
- **AI-Powered Analysis** with species identification
- **Power Level Calculation** based on size, rarity, danger level, and photo quality
- **Collection Management** with active team selection

### Battle System
- **Matchmaking** based on ELO rating within regions
- **Real-time Combat** with RNG mechanics
- **Battle Actions**: Attack, Defend, Special Abilities
- **ELO Rating Updates** after each battle

### Power Calculation Algorithm

Spider power levels are calculated using multiple factors:

```
Base Power = 50

Factors:
- Size: tiny (1x) → giant (2.2x)
- Rarity: common (1x) → legendary (2.5x)
- Danger Level: 1-10 (real-world toxicity)
- Photo Quality: 1-10 (AI assessed clarity)
- Confidence: AI identification confidence %

Power Level = Base × Size × Rarity × Danger × Quality × Confidence
```

### Rarity System
- **Common** (40%): House spiders, garden orb weavers
- **Uncommon** (30%): Wolf spiders, jumping spiders
- **Rare** (20%): Brown recluse, huntsman spiders
- **Epic** (8%): Black widow spiders
- **Legendary** (2%): Desert tarantulas

## 🏗️ Technical Architecture

### Frontend (React Native/Expo)
- **TypeScript** for type safety
- **Expo Camera** for photo capture
- **AsyncStorage** for token persistence
- **Custom navigation** system
- **Responsive UI** with dark theme

### Backend (Node.js/Express)
- **RESTful API** with JWT authentication
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time battles
- **Multer** for image uploads
- **Mock AI analysis** (production would use Google Vision API)

### Database Models
- **User**: Authentication, profile, ELO rating, spider collection
- **Spider**: AI analysis results, stats, battle history
- **Battle**: Real-time battle state, action log, results

## 🚀 Project Structure

```
project/
├── SpiderLeague/           # React Native frontend
│   ├── App.tsx            # Main app with navigation
│   ├── src/
│   │   ├── screens/       # All app screens
│   │   ├── services/      # API service layer
│   │   └── types/         # TypeScript interfaces
│   └── package.json
├── SpiderLeague-Backend/   # Node.js backend
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth middleware
│   │   └── utils/         # Helper functions
│   ├── package.json
│   └── README.md
└── README.md              # This file
```

## 🎮 How to Play

1. **Register** for an account in the Arizona Desert League
2. **Capture Spiders** using the camera - get close-up, well-lit shots
3. **Build Your Team** by activating up to 6 spiders for battles
4. **Find Matches** against players with similar ELO ratings
5. **Battle** using Attack, Defend, and Special abilities
6. **Climb the Rankings** to become the ultimate Spider Master

## 🔧 Development Setup

### Backend
```bash
cd SpiderLeague-Backend
npm install
# Set up MongoDB and update .env file
npm start
```

### Frontend
```bash
cd SpiderLeague
npm install
npm start
```

## 🌟 What's Been Built

### ✅ Completed Features
- [x] User authentication system (register/login/logout)
- [x] Photo capture with camera integration
- [x] Mock AI spider analysis and identification
- [x] Power level calculation algorithm
- [x] Spider collection management
- [x] ELO-based matchmaking system
- [x] Real-time battle system with RNG combat
- [x] Regional league system (Arizona)
- [x] Complete backend API with all endpoints
- [x] Responsive mobile UI with dark theme
- [x] Basic navigation between all screens

### 🚧 Future Enhancements
- [ ] Real AI integration (Google Vision API)
- [ ] Additional regions (California, Texas, Florida)
- [ ] Tournament system
- [ ] Push notifications
- [ ] Social features (friends, chat)
- [ ] Spider abilities and special moves
- [ ] Achievement system
- [ ] Leaderboard screen
- [ ] Battle replay system

## 🎨 UI/UX Design

- **Dark Theme** for mobile-friendly viewing
- **Orange Accent** (#ff6b35) for brand color
- **Card-based Layout** for easy touch interaction
- **Emoji Integration** for visual appeal and personality
- **Responsive Design** that works on various screen sizes

## 🌍 Regional League System (v0)

Starting with Arizona Desert League featuring local species:
- Black Widow (Epic) - High danger, medium size
- Brown Recluse (Rare) - High danger, small size  
- Desert Tarantula (Legendary) - Low danger, giant size
- Jumping Spider (Common) - Low danger, tiny size
- Wolf Spider (Uncommon) - Medium danger, medium size

## 🔮 Future Vision

The ultimate goal is to create a global spider collecting game that:
- Educates users about local spider species
- Promotes photography and outdoor exploration
- Builds competitive gaming communities
- Expands to other regions and countries
- Integrates with real scientific data

This prototype demonstrates the core gameplay loop and technical feasibility of the concept. The combination of real-world photo capture, AI analysis, and competitive gaming creates a unique and engaging mobile experience.

---

**Version**: 0.1 (Prototype)  
**Region**: Arizona Desert League  
**Status**: Functional MVP with core features implemented