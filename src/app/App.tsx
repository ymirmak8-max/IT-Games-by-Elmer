import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Code2, Zap, Trophy, Star, ArrowRight, RotateCcw, CheckCircle2, XCircle, Flame, Target, BookOpen, ChevronRight, User, GraduationCap, School, BookOpenCheck, Moon, Sun, Music, ArrowLeft, PlayCircle } from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { id: "python", name: "Python", icon: "🐍", color: "#3b82f6", bg: "#1e3a5f", desc: "Beginner-friendly, used in AI & data science" },
  { id: "javascript", name: "JavaScript", icon: "⚡", color: "#f59e0b", bg: "#3d2c00", desc: "The language of the web, runs everywhere" },
  { id: "html", name: "HTML & CSS", icon: "🎨", color: "#f97316", bg: "#3d1f00", desc: "Build and style beautiful websites" },
  { id: "java", name: "Java", icon: "☕", color: "#ef4444", bg: "#3d1010", desc: "Object-oriented powerhouse for apps & Android" },
  { id: "cpp", name: "C++", icon: "⚙️", color: "#8b5cf6", bg: "#2d1f4a", desc: "High-performance systems & game development" },
  { id: "c", name: "C", icon: "🔧", color: "#60a5fa", bg: "#102a43", desc: "Learn the fundamentals of procedural programming" },
  { id: "typescript", name: "TypeScript", icon: "🔷", color: "#06b6d4", bg: "#003d4a", desc: "JavaScript with types — safer, scalable code" },
];

type Question = {
  id: number;
  type: "multiple" | "code" | "truefalse";
  question: string;
  code?: string;
  options: string[];
  answer: number;
  explanation: string;
  xp: number;
};

const QUESTIONS: Record<string, Question[]> = {
  python: [
    {
      id: 1, type: "multiple",
      question: "What keyword do you use to define a function in Python?",
      options: ["function", "def", "func", "define"],
      answer: 1,
      explanation: "`def` is the keyword used to define functions in Python. Example: `def greet(): print('Hello!')`",
      xp: 10,
    },
    {
      id: 2, type: "code",
      question: "What does this code print?",
      code: `x = [1, 2, 3, 4, 5]\nprint(x[2])`,
      options: ["1", "2", "3", "5"],
      answer: 2,
      explanation: "Python lists are zero-indexed. `x[2]` accesses the third element, which is `3`.",
      xp: 15,
    },
    {
      id: 3, type: "multiple",
      question: "Which of these is the correct way to write a comment in Python?",
      options: ["// This is a comment", "/* Comment */", "# This is a comment", "-- Comment"],
      answer: 2,
      explanation: "Python uses `#` for single-line comments. Unlike many languages, there are no `//` or `/* */` comments.",
      xp: 10,
    },
    {
      id: 4, type: "code",
      question: "What is the output of this code?",
      code: `name = "Alice"\nprint(f"Hello, {name}!")`,
      options: ["Hello, name!", "Hello, Alice!", "{name}", "Error"],
      answer: 1,
      explanation: "f-strings in Python let you embed variables inside curly braces `{}`. `{name}` becomes `Alice`.",
      xp: 15,
    },
    {
      id: 5, type: "truefalse",
      question: "In Python, indentation is just a style preference and doesn't affect code execution.",
      options: ["True", "False"],
      answer: 1,
      explanation: "FALSE! Indentation is REQUIRED in Python. It defines code blocks (like function bodies, loops, if-statements).",
      xp: 10,
    },
    {
      id: 6, type: "code",
      question: "What does this loop print?",
      code: `for i in range(3):\n    print(i)`,
      options: ["1 2 3", "0 1 2", "0 1 2 3", "1 2"],
      answer: 1,
      explanation: "`range(3)` generates numbers 0, 1, 2. The loop prints each one — so output is `0`, `1`, `2`.",
      xp: 20,
    },
    {
      id: 7, type: "multiple",
      question: "Which data type would you use to store a list of unique items with no duplicates?",
      options: ["list", "tuple", "set", "dict"],
      answer: 2,
      explanation: "A `set` automatically removes duplicates and only stores unique values. `{1, 2, 3}` is a set.",
      xp: 20,
    },
  ],
  javascript: [
    {
      id: 1, type: "multiple",
      question: "Which keyword declares a variable that CANNOT be reassigned?",
      options: ["var", "let", "const", "fixed"],
      answer: 2,
      explanation: "`const` declares a constant — once assigned, its value cannot be reassigned. Use `let` for variables that change.",
      xp: 10,
    },
    {
      id: 2, type: "code",
      question: "What does this code output?",
      code: `console.log(typeof "Hello");`,
      options: ["string", "text", "String", "undefined"],
      answer: 0,
      explanation: "`typeof` returns a string describing the type. Strings return `\"string\"` (lowercase).",
      xp: 15,
    },
    {
      id: 3, type: "multiple",
      question: "Which method adds an item to the END of an array?",
      options: ["push()", "pop()", "shift()", "unshift()"],
      answer: 0,
      explanation: "`push()` adds elements to the END. `unshift()` adds to the START. `pop()` removes from end, `shift()` from start.",
      xp: 10,
    },
    {
      id: 4, type: "code",
      question: "What is the result?",
      code: `const nums = [1, 2, 3];\nconst doubled = nums.map(n => n * 2);\nconsole.log(doubled);`,
      options: ["[1, 2, 3]", "[2, 4, 6]", "[3, 4, 5]", "undefined"],
      answer: 1,
      explanation: "`.map()` creates a NEW array by applying a function to each element. Each number is doubled → `[2, 4, 6]`.",
      xp: 20,
    },
    {
      id: 5, type: "truefalse",
      question: "In JavaScript, `===` and `==` always produce the same result.",
      options: ["True", "False"],
      answer: 1,
      explanation: "FALSE! `==` does type coercion (`'5' == 5` is `true`). `===` checks both value AND type (`'5' === 5` is `false`).",
      xp: 15,
    },
    {
      id: 6, type: "multiple",
      question: "What does an arrow function `() => {}` do differently from a regular function?",
      options: ["It runs faster", "It has no `this` binding", "It can't take parameters", "It always returns undefined"],
      answer: 1,
      explanation: "Arrow functions don't have their own `this` — they inherit it from the surrounding scope. This is key for callbacks.",
      xp: 20,
    },
    {
      id: 7, type: "code",
      question: "What does this output?",
      code: `async function greet() {\n  return "Hello!";\n}\nconsole.log(typeof greet());`,
      options: ["string", "object", "Promise", "undefined"],
      answer: 1,
      explanation: "Async functions always return a Promise, even if you return a plain value. `typeof` a Promise is `'object'`.",
      xp: 25,
    },
  ],
  html: [
    {
      id: 1, type: "multiple",
      question: "Which HTML tag creates the largest heading?",
      options: ["<h6>", "<h1>", "<heading>", "<title>"],
      answer: 1,
      explanation: "`<h1>` is the largest heading. Headings go from `<h1>` (largest) to `<h6>` (smallest).",
      xp: 10,
    },
    {
      id: 2, type: "code",
      question: "What does this CSS do?",
      code: `.box {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}`,
      options: ["Makes the box invisible", "Centers content horizontally only", "Centers content both horizontally and vertically", "Adds a border"],
      answer: 2,
      explanation: "`justify-content: center` centers horizontally, `align-items: center` centers vertically — together they center content in both directions.",
      xp: 15,
    },
    {
      id: 3, type: "multiple",
      question: "Which CSS property controls the space INSIDE an element (between content and border)?",
      options: ["margin", "padding", "spacing", "gap"],
      answer: 1,
      explanation: "`padding` is the space inside the element. `margin` is the space OUTSIDE (between elements).",
      xp: 10,
    },
    {
      id: 4, type: "truefalse",
      question: "The `<div>` element has special semantic meaning in HTML.",
      options: ["True", "False"],
      answer: 1,
      explanation: "FALSE! `<div>` is a generic container with NO semantic meaning. Use semantic tags like `<header>`, `<nav>`, `<main>`, `<section>` when appropriate.",
      xp: 10,
    },
    {
      id: 5, type: "code",
      question: "What is wrong with this HTML?",
      code: `<img src="photo.jpg">`,
      options: ["Nothing, it's correct", "Missing the alt attribute", "img tags need a closing tag", "src should be href"],
      answer: 1,
      explanation: "Always include `alt` text for accessibility! Screen readers and users with slow connections depend on it: `<img src='photo.jpg' alt='description'>`",
      xp: 15,
    },
    {
      id: 6, type: "multiple",
      question: "Which CSS unit is RELATIVE to the root font size?",
      options: ["px", "em", "rem", "vh"],
      answer: 2,
      explanation: "`rem` (root em) is relative to the root `<html>` element's font-size. `em` is relative to the parent element. `px` is absolute.",
      xp: 20,
    },
    {
      id: 7, type: "code",
      question: "Which CSS makes text bold?",
      code: `/* Which property? */\np {\n  ______: bold;\n}`,
      options: ["text-weight", "font-bold", "font-weight", "weight"],
      answer: 2,
      explanation: "`font-weight: bold` makes text bold. You can also use numeric values: `font-weight: 700` equals bold.",
      xp: 10,
    },
  ],
  java: [
    {
      id: 1, type: "multiple",
      question: "What is the correct way to declare a public integer variable named `score` in Java?",
      options: ["int public score;", "public int score;", "score int public;", "public score int;"],
      answer: 1,
      explanation: "Java syntax: access modifier first (`public`), then type (`int`), then name (`score`). Always in that order.",
      xp: 10,
    },
    {
      id: 2, type: "code",
      question: "What does this print?",
      code: `String s = "Hello";\nSystem.out.println(s.length());`,
      options: ["4", "5", "6", "Error"],
      answer: 1,
      explanation: "`\"Hello\"` has 5 characters: H-e-l-l-o. `.length()` returns `5`.",
      xp: 10,
    },
    {
      id: 3, type: "multiple",
      question: "Java is considered a ________ language because code is compiled to bytecode.",
      options: ["interpreted", "platform-independent", "scripting", "untyped"],
      answer: 1,
      explanation: "Java compiles to bytecode that runs on the JVM (Java Virtual Machine), making it platform-independent — 'Write Once, Run Anywhere'.",
      xp: 15,
    },
    {
      id: 4, type: "truefalse",
      question: "In Java, `String` is a primitive data type.",
      options: ["True", "False"],
      answer: 1,
      explanation: "FALSE! `String` is a class (object type) in Java. Primitive types are: `int`, `double`, `boolean`, `char`, `byte`, `short`, `long`, `float`.",
      xp: 15,
    },
    {
      id: 5, type: "code",
      question: "What is the output?",
      code: `int[] arr = {10, 20, 30};\nSystem.out.println(arr[1]);`,
      options: ["10", "20", "30", "1"],
      answer: 1,
      explanation: "Arrays in Java are zero-indexed. `arr[0]` = 10, `arr[1]` = 20, `arr[2]` = 30.",
      xp: 15,
    },
    {
      id: 6, type: "multiple",
      question: "Which keyword is used to inherit a class in Java?",
      options: ["implements", "extends", "inherits", "super"],
      answer: 1,
      explanation: "`extends` is used for class inheritance. `implements` is for interfaces. Example: `class Dog extends Animal {}`",
      xp: 20,
    },
    {
      id: 7, type: "multiple",
      question: "What does `void` mean as a return type?",
      options: ["Returns null", "Returns 0", "Returns nothing", "Returns empty string"],
      answer: 2,
      explanation: "`void` means the method returns NOTHING. It performs an action but doesn't give back a value.",
      xp: 10,
    },
  ],
  cpp: [
    {
      id: 1, type: "multiple",
      question: "What symbol is used for output in C++?",
      options: ["print()", "System.out", "cout <<", "console.log"],
      answer: 2,
      explanation: "`cout <<` (from `<iostream>`) is C++'s output stream. Example: `cout << \"Hello\" << endl;`",
      xp: 10,
    },
    {
      id: 2, type: "code",
      question: "What does this code do?",
      code: `int x = 5;\nint* ptr = &x;\ncout << *ptr;`,
      options: ["Prints memory address", "Prints 5", "Causes an error", "Prints &x"],
      answer: 1,
      explanation: "`&x` gets the address of x. `*ptr` dereferences the pointer — getting the VALUE at that address, which is `5`.",
      xp: 25,
    },
    {
      id: 3, type: "multiple",
      question: "What does `#include <iostream>` do?",
      options: ["Imports a class", "Includes the input/output stream library", "Defines the main function", "Compiles the code"],
      answer: 1,
      explanation: "`#include` adds a header file to your code. `<iostream>` provides `cin` and `cout` for input/output.",
      xp: 10,
    },
    {
      id: 4, type: "truefalse",
      question: "C++ automatically manages memory — you never need to free allocated memory manually.",
      options: ["True", "False"],
      answer: 1,
      explanation: "FALSE! C++ requires manual memory management. Use `new` to allocate and `delete` to free memory. Memory leaks happen when you forget `delete`!",
      xp: 20,
    },
    {
      id: 5, type: "code",
      question: "What is the output?",
      code: `for (int i = 0; i < 3; i++) {\n  cout << i << " ";\n}`,
      options: ["1 2 3", "0 1 2", "0 1 2 3", "1 2"],
      answer: 1,
      explanation: "`i` starts at 0, runs while `i < 3`. Prints 0, 1, 2 (each followed by a space).",
      xp: 15,
    },
    {
      id: 6, type: "multiple",
      question: "Which C++ feature allows a function to have the same name but different parameters?",
      options: ["Overriding", "Overloading", "Templates", "Inheritance"],
      answer: 1,
      explanation: "Function overloading lets you define multiple functions with the same name but different parameter types or counts.",
      xp: 20,
    },
    {
      id: 7, type: "multiple",
      question: "What is `std::` in C++?",
      options: ["A class name", "Standard library namespace", "A data type", "A compile flag"],
      answer: 1,
      explanation: "`std` is the standard namespace. Writing `using namespace std;` lets you skip the `std::` prefix and write `cout` instead of `std::cout`.",
      xp: 15,
    },
  ],

  c: [
    {
      id: 1, type: "multiple",
      question: "Which function is the starting point of a C program?",
      options: ["start()", "main()", "begin()", "run()"],
      answer: 1,
      explanation: "Every standard C program starts execution from the main() function.",
      xp: 10,
    },
    {
      id: 2, type: "code",
      question: "What does this code print?",
      code: `#include <stdio.h>\nint main() {\n  printf("Hello");\n  return 0;\n}`,
      options: ["Hello", "printf", "Error", "Nothing"],
      answer: 0,
      explanation: "printf() displays text on the screen, so this program prints Hello.",
      xp: 10,
    },
    {
      id: 3, type: "multiple",
      question: "Which header file is commonly used for printf() and scanf()?",
      options: ["<string.h>", "<math.h>", "<stdio.h>", "<stdlib.h>"],
      answer: 2,
      explanation: "<stdio.h> provides standard input and output functions such as printf() and scanf().",
      xp: 15,
    },
    {
      id: 4, type: "truefalse",
      question: "In C, array indexing starts at 0.",
      options: ["True", "False"],
      answer: 0,
      explanation: "TRUE! The first element of a C array is at index 0.",
      xp: 10,
    },
    {
      id: 5, type: "code",
      question: "What is the output?",
      code: `int x = 5;\nint y = 3;\nprintf("%d", x + y);`,
      options: ["2", "8", "15", "53"],
      answer: 1,
      explanation: "The + operator adds 5 and 3, so printf() outputs 8.",
      xp: 15,
    },
    {
      id: 6, type: "multiple",
      question: "Which symbol is used to get the address of a variable in C?",
      options: ["*", "&", "#", "@"],
      answer: 1,
      explanation: "The & operator is the address-of operator. For example, &x gives the memory address of x.",
      xp: 20,
    },
    {
      id: 7, type: "multiple",
      question: "Which format specifier is commonly used to print an integer with printf()?",
      options: ["%s", "%f", "%d", "%c"],
      answer: 2,
      explanation: "%d is commonly used for signed integer values with printf().",
      xp: 15,
    },
  ],
  typescript: [
    {
      id: 1, type: "multiple",
      question: "How do you declare a variable with a specific type in TypeScript?",
      options: ["let name = string;", "let name: string;", "string let name;", "var name<string>;"],
      answer: 1,
      explanation: "TypeScript uses `:` for type annotations. `let name: string = 'Alice'` tells TypeScript `name` must always be a string.",
      xp: 10,
    },
    {
      id: 2, type: "code",
      question: "What's wrong with this TypeScript code?",
      code: `let age: number = 25;\nage = "thirty";`,
      options: ["Nothing, it's fine", "Type error: can't assign string to number", "Missing semicolon", "age is not defined"],
      answer: 1,
      explanation: "TypeScript won't allow assigning a `string` to a `number` type. This is exactly what TypeScript protects you from!",
      xp: 15,
    },
    {
      id: 3, type: "multiple",
      question: "What does the TypeScript type `string | number` mean?",
      options: ["Only string", "Only number", "Either string or number", "Both string and number at once"],
      answer: 2,
      explanation: "`|` creates a Union Type — the value can be EITHER type. `string | number` means it accepts both strings and numbers.",
      xp: 15,
    },
    {
      id: 4, type: "truefalse",
      question: "TypeScript code runs directly in the browser without any compilation.",
      options: ["True", "False"],
      answer: 1,
      explanation: "FALSE! TypeScript must be compiled (transpiled) to JavaScript before the browser can run it. The `tsc` compiler handles this.",
      xp: 10,
    },
    {
      id: 5, type: "code",
      question: "What does this interface define?",
      code: `interface User {\n  name: string;\n  age: number;\n  isAdmin?: boolean;\n}`,
      options: ["A class with methods", "A data shape — an object with name, age, and optional isAdmin", "A function type", "An enum"],
      answer: 1,
      explanation: "Interfaces define the shape of objects. The `?` after `isAdmin` makes it optional — objects can omit it.",
      xp: 20,
    },
    {
      id: 6, type: "multiple",
      question: "What does the `any` type do in TypeScript?",
      options: ["Matches only primitive types", "Opts out of type checking entirely", "Makes a variable required", "Creates a generic type"],
      answer: 1,
      explanation: "`any` disables type checking for that variable — it accepts anything. Using it too much defeats TypeScript's purpose!",
      xp: 15,
    },
    {
      id: 7, type: "code",
      question: "What does this generic function do?",
      code: `function identity<T>(arg: T): T {\n  return arg;\n}`,
      options: ["Only works with strings", "Returns the same type it receives", "Always returns undefined", "Converts any type to string"],
      answer: 1,
      explanation: "Generics (`<T>`) let functions work with any type while preserving type info. `identity(5)` returns a `number`, `identity('hi')` returns a `string`.",
      xp: 25,
    },
  ],
};

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = "home" | "profile" | "guidelines" | "language" | "game" | "results";
type AnswerState = "idle" | "correct" | "wrong";

// ─── Components ──────────────────────────────────────────────────────────────

function XPBar({ current, max, level }: { current: number; max: number; level: number }) {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1">
        <Star size={12} className="text-yellow-400" />
        <span className="text-yellow-400 font-mono font-bold text-xs">Lv.{level}</span>
      </div>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-mono text-white/40">{current}/{max} XP</span>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0d0d1a]">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10 bg-white/5">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-2 text-white/30 text-xs font-mono">code.preview</span>
      </div>
      <pre className="p-4 text-sm font-mono leading-relaxed text-cyan-300 overflow-x-auto whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function ParticleEffect({ active, correct }: { active: boolean; correct: boolean }) {
  if (!active) return null;
  const color = correct ? "#22c55e" : "#ef4444";
  const particles = Array.from({ length: correct ? 12 : 6 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: (Math.cos((i / particles.length) * Math.PI * 2) * 150) + (Math.random() - 0.5) * 80,
            y: (Math.sin((i / particles.length) * Math.PI * 2) * 150) + (Math.random() - 0.5) * 80,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function HomeScreen({
  onStart,
  onProfile,
  onGuidelines,
  onToggleTheme,
  darkMode,
  profile,
}: {
  onStart: () => void;
  onProfile: () => void;
  onGuidelines: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
  profile: StudentProfile;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-5 right-5 z-10 flex flex-wrap justify-end gap-2">
        <button onClick={onProfile} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/70 font-mono text-xs">
          <User size={14} /> {profile.username ? "Profile" : "Student Profile"}
        </button>
        <button onClick={onGuidelines} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/70 font-mono text-xs">
          <BookOpenCheck size={14} /> Guidelines
        </button>
        <button onClick={onToggleTheme} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/70 font-mono text-xs">
          {darkMode ? <Sun size={14} /> : <Moon size={14} />} {darkMode ? "Light" : "Dark"}
        </button>
        <button onClick={() => window.open("https://open.spotify.com/", "_blank", "noopener,noreferrer")}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 font-mono text-xs">
          <Music size={14} /> Spotify
        </button>
      </div>
      {/* background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto"
      >
        <motion.div
          className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-8"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <Zap size={16} className="text-yellow-400" />
          <span className="text-sm font-mono text-purple-300">Created by Elmer</span>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-mono font-black mb-4 leading-none tracking-tight">
          <span className="text-white">Code</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Quest</span>
        </h1>

        <p className="text-white/50 text-lg font-mono mb-2">
          {"Relapse Time"}
        </p>
        <p className="text-white/30 text-sm mb-12">
          Choose a language. Answer questions. Level up. Become a better and move on.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-10 max-w-md mx-auto">
          {[
            { icon: <BookOpen size={18} />, label: "7 Questions", color: "text-purple-400" },
            { icon: <Zap size={18} />, label: "Earn XP", color: "text-yellow-400" },
            { icon: <Trophy size={18} />, label: "Rank Up", color: "text-cyan-400" },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-2">
              <span className={item.color}>{item.icon}</span>
              <span className="text-xs font-mono text-white/60">{item.label}</span>
            </div>
          ))}
        </div>

        <motion.button
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold text-lg px-10 py-4 rounded-2xl shadow-lg shadow-purple-500/25"
          whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(124, 58, 237, 0.5)" }}
          whileTap={{ scale: 0.97 }}
        >
          Start Playing
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </div>
  );
}


type StudentProfile = {
  username: string;
  yearLevel: string;
  course: string;
  school: string;
};

function ProfileScreen({
  profile,
  onSave,
  onBack,
}: {
  profile: StudentProfile;
  onSave: (profile: StudentProfile) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<StudentProfile>(profile);

  const update = (key: keyof StudentProfile, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.yearLevel || !form.course.trim() || !form.school.trim()) {
      alert("Please complete all student profile fields.");
      return;
    }
    onSave({
      username: form.username.trim(),
      yearLevel: form.yearLevel,
      course: form.course.trim(),
      school: form.school.trim(),
    });
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8">
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <User className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-mono font-black text-white">Student Profile</h2>
              <p className="text-white/40 text-sm font-mono">Enter your information before starting.</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4 mt-7">
            <label className="block">
              <span className="text-xs font-mono text-white/50">Username</span>
              <div className="relative mt-2">
                <User size={16} className="absolute left-3 top-3.5 text-white/30" />
                <input value={form.username} onChange={(e) => update("username", e.target.value)}
                  placeholder="e.g. ElmerMak"
                  className="w-full rounded-xl border border-white/10 bg-black/20 text-white placeholder:text-white/25 pl-10 pr-4 py-3 outline-none focus:border-purple-500/60" />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-mono text-white/50">Year Level</span>
              <div className="relative mt-2">
                <GraduationCap size={16} className="absolute left-3 top-3.5 text-white/30" />
                <select value={form.yearLevel} onChange={(e) => update("yearLevel", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#11111f] text-white pl-10 pr-4 py-3 outline-none focus:border-purple-500/60">
                  <option value="">Select year level</option>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                  <option>5th Year</option>
                  <option>Graduate / Other</option>
                </select>
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-mono text-white/50">Course</span>
              <div className="relative mt-2">
                <BookOpenCheck size={16} className="absolute left-3 top-3.5 text-white/30" />
                <input value={form.course} onChange={(e) => update("course", e.target.value)}
                  placeholder="e.g. BS Information Technology"
                  className="w-full rounded-xl border border-white/10 bg-black/20 text-white placeholder:text-white/25 pl-10 pr-4 py-3 outline-none focus:border-purple-500/60" />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-mono text-white/50">School</span>
              <div className="relative mt-2">
                <School size={16} className="absolute left-3 top-3.5 text-white/30" />
                <input value={form.school} onChange={(e) => update("school", e.target.value)}
                  placeholder="e.g. Your University"
                  className="w-full rounded-xl border border-white/10 bg-black/20 text-white placeholder:text-white/25 pl-10 pr-4 py-3 outline-none focus:border-purple-500/60" />
              </div>
            </label>

            <button type="submit"
              className="w-full mt-3 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold">
              Save Profile & Continue <ArrowRight size={17} className="inline ml-2" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function GuidelinesScreen({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  const guidelines = [
    "Read each question carefully before selecting an answer.",
    "Each language has 7 challenges with different XP values.",
    "After answering, review the explanation to learn from mistakes.",
    "Correct answers increase your XP and can build your streak.",
    "Do not refresh the page while answering if you want to keep your current quiz.",
    "You can listen to Spotify while answering by using the Music button.",
    "Use the profile section to update your student information anytime.",
  ];

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8">
          <ArrowLeft size={16} /> Back
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-7">
          <div className="flex items-center gap-3 mb-7">
            <BookOpenCheck className="text-cyan-400" />
            <div>
              <h2 className="text-2xl font-mono font-black text-white">Quiz Guidelines</h2>
              <p className="text-white/40 text-sm font-mono">Follow these rules for a better learning experience.</p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {guidelines.map((item, i) => (
              <div key={item} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <span className="w-6 h-6 shrink-0 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-mono font-bold">{i + 1}</span>
                <p className="text-white/70 text-sm font-mono leading-relaxed">{item}</p>
              </div>
            ))}
          </div>

          <button onClick={onContinue}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold">
            Choose a Language <ArrowRight size={17} className="inline ml-2" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function LanguageScreen({ onSelect }: { onSelect: (lang: string) => void }) {
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h2 className="text-4xl font-mono font-black text-white mb-3">
            Pick Your Language
          </h2>
          <p className="text-white/40 font-mono text-sm">{"Choose a language to begin your quest"}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANGUAGES.map((lang, i) => (
            <motion.button
              key={lang.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onSelect(lang.id)}
              className="group text-left p-6 rounded-2xl border border-white/10 bg-white/5 relative overflow-hidden"
              whileHover={{ scale: 1.03, borderColor: lang.color }}
              whileTap={{ scale: 0.97 }}
              style={{ "--hover-color": lang.color } as React.CSSProperties}
            >
              {/* glow background */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(ellipse at 30% 30%, ${lang.bg} 0%, transparent 70%)` }}
              />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{lang.icon}</span>
                  <ChevronRight
                    size={18}
                    className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all"
                  />
                </div>
                <h3 className="text-xl font-mono font-bold text-white mb-2">{lang.name}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{lang.desc}</p>

                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
                  <span className="text-xs font-mono" style={{ color: lang.color }}>
                    7 challenges · ~5 min
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GameScreen({
  langId,
  onFinish,
}: {
  langId: string;
  onFinish: (score: number, xp: number, correct: number) => void;
}) {
  const questions = QUESTIONS[langId] ?? [];
  const lang = LANGUAGES.find((l) => l.id === langId)!;
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [totalXP, setTotalXP] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const [particleCorrect, setParticleCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [xpLevel, setXpLevel] = useState(1);

  const currentQ = questions[qIndex];
  const isLast = qIndex === questions.length - 1;

  const handleSelect = useCallback(
    (idx: number) => {
      if (answerState !== "idle") return;
      setSelected(idx);
      const correct = idx === currentQ.answer;
      setAnswerState(correct ? "correct" : "wrong");
      setShowExplanation(true);
      setParticleCorrect(correct);
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 900);

      if (correct) {
        const bonus = streak >= 2 ? Math.round(currentQ.xp * 0.5) : 0;
        const earned = currentQ.xp + bonus;
        setTotalXP((prev) => {
          const next = prev + earned;
          setXpLevel(Math.floor(next / 50) + 1);
          return next;
        });
        setCorrectCount((c) => c + 1);
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
    },
    [answerState, currentQ, streak]
  );

  const handleNext = () => {
    if (isLast) {
      onFinish(Math.round((correctCount / questions.length) * 100), totalXP, correctCount);
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setAnswerState("idle");
    setShowExplanation(false);
  };

  const progress = ((qIndex) / questions.length) * 100;

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col max-w-2xl mx-auto">
      <ParticleEffect active={showParticles} correct={particleCorrect} />

      {/* Header */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{lang.icon}</span>
            <span className="font-mono font-bold text-white">{lang.name}</span>
          </div>
          <div className="flex items-center gap-3">
            {streak >= 2 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1"
              >
                <Flame size={12} className="text-orange-400" />
                <span className="text-orange-400 font-mono font-bold text-xs">{streak}x streak!</span>
              </motion.div>
            )}
            <span className="text-sm font-mono text-white/40">
              {qIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.open("https://open.spotify.com/", "_blank", "noopener,noreferrer")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 font-mono text-xs hover:bg-green-500/20"
            title="Open Spotify"
          >
            <Music size={14} /> Spotify Music
          </button>
        </div>

        <XPBar current={totalXP} max={(xpLevel) * 50} level={xpLevel} />

        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: lang.color }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-bold border"
              style={{
                color: lang.color,
                borderColor: `${lang.color}40`,
                backgroundColor: `${lang.color}15`,
              }}
            >
              <Target size={11} />
              {currentQ.type === "multiple" ? "Multiple Choice" : currentQ.type === "code" ? "Code Challenge" : "True or False"}
            </div>
            <span className="text-xs font-mono text-yellow-400/60">+{currentQ.xp} XP</span>
            {streak >= 2 && (
              <span className="text-xs font-mono text-orange-400/60">+{Math.round(currentQ.xp * 0.5)} bonus</span>
            )}
          </div>

          <h3 className="text-xl md:text-2xl font-mono font-bold text-white mb-5 leading-snug">
            {currentQ.question}
          </h3>

          {currentQ.code && (
            <div className="mb-5">
              <CodeBlock code={currentQ.code} />
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 mb-5">
            {currentQ.options.map((opt, i) => {
              const isCorrect = i === currentQ.answer;
              const isSelected = i === selected;
              let borderColor = "border-white/10";
              let bg = "bg-white/5 hover:bg-white/10";
              let textColor = "text-white/80";
              let icon = null;

              if (answerState !== "idle") {
                if (isCorrect) {
                  borderColor = "border-green-500/60";
                  bg = "bg-green-500/15";
                  textColor = "text-green-300";
                  icon = <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />;
                } else if (isSelected && !isCorrect) {
                  borderColor = "border-red-500/60";
                  bg = "bg-red-500/15";
                  textColor = "text-red-300";
                  icon = <XCircle size={18} className="text-red-400 flex-shrink-0" />;
                } else {
                  bg = "bg-white/3";
                  textColor = "text-white/30";
                }
              }

              return (
                <motion.button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answerState !== "idle"}
                  className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${borderColor} ${bg} ${textColor} disabled:cursor-default`}
                  whileHover={answerState === "idle" ? { scale: 1.01 } : {}}
                  whileTap={answerState === "idle" ? { scale: 0.99 } : {}}
                >
                  <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-mono text-sm flex-1">{opt}</span>
                  {icon}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={`rounded-xl p-4 border mb-5 ${
                    answerState === "correct"
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {answerState === "correct" ? (
                      <CheckCircle2 size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-mono font-bold text-sm mb-1" style={{ color: answerState === "correct" ? "#4ade80" : "#f87171" }}>
                        {answerState === "correct" ? "Correct!" : "Not quite!"}
                      </p>
                      <p className="text-white/60 text-sm font-mono leading-relaxed">{currentQ.explanation}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          {answerState !== "idle" && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="w-full py-4 rounded-xl font-mono font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg shadow-purple-500/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLast ? "See Results" : "Next Question"}
              <ArrowRight size={18} />
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ResultsScreen({
  langId,
  score,
  xp,
  correct,
  total,
  onReplay,
  onHome,
}: {
  langId: string;
  score: number;
  xp: number;
  correct: number;
  total: number;
  onReplay: () => void;
  onHome: () => void;
}) {
  const lang = LANGUAGES.find((l) => l.id === langId)!;
  const grade =
    score >= 90 ? { label: "MASTER", color: "#f59e0b", icon: "🏆" } :
    score >= 70 ? { label: "SKILLED", color: "#a78bfa", icon: "⭐" } :
    score >= 50 ? { label: "LEARNING", color: "#06b6d4", icon: "📚" } :
    { label: "KEEP GOING", color: "#f97316", icon: "💪" };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="max-w-md w-full text-center relative"
      >
        <motion.div
          className="text-7xl mb-4"
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {grade.icon}
        </motion.div>

        <div
          className="inline-block font-mono font-black text-4xl mb-2 tracking-widest"
          style={{ color: grade.color }}
        >
          {grade.label}
        </div>

        <div className="text-8xl font-mono font-black text-white mb-1">{score}%</div>
        <p className="text-white/40 font-mono text-sm mb-8">
          {correct} of {total} correct · {xp} XP earned
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Correct", value: correct, color: "#22c55e" },
            { label: "Wrong", value: total - correct, color: "#ef4444" },
            { label: "XP Gained", value: `+${xp}`, color: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-mono font-black mb-1" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs font-mono text-white/40">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Language badge */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-xl">{lang.icon}</span>
          <span className="font-mono text-white/60">{lang.name} complete</span>
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={onReplay}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border border-white/20 font-mono font-bold text-white/70 bg-white/5"
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw size={16} />
            Retry
          </motion.button>
          <motion.button
            onClick={onHome}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-mono font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg shadow-purple-500/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Code2 size={16} />
            New Language
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [results, setResults] = useState<{ score: number; xp: number; correct: number } | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("codequest-theme");
    return saved !== "light";
  });
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      return JSON.parse(localStorage.getItem("codequest-profile") || '{"username":"","yearLevel":"","course":"","school":""}');
    } catch {
      return { username: "", yearLevel: "", course: "", school: "" };
    }
  });

  const totalQs = selectedLang ? (QUESTIONS[selectedLang]?.length ?? 0) : 0;

  useEffect(() => {
    localStorage.setItem("codequest-theme", darkMode ? "dark" : "light");
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
  }, [darkMode]);

  const saveProfile = (next: StudentProfile) => {
    setProfile(next);
    localStorage.setItem("codequest-profile", JSON.stringify(next));
    setScreen("guidelines");
  };

  const startQuest = () => {
    if (!profile.username || !profile.yearLevel || !profile.course || !profile.school) {
      setScreen("profile");
      return;
    }
    setScreen("language");
  };

  return (
    <div className={`${darkMode ? "dark-mode" : "light-mode"} min-h-screen text-foreground overflow-x-hidden`}
      style={{ fontFamily: "'JetBrains Mono', 'Inter', monospace" }}>
      <style>{`
        .light-mode { background: #f7f8fc; color: #111827; }
        .light-mode .text-white { color: #111827 !important; }
        .light-mode .text-white\\/80 { color: #374151 !important; }
        .light-mode .text-white\\/70 { color: #4b5563 !important; }
        .light-mode .text-white\\/60 { color: #6b7280 !important; }
        .light-mode .text-white\\/50 { color: #6b7280 !important; }
        .light-mode .text-white\\/40 { color: #6b7280 !important; }
        .light-mode .text-white\\/30 { color: #9ca3af !important; }
        .light-mode .text-white\\/20 { color: #9ca3af !important; }
        .light-mode .bg-white\\/5 { background-color: rgba(17,24,39,.045) !important; }
        .light-mode .bg-white\\/10 { background-color: rgba(17,24,39,.08) !important; }
        .light-mode .border-white\\/10 { border-color: rgba(17,24,39,.12) !important; }
        .light-mode .border-white\\/20 { border-color: rgba(17,24,39,.18) !important; }
        .light-mode .bg-black\\/20 { background-color: rgba(255,255,255,.85) !important; }
        .light-mode input, .light-mode select { color: #111827 !important; }
        .light-mode input::placeholder { color: #9ca3af !important; }
      `}</style>

      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: darkMode
            ? `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`
            : `linear-gradient(rgba(17,24,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.04) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <AnimatePresence mode="wait">
        {screen === "home" && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HomeScreen
              profile={profile}
              darkMode={darkMode}
              onToggleTheme={() => setDarkMode((v) => !v)}
              onProfile={() => setScreen("profile")}
              onGuidelines={() => setScreen("guidelines")}
              onStart={startQuest}
            />
          </motion.div>
        )}

        {screen === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProfileScreen profile={profile} onSave={saveProfile} onBack={() => setScreen("home")} />
          </motion.div>
        )}

        {screen === "guidelines" && (
          <motion.div key="guidelines" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GuidelinesScreen onBack={() => setScreen("home")} onContinue={() => setScreen("language")} />
          </motion.div>
        )}

        {screen === "language" && (
          <motion.div key="language" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LanguageScreen
              onSelect={(lang) => {
                setSelectedLang(lang);
                setResults(null);
                setScreen("game");
              }}
            />
          </motion.div>
        )}

        {screen === "game" && selectedLang && (
          <motion.div key={`game-${selectedLang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GameScreen
              langId={selectedLang}
              onFinish={(score, xp, correct) => {
                setResults({ score, xp, correct });
                setScreen("results");
              }}
            />
          </motion.div>
        )}

        {screen === "results" && selectedLang && results && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResultsScreen
              langId={selectedLang}
              score={results.score}
              xp={results.xp}
              correct={results.correct}
              total={totalQs}
              onReplay={() => {
                setResults(null);
                setScreen("game");
              }}
              onHome={() => {
                setSelectedLang(null);
                setScreen("language");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
