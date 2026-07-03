import axios from "axios";

const api = axios.create({
  baseURL: "https://api.onlinecompiler.io/api",
  headers: {
    Authorization: process.env.NEXT_PUBLIC_ONLINE_COMPILER_API_KEY!,
    "Content-Type": "application/json",
  },
});

const LANGUAGE_CHOICES: Record<string, string> = {
  javascript: "nodejs-24",
  typescript: "deno",
  python: "python-3.14",
  java: "openjdk-25",
  cpp: "cpp-gcc-15",
  c: "c-gcc-15",
  go: "go-1.26",
  rust: "rust-1.93",
};

export const executeCode = async (
  language: string,
  sourceCode: string,
  input: string = ""
) => {
  const compiler = LANGUAGE_CHOICES[language];

  if (!compiler) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const response = await api.post("/execute", {
    compiler,
    code: sourceCode,
    input,
  });

  return response.data;
};