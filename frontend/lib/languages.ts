export const LANGUAGE_CHOICES = {
  python: "Python 3.14",
  c: "GCC 15",
  cpp: "G++ 15",
  java: "OpenJDK 25",
  csharp: ".NET C# 9",
  fsharp: ".NET F# 9",
  php: "PHP 8.5",
  ruby: "Ruby 4.0",
  haskell: "Haskell 9.12",
  go: "Go 1.26",
  rust: "Rust 1.93",
  typescript: "TypeScript (Deno)",
};

export const CODE_SNIPPETS = {
  python: `def greet(name):
    print("Hello, " + name)

greet("Alex")
`,

  c: `#include <stdio.h>

int main() {
    printf("Hello World\\n");
    return 0;
}
`,

  cpp: `#include <iostream>

int main() {
    std::cout << "Hello World" << std::endl;
    return 0;
}
`,

  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
`,

  csharp: `using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello World");
    }
}
`,

  fsharp: `printfn "Hello World"`,

  php: `<?php

echo "Hello World";
`,

  ruby: `puts "Hello World"`,

  haskell: `main = putStrLn "Hello World"`,

  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello World")
}
`,

  rust: `fn main() {
    println!("Hello World");
}
`,

  typescript: `function greet(name: string) {
    console.log("Hello, " + name);
}

greet("Alex");
`,
};