"use client"

import { createContext, useCallback, useContext, useRef } from "react"
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

type MessageHandler = (message: WebSocketMessage) => void


type WebsocketContextType = {
    isConnected: boolean,
    sendMessage: (message: WebSocketMessage) => void,
    subscribe: (
        type: WebSocketMessage["type"],
        handler: MessageHandler
    ) => () => void
}


const WebsocketContext = createContext<WebsocketContextType | null>(null);


export function WebsocketProvider({
    roomId,
    children
}: {
    roomId: string;
    children: React.ReactNode
}) {


    const listeners = useRef(
        new Map<WebSocketMessage["type"], Set<MessageHandler>>()
    );


    const { isConnected, sendMessage } = useWebsocket({
        roomId,
        onMessage: (data) => {
            const handlers = listeners.current.get(data.type);

            handlers?.forEach(handler => handler(data))
        }
    })




    const subscribe = useCallback((type: WebSocketMessage["type"], handler: MessageHandler) => {
        if (!listeners.current.get(type)) {
            listeners.current.set(type, new Set())
        }

        listeners.current.get(type)?.add(handler);

        //unsubscribe

        return () => {
            listeners.current.get(type)?.delete(handler);

            if (listeners.current.get(type)?.size === 0) {
                listeners.current.delete(type)
            }
        }
    }, [])



    return (
        <WebsocketContext.Provider
            value={{
                isConnected, sendMessage, subscribe
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