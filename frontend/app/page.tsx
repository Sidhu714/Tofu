"use client";
import { BackgroundBeams } from "@/components/ui/background-beam";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen w-full  bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4 flex flex-col items-center gap-5">
        <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
          TUFO
        </h1>

        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
          The simple standalone Editor for your small problem to run and get
          output in faster response time with the power of WebSocket to show your live coding and approaches to others
        </p>
        <Link href={"/CodeEditor"} className=" z-10 text-lg inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 mt-4">
          Editor
          <span><RightArrow/></span>
        </Link>
      </div>
      <BackgroundBeams />
    </div>
  );
}

function RightArrow(){
  return(
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </>
  )
}
