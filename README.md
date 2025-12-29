# European Capitals Quiz

A trivia game testing your knowledge of European capital cities. Built as a Progressive Web App (PWA) with offline support.

## Features

### Game Modes
- **Classic Mode** - Answer a set number of questions with optional per-question timer
- **Speed Run Mode** - Answer as many questions as possible in 60 seconds

### Gameplay
- 45 European countries and capitals
- 3 difficulty levels (Easy, Medium, Hard)
- Region filtering (Western, Eastern, Northern, Southern Europe, etc.)
- Hints system (reveal first letter, eliminate wrong answer)
- Country flag displayed with each question
- Interactive map showing capital location after answering
- Fun facts about each capital city

### Progress Tracking
- Streak counter with confetti animations
- Country mastery system (tracks accuracy per country)
- Lifetime statistics (quizzes played, accuracy, best streak, avg time)
- Weekly progress summary with activity chart
- Achievements system (16 unlockable achievements)
- Local leaderboard

### Customization
- Dark/Light theme with system auto-detection
- Export/Import progress as JSON backup
- Share results as text or downloadable image

### Technical
- Progressive Web App (installable)
- Offline support via Service Worker
- No dependencies - pure HTML, CSS, JavaScript
- Responsive design

## Getting Started

### Run Locally

The app requires a local server due to ES modules and Service Worker:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
```

Then open http://localhost:8080 in your browser.

### Install as PWA

1. Open the app in Chrome/Edge/Safari
2. Click "Install" in the browser's address bar (or Add to Home Screen on mobile)
3. The app will work offline once installed

## Project Structure

```
european-capitals/
├── index.html          # Main HTML structure
├── styles.css          # All styles (~2000 lines)
├── app.js              # Application logic (~2300 lines)
├── sw.js               # Service Worker for offline support
├── manifest.json       # PWA manifest
├── countries.json      # Country and region data
├── cities.json         # Cities for answer options
├── fun-facts.json      # Fun facts about capitals
└── icons/              # PWA icons
    ├── icon-192.png
    └── icon-512.png
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

## Future Plans

See [MULTIPLAYER_ARCHITECTURE.md](./MULTIPLAYER_ARCHITECTURE.md) for planned multiplayer features.
