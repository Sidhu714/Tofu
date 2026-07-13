import WebSocket, { WebSocketServer } from "ws";
import * as Y from "yjs"
import * as syncProtocol from "y-protocols/sync"
import * as awarenessProtocol from "y-protocols/awareness"
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

const wss = new WebSocketServer({ port: 8000 });

const messageSync = 0;
const messageAwareness = 1;

type Room = {
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  clients: Set<WebSocket>;

  // tracks which awareness clientIDs belong to which socket, so we can
  // clean them up correctly when that socket disconnects
  connControlledIDs: Map<WebSocket, Set<number>>;
}

const rooms = new Map<string, Room>();


function send(ws: WebSocket, message: Uint8Array) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(message);
  }
}


function broadCast(room: Room, message: Uint8Array, exclude?: WebSocket) {
  room.clients.forEach((client) => {
    if (client !== exclude) send(client, message);
  })
}


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


function getOrCreateRoom(roomid: string): Room {
  let room = rooms.get(roomid);

  if (room) return room;


  let doc = roomDocs.get(roomid);

  doc = new Y.Doc();
  doc.getText("code");
  doc.getMap("meta").set("language", DEFAULT_LANGUAGE);

  //It stores temporary things like cursor position,username,selected text,online status
  // for example Alice  cursor = line 4

  const awareness = new awarenessProtocol.Awareness(doc);

  room = {
    doc,
    awareness,
    clients: new Set(),
    connControlledIDs: new Map()
  };

  rooms.set(roomid, room);

  doc.on("update", (update: Uint8Array, origin: WebSocket | null) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    broadCast(room, encoding.toUint8Array(encoder), origin ?? undefined)
  })


  awareness.on(
    "update",
    (
      { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
      origin: WebSocket | null
    ) => {
      const changedIDs = added.concat(updated, removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedIDs)
      );
      broadCast(room!, encoding.toUint8Array(encoder), origin ?? undefined);
    }
  );

  return room;

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

  const room = getOrCreateRoom(roomid)
  room.clients.add(ws);
  room.connControlledIDs.set(ws, new Set());

  console.log(`Client joined ${roomid}`);


  {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, room.doc);
    send(ws, encoding.toUint8Array(encoder));
  }

  // --- Send current awareness (existing cursors) to the new client ---
  const states = room.awareness.getStates();
  if (states.size > 0) {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(room.awareness, Array.from(states.keys()))
    );
    send(ws, encoding.toUint8Array(encoder));
  }



  ws.on("message", (data: WebSocket.RawData) => {
    const message = data instanceof ArrayBuffer ? new Uint8Array(data) : (data as Uint8Array);
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case messageSync: {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        // This single call handles SyncStep1, SyncStep2, and Update messages,
        // applies them to room.doc (tagging `ws` as the origin), and writes
        // a reply into `encoder` if one is needed (e.g. our SyncStep2 reply
        // to their SyncStep1).
        syncProtocol.readSyncMessage(decoder, encoder, room.doc, ws);
        if (encoding.length(encoder) > 1) {
          send(ws, encoding.toUint8Array(encoder));
        }
        break;
      }
      case messageAwareness: {
        const update = decoding.readVarUint8Array(decoder);
        awarenessProtocol.applyAwarenessUpdate(room.awareness, update, ws);

        const decoder2 = decoding.createDecoder(update);
        const numClients = decoding.readVarUint(decoder2);
        const controlled = room.connControlledIDs.get(ws)!;
        for (let i = 0; i < numClients; i++) {
          const clientID = decoding.readVarUint(decoder2);
          controlled.add(clientID);
          decoding.readVarUint(decoder2);   // clock
          decoding.readVarString(decoder2); // state JSON — read and discard
        }
        break;
      }
    }
  });

  ws.on("close", () => {
    room.clients.delete(ws);

    // Remove any awareness state (cursor) this client owned
    const controlled = room.connControlledIDs.get(ws);
    if (controlled) {
      awarenessProtocol.removeAwarenessStates(room.awareness, Array.from(controlled), null);
    }
    room.connControlledIDs.delete(ws);

    if (room.clients.size === 0) {
      rooms.delete(roomid);
    }
  });
});

console.log("WebSocket server is running on ws://localhost:8000");
