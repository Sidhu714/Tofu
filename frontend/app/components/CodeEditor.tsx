'use client'

import { Editor } from "@monaco-editor/react"
import LanguageSelector from "./LanguageSelector"
import { useEffect, useRef, useState } from "react"
import { CODE_SNIPPETS } from "@/lib/languages"
import Output from "./Output"
import { useWebsocket } from "@/hooks/useWebsocket"


export default function TheEditorComponent(){

    const editorRef = useRef();
    const [value,setValue] = useState<string | undefined>("");
    const [language,setLanguage] = useState("javascript");
    const { socket, isConnected, sendMessage } = useWebsocket();

    useEffect(() =>{
        if (socket) {

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'language_change') {
                    setLanguage(data.language);
                    setValue(data.code);
                } else if (data.type === 'code_change') {
                    setValue(data.code);
                }
            };
        }
    },[socket])
    const onMount = (editor : any) =>{
        editorRef.current = editor;
        editor.focus(); 
    }

    const onSelect = (language: string) => {
        setLanguage(language);
        const newValue = (CODE_SNIPPETS as CODE_SNIPPETS)[language] ?? "";
        setValue(newValue);
        if (isConnected) {
            sendMessage({
                type: 'language_change',
                language,
                code: newValue
            });
        }
    }
    const onChange = (newValue: string | undefined) => {
        setValue(newValue);
        if (isConnected) {
            sendMessage({
                type: 'code_change',
                code: newValue
            });
        }
    }

    
    return (
        <div className="w-full max-w-8xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <LanguageSelector language={language} onSelect={onSelect}/>
                    <Editor
                        className="mt-4"
                        height="88vh"
                        width="100%"
                        language={language}
                        defaultValue={(CODE_SNIPPETS as CODE_SNIPPETS)[language] ?? ""}
                        theme="vs-dark"
                        value={value}
                        onChange={onChange}
                        onMount={onMount}
                    />
                </div>
                <div>
                    <Output editorRef={editorRef} language={language}/>
                </div>
            </div>
        </div>
    )
}


type CODE_SNIPPETS = {
    [key: string]: string
}