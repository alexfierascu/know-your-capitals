# Multiplayer Architecture Options

This document compares Firebase vs Supabase for adding real-time multiplayer to the European Capitals Quiz.

---

## Table of Contents
- [Overview](#overview)
- [Architecture Comparison](#architecture-comparison)
- [Data Models](#data-models)
- [Real-time Game Flow](#real-time-game-flow)
- [Authentication](#authentication)
- [Cost Comparison](#cost-comparison)
- [Implementation Roadmap](#implementation-roadmap)
- [Recommendation](#recommendation)

---

## Overview

### Current Architecture (Vanilla JS)
```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
├─────────────────────────────────────────────────────┤
│  index.html + styles.css + app.js                   │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   State     │  │     UI      │  │   Storage   │ │
│  │  Management │◄─┤  Rendering  │──►│ localStorage│ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Target Architecture (Multiplayer)
```
┌──────────────┐                        ┌──────────────┐
│   Player 1   │                        │   Player 2   │
│   (Paris)    │                        │   (Malaga)   │
└──────┬───────┘                        └───────┬──────┘
       │                                        │
       │            WebSocket/Realtime          │
       └──────────────────┬─────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Backend Service     │
              │  (Firebase/Supabase)  │
              ├───────────────────────┤
              │  • Authentication     │
              │  • Game Matchmaking   │
              │  • Real-time Sync     │
              │  • Leaderboards       │
              │  • Game History       │
              └───────────────────────┘
```

---

## Architecture Comparison

### Firebase Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FIREBASE                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Firebase Auth  │  │    Firestore    │  │   Cloud Func    │ │
│  │                 │  │   (Database)    │  │   (Optional)    │ │
│  │  • Google SSO   │  │                 │  │                 │ │
│  │  • Email/Pass   │  │  • Users        │  │  • Matchmaking  │ │
│  │  • Anonymous    │  │  • Games        │  │  • Validation   │ │
│  │                 │  │  • Leaderboard  │  │  • Cleanup      │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                     │          │
│           └────────────────────┼─────────────────────┘          │
│                                │                                 │
│                    ┌───────────▼───────────┐                    │
│                    │   Firebase SDK        │                    │
│                    │   (Client-side)       │                    │
│                    └───────────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│   │  Auth    │    │  Lobby   │    │   Game   │    │  Stats   │ │
│   │  Screen  │───►│  Screen  │───►│  Screen  │───►│  Screen  │ │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│                                                                  │
│   Vanilla JS + Firebase SDK (or migrate to Vue/React)           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Firebase Services:**
| Service | Purpose | Pricing |
|---------|---------|---------|
| Authentication | User login/signup | Free (50k MAU) |
| Firestore | NoSQL database + realtime | Free (1GB storage, 50k reads/day) |
| Cloud Functions | Server-side logic | Free (2M invocations/month) |
| Hosting | Static file hosting | Free (10GB/month) |

---

### Supabase Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Supabase Auth  │  │   PostgreSQL    │  │    Realtime     │ │
│  │                 │  │   (Database)    │  │                 │ │
│  │  • Google SSO   │  │                 │  │  • Broadcast    │ │
│  │  • Email/Pass   │  │  • users        │  │  • Presence     │ │
│  │  • Magic Link   │  │  • games        │  │  • DB Changes   │ │
│  │                 │  │  • leaderboard  │  │                 │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                     │          │
│           │           ┌────────▼────────┐           │          │
│           │           │   Row Level     │           │          │
│           └──────────►│   Security      │◄──────────┘          │
│                       │   (RLS)         │                       │
│                       └────────┬────────┘                       │
│                                │                                 │
│                    ┌───────────▼───────────┐                    │
│                    │   Supabase SDK        │                    │
│                    │   (Client-side)       │                    │
│                    └───────────────────────┘                    │
│                                                                  │
│  ┌─────────────────┐                                            │
│  │  Edge Functions │  (Optional - Deno-based serverless)        │
│  └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                            │
├─────────────────────────────────────────────────────────────────┤
│   Same as Firebase - Vanilla JS or Framework                    │
└─────────────────────────────────────────────────────────────────┘
```

**Key Supabase Services:**
| Service | Purpose | Pricing |
|---------|---------|---------|
| Authentication | User login/signup | Free (50k MAU) |
| PostgreSQL | Relational database | Free (500MB, 2 projects) |
| Realtime | WebSocket subscriptions | Free (200 concurrent) |
| Edge Functions | Server-side logic | Free (500k invocations) |
| Storage | File storage | Free (1GB) |

---

## Data Models

### Firebase (Firestore - NoSQL)

```
firestore/
├── users/
│   └── {userId}/
│       ├── displayName: "Alex"
│       ├── email: "alex@example.com"
│       ├── photoURL: "https://..."
│       ├── stats: {
│       │     totalGames: 42,
│       │     wins: 28,
│       │     losses: 14,
│       │     bestStreak: 12,
│       │     accuracy: 0.78
│       │   }
│       └── createdAt: Timestamp
│
├── games/
│   └── {gameId}/
│       ├── status: "waiting" | "playing" | "finished"
│       ├── createdAt: Timestamp
│       ├── settings: {
│       │     difficulty: "medium",
│       │     questionCount: 10,
│       │     timePerQuestion: 15
│       │   }
│       ├── players: {
│       │     player1: {
│       │       oderId,
│       │       displayName,
│       │       score: 0,
│       │       currentAnswer: null,
│       │       ready: false
│       │     },
│       │     player2: { ... }
│       │   }
│       ├── currentQuestion: 0
│       ├── questions: [ ... ] // Generated on game start
│       └── winner: null | oderId
│
├── lobbies/
│   └── {lobbyId}/
│       ├── code: "ABC123"  // Join code
│       ├── hostId: oderId
│       ├── players: [oderId, ...]
│       ├── status: "open" | "full" | "started"
│       └── createdAt: Timestamp
│
└── leaderboard/
    └── global/
        └── {oderId}/
            ├── displayName: "Alex"
            ├── wins: 28
            ├── rating: 1850
            └── updatedAt: Timestamp
```

### Supabase (PostgreSQL - Relational)

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    total_games INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    accuracy DECIMAL(5,4) DEFAULT 0,
    rating INTEGER DEFAULT 1500,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT CHECK (status IN ('waiting', 'playing', 'finished')) DEFAULT 'waiting',
    difficulty TEXT DEFAULT 'medium',
    question_count INTEGER DEFAULT 10,
    time_per_question INTEGER DEFAULT 15,
    current_question INTEGER DEFAULT 0,
    questions JSONB, -- Array of question objects
    winner_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

-- Game players (many-to-many)
CREATE TABLE game_players (
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES profiles(id),
    score INTEGER DEFAULT 0,
    current_answer TEXT,
    ready BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (game_id, player_id)
);

-- Lobbies for matchmaking
CREATE TABLE lobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- 6-char join code
    host_id UUID REFERENCES profiles(id),
    status TEXT CHECK (status IN ('open', 'full', 'started')) DEFAULT 'open',
    max_players INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lobby players
CREATE TABLE lobby_players (
    lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
    player_id UUID REFERENCES profiles(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (lobby_id, player_id)
);

-- Global leaderboard (materialized view for performance)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT
    id,
    display_name,
    avatar_url,
    wins,
    rating,
    RANK() OVER (ORDER BY rating DESC) as rank
FROM profiles
WHERE total_games >= 5
ORDER BY rating DESC
LIMIT 100;
```

---

## Real-time Game Flow

### Sequence Diagram

```
Player 1 (Host)              Backend                Player 2 (Guest)
      │                         │                         │
      │  1. Create Lobby        │                         │
      │────────────────────────►│                         │
      │                         │                         │
      │  Lobby Code: "ABC123"   │                         │
      │◄────────────────────────│                         │
      │                         │                         │
      │                         │  2. Join with code      │
      │                         │◄────────────────────────│
      │                         │                         │
      │  Player 2 joined!       │  Joined lobby!          │
      │◄────────────────────────│────────────────────────►│
      │                         │                         │
      │  3. Start Game          │                         │
      │────────────────────────►│                         │
      │                         │                         │
      │  Game Started!          │  Game Started!          │
      │◄────────────────────────│────────────────────────►│
      │                         │                         │
      │      ┌──────────────────┴──────────────────┐      │
      │      │         FOR EACH QUESTION           │      │
      │      └──────────────────┬──────────────────┘      │
      │                         │                         │
      │  Question #1            │  Question #1            │
      │◄────────────────────────│────────────────────────►│
      │                         │                         │
      │  4. Submit Answer       │                         │
      │────────────────────────►│                         │
      │                         │                         │
      │  P1 answered (waiting)  │  P1 answered (waiting)  │
      │◄────────────────────────│────────────────────────►│
      │                         │                         │
      │                         │  5. Submit Answer       │
      │                         │◄────────────────────────│
      │                         │                         │
      │  Results: P1 ✓, P2 ✗    │  Results: P1 ✓, P2 ✗    │
      │◄────────────────────────│────────────────────────►│
      │                         │                         │
      │      └──────────────────┴──────────────────┘      │
      │                         │                         │
      │  Final: P1 wins 8-6!    │  Final: P1 wins 8-6!    │
      │◄────────────────────────│────────────────────────►│
      │                         │                         │
```

### Firebase Implementation

```javascript
// Listen to game state changes
const gameRef = doc(db, 'games', gameId);

onSnapshot(gameRef, (snapshot) => {
    const game = snapshot.data();

    switch (game.status) {
        case 'waiting':
            showWaitingScreen(game);
            break;
        case 'playing':
            updateGameUI(game);
            break;
        case 'finished':
            showResults(game);
            break;
    }
});

// Submit answer
async function submitAnswer(answer) {
    const playerKey = `players.${myUserId}`;

    await updateDoc(gameRef, {
        [`${playerKey}.currentAnswer`]: answer,
        [`${playerKey}.answeredAt`]: serverTimestamp()
    });
}
```

### Supabase Implementation

```javascript
// Subscribe to game changes
const gameChannel = supabase
    .channel(`game:${gameId}`)
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload) => {
            updateGameUI(payload.new);
        }
    )
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_players', filter: `game_id=eq.${gameId}` },
        (payload) => {
            updatePlayerState(payload.new);
        }
    )
    .subscribe();

// Submit answer
async function submitAnswer(answer) {
    await supabase
        .from('game_players')
        .update({
            current_answer: answer,
            answered_at: new Date().toISOString()
        })
        .eq('game_id', gameId)
        .eq('player_id', myUserId);
}
```

---

## Authentication

### Firebase Auth Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │     │  Firebase   │     │   App       │
│   Screen    │────►│    Auth     │────►│   Ready     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Google  │ │  Email   │ │ Anonymous│
        │   SSO    │ │ Password │ │  (Guest) │
        └──────────┘ └──────────┘ └──────────┘
```

```javascript
// Firebase Auth
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const auth = getAuth();

// Google Sign-in
async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
}

// Anonymous (play as guest)
async function playAsGuest() {
    const result = await signInAnonymously(auth);
    return result.user;
}
```

### Supabase Auth Flow

```javascript
// Supabase Auth
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Google Sign-in
async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
    });
    return data;
}

// Email Magic Link (passwordless)
async function signInWithEmail(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
        email: email
    });
    return data;
}
```

---

## Cost Comparison

### Free Tier Limits

| Feature | Firebase | Supabase |
|---------|----------|----------|
| **Auth Users** | 50,000 MAU | 50,000 MAU |
| **Database** | 1 GB storage | 500 MB storage |
| **Reads** | 50,000/day | Unlimited |
| **Writes** | 20,000/day | Unlimited |
| **Realtime** | Included | 200 concurrent |
| **Bandwidth** | 10 GB/month | 2 GB/month |
| **Functions** | 2M invocations | 500K invocations |

### Estimated Usage (1,000 daily active users)

| Metric | Estimate | Firebase | Supabase |
|--------|----------|----------|----------|
| Games/day | 2,000 | Free | Free |
| DB reads/day | 100,000 | ~$0.06 | Free |
| DB writes/day | 20,000 | Free | Free |
| Realtime connections | 200 peak | Free | Free |
| **Monthly Cost** | - | **~$2** | **Free** |

### Scaling Costs (10,000 DAU)

| | Firebase | Supabase |
|---|----------|----------|
| Monthly estimate | $25-50 | $25 (Pro plan) |

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Set up Firebase/Supabase project
- [ ] Implement authentication (Google + Guest)
- [ ] Create user profiles
- [ ] Migrate localStorage stats to cloud

### Phase 2: Lobby System (Week 2)
- [ ] Create lobby UI
- [ ] Generate join codes
- [ ] Real-time lobby updates
- [ ] Ready-up system

### Phase 3: Multiplayer Game (Week 2-3)
- [ ] Sync question generation
- [ ] Real-time answer submission
- [ ] Score tracking
- [ ] Handle disconnections

### Phase 4: Polish (Week 3-4)
- [ ] Global leaderboard
- [ ] Match history
- [ ] Friend system (optional)
- [ ] Rating/ELO system

### File Structure (After Migration)

```
european-capitals/
├── index.html
├── styles.css
├── src/
│   ├── main.js              # Entry point
│   ├── config.js            # Firebase/Supabase config
│   ├── auth/
│   │   ├── auth.js          # Auth logic
│   │   └── authUI.js        # Login/signup UI
│   ├── game/
│   │   ├── singlePlayer.js  # Current quiz logic
│   │   ├── multiplayer.js   # Real-time game logic
│   │   └── questions.js     # Question generation
│   ├── lobby/
│   │   ├── lobby.js         # Lobby management
│   │   └── lobbyUI.js       # Lobby UI
│   ├── state/
│   │   └── store.js         # Centralized state
│   └── utils/
│       └── helpers.js
├── package.json             # For Firebase/Supabase SDK
└── firebase.json            # or supabase config
```

---

## Recommendation

### Choose Firebase if:
- You want the fastest path to production
- You prefer NoSQL/document databases
- You might use other Google services (Analytics, Crashlytics)
- You don't mind vendor lock-in

### Choose Supabase if:
- You prefer SQL and relational data
- You want the option to self-host later
- You value open-source
- You want more generous free tier limits

### My Recommendation: **Supabase**

For a multiplayer quiz game:
1. **Relational data fits better** - Players, games, scores have clear relationships
2. **More generous free tier** - Unlimited reads/writes
3. **PostgreSQL is portable** - Can migrate to any Postgres host
4. **Open source** - No vendor lock-in concerns
5. **Row Level Security** - Clean permission model

---

## Next Steps

1. **Choose platform** (Firebase or Supabase)
2. **Create account** and project
3. **Start with Phase 1** - Auth + user profiles
4. **Keep single-player working** while building multiplayer

Ready to start? Let me know which platform you choose!
