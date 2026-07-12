import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8000 });

const rooms = new Map<string, Set<WebSocket>>();


type RoomState = { code: string; language: string }
const roomState = new Map<string, RoomState>();


const DEFAULT_STATE: RoomState = { code: "", language: "python" }

wss.on("connection", (ws: WebSocket, request) => {
  console.log("A client connected");

  const roomid = request.url?.slice(1);

  if (!roomid) {
    ws.close()
    return
  }

  if (!rooms.has(roomid)) {
    rooms.set(roomid, new Set())
  }

  rooms.get(roomid)?.add(ws)


  console.log(`Client joined ${roomid}`);

  const state = roomState.get(roomid) ?? DEFAULT_STATE;

  ws.send(
    JSON.stringify({
      type: "language_change",
      language: state.language,
      code: state.code
    })
  )

  ws.on("message", (message: WebSocket.RawData) => {

    const raw = message.toString();

    console.log("the raw message", raw)

    try {
      const parsed = JSON.parse(raw);
      const prev = roomState.get(roomid) ?? DEFAULT_STATE

      if (parsed.type === "code_change") {
        roomState.set(roomid, { ...prev, code: parsed.code })
      } else if (parsed.type === "language_change") {
        roomState.set(roomid, { code: parsed.code, language: parsed.language })
      }

    } catch (err) {
      console.error("Invalid message JSON, relaying anyway:", err);
    }

    const clients = rooms.get(roomid);

    clients?.forEach((client) => {

      if (client !== ws && client?.readyState === WebSocket.OPEN) {
        client.send(message.toString())
      }
    })
  });

  ws.on("close", () => {
    const clients = rooms.get(roomid);

    clients?.delete(ws);

    if (clients?.size === 0) {
      rooms.delete(roomid);
      roomState.delete(roomid)
    }
  });
});

console.log("WebSocket server is running on ws://localhost:8000");
