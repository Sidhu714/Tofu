import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://api.onlinecompiler.io/api/run-code-sync/",
      {
        method: "POST",
        headers: {
          Authorization: process.env.ONLINE_COMPILER_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to execute code.",
      },
      {
        status: 500,
      }
    );
  }
}