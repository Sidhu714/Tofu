import { useState, useEffect, useCallback, useRef } from "react";




type WebSocketMessage =

  | {
    type: "code_change";
    code: string
  }
  | {
    type: "language_change";
    language: string;
    code: string;
  } 
  | {
    type : "output",
    output : string[];
  }

type WebsocketParams = {
  roomId: string,
  onMessage: (messsage: WebSocketMessage) => void
}

export function useWebsocket({ roomId, onMessage }: WebsocketParams) {

  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef(onMessage);


  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);


  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WEBSOCKET_URL!}/${roomId}`
    );

    console.log("Opening websocket");

    ws.onopen = () => {
      
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      socketRef.current = ws;
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current?.(data);
      } catch (err) {
        console.error("Invalid websocket message", err);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      socketRef.current = null;
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close(); // always close, regardless of readyState
    };
  }, [roomId]);



  const sendMessage = useCallback((message: WebSocketMessage) => {

    const socket = socketRef.current;

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
    } else {
      console.error('Websocket is not connected')
    }
  }, [])

  return {
    isConnected,
    sendMessage,
    socket: socketRef.current
  }
}