"use client"

import { useEffect,useRef,useState } from "react"
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

const messageSync = 0;
const messageAwareness = 1;


export function useYjsRoom(roomId : string){
    const [isConnected,setIsConnected] = useState(false);

    const docRef = useRef<Y.Doc>();
    const awarenessRef = useRef<awarenessProtocol.Awareness>();
    const wsRef = useRef<WebSocket>();

    if(!docRef.current){
        docRef.current = new Y.Doc();
        awarenessRef.current = new awarenessProtocol.Awareness(docRef.current);
    }

    useEffect(() =>{
        
    },[])
}