import { useState,useEffect,useCallback } from "react";


interface WebSocketMessage{
    type : string,
    [key : string] : any
}

export function useWebsocket(roomId : string){
    
    const [socket,setSocket] = useState<WebSocket | null>(null);
    const [isConnected,setIsConnected] = useState(false);

    useEffect(() =>{
        const ws = new WebSocket(
          `${process.env.NEXT_PUBLIC_WEBSOCKET_URL!}/${roomId}`
        );

        ws.onopen = () =>{
            console.log('Connected to WebSocket server');
            // toast({
            //     title : "WebSocket Connection Established",
            //     status : "success",
            //     isClosable: true
            // })

            

            ws?.send(JSON.stringify({
              type : "sync",
              code : "initialcode"
            }))

            setIsConnected(true);
            setSocket(ws);

            
        }
        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
            setIsConnected(false);
            setSocket(null);
          };
      
          ws.onerror = (error) => {
            console.error('WebSocket error:', error);
          };
      
          return () => {
              ws.close(); // always close, regardless of readyState
          };
    },[]);

    const sendMessage = useCallback((message : WebSocketMessage) =>{
      if(socket && socket.readyState === WebSocket.OPEN){
        socket.send(JSON.stringify(message))
      }else{
        console.error('Websocket is not connected')
      }
    },[socket])

    return { socket,isConnected,sendMessage}
}