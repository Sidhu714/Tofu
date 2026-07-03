import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

const LANGUAGE_CHOICES: Record<string, string> = {
  python: "python-3.14",
  c: "gcc-15",
  cpp: "g++-15",
  java: "openjdk-25",
  csharp: "dotnet-csharp-9",
  fsharp: "dotnet-fsharp-9",
  php: "php-8.5",
  ruby: "ruby-4.0",
  haskell: "haskell-9.12",
  go: "go-1.26",
  rust: "rust-1.93",
  typescript: "typescript-deno",
};

export const executeCode = async (
  language: string,
  sourceCode: string,
  input = ""
) => {
  const compiler = LANGUAGE_CHOICES[language];

  console.log("the langauge",language)

  const response = await api.post("/execute", {
    compiler,
    code: sourceCode,
    input,
  });

  return response.data;
};