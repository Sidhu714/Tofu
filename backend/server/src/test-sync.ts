// test-sync.ts
import WebSocket from "ws";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

const messageSync = 0;
const ROOM = "test-room";


// this is client testing

function connect(name: string, onReady: (doc: Y.Doc, ws: WebSocket) => void) {
  const doc = new Y.Doc();
  const ws = new WebSocket(`ws://localhost:8000/${ROOM}`);
  ws.binaryType = "arraybuffer";

  

  ws.on("open", () => console.log(`[${name}] connected`));

  //Whenever the server sends something..., Client receives bytes

  ws.on("message", (data: any) => {
    const message = new Uint8Array(data);
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);

    if (messageType === messageSync) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.readSyncMessage(decoder, encoder, doc, ws);
      if (encoding.length(encoder) > 1) {
        ws.send(encoding.toUint8Array(encoder));
      }
    }
  });

  doc.on("update", (update: Uint8Array, origin: any) => {
    if (origin === "local") {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      ws.send(encoding.toUint8Array(encoder));
    }
  });

  ws.on("open", () => onReady(doc, ws));
}

connect("A", (docA) => {
  setTimeout(() => {
    console.log("[A] inserting 'hello'");
    docA.transact(() => {
      docA.getText("code").insert(0, "hello");
    }, "local"); // FIXED: origin goes here, not in .insert()
  }, 500);
});

connect("B", (docB) => {
  setTimeout(() => {
    console.log("[B] sees:", docB.getText("code").toString());
    console.log("[B] appending ' world'");
    docB.transact(() => {
      const yt = docB.getText("code");
      yt.insert(yt.length, " world");
    }, "local"); // FIXED: same here
  }, 1500);

  setTimeout(() => {
    console.log("[B] final:", docB.getText("code").toString());
  }, 2500);
});