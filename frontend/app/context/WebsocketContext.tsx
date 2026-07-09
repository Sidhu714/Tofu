"use client"

import { createContext,useContext } from "react"

type WebsocketContextType = {
    isConnected : boolean,
    sendMessage : (message : any) => void
}

const WebsocketContext = createContext<WebsocketContextType | null>(null);


export function useWebsocketContext(){
    const context = useContext(WebsocketContext);

    if (!context) {
        throw new Error(
            "useWebsocketContext must be used inside WebsocketProvider"
        );
    }

    return context;
}