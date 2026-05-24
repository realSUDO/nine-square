# Nine Square

A hand-drawn-style Tic-Tac-Toe game built with React + Vite. Play locally with a friend on the same device, or challenge someone online via a shareable room code.

### Live link : https://ns.sudohq.me
## Features

- **Local multiplayer** — two players on the same screen
- **Online multiplayer** — create a room, share the code or link, play in real-time via WebSockets
- **Hand-drawn aesthetic** — SVG board with sketch-like grid lines and symbols
- **Sound effects** — click, win, lose, and tie audio cues
- **Dark mode** — toggle between light and dark themes
- **Win animation** — confetti burst on the winner's player card

## Tech Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React 19, Vite                |
| Realtime | Socket.IO (client + server)   |
| Backend  | Node.js, Express              |
| Styling  | Plain CSS                     |

## Folder Structure

```
nine-square/
├── public/
│   ├── click.mp3 / win.mp3 / lost.mp3 / tye.mp3   # sound effects
│   └── user-base.png / user-base-dark.png           # player avatars
├── src/
│   ├── components/
│   │   ├── Board.jsx          # SVG game board with win-strike animation
│   │   └── FriendsFlow.jsx    # Online lobby UI (create/join room)
│   ├── utils/
│   │   ├── winner.js          # Win-condition checker
│   │   └── sfx.js             # Sound effect helpers
│   ├── Game.jsx               # Main game logic & state (active entry point)
│   ├── App.jsx                # Standalone local-only prototype (unused)
│   ├── game.css               # All styles
│   └── main.jsx               # React entry point
├── server.js                  # Socket.IO + Express server (online mode)
├── vite.config.js
└── package.json
```

> `Game.jsx` is the real app. `App.jsx` is an earlier local-only prototype.

## Getting Started

**Install dependencies**
```bash
npm install
```

**Run frontend only (local multiplayer)**
```bash
npm run dev
```

**Run with online multiplayer**

Start the backend server in one terminal:
```bash
node server.js
```
Then start Vite in another:
```bash
npm run dev
```

**Build for production**
```bash
npm run build
node server.js   # serves the built client from /dist
```

## Online Multiplayer Flow

1. One player clicks **Online Multiplayer → Create Room** and shares the room code or invite link.
2. The other player enters the code (or opens the link) and clicks **Join Room**.
3. The game starts automatically once both players are in.
4. Both players must agree to start the next round — each clicks **Next Round**.
