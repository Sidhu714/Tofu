import WebSocket, { WebSocketServer } from "ws";
import * as Y from "yjs"



const wss = new WebSocketServer({ port: 8000 });

const rooms = new Map<string, Set<WebSocket>>();


// CHANGED: one Y.Doc per room instead of a plain {code, language} object
const roomDocs = new Map<string, Y.Doc>();

const DEFAULT_LANGUAGE = "python";


// roomDocs

// "room1" -> Y.Doc
// "room2" -> Y.Doc
// "room3" -> Y.Doc



// this function creates a like 

// roomDocs

// abc
//  └── Y.Doc
//       ├── code = ""
//       └── language = "python"


function getOrCreateDoc(roomid: string): Y.Doc {
  let doc = roomDocs.get(roomid);
  if (!doc) {
    doc = new Y.Doc();
    const yText = doc.getText("code");
    const yMeta = doc.getMap("meta");
    yMeta.set("language", DEFAULT_LANGUAGE);
    roomDocs.set(roomid, doc)
  }

  return doc;
}


function getDocState(doc: Y.Doc) {
  return {
    code: doc.getText("code").toString(),
    language: (doc.getMap("meta").get("language") as string) ?? DEFAULT_LANGUAGE,
  }
}

function setDocCode(doc: Y.Doc, code: string) {
  const ytext = doc.getText("code");
  doc.transact(() => {
    ytext.delete(0, ytext.length);
    ytext.insert(0, code);
  })
}

function setDocLanguage(doc: Y.Doc, language: string, code: string) {
  doc.transact(() => {
    doc.getMap("meta").set("language", language);
    setDocCode(doc, code);
  });
}

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

  const doc = getOrCreateDoc(roomid);
  const state = getDocState(doc);



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
      const doc = getOrCreateDoc(roomid);

      if (parsed.type === "code_change") {
        setDocCode(doc, parsed.code)
      } else if (parsed.type === "language_change") {
        setDocLanguage(doc, parsed.language, parsed.code)
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
      roomDocs.delete(roomid)
    }
  });
});

console.log("WebSocket server is running on ws://localhost:8000");
