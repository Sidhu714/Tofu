# Tofu

A real-time collaborative code editor. Multiple people can join the same session, write code together in a Monaco-powered editor, switch languages, and run code — with every change and every result synced live across all connected clients over WebSockets.

## Features

- **Live collaborative editing** — code changes and language switches broadcast instantly to everyone connected via WebSocket.
- **Multi-language support** — pick a language from the dropdown; the editor and starter snippet update for everyone in the room.
- **Remote code execution** — run code and see stdout/stderr in a dedicated output console, also synced to other participants.
- **Connection status indicator** — a live badge in the header shows whether the session is currently synced.

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js (App Router, Turbopack) |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| UI | Chakra UI + Tailwind CSS |
| Real-time sync | `ws` (WebSocket server) |
| Language | TypeScript |

## Project structure

```
.
├── app/
│   ├── page.tsx                 # Landing page
│   ├── CodeEditor/               # Editor route
│   └── api/execute/               # Code execution API route
├── components/
│   ├── TheEditorComponent.tsx    # Main layout: editor + output panels
│   ├── LanguageSelector.tsx      # Language dropdown
│   └── Output.tsx                # Run button + output console
├── hooks/
│   └── useWebsocket.ts           # WebSocket client hook
├── lib/
│   ├── api.ts                    # executeCode() — calls /api/execute
│   └── languages.ts              # CODE_SNIPPETS, LANGUAGE_CHOICES
├── server/
│   └── index.ts                  # Standalone WebSocket server (ws)
└── .env                          # Environment variables
```

> Adjust paths above if your actual folder layout differs — this reflects the files referenced in the app so far.

## Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)

## Setup

**1. Clone and install dependencies**

```bash
git clone <your-repo-url>
cd TOFU
npm install
```

**2. Configure environment variables**

Create a `.env` file in the project root:

```env
# WebSocket server the frontend connects to
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000

# Code execution API (fill in whatever your /api/execute route relies on,
# e.g. a Judge0 instance or RapidAPI key)
EXECUTE_API_URL=
EXECUTE_API_KEY=
```

**3. Start the WebSocket server**

In one terminal:

```bash
npx tsx server/index.ts
```

You should see:

```
WebSocket server is running on ws://localhost:8000
```

**4. Start the Next.js app**

In a second terminal:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Usage

1. Open `http://localhost:3000/CodeEditor` in your browser.
2. Open the same URL in a second tab (or share it with a collaborator) to test real-time sync.
3. Pick a language from the dropdown in the editor header.
4. Write code in the Monaco editor — changes appear in the other tab instantly.
5. Click **Run** to execute the code. The output (and status: running / success / error) appears in the right-hand panel and syncs to all connected clients.
6. The badge in the top bar shows **Live · synced** while the WebSocket connection is active, and **Offline** if it drops.

## Troubleshooting

- **"Offline" badge / nothing syncs** — make sure the WebSocket server (`server/index.ts`) is running and `NEXT_PUBLIC_WEBSOCKET_URL` in `.env` matches its address and port.
- **Run button does nothing / errors out** — check `EXECUTE_API_URL` / `EXECUTE_API_KEY` are set correctly and that the execution service is reachable.
- **Dev server memory grows over time** — make sure you're on a version of `useWebsocket.ts` that always closes the socket in its cleanup function (`ws.close()` unconditionally, not gated on `readyState === OPEN`), otherwise sockets can leak across Fast Refresh/Strict Mode remounts.

## License

MIT (or update to whatever you're using).
