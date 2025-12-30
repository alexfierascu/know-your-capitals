# European Capitals Quiz

A trivia game testing your knowledge of European capital cities. Built as a Progressive Web App (PWA) with offline support, cloud sync, and multi-language support.

## Features

### Game Modes
- **Classic Mode** - Answer a set number of questions with optional per-question timer
- **Speed Run Mode** - Answer as many questions as possible in 60 seconds (stops when all 45 questions are answered)

### Gameplay
- 45 European countries and capitals
- 3 difficulty levels (Easy, Medium, Hard)
- Region filtering (Western, Eastern, Northern, Southern Europe, etc.)
- Hints system (reveal first letter, eliminate wrong answer)
- Country flag displayed with each question
- Interactive map showing capital location after answering
- Fun facts about each capital city

### User Accounts & Cloud Sync
- Sign in with Google, Email/Password, or play as Guest
- Email verification for new accounts
- Password reset functionality
- Profile with customizable nickname
- Cloud sync of progress and stats via Firebase
- Data migration when switching from guest to authenticated account

### Progress Tracking
- Streak counter with confetti animations
- Country mastery system (tracks accuracy per country)
- Lifetime statistics (quizzes played, accuracy, best streak, avg time)
- Weekly progress summary with activity chart
- Achievements system (16 unlockable achievements)
- Leaderboard

### Customization
- Dark/Light theme with system auto-detection
- Export/Import progress as JSON backup
- Share results as text or downloadable image

### Internationalization
- 10 supported languages: English, Spanish, French, German, Italian, Portuguese, Polish, Dutch, Romanian, Swedish
- Fully translated UI including auth screens
- Localized fun facts for each language
- Auto-detects browser language

### Technical
- Progressive Web App (installable)
- Offline support via Service Worker
- Firebase Authentication & Firestore
- Built with Vite
- Modular ES6 JavaScript architecture
- Web Components for modals
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Firebase project (for authentication and cloud sync)

### Installation

```bash
npm install
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Google and Email/Password providers)
3. Create a Firestore database
4. Enable App Check with reCAPTCHA v3
5. Copy your Firebase config to `src/auth/firebase.js`

### Development

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
npm run preview
```

### Install as PWA

1. Open the app in Chrome/Edge/Safari
2. Click "Install" in the browser's address bar (or Add to Home Screen on mobile)
3. The app will work offline once installed

## Project Structure

```
european-capitals/
├── index.html              # Main HTML structure
├── sw.js                   # Service Worker for offline support
├── manifest.json           # PWA manifest
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies and scripts
├── countries.json          # Country and region data
├── cities.json             # Cities for answer options
├── public/
│   ├── locales/            # Translation files
│   │   ├── en.json, es.json, fr.json, de.json, it.json
│   │   ├── pt.json, pl.json, nl.json, ro.json, sv.json
│   │   └── fun-facts-*.json
│   └── icons/              # PWA icons (72px - 512px)
├── src/
│   ├── main.js             # Entry point
│   ├── auth/               # Authentication
│   │   ├── auth.js         # Auth logic
│   │   ├── authUI.js       # Auth UI handling
│   │   └── firebase.js     # Firebase configuration
│   ├── data/               # Data management
│   │   ├── state.js        # Application state
│   │   ├── storage.js      # LocalStorage management
│   │   ├── dataSync.js     # Cloud sync logic
│   │   └── userStats.js    # User statistics
│   ├── quiz/               # Quiz logic
│   │   ├── quiz.js         # Core quiz logic
│   │   ├── timer.js        # Game timer
│   │   ├── hints.js        # Hint system
│   │   ├── options.js      # Answer options generation
│   │   └── review.js       # Quiz review
│   ├── ui/                 # User interface
│   │   ├── elements.js     # DOM element references
│   │   ├── stats.js        # Statistics display
│   │   ├── achievements.js # Achievement system
│   │   ├── leaderboard.js  # Leaderboard
│   │   ├── progress.js     # Progress tracking
│   │   ├── share.js        # Results sharing
│   │   ├── map.js          # Interactive map
│   │   ├── confetti.js     # Confetti animations
│   │   └── components/     # Web Components
│   │       ├── BaseModal.js
│   │       ├── StatsModal.js
│   │       ├── ProfileModal.js
│   │       ├── DeleteAccountModal.js
│   │       ├── ResetConfirmModal.js
│   │       └── MigrationModal.js
│   ├── utils/              # Utilities
│   │   ├── i18n.js         # Internationalization
│   │   ├── theme.js        # Theme toggle
│   │   ├── constants.js    # Static constants
│   │   ├── utils.js        # Utility functions
│   │   └── imageUtils.js   # Image utilities
│   └── styles/             # CSS modules
│       ├── main.css        # Imports all modules
│       ├── base.css        # Variables and reset
│       ├── layout.css      # Layout and containers
│       ├── components.css  # Buttons, inputs, etc.
│       ├── quiz.css        # Quiz screen styles
│       ├── results.css     # Results screen styles
│       ├── modals.css      # Modal styles
│       ├── stats.css       # Stats display styles
│       └── auth.css        # Authentication styles
```

## Data Files

### countries.json
```json
{
  "countries": [
    { "name": "France", "capital": "Paris", "region": "western" }
  ],
  "regions": [
    { "id": "western", "name": "Western Europe" }
  ]
}
```

### cities.json
```json
{
  "France": ["Lyon", "Marseille", "Nice", "Toulouse"],
  "Germany": ["Munich", "Hamburg", "Frankfurt", "Cologne"]
}
```

## Achievements

| Icon | Achievement | Description |
|:----:|-------------|-------------|
| 🎯 | First Steps | Complete your first quiz |
| ⭐ | Perfect! | Get 100% on any quiz |
| 🌟 | Perfectionist | Get 5 perfect scores |
| 🔥 | On Fire | 5 correct answers in a row |
| 💥 | Unstoppable | 10 correct answers in a row |
| 📚 | Dedicated | Complete 10 quizzes |
| 🎓 | Quiz Master | Complete 50 quizzes |
| 🗺️ | Getting There | Master 5 countries |
| 🌍 | Geography Buff | Master 20 countries |
| 👑 | European Expert | Master all 45 countries |
| 💪 | Challenge Accepted | Complete a quiz on Hard |
| 🏆 | Legendary | Get 100% on Hard difficulty |
| ⚡ | Speed Demon | Complete 10 questions in under 60 seconds |
| 🧠 | No Help Needed | Get 100% without using hints |
| 🏔️ | Balkan Expert | Master all Balkan countries |
| ❄️ | Nordic Explorer | Master all Northern European countries |

**Mastering a country:** Answer correctly 3+ times with 80%+ accuracy.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT
