# CodeRoom

A real-time collaborative code editor. Everyone currently connected writes code together in a Monaco-powered editor, switches languages, and runs code — with every change and every result broadcast live to all connected clients over WebSockets.

> **Current limitation:** there's no room/session concept yet — every connected client, anywhere, shares one single global editor. Multi-room support (isolated sessions, join-by-link) is the next milestone. This README describes what's actually implemented today.

## Features

- **Live collaborative editing** — code changes broadcast instantly to every connected client via WebSocket.
- **Multi-language support** — pick a language from the dropdown; the editor and starter snippet update for everyone connected.
- **Remote code execution** — runs code through [onlinecompiler.io](https://onlinecompiler.io), shows stdout/stderr in a dedicated output console, and syncs the result to every connected client.
- **Connection status indicator** — a live badge in the header shows **Live · synced** or **Offline** based on WebSocket connection state.

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| UI | Tailwind CSS + Radix UI primitives + Framer Motion |
| Real-time sync | `ws` (standalone WebSocket server) |
| Code execution | onlinecompiler.io API, proxied through a Next.js API route |
| Language | TypeScript throughout |

## Project structure

```
.
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── CodeEditor/page.tsx         # Editor route
│   │   ├── components/
│   │   │   ├── CodeEditor.tsx          # Main layout: editor + output panels
│   │   │   ├── LanguageSelector.tsx    # Language dropdown
│   │   │   ├── Navbar.tsx              # Top nav
│   │   │   └── Output.tsx              # Run button + output console
│   │   └── api/execute/route.ts        # Proxies code execution to onlinecompiler.io
│   ├── components/ui/                  # Radix-based UI primitives (button, dialog, popover, command)
│   ├── hooks/
│   │   └── useWebsocket.ts             # WebSocket client hook
│   ├── lib/
│   │   ├── api.ts                      # executeCode() — calls /api/execute
│   │   ├── languages.ts                # CODE_SNIPPETS, LANGUAGE_CHOICES
│   │   └── utils.ts
│   └── .env.example
└── backend/
    └── server/
        ├── src/index.ts                # WebSocket relay server (ws)
        └── package.json                # Separate package: build with tsc, run compiled output
```

## Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)

## Setup

**1. Clone and install dependencies**

```bash
git clone <your-repo-url>
cd <repo-folder>
cd frontend && npm install
cd ../backend/server && npm install
```

**2. Configure environment variables**

Copy `frontend/.env.example` to `frontend/.env` and fill in:

```env
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000
ONLINE_COMPILER_API_KEY=
```

**3. Start the WebSocket server**

From `backend/server`:

```bash
npm run build
npm start
```

Or for auto-reload during development:

```bash
npm run build && npm run watch
```

You should see:

```
WebSocket server is running on ws://localhost:8000
```

**4. Start the Next.js app**

From `frontend`, in a second terminal:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Usage

1. Open `http://localhost:3000/CodeEditor` in your browser.
2. Open the same URL in a second tab, or on a second machine pointed at the same backend — there's currently one shared global session, so any connected client sees the same editor.
3. Pick a language from the dropdown in the editor header.
4. Write code in the Monaco editor — changes appear for every other connected client instantly.
5. Click **Run** to execute the code. The output (and status: running / success / error) appears in the right-hand panel and syncs to all connected clients.
6. The badge in the top bar shows **Live · synced** while the WebSocket connection is active, and **Offline** if it drops.

## Troubleshooting

- **"Offline" badge / nothing syncs** — make sure the WebSocket server (`backend/server`, built and running via `npm start`) is up, and `NEXT_PUBLIC_WEBSOCKET_URL` in `frontend/.env` matches its address and port.
- **Run button does nothing / errors out** — check `ONLINE_COMPILER_API_KEY` is set correctly in `frontend/.env` and that onlinecompiler.io is reachable.
- **Dev server memory grows over time** — `useWebsocket.ts` should always close the socket unconditionally in its cleanup function (`ws.close()`, not gated on `readyState === OPEN`), otherwise sockets can leak across Fast Refresh/Strict Mode remounts.

## Roadmap

- [ ] Per-room sessions (`ws://.../room/:roomId`) instead of one global broadcast
- [ ] State sync on join — new clients see the current document instead of a blank editor
- [ ] User identity (name + color per connection)
- [ ] Live cursors and participant presence
- [ ] Conflict-free concurrent editing (CRDT-based, via Yjs)
- [ ] Horizontal scaling across multiple WebSocket server instances