"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { BackgroundBeams } from "@/components/ui/background-beam";
import { useRouter } from "next/navigation";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [generatedId, setGeneratedId] = useState("");
  const router = useRouter();

  const handleGenerate = () => {
    const id = nanoid(8); // change to 6, 7, or 8 if needed
    setGeneratedId(id);
  };

  const handleRedirect = () => {
     
    router.push(`/CodeEditor/${generatedId}?name=${encodeURIComponent(roomName)}`);
  }

  return (
    <div className="h-screen w-full bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4 flex flex-col items-center gap-5">
        <h1 className="relative z-10 text-lg md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-center font-sans font-bold">
          TUFO
        </h1>

        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
          The simple standalone Editor for your small problem to run and get
          output in faster response time with the power of WebSocket to show
          your live coding and approaches to others
        </p>

        <button
          onClick={() => setOpen(true)}
          className="z-10 text-lg inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 mt-4 gap-2"
        >
          Editor
          <RightArrow />
        </button>
      </div>

      <BackgroundBeams />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Create Editor</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-neutral-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Enter name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name"
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none focus:border-slate-500"
                />
              </div>

              <button
                onClick={handleGenerate}
                className="w-full rounded-md bg-white text-black  px-4 py-3 text-white hover:bg-white transition"
              >
                Generate
              </button>

              {generatedId && (
                <div className="rounded-md border border-neutral-700 bg-neutral-800 p-4 text-sm text-neutral-200">
                  <p>
                    Name: <span className="font-semibold">{roomName || "N/A"}</span>
                  </p>
                  <p className="mt-2">
                    Generated ID:{" "}
                    <span className="font-semibold text-green-400">
                      {generatedId}
                    </span>

                    <button
                    className="w-full rounded-md bg-white text-black px-4 py-3 text-white hover:bg-white transition mt-4"
                    onClick={handleRedirect}
                    >
                      Redirect
                      </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RightArrow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-arrow-right"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}