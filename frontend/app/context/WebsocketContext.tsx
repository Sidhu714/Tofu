"use client"

import { createContext, useContext } from "react"
import { useWebsocket } from "@/hooks/useWebsocket";


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
        type: "output",
        output: string[];
    }


type WebsocketContextType = {
    isConnected: boolean,
    sendMessage: (message: WebSocketMessage) => void
}


const WebsocketContext = createContext<WebsocketContextType | null>(null);


export function WebsocketProvider({
    roomId,
    children
}: {
    roomId: string;
    children: React.ReactNode
}) {
    const { isConnected, sendMessage } = useWebsocket({
        roomId,
        onMessage: (data) => {
            console.log("Provider received:", data);
        }
    })

    return (
        <WebsocketContext.Provider
            value={{
                isConnected, sendMessage
            }}
        >
            {children}
        </WebsocketContext.Provider>
    )
}

export function useWebsocketContext() {
    const context = useContext(WebsocketContext);

    if (!context) {
        throw new Error(
            "useWebsocketContext must be used inside WebsocketProvider"
        );
    }

    return context;
}