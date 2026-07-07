import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8000 });

const rooms = new Map<string, Set<WebSocket>>();


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



  ws.on("message", (message: WebSocket.RawData) => {
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
    }
  });
});

console.log("WebSocket server is running on ws://localhost:8000");
