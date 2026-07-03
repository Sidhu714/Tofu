import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8000 });

wss.on("connection", (ws: WebSocket) => {
  console.log("A client connected");

  ws.on("message", (message: WebSocket.RawData) => {
    const data = JSON.parse(message.toString());

    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  ws.on("close", () => {
    console.error("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8000");
