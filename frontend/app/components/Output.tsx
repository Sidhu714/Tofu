'use client'

import { executeCode } from "@/lib/api";
import { useEffect, useState } from "react";
import { useWebsocket } from "@/hooks/useWebsocket";

type Status = "idle" | "running" | "success" | "error";

const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  idle: { label: "Idle", color: "#616169" },
  running: { label: "Running", color: "#F5C445" },
  success: { label: "Success", color: "#34D8A6" },
  error: { label: "Error", color: "#F76F6F" },
};

export default function Output({
  editorRef,
  language,
  roomId
}: {
  editorRef: any;
  language: string;
  roomId : string;
}) {
  const [codeOutput, setCodeOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const { isConnected, sendMessage } = useWebsocket({
     roomId,
      onMessage : (data) => {
        if(data.type == "output"){
          setCodeOutput(data.output);
        }
      }
     });

  

  const output = async () => {
    const sourceCode = editorRef.current?.getValue();
    if (!sourceCode) return;

    setIsLoading(true);
    setStatus("running");

    try {
      const result = await executeCode(language, sourceCode);
      const outputLines = result.output.split("\n");
      setCodeOutput(outputLines);

      if (isConnected) {
        sendMessage({
          type: "output",
          output: outputLines,
        });
      }

      setStatus(result.stderr ? "error" : "success");
    } catch (error) {
      console.error(error);
      setStatus("error");
      alert("Run failed. We couldn't reach the execution service. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const { label, color } = STATUS_CONFIG[status];

  return (
    <>
      <div className="flex items-center justify-between border-b border-[#1F1F24] bg-[#17171B] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9A9AA5]">
            Output
          </span>

          <span className="flex items-center gap-1.5 rounded-full border border-[#232328] px-2 py-0.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[11px] font-medium" style={{ color }}>
              {label}
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={output}
          disabled={isLoading}
          className="inline-flex h-[30px] items-center gap-2 rounded-md bg-[#34D8A6] px-4 text-xs font-semibold text-[#0A0A0C] transition hover:bg-[#2BC495] active:bg-[#25AD84] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0A0A0C]/30 border-t-[#0A0A0C]" />
              Running
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 0.5L9 5L1 9.5V0.5Z" fill="#0A0A0C" />
              </svg>
              Run
            </>
          )}
        </button>
      </div>

      <div className="h-[82vh] flex-1 overflow-auto bg-[#0F0F11] p-4 font-mono text-[13px]">
        {codeOutput.length > 0 ? (
          <div className="space-y-1">
            {codeOutput.map((line, index) => (
              <div key={index} className="flex gap-3">
                <span className="select-none text-[#3A3A40]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={status === "error" ? "text-[#F76F6F]" : "text-[#D4D4D8]"}>
                  {line || "\u00A0"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="text-2xl">▷</span>
            <p className="font-sans text-sm text-[#616169]">
              Run your code to see the output here
            </p>
          </div>
        )}
      </div>
    </>
  );
}