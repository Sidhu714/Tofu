

'use client'


import LanguageSelector from "./LanguageSelector"
import { useEffect, useRef, useState } from "react"
import { CODE_SNIPPETS } from "@/lib/languages"
import Output from "./Output"
import dynamic from "next/dynamic"
import { useWebsocketContext } from "../context/WebsocketContext"
import { subscribe } from "diagnostics_channel"

const Editor = dynamic(
    () => import("@monaco-editor/react").then((m) => m.Editor),
    { ssr: false }
);



export default function TheEditorComponent() {

    const editorRef = useRef();

    const [editorState, setEditorState] = useState({
        value: CODE_SNIPPETS["python"],
        language: "python",
    });




    const { isConnected, sendMessage, subscribe } = useWebsocketContext();

    const onMount = (editor: any) => {
        editorRef.current = editor;
        editor.focus();
    }




    const onSelect = (language: string) => {

        const newValue = (CODE_SNIPPETS as CODE_SNIPPETS)[language] ?? "";
        setEditorState({
            language,
            value: newValue
        })
        if (isConnected) {
            sendMessage({
                type: 'language_change',
                language,
                code: newValue
            });
        }
    }

    const onChange = (newValue: string | undefined) => {
        setEditorState((prev) => ({
            ...prev,
            value: newValue ?? ""
        }))
        if (isConnected) {
            sendMessage({
                type: 'code_change',
                code: newValue ?? ""
            });
        }
    }


    useEffect(() => {
        const unsubscribeCodeChange = subscribe(
            "code_change",
            (data) => {
                if(data.type === "code_change"){
                    setEditorState({
                        "language" : data.type,
                        "value" : data.code
                    })
                }
            }
        )

        const unsubscribeLanguageChange = subscribe(
            "language_change",
            (data) => {
                if(data.type === "language_change"){
                    setEditorState({
                        "language" : data.language,
                        "value" : data.code
                    })
                }
            }
        )

        return () => {
            unsubscribeCodeChange(),
            unsubscribeLanguageChange()
        }
    },[subscribe])

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
                        className={`h-2 w-2 rounded-full ${isConnected ? "bg-[#34D8A6] animate-pulse" : "bg-[#616169]"
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
                    <section className="flex flex-col overflow-visible rounded-xl border border-[#232328] bg-[#131316]">
                        <div className="flex items-center justify-between border-b border-[#1F1F24] bg-[#17171B] px-4 py-2.5">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A9AA5]">
                                Editor
                            </span>
                            <LanguageSelector language={editorState['language']} onSelect={onSelect} />
                        </div>

                        <div className="overflow-hidden rounded-b-xl">
                            <Editor
                                height="82vh"
                                width="100%"
                                language={editorState['language']}
                                theme="vs-dark"
                                value={editorState['value']}
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
                        </div>
                    </section>


                    <section className="flex flex-col overflow-hidden rounded-xl border border-[#232328] bg-[#131316]">
                        <Output editorRef={editorRef} language={editorState['language']} />
                    </section>

                </div>
            </div>
        </div>
    )
}

type CODE_SNIPPETS = {
    [key: string]: string
}

