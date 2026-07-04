

'use client'


import LanguageSelector from "./LanguageSelector"
import { useEffect, useRef, useState } from "react"
import { CODE_SNIPPETS } from "@/lib/languages"
import Output from "./Output"
import { useWebsocket } from "@/hooks/useWebsocket"
import dynamic from "next/dynamic"

export default function TheEditorComponent() {

    const editorRef = useRef();
    const [value, setValue] = useState<string | undefined>("");
    const [language, setLanguage] = useState("python");
    const { socket, isConnected, sendMessage } = useWebsocket();

    const Editor = dynamic(
        () => import("@monaco-editor/react").then((m) => m.Editor),
        { ssr: false }
        );

    useEffect(() => {
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
    }, [socket])

    const onMount = (editor: any) => {
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
        <div className="min-h-screen bg-[#0A0A0C] text-[#F4F4F6]">
            {/* Top bar */}
            <header className="flex items-center justify-between border-b border-[#1F1F24] px-6 py-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#34D8A6]">
                        <span className="text-xs font-bold text-[#0A0A0C]">{'</>'}</span>
                    </div>
                    <span className="text-sm font-semibold tracking-tight text-[#F4F4F6]">
                        CodeRoom
                    </span>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-[#232328] bg-[#131316] px-3 py-1.5">
                    <span
                        className={`h-2 w-2 rounded-full ${
                            isConnected ? "bg-[#34D8A6] animate-pulse" : "bg-[#616169]"
                        }`}
                    />
                    <span className="text-xs font-medium text-[#9A9AA5]">
                        {isConnected ? "Live · synced" : "Offline"}
                    </span>
                </div>
            </header>

            {/* Workspace */}
            <div className="mx-auto max-w-[1600px] px-6 py-6">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                    {/* Editor panel */}
                    <section className="flex flex-col overflow-hidden rounded-xl border border-[#232328] bg-[#131316]">
                        <div className="flex items-center justify-between border-b border-[#1F1F24] bg-[#17171B] px-4 py-2.5">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A9AA5]">
                                Editor
                            </span>
                            <LanguageSelector language={language} onSelect={onSelect} />
                        </div>
                        <Editor
                            height="82vh"
                            width="100%"
                            language={language}
                            defaultValue={(CODE_SNIPPETS as CODE_SNIPPETS)[language] ?? ""}
                            theme="vs-dark"
                            value={value}
                            onChange={onChange}
                            onMount={onMount}
                            options={{
                                fontSize: 14,
                                fontFamily: "JetBrains Mono, monospace",
                                minimap: { enabled: false },
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                            }}
                        />
                    </section>

                    /* Output panel */
                    <section className="flex flex-col overflow-hidden rounded-xl border border-[#232328] bg-[#131316]">
                        <Output editorRef={editorRef} language={language} />
                    </section>

                </div>
            </div>
        </div>
    )
}

type CODE_SNIPPETS = {
    [key: string]: string
}