import { useState, useEffect, useCallback, useRef } from "react";
import type { FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Code2, Zap, Trophy, Star, ArrowRight, RotateCcw, CheckCircle2, XCircle, Flame, Target, BookOpen, ChevronRight, User, GraduationCap, School, BookOpenCheck, Moon, Sun, Music, ArrowLeft, Swords, Shield, Camera, Gamepad2, Crown, Medal, Users, Sparkles, Heart, Volume2, Palette, Pencil, Terminal, Bug, Flame as FlameIcon, Menu, X } from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────

type AppUser = {
  id: string;
  username: string;
  password: string;
  role: "player" | "admin";
  photo: string;
  school: string;
  provider: "local" | "google" | "facebook";
  totalXP: number;
  weeklyXP: number;
  isOnline: boolean;
  friends: string[];
  createdAt: string;
};

type Screen = "welcome" | "home" | "profile" | "guidelines" | "modes" | "language" | "music" | "game" | "results" | "duel-setup" | "duel" | "community" | "leaderboard" | "admin" | "login";

const DEFAULT_ADMIN = { username: "admin", password: "admin123" };

const readUsers = (): AppUser[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("codequest-users");
    if (!raw) return [];
    return JSON.parse(raw) as AppUser[];
  } catch {
    return [];
  }
};

const writeUsers = (users: AppUser[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("codequest-users", JSON.stringify(users));
};

const seedDefaultUsers = () => {
  if (typeof window === "undefined") return [];
  const users = readUsers();
  if (users.length > 0) return users;
  const adminUser: AppUser = {
    id: "admin-1",
    username: DEFAULT_ADMIN.username,
    password: DEFAULT_ADMIN.password,
    role: "admin",
    photo: "",
    school: "CodeQuest Academy",
    provider: "local",
    totalXP: 5000,
    weeklyXP: 320,
    isOnline: true,
    friends: [],
    createdAt: new Date().toISOString(),
  };
  const seeded = [adminUser];
  writeUsers(seeded);
  return seeded;
};

const makeUser = (username: string, password: string, provider: AppUser["provider"], photo = "", school = "Unknown School"): AppUser => ({
  id: `${provider}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  username,
  password,
  role: "player",
  photo,
  school,
  provider,
  totalXP: 0,
  weeklyXP: 0,
  isOnline: true,
  friends: [],
  createdAt: new Date().toISOString(),
});

const LANGUAGES = [
  { id: "python", name: "Python", icon: "🐍", color: "#3b82f6", bg: "#1e3a5f", desc: "Beginner-friendly, used in AI & data science" },
  { id: "javascript", name: "JavaScript", icon: "⚡", color: "#f59e0b", bg: "#3d2c00", desc: "The language of the web, runs everywhere" },
  { id: "html", name: "HTML & CSS", icon: "🎨", color: "#f97316", bg: "#3d1f00", desc: "Build and style beautiful websites" },
  { id: "java", name: "Java", icon: "☕", color: "#ef4444", bg: "#3d1010", desc: "Object-oriented powerhouse for apps & Android" },
  { id: "cpp", name: "C++", icon: "⚙️", color: "#8b5cf6", bg: "#2d1f4a", desc: "High-performance systems & game development" },
  { id: "c", name: "C", icon: "🔧", color: "#60a5fa", bg: "#102a43", desc: "Learn the fundamentals of procedural programming" },
  { id: "typescript", name: "TypeScript", icon: "🔷", color: "#06b6d4", bg: "#003d4a", desc: "JavaScript with types — safer, scalable code" },
  { id: "php", name: "PHP", icon: "🐘", color: "#a78bfa", bg: "#2e2752", desc: "Build dynamic websites and server-side applications" },
  { id: "sql", name: "SQL", icon: "🗄️", color: "#38bdf8", bg: "#123047", desc: "Query, manage, and analyze relational databases" },
  { id: "csharp", name: "C#", icon: "🎯", color: "#22c55e", bg: "#123522", desc: "Modern programming for apps and game development" },
  { id: "kotlin", name: "Kotlin", icon: "🟣", color: "#f472b6", bg: "#43213b", desc: "Modern language for Android and JVM development" },
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
  php: [
    { id: 1, type: "multiple", question: "Which symbol starts a variable in PHP?", options: ["#", "$", "@", "%"], answer: 1, explanation: "PHP variables begin with the dollar sign, such as $name.", xp: 10 },
    { id: 2, type: "code", question: "What does this PHP code print?", code: `<?php\n$name = "CodeQuest";\necho $name;`, options: ["$name", "CodeQuest", "echo", "Error"], answer: 1, explanation: "echo outputs the value stored in $name.", xp: 15 },
    { id: 3, type: "multiple", question: "Which tag is commonly used to start PHP code?", options: ["<php>", "<?php", "<script>", "<?"], answer: 1, explanation: "PHP code normally starts with <?php.", xp: 10 },
    { id: 4, type: "truefalse", question: "PHP can be used for server-side web development.", options: ["True", "False"], answer: 0, explanation: "TRUE! PHP is widely used for server-side web applications.", xp: 15 },
    { id: 5, type: "multiple", question: "Which operator is used for string concatenation in PHP?", options: ["+", ".", "&", "::"], answer: 1, explanation: "The dot operator (.) concatenates strings in PHP.", xp: 15 },
    { id: 6, type: "code", question: "What is printed?", code: `$x = 5;\n$y = 2;\necho $x + $y;`, options: ["3", "7", "10", "52"], answer: 1, explanation: "The + operator adds the two numbers, producing 7.", xp: 20 },
    { id: 7, type: "multiple", question: "Which superglobal contains form data sent with POST?", options: ["$_GET", "$_POST", "$_FORM", "$_DATA"], answer: 1, explanation: "$_POST contains variables submitted through an HTTP POST request.", xp: 20 },
  ],
  sql: [
    { id: 1, type: "multiple", question: "Which command is used to retrieve data from a table?", options: ["GET", "SELECT", "FETCH", "READ"], answer: 1, explanation: "SELECT retrieves rows from one or more database tables.", xp: 10 },
    { id: 2, type: "code", question: "What does this query return?", code: `SELECT name FROM students;`, options: ["All student names", "The whole database", "Only the table name", "An error"], answer: 0, explanation: "The query selects the name column from the students table.", xp: 15 },
    { id: 3, type: "multiple", question: "Which clause filters rows?", options: ["ORDER BY", "WHERE", "GROUP BY", "LIMIT"], answer: 1, explanation: "WHERE applies conditions to filter rows.", xp: 10 },
    { id: 4, type: "truefalse", question: "SQL can be used to insert new records into a database.", options: ["True", "False"], answer: 0, explanation: "TRUE! INSERT INTO is used to add records.", xp: 15 },
    { id: 5, type: "multiple", question: "Which command adds a new row?", options: ["INSERT", "ADDROW", "APPEND", "CREATE"], answer: 0, explanation: "INSERT INTO adds new rows to a table.", xp: 15 },
    { id: 6, type: "code", question: "Which query changes a student's course?", code: `UPDATE students\nSET course = 'BSIT'\nWHERE id = 1;`, options: ["Deletes the student", "Updates the matching row", "Creates a table", "Selects the course"], answer: 1, explanation: "UPDATE changes existing records that match the WHERE condition.", xp: 20 },
    { id: 7, type: "multiple", question: "Which clause sorts query results?", options: ["SORT BY", "ORDER BY", "ARRANGE", "GROUP BY"], answer: 1, explanation: "ORDER BY sorts returned rows.", xp: 20 },
  ],
  csharp: [
    { id: 1, type: "multiple", question: "Which keyword declares a class in C#?", options: ["object", "class", "type", "structclass"], answer: 1, explanation: "The class keyword declares a class.", xp: 10 },
    { id: 2, type: "code", question: "What does this print?", code: `int x = 4;\nConsole.WriteLine(x + 2);`, options: ["2", "4", "6", "42"], answer: 2, explanation: "4 + 2 equals 6.", xp: 15 },
    { id: 3, type: "multiple", question: "Which method prints text to the console?", options: ["Console.WriteLine()", "print()", "echo()", "console.log()"], answer: 0, explanation: "Console.WriteLine() writes text and then moves to a new line.", xp: 10 },
    { id: 4, type: "truefalse", question: "C# is commonly used with the .NET platform.", options: ["True", "False"], answer: 0, explanation: "TRUE! C# is a primary language of the .NET ecosystem.", xp: 15 },
    { id: 5, type: "multiple", question: "Which type stores true or false?", options: ["bool", "boolean", "bit", "truth"], answer: 0, explanation: "C# uses bool for Boolean values.", xp: 15 },
    { id: 6, type: "code", question: "What is the value of total?", code: `int a = 3;\nint b = 5;\nint total = a * b;`, options: ["8", "15", "35", "2"], answer: 1, explanation: "3 multiplied by 5 is 15.", xp: 20 },
    { id: 7, type: "multiple", question: "Which symbol ends most C# statements?", options: [".", ";", ":", ","], answer: 1, explanation: "Most C# statements end with a semicolon.", xp: 20 },
  ],
  kotlin: [
    { id: 1, type: "multiple", question: "Which keyword declares a read-only variable in Kotlin?", options: ["var", "let", "val", "const"], answer: 2, explanation: "val declares a read-only reference; var declares a mutable variable.", xp: 10 },
    { id: 2, type: "code", question: "What does this print?", code: `val x = 5\nprintln(x + 3)`, options: ["2", "5", "8", "53"], answer: 2, explanation: "5 + 3 equals 8.", xp: 15 },
    { id: 3, type: "multiple", question: "Which function is commonly used to print a line in Kotlin?", options: ["printLine()", "println()", "echo()", "console()"], answer: 1, explanation: "println() prints a value followed by a new line.", xp: 10 },
    { id: 4, type: "truefalse", question: "Kotlin is widely used for Android development.", options: ["True", "False"], answer: 0, explanation: "TRUE! Kotlin is a major language for modern Android development.", xp: 15 },
    { id: 5, type: "multiple", question: "Which keyword declares a mutable variable?", options: ["val", "var", "mut", "change"], answer: 1, explanation: "var declares a variable whose value can be changed.", xp: 15 },
    { id: 6, type: "code", question: "What is the result?", code: `val a = 2\nval b = 4\nprintln(a * b)`, options: ["6", "8", "24", "2"], answer: 1, explanation: "2 multiplied by 4 equals 8.", xp: 20 },
    { id: 7, type: "multiple", question: "Which symbol is used for a single-line comment?", options: ["#", "//", "<!--", "--"], answer: 1, explanation: "Kotlin uses // for single-line comments.", xp: 20 },
  ]};

// ─── Types ───────────────────────────────────────────────────────────────────

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


const RANKS = [
  { name: "Beginner Programmer", minXP: 0, icon: "🌱", color: "#94a3b8" },
  { name: "Novice Programmer", minXP: 100, icon: "🛡️", color: "#60a5fa" },
  { name: "Junior Programmer", minXP: 250, icon: "⚔️", color: "#a78bfa" },
  { name: "Intermediate Programmer", minXP: 500, icon: "🔥", color: "#f59e0b" },
  { name: "Advanced Programmer", minXP: 900, icon: "💎", color: "#22d3ee" },
  { name: "Senior Programmer", minXP: 1500, icon: "👑", color: "#fbbf24" },
];

function getRank(totalXP: number) {
  return [...RANKS].reverse().find((rank) => totalXP >= rank.minXP) ?? RANKS[0];
}

// ─── Screens ─────────────────────────────────────────────────────────────────


type GameMode = "practice" | "battle" | "speed" | "debug" | "survival" | "compiler";

type AnimeCharacter = { id: string; name: string; title: string; emoji: string; color: string; accent: string; attack: string; aura: string };

const COMPILER_CHALLENGES: Record<string, { prompt: string; code: string; expected: string; hint: string }[]> = {
  python: [
    { prompt: "Complete the output statement.", code: "name = \"Elmer\"\nprint(____)", expected: "name", hint: "Print the variable named name." },
    { prompt: "Complete the loop range.", code: "for i in range(____):\n    print(i)", expected: "5", hint: "Print 0, 1, 2, 3, 4." },
  ],
  javascript: [
    { prompt: "Complete the console output.", code: "const score = 100;\nconsole.log(____);", expected: "score", hint: "Output the score variable." },
    { prompt: "Complete the increment.", code: "let xp = 10;\nxp ____ 5;", expected: "+=", hint: "Add five XP to the variable." },
  ],
  java: [
    { prompt: "Complete the Java print statement.", code: 'String name = "Elmer";\nSystem.out.println(____);', expected: "name", hint: "Print the name variable." },
    { prompt: "Complete the comparison operator.", code: "if (score ____ 75) {\n    System.out.println(\"Pass\");\n}", expected: ">=", hint: "Pass when score is 75 or higher." },
  ],
  cpp: [
    { prompt: "Complete the C++ output.", code: "int score = 90;\ncout << ____;", expected: "score", hint: "Send the score variable to cout." },
    { prompt: "Complete the increment operator.", code: "int xp = 10;\nxp ____ 5;", expected: "+=", hint: "Add five to xp." },
  ],
  c: [
    { prompt: "Complete the C output statement.", code: "int score = 90;\nprintf(\"%d\", ____);", expected: "score", hint: "Pass score as printf's argument." },
    { prompt: "Complete the comparison.", code: "if (score ____ 75) {", expected: ">=", hint: "75 should count as passing." },
  ],
  typescript: [
    { prompt: "Complete the typed variable output.", code: 'const username: string = "Elmer";\nconsole.log(____);', expected: "username", hint: "Output the typed variable." },
    { prompt: "Complete the type annotation.", code: "let xp: ____ = 100;", expected: "number", hint: "XP is numeric." },
  ],
  php: [
    { prompt: "Complete the PHP output.", code: '$name = "Elmer";\necho ____;', expected: "$name", hint: "Echo the variable including its $ prefix." },
    { prompt: "Complete the PHP comparison.", code: "if ($score ____ 75) {", expected: ">=", hint: "75 or higher passes." },
  ],
  sql: [
    { prompt: "Complete the SQL query.", code: "SELECT ____ FROM students;", expected: "*", hint: "Select every column." },
    { prompt: "Complete the filter.", code: "SELECT * FROM students WHERE score ____ 75;", expected: ">=", hint: "Keep scores 75 and above." },
  ],
  csharp: [
    { prompt: "Complete the C# output.", code: 'string name = "Elmer";\nConsole.WriteLine(____);', expected: "name", hint: "Write the name variable." },
    { prompt: "Complete the comparison.", code: "if (score ____ 75) {", expected: ">=", hint: "75 is a passing score." },
  ],
  kotlin: [
    { prompt: "Complete the Kotlin output.", code: 'val name = "Elmer"\nprintln(____)', expected: "name", hint: "Print the name value." },
    { prompt: "Complete the mutable declaration.", code: "____ xp = 100", expected: "var", hint: "Use the mutable variable keyword." },
  ],
};

const ANIME_CHARACTERS: AnimeCharacter[] = [
  { id: "nova", name: "Nova", title: "Neon Code Mage", emoji: "🧙‍♀️", color: "#8b5cf6", accent: "#22d3ee", attack: "NEON CODE BURST!", aura: "violet" },
  { id: "kairo", name: "Kairo", title: "Cyber Blade Runner", emoji: "⚔️", color: "#06b6d4", accent: "#3b82f6", attack: "CYBER SLASH!", aura: "cyan" },
  { id: "akari", name: "Akari", title: "Flame Syntax Ninja", emoji: "🔥", color: "#f97316", accent: "#ec4899", attack: "FLAME SYNTAX!", aura: "fire" },
  { id: "rei", name: "Rei", title: "Quantum Hacker", emoji: "🦋", color: "#ec4899", accent: "#a855f7", attack: "QUANTUM BREAK!", aura: "pink" },
  { id: "zen", name: "Zen", title: "Thunder Compiler", emoji: "⚡", color: "#facc15", accent: "#22c55e", attack: "THUNDER COMPILE!", aura: "gold" },
];


const SPOTIFY_TRACKS = [
  { id: "2nbotE8GMs2IYte7WgtZBa", title: "Multo", artist: "Cup of Joe", category: "OPM" },
  { id: "61vyXXtY7OSYFRtSzv5ehw", title: "Mundo", artist: "IV OF SPADES", category: "OPM" },
  { id: "4rwsFa82o2Bqo5DEj0wUKr", title: "Palagi", artist: "TJ Monterde", category: "OPM" },
  { id: "73yag1G1OoegdWZAtMxY5D", title: "Blinding Lights", artist: "The Weeknd", category: "The Weeknd" },
  { id: "38JOdzBE9kPj5UhKtqIIqQ", title: "Starboy", artist: "The Weeknd", category: "The Weeknd" },
  { id: "4m0q0xQ2BNl9SCAGKyfiGZ", title: "Somebody Else", artist: "The 1975", category: "Rock / Alt" },
  { id: "74ntRTkfvBFTqC6RMcZnrA", title: "Lips Of An Angel", artist: "Hinder", category: "Rock / Alt" },
  { id: "0V3wPSX9ygBnCm8psDIegu", title: "Anti-Hero", artist: "Taylor Swift", category: "Pop" },
  { id: "2plbrEY59IikOBgBGLjaoe", title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", category: "Pop" },
  { id: "6mPNCrmCQgV4ZIRwNFW9w8", title: "Code", artist: "Programming and Coding Music Club", category: "Focus" },
  { id: "6zcjD7iRPz5fgOFAFtQqEJ", title: "Coding Focus, Pt. 10", artist: "Programming Coding Ambient Chill", category: "Focus" },
  { id: "0p20HotsDDhhAUtJ2KOAg9", title: "Relaxing Beats for Late Night Coding", artist: "Lo Fi Hip Hop", category: "Focus" },
];

type MusicTrack = (typeof SPOTIFY_TRACKS)[number];

type MusicStyle = {
  wave: OscillatorType;
  notes: Array<[number, number]>;
};

const getMusicStyle = (track: MusicTrack): MusicStyle => {
  if (track.category === "Focus") {
    return { wave: "sine", notes: [[220, 280], [330, 392], [392, 440], [440, 330]] };
  }
  if (track.category === "Pop" || track.artist.includes("Weeknd")) {
    return { wave: "triangle", notes: [[440, 523], [554, 659], [698, 783], [659, 587]] };
  }
  if (track.category === "Rock / Alt") {
    return { wave: "sawtooth", notes: [[196, 246], [246, 293], [329, 392], [392, 329]] };
  }
  return { wave: "square", notes: [[261, 329], [329, 392], [392, 440], [440, 523]] };
};

const DEBUG_QUESTIONS_BY_LANGUAGE: Record<string, Question[]> = {
  python: [
    { id: 201, type: "code", question: "Fix the Python indentation bug.", code: `if score >= 75:\nprint("Passed")`, options: ["Indent print() under if", "Remove if", "Add ;", "Change >= to <="], answer: 0, explanation: "Python requires indentation to define the body of an if statement.", xp: 25 },
    { id: 202, type: "code", question: "Fix the Python loop so it counts upward.", code: `for i in range(5):\n    print(i)`, options: ["This code is already correct", "Change range to range(-5)", "Remove print", "Use i--"], answer: 0, explanation: "range(5) correctly produces 0 through 4, so no fix is needed.", xp: 25 },
  ],
  javascript: [
    { id: 211, type: "code", question: "Fix the JavaScript loop that never reaches the end.", code: `for (let i = 0; i < 5; i--) {\n  console.log(i);\n}`, options: ["Change i-- to i++", "Change < to >", "Remove let", "Remove console.log"], answer: 0, explanation: "The counter must increase toward 5, so i++ is required.", xp: 25 },
    { id: 212, type: "code", question: "Fix the JavaScript null-check bug.", code: `const user = null;\nconsole.log(user.name);`, options: ["Check user before reading name", "Use user.name = null", "Remove const", "Convert user to number"], answer: 0, explanation: "Accessing a property on null throws an error. Check that user exists first.", xp: 25 },
  ],
  html: [
    { id: 221, type: "code", question: "Fix the HTML form bug: the input cannot be submitted with the intended field name.", code: `<form>\n  <input id="email">\n</form>`, options: ["Add name=\"email\"", "Remove the input", "Change form to div", "Add Python code"], answer: 0, explanation: "A form control should have a name attribute so its value can be submitted as form data.", xp: 25 },
    { id: 222, type: "code", question: "Fix the CSS bug that prevents the text color rule from applying.", code: `.title { color: bluish; }`, options: ["Use a valid color such as blue", "Add Python", "Remove color", "Change .title to <title>"], answer: 0, explanation: "bluish is not a valid CSS color keyword. Use blue, a hex value, rgb(), etc.", xp: 25 },
  ],
  java: [
    { id: 231, type: "code", question: "Fix the Java comparison bug.", code: `int age = 18;\nif (age = 18) {\n  System.out.println("Adult");\n}`, options: ["Change = to ==", "Change int to string", "Remove if", "Use ==="], answer: 0, explanation: "Java uses == for comparison; = assigns a value.", xp: 25 },
    { id: 232, type: "code", question: "Fix the Java array index bug.", code: `int[] nums = {1,2,3};\nSystem.out.println(nums[3]);`, options: ["Use nums[2]", "Use nums[4]", "Remove the array", "Use nums[-1]"], answer: 0, explanation: "The last valid index is 2 because Java arrays are zero-indexed.", xp: 25 },
  ],
  cpp: [
    { id: 241, type: "code", question: "Fix the C++ output bug.", code: `int x = 5;\ncout << x`, options: ["Add a semicolon", "Remove cout", "Change int to string", "Add Python"], answer: 0, explanation: "The C++ statement needs a semicolon at the end.", xp: 25 },
    { id: 242, type: "code", question: "Fix the C++ array bounds bug.", code: `int a[3] = {1,2,3};\ncout << a[3];`, options: ["Use a[2]", "Use a[4]", "Use a[-3]", "Delete a"], answer: 0, explanation: "Valid indexes are 0, 1, and 2. Index 3 is out of bounds.", xp: 25 },
  ],
  c: [
    { id: 251, type: "code", question: "Fix the C format-specifier bug.", code: `int age = 20;\nprintf("%s", age);`, options: ["Use %d", "Use %f", "Use %c only", "Remove age"], answer: 0, explanation: "%d is the correct printf format specifier for an int.", xp: 25 },
    { id: 252, type: "code", question: "Fix the C pointer bug.", code: `int x = 5;\nint *p;\n*p = x;`, options: ["Set p = &x before dereferencing", "Delete x", "Use p++", "Change int to float"], answer: 0, explanation: "p must point to valid memory before *p is used.", xp: 25 },
  ],
  typescript: [
    { id: 261, type: "code", question: "Fix the TypeScript type bug.", code: `let score: number = "100";`, options: ["Use 100 without quotes", "Change number to boolean", "Remove score", "Use undefined"], answer: 0, explanation: "A number variable must receive a number, not a string.", xp: 25 },
    { id: 262, type: "code", question: "Fix the TypeScript optional-value bug.", code: `let name: string | undefined;\nconsole.log(name.toUpperCase());`, options: ["Check name before calling toUpperCase()", "Remove string", "Use name = false", "Add a semicolon only"], answer: 0, explanation: "name can be undefined, so TypeScript requires a guard before calling a string method.", xp: 25 },
  ],
  php: [
    { id: 271, type: "code", question: "Fix the PHP variable bug.", code: `$name = "Elmer";\necho name;`, options: ["Use echo $name;", "Use echo #name;", "Remove $ from assignment", "Use console.log"], answer: 0, explanation: "PHP variables require the $ prefix when they are referenced.", xp: 25 },
    { id: 272, type: "code", question: "Fix the PHP comparison bug.", code: `$age = 18;\nif ($age = 20) { echo "OK"; }`, options: ["Change = to == or ===", "Remove $age", "Use =>", "Use ===="], answer: 0, explanation: "= assigns a value; == or === compares values.", xp: 25 },
  ],
  sql: [
    { id: 281, type: "code", question: "Fix the SQL query that has the wrong clause order.", code: `SELECT name FROM users\nWHERE age > 18\nORDER BY name;`, options: ["This query is already correct", "Move WHERE after ORDER BY", "Remove SELECT", "Replace WHERE with if"], answer: 0, explanation: "SELECT, FROM, WHERE, then ORDER BY is valid SQL clause order.", xp: 25 },
    { id: 282, type: "code", question: "Fix the SQL NULL comparison bug.", code: `SELECT * FROM users WHERE email = NULL;`, options: ["Use email IS NULL", "Use email == NULL", "Use email := NULL", "Remove WHERE"], answer: 0, explanation: "SQL uses IS NULL / IS NOT NULL for NULL checks.", xp: 25 },
  ],
  csharp: [
    { id: 291, type: "code", question: "Fix the C# comparison bug.", code: `int score = 90;\nif (score = 90) Console.WriteLine("A");`, options: ["Change = to ==", "Change int to string", "Remove if", "Use ==="], answer: 0, explanation: "C# uses == for equality comparison.", xp: 25 },
    { id: 292, type: "code", question: "Fix the C# array index bug.", code: `int[] nums = {1,2,3};\nConsole.WriteLine(nums[3]);`, options: ["Use nums[2]", "Use nums[4]", "Use nums[-1]", "Delete nums"], answer: 0, explanation: "The last valid index is 2 for a three-item array.", xp: 25 },
  ],
  kotlin: [
    { id: 301, type: "code", question: "Fix the Kotlin null-safety bug.", code: `var name: String? = null\nprintln(name.length)`, options: ["Use name?.length", "Remove String?", "Use name++", "Use === only"], answer: 0, explanation: "A nullable String must be safely accessed with ?. or checked first.", xp: 25 },
    { id: 302, type: "code", question: "Fix the Kotlin mutable-variable bug.", code: `val score = 10\nscore = 20`, options: ["Change val to var", "Change 20 to null", "Remove score", "Use const"], answer: 0, explanation: "val is read-only; use var when the value needs to change.", xp: 25 },
  ],
};

const DEBUG_QUESTIONS: Question[] = DEBUG_QUESTIONS_BY_LANGUAGE.javascript;

function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(124,58,237,.24),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(6,182,212,.14),transparent_30%),radial-gradient(circle_at_85%_70%,rgba(236,72,153,.12),transparent_30%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 28, ease: "linear" }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[720px] aspect-square rounded-full border border-purple-400/10" />
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 18, ease: "linear" }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[48vw] max-w-[500px] aspect-square rounded-full border border-cyan-400/10 border-dashed" />
      </div>

      <div className="absolute hidden lg:block top-24 left-8 text-[11px] font-mono text-cyan-300/30 rotate-[-8deg]">{`while(skill){ learn(); levelUp(); }`}</div>
      <div className="absolute hidden lg:block bottom-28 right-8 text-[11px] font-mono text-purple-300/30 rotate-[7deg]">{`if(correct) { attack(); }`}</div>

      <motion.div initial={{ opacity: 0, scale: .92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .8, type: "spring" }}
        className="relative z-10 w-full max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-400/30 bg-purple-500/10 backdrop-blur-xl text-purple-200 font-mono text-xs font-black tracking-wider mb-7">
          <Sparkles size={14} className="text-yellow-300" /> THE ULTIMATE CODING ADVENTURE
        </div>

        <motion.div animate={{ y: [0, -7, 0], rotate: [0, 2, -2, 0] }} transition={{ repeat: Infinity, duration: 4 }}
          className="mx-auto w-20 h-20 rounded-[28px] bg-gradient-to-br from-purple-600 via-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-[0_0_70px_rgba(139,92,246,.45)] mb-7">
          <Code2 size={42} className="text-white" />
        </motion.div>

        <p className="text-cyan-300 font-mono font-black tracking-[0.35em] text-xs sm:text-sm mb-3">WELCOME, CODE WARRIOR</p>
        <h1 className="text-6xl sm:text-7xl md:text-9xl font-mono font-black leading-[.82] tracking-[-.08em]">
          <span className="text-white">Code</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300">Quest</span>
        </h1>
        <p className="text-white/55 font-mono text-base sm:text-lg md:text-xl mt-7 max-w-3xl mx-auto">
          Enter a world where <span className="text-purple-300">answers become weapons</span>, code becomes power, and every challenge makes you stronger.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mt-10 mb-9">
          {[
            ["⚔️", "BATTLE", "Fight with code"],
            ["⚡", "SPEED", "Race the clock"],
            ["🐛", "DEBUG", "Hunt the bugs"],
            ["🎵", "MUSIC", "Choose your vibe"],
          ].map(([icon, title, desc]) => (
            <motion.div whileHover={{ y: -4 }} key={title} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
              <div className="text-2xl mb-2">{icon}</div><p className="text-white font-mono font-black text-xs">{title}</p><p className="text-white/35 font-mono text-[9px] mt-1">{desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.button onClick={onContinue} whileHover={{ scale: 1.04, boxShadow: "0 0 70px rgba(139,92,246,.5)" }} whileTap={{ scale: .97 }}
          className="group inline-flex items-center gap-3 px-9 sm:px-12 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 text-white font-mono font-black text-base sm:text-lg shadow-2xl shadow-purple-500/25">
          ENTER CODEQUEST <ArrowRight size={21} className="group-hover:translate-x-1 transition-transform"/>
        </motion.button>
        <p className="text-white/25 text-[10px] font-mono mt-4">Built by Elmer Makig-angay — an aspiring web developer turning code into interactive adventures.</p>
      </motion.div>
    </div>
  );
}

function MusicSelectionScreen({
  selectedTrack,
  onSelect,
  onBack,
}: {
  selectedTrack: (typeof SPOTIFY_TRACKS)[number];
  onSelect: (track: (typeof SPOTIFY_TRACKS)[number]) => void;
  onBack: () => void;
}) {
  const [category, setCategory] = useState("All");
  const categories = ["All", "OPM", "The Weeknd", "Pop", "Rock / Alt", "Focus"];
  const visibleTracks = category === "All" ? SPOTIFY_TRACKS : SPOTIFY_TRACKS.filter((t) => t.category === category);

  return (
    <div className="min-h-screen px-3 sm:px-5 py-6 sm:py-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,.18),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(6,182,212,.14),transparent_35%)]" />
      <div className="max-w-5xl mx-auto relative">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8">
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.div animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 3 }}
            className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-green-500/25 mb-4">
            <Music size={30} className="text-white" />
          </motion.div>
          <p className="text-green-300 text-xs font-mono font-black tracking-[0.3em]">GLOBAL SOUNDTRACK</p>
          <h2 className="text-4xl md:text-6xl font-mono font-black text-white mt-2">CHOOSE YOUR SOUNDTRACK</h2>
          <p className="text-white/40 font-mono text-sm mt-3">Choose a track anytime. Selecting one closes this screen and keeps the soundtrack playing globally.</p>
        </motion.div>

        <div className="rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 via-white/5 to-cyan-500/10 p-4 sm:p-6 shadow-2xl">
          <div className="flex flex-wrap gap-2 pb-2 mb-4">
            {categories.map((item) => (
              <button key={item} onClick={() => setCategory(item)}
                className={`shrink-0 px-3 py-2 rounded-full text-[10px] font-mono border ${
                  category === item ? "bg-green-500/20 border-green-400/50 text-green-300" : "bg-white/5 border-white/10 text-white/50"
                }`}>
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleTracks.map((track) => (
              <motion.button key={track.id} whileHover={{ y: -2 }} whileTap={{ scale: .98 }} onClick={() => onSelect(track)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  selectedTrack.id === track.id ? "border-green-400/60 bg-green-500/15 shadow-lg shadow-green-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedTrack.id === track.id ? "bg-green-500/20" : "bg-white/5"}`}>
                    <Music size={17} className={selectedTrack.id === track.id ? "text-green-300" : "text-white/50"} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono font-black text-sm text-white truncate">{track.title}</p>
                    <p className="font-mono text-[10px] text-white/40 truncate">{track.artist}</p>
                  </div>
                </div>
                <p className="mt-3 text-[9px] font-mono text-green-300/60">{track.category}</p>
              </motion.button>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/5 p-4 text-center">
            <Music size={24} className="mx-auto text-green-300 mb-2" />
            <p className="text-green-300 font-mono font-black text-sm">GLOBAL SOUNDTRACK ARMED</p>
            <p className="text-white/35 font-mono text-[10px] mt-1">Your selected track plays from the beginning and stays with you across the whole website.</p>
          </div>
          <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-500/5 px-4 py-3 text-center">
            <p className="text-cyan-300 font-mono font-black text-xs">SELECT = PLAY NOW</p>
            <p className="text-white/35 font-mono text-[10px] mt-1">Tap any song and this menu closes immediately. Your selected soundtrack remains global while you use CodeQuest.</p>
          </div>
          <p className="text-center text-white/25 text-[10px] font-mono mt-3">Tap once to start the soundtrack. It will keep playing as you explore the app.</p>
        </div>
      </div>
    </div>
  );
}

function MusicPlayer({ compact = false, selectedTrack }: { compact?: boolean; selectedTrack?: (typeof SPOTIFY_TRACKS)[number] }) {
  const [track, setTrack] = useState(selectedTrack ?? SPOTIFY_TRACKS[0]);
  useEffect(() => { if (selectedTrack) setTrack(selectedTrack); }, [selectedTrack]);
  const [category, setCategory] = useState("All");
  const categories = ["All", "OPM", "The Weeknd", "Pop", "Rock / Alt", "Focus"];
  const visibleTracks = category === "All" ? SPOTIFY_TRACKS : SPOTIFY_TRACKS.filter((item) => item.category === category);

  return (
    <div className={`rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 via-white/5 to-cyan-500/5 shadow-2xl ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center">
          <Music size={18} className="text-green-400" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-sm font-black text-green-300">CODEQUEST MUSIC</p>
          <p className="text-white/40 text-[10px] font-mono truncate">Browser soundtrack for your quest.</p>
        </div>
        <span className="ml-auto shrink-0 text-[10px] font-mono text-white/30">{SPOTIFY_TRACKS.length} tracks</span>
      </div>

      <div className="flex flex-wrap gap-1.5 pb-1 mb-3">
        {categories.map((item) => (
          <button key={item} onClick={() => setCategory(item)}
            className={`shrink-0 px-2.5 py-1.5 rounded-full text-[9px] font-mono border transition-all ${
              category === item ? "bg-green-500/20 border-green-500/40 text-green-300" : "bg-white/5 border-white/10 text-white/50 hover:text-white"
            }`}>
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {visibleTracks.map((item) => (
          <button key={item.id} onClick={() => setTrack(item)}
            className={`min-w-0 text-left p-2.5 rounded-xl border transition-all ${
              track.id === item.id ? "bg-green-500/15 border-green-500/40" : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}>
            <p className="text-[11px] font-mono font-bold text-white truncate">{item.title}</p>
            <p className="text-[9px] font-mono text-white/40 truncate">{item.artist}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-green-500/15 bg-black/20 px-3 py-3 text-[10px] font-mono text-green-300">
        <div className="flex items-center justify-between gap-2">
          <span className="font-black">NOW PLAYING</span>
          <span>{track.title}</span>
        </div>
        <p className="mt-1 text-white/45">{track.artist} · {track.category}</p>
      </div>

      <div className="flex items-center gap-2 mt-2 text-[9px] font-mono text-white/35">
        <Volume2 size={11} />
        <span>Selected track starts after your first tap. Audio is played through the browser.</span>
      </div>
    </div>
  );
}

function AnimeCoderAvatar({ side = "player", large = false, attacking = false, hit = false, character }: { side?: "player" | "enemy"; large?: boolean; attacking?: boolean; hit?: boolean; character?: AnimeCharacter }) {
  const player = side === "player";
  const fighter = character ?? (player ? ANIME_CHARACTERS[0] : ANIME_CHARACTERS[1]);
  const main = player ? fighter.color : fighter.accent;
  const secondary = player ? fighter.accent : fighter.color;
  return (
    <motion.div
      animate={{
        y: hit ? [0, -5, 5, -3, 0] : [0, -5, 0],
        x: attacking ? (player ? [0, 30, 0] : [0, -30, 0]) : 0,
        rotate: attacking ? (player ? [0, 8, -2, 0] : [0, -8, 2, 0]) : (player ? [0, 1, 0] : [0, -1, 0]),
        scale: hit ? [1, 1.06, .96, 1] : 1,
      }}
      transition={{ duration: attacking || hit ? .55 : 2.4, ease: "easeInOut", repeat: attacking || hit ? 0 : Infinity }}
      className={`${large ? "w-32 h-40 sm:w-40 sm:h-48" : "w-20 h-24"} relative shrink-0`}
      aria-label={player ? "Anime coding hero" : "Anime code beast"}
    >
      <div className={`absolute inset-x-1/2 -translate-x-1/2 bottom-0 ${large ? "w-32 h-24" : "w-16 h-14"} rounded-[45%_45%_25%_25%] border-2 ${
        player ? "border-cyan-300/60" : "border-pink-300/60"
      } shadow-[0_0_35px_rgba(34,211,238,.18)]`}>
        <div className={`absolute ${large ? "top-2" : "top-1"} left-1/2 -translate-x-1/2 ${large ? "w-20 h-9" : "w-12 h-6"} rounded-full bg-gradient-to-r from-black/80 via-white/10 to-black/80`} />
        <div className={`absolute ${large ? "top-9" : "top-7"} left-1/2 -translate-x-1/2 ${large ? "w-24 h-24" : "w-14 h-14"} rounded-[48%] ${
          player ? "bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200" : "bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100"
        } border-2 ${player ? "border-cyan-200/60" : "border-pink-200/60"} shadow-xl`}>
          <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${large ? "w-28 h-12" : "w-16 h-7"} rounded-[70%_70%_30%_30%] ${
            player ? "bg-gradient-to-b from-slate-950 via-cyan-950 to-slate-900" : "bg-gradient-to-b from-slate-950 via-fuchsia-950 to-slate-900"
          }`} />
          <div className={`absolute ${large ? "top-10" : "top-7"} left-1/2 -translate-x-1/2 flex ${large ? "gap-7" : "gap-3"}`}>
            <span className={`${large ? "w-4 h-5" : "w-2 h-3"} rounded-full bg-gradient-to-b from-cyan-300 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,.8)]`} />
            <span className={`${large ? "w-4 h-5" : "w-2 h-3"} rounded-full bg-gradient-to-b from-pink-300 to-purple-500 shadow-[0_0_10px_rgba(236,72,153,.8)]`} />
          </div>
          <div className={`absolute ${large ? "bottom-7" : "bottom-4"} left-1/2 -translate-x-1/2 ${large ? "w-8" : "w-4"} h-1 rounded-full ${player ? "bg-cyan-400" : "bg-pink-400"}`} />
        </div>
        <div className={`absolute ${large ? "bottom-4" : "bottom-2"} left-1/2 -translate-x-1/2 ${large ? "text-3xl" : "text-lg"}`}>{fighter.emoji}</div>
      </div>
      <motion.div animate={attacking ? { scale: [1, 1.5, .8, 1.25, 1], opacity: [0.25, .75, .35, .65, .25], rotate: [0, 90, 180, 270, 360] } : { scale: [1, 1.08, 1], opacity: [.2, .35, .2] }} transition={{ duration: attacking ? .65 : 2.2, repeat: attacking ? 0 : Infinity }} className="absolute left-1/2 -translate-x-1/2 top-0 w-40 h-40 rounded-full blur-2xl" style={{ background: `radial-gradient(circle, ${main}99 0%, ${secondary}40 42%, transparent 72%)` }} />
      {attacking && <motion.div initial={{ opacity: 0, scale: .3 }} animate={{ opacity: [0, 1, 0], scale: [0.3, 1.5, 2.4], rotate: [0, 12, -12, 0] }} transition={{ duration: .65 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-4xl font-mono font-black z-10" style={{ color: main, textShadow: `0 0 25px ${main}` }}>{fighter.attack}</motion.div>}
    </motion.div>
  );
}

function ModesScreen({ onSelect, onBack }: { onSelect: (mode: GameMode) => void; onBack: () => void }) {
  const modes = [
    { id: "practice" as GameMode, icon: "🧠", title: "Practice Mode", desc: "Relaxed learning with explanations after every answer.", color: "#8b5cf6", questions: "7 questions" },
    { id: "battle" as GameMode, icon: "⚔️", title: "Battle Mode", desc: "Correct answers become attacks against the Code Beast with anime combat effects.", color: "#ef4444", questions: "7 questions" },
    { id: "speed" as GameMode, icon: "⚡", title: "Speed Mode", desc: "Race the clock and finish before time runs out.", color: "#f59e0b", questions: "5 questions · 60 sec" },
    { id: "debug" as GameMode, icon: "🐛", title: "Bug Hunter", desc: "Open broken code, identify the bug, and fix it in the language you choose.", color: "#22c55e", questions: "Language-specific bug fixes" },
    { id: "survival" as GameMode, icon: "🔥", title: "Code Survival", desc: "Keep your run alive. Wrong answers drain your life and streak.", color: "#06b6d4", questions: "12 lives-on-the-line" },
    { id: "compiler" as GameMode, icon: "⌨️", title: "Compiler Lab", desc: "Type the missing code directly into a terminal-style compiler and execute your answer.", color: "#22d3ee", questions: "Typing challenge" },
  ];
  return (
    <div className="min-h-screen px-4 sm:px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8"><ArrowLeft size={16}/> Back</button>
        <div className="text-center mb-10"><Gamepad2 className="mx-auto text-purple-400 mb-3" size={40}/><h2 className="text-4xl md:text-5xl font-mono font-black text-white">CHOOSE YOUR GAME</h2><p className="text-white/40 font-mono text-sm mt-2">Your soundtrack stays active while you explore the whole CodeQuest world.</p></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modes.map((mode) => <motion.button key={mode.id} onClick={() => onSelect(mode.id)} whileHover={{ y: -5, scale: 1.01 }} whileTap={{ scale: .98 }}
            className="text-left rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all shadow-xl">
            <div className="text-5xl mb-5">{mode.icon}</div>
            <h3 className="text-xl font-mono font-black text-white mb-2">{mode.title}</h3>
            <p className="text-white/50 text-sm font-mono leading-relaxed mb-5">{mode.desc}</p>
            <div className="flex items-center justify-between"><span className="text-xs font-mono" style={{color:mode.color}}>{mode.questions}</span><ArrowRight size={17} className="text-white/30"/></div>
          </motion.button>)}
        </div>
      </div>
    </div>
  );
}

function RankBadge({ totalXP, compact = false }: { totalXP: number; compact?: boolean }) {
  const rank = getRank(totalXP);
  return (
    <div className={`flex items-center gap-2 rounded-xl border bg-black/10 ${compact ? "px-2.5 py-1.5" : "px-3 py-2"}`} style={{ borderColor: `${rank.color}55` }}>
      <span className={compact ? "text-base" : "text-xl"}>{rank.icon}</span>
      <div className="min-w-0">
        <p className="font-mono font-black truncate" style={{ color: rank.color, fontSize: compact ? 10 : 12 }}>{rank.name}</p>
        <p className="text-white/30 font-mono" style={{ fontSize: compact ? 8 : 9 }}>{totalXP} XP</p>
      </div>
      <Trophy size={compact ? 12 : 15} style={{ color: rank.color }} className="ml-auto shrink-0" />
    </div>
  );
}

type StudentProfile = {
  username: string;
  yearLevel: string;
  course: string;
  school: string;
  photo: string;
};

function HomeScreen({
  onStart,
  onProfile,
  onGuidelines,
  onToggleTheme,
  darkMode,
  profile,
  totalXP,
  onDuel,
  onMusic,
  selectedTrack,
  onCommunity,
  onLeaderboard,
  onAdmin,
  currentUser,
}: {
  onStart: () => void;
  onProfile: () => void;
  onGuidelines: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
  profile: StudentProfile;
  totalXP: number;
  onDuel: () => void;
  onMusic: () => void;
  selectedTrack: (typeof SPOTIFY_TRACKS)[number];
  onCommunity: () => void;
  onLeaderboard: () => void;
  onAdmin: () => void;
  currentUser: AppUser | null;
}) {
  const rank = getRank(totalXP);
  const questionCount = 7;
  const nextRank = RANKS[RANKS.indexOf(rank) + 1];
  const progress = nextRank
    ? Math.max(4, Math.min(100, ((totalXP - rank.minXP) / Math.max(1, nextRank.minXP - rank.minXP)) * 100))
    : 100;

  return (
    <div className="min-h-screen relative overflow-hidden px-3 sm:px-5 lg:px-8 py-4 sm:py-6">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_45%_28%,rgba(139,92,246,.16),transparent_30%),radial-gradient(circle_at_75%_70%,rgba(6,182,212,.12),transparent_30%)]" />
      <div className="absolute -top-24 left-1/3 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Profile is intentionally the main top-center identity card. Clicking it opens the editable profile. */}
      <div className="relative z-20 flex justify-center">
        <motion.button
          onClick={onProfile}
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2, scale: 1.01 }}
          className="group w-full max-w-[520px] rounded-[28px] border border-white/10 bg-black/25 backdrop-blur-2xl p-3 sm:p-4 shadow-2xl shadow-purple-500/10 text-left"
          aria-label="Edit profile"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {profile.photo ? (
              <img src={profile.photo} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-lg" alt="Profile" />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500/30 to-cyan-500/20 border border-cyan-400/30 flex items-center justify-center"><User className="text-cyan-300" size={28}/></div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-white font-mono font-black text-base sm:text-lg truncate">{profile.username || "Code Warrior"}</p>
                <span className="text-[8px] font-mono text-cyan-300 border border-cyan-400/20 bg-cyan-400/10 rounded-full px-2 py-1 opacity-70 group-hover:opacity-100">EDIT</span>
              </div>
              <p className="text-white/40 text-[10px] sm:text-xs font-mono truncate">{profile.yearLevel || "Player"} · {profile.course || "Programmer"}</p>
              <div className="mt-2"><RankBadge totalXP={totalXP} compact /></div>
            </div>
            <div className="hidden sm:block text-right shrink-0">
              <p className="text-cyan-300 font-mono font-black text-sm">{totalXP} XP</p>
              <p className="text-white/25 text-[8px] font-mono mt-1">{nextRank ? `${nextRank.minXP - totalXP} XP TO NEXT` : "MAX RANK"}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[8px] font-mono text-white/30 mb-1"><span>RANK PROGRESS</span><span>{Math.round(progress)}%</span></div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-cyan-400" animate={{ width: `${progress}%` }} /></div>
          </div>
        </motion.button>
      </div>

      <motion.main initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08, duration: .55 }} className="relative z-10 w-full max-w-6xl mx-auto mt-6 sm:mt-8 lg:mt-10 pb-10">
        <div className="text-center">
          <motion.div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-400/30 rounded-full px-4 py-2 mb-5" animate={{ scale: [1, 1.025, 1] }} transition={{ repeat: Infinity, duration: 2.8 }}>
            <Zap size={16} className="text-yellow-400" />
            <span className="text-xs sm:text-sm font-mono text-purple-300">Made with code, imagination &amp; ambition</span>
          </motion.div>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-mono font-black tracking-tight leading-none bg-gradient-to-r from-white via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(139,92,246,.18)]">CodeQuest</h1>
          <p className="text-white/55 font-mono text-base sm:text-lg md:text-xl mt-4">&quot;Your Coding Adventure Starts Here&quot;</p>
          <p className="text-white/30 font-mono text-[10px] sm:text-xs md:text-sm max-w-2xl mx-auto mt-3 leading-6">Choose a mode, master a language, debug broken code, survive the compiler, and become the next coding legend.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mt-7">
          {(
            [
              [BookOpen, `${questionCount} Questions`, "Challenge yourself"],
              [Zap, "Earn XP", "Build your rank"],
              [Trophy, rank.name, "Level up your skills"],
            ] as Array<[typeof BookOpen, string, string]>
          ).map(([Icon, title, sub], i) => {
            const C = Icon;
            return <motion.div key={String(title)} whileHover={{ y: -3 }} className={`rounded-2xl border p-4 text-center ${i === 0 ? "border-purple-400/20 bg-purple-500/10" : i === 1 ? "border-yellow-400/20 bg-yellow-500/10" : "border-cyan-400/20 bg-cyan-500/10"}`}><C size={22} className="mx-auto mb-2" /><p className="font-mono font-black text-sm text-white">{title}</p><p className="font-mono text-[9px] text-white/35 mt-1">{sub}</p></motion.div>;
          })}
        </div>

        <div className="rounded-[28px] border border-purple-400/20 bg-gradient-to-br from-purple-500/10 via-black/10 to-cyan-500/10 p-4 sm:p-5 mt-5 max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-2"><div><p className="text-[9px] font-mono tracking-[.28em] text-purple-300">CODING JOURNEY</p><p className="font-mono font-black text-white mt-1">{rank.name}</p></div><p className="font-mono font-black text-cyan-300">{totalXP} XP</p></div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-cyan-400" animate={{ width: `${progress}%` }} transition={{ duration: .8 }} /></div>
          <p className="text-[8px] font-mono text-white/30 mt-2">{nextRank ? `${nextRank.minXP - totalXP} XP until ${nextRank.name}` : "You have reached the highest rank."}</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6">
          <motion.button onClick={onStart} whileHover={{ scale: 1.03 }} whileTap={{ scale: .98 }} className="w-full sm:w-auto min-w-[250px] px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 text-white font-mono font-black text-lg shadow-2xl shadow-purple-500/20">Start Playing <ArrowRight size={20} className="inline ml-2"/></motion.button>
          <button onClick={onDuel} className="w-full sm:w-auto px-7 py-4 rounded-2xl border border-pink-400/30 bg-pink-500/10 text-pink-300 font-mono font-black text-sm hover:bg-pink-500/15"><Users size={17} className="inline mr-2"/>1v1 Friend Arena</button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 max-w-4xl mx-auto">
          <button onClick={onCommunity} className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-left text-cyan-200 font-mono text-sm">🌐 Community Hub</button>
          <button onClick={onLeaderboard} className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-left text-yellow-200 font-mono text-sm">🏆 Weekly Rankings</button>
          {currentUser?.role === "admin" && <button onClick={onAdmin} className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-left text-red-200 font-mono text-sm">🛡 Admin Console</button>}
        </div>

        <div className="mt-8 flex justify-center">
          <div className="w-full max-w-xl flex items-center justify-center px-4 py-3 rounded-2xl border border-white/10 bg-black/15 backdrop-blur-xl text-center">
            <div>
              <p className="text-[8px] font-mono tracking-[.22em] text-cyan-300">CODEQUEST CREATOR</p>
              <p className="text-xs sm:text-sm font-mono font-black text-white mt-1">Made by Elmer Makig-angay</p>
              <p className="text-[9px] sm:text-[10px] font-mono text-white/35 mt-1">An aspiring web developer turning code into interactive adventures.</p>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}

function ProfileScreen({
  profile,
  totalXP,
  onSave,
  onBack,
  darkMode,
  onToggleTheme,
  currentUser,
  onLogin,
  onLogout,
  onOpenLogin,
}: {
  profile: StudentProfile;
  totalXP: number;
  onSave: (profile: StudentProfile) => void;
  onBack: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  currentUser: AppUser | null;
  onLogin: (user: AppUser) => void;
  onLogout: () => void;
  onOpenLogin: () => void;
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
      photo: form.photo || "",
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

          <div className="mb-5">
            <RankBadge totalXP={totalXP} />
          </div>

          <div className="mb-5 rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Menu size={15} className="text-cyan-300" />
              <span className="text-[10px] font-mono font-black tracking-[0.24em] text-cyan-300">SETTINGS</span>
            </div>
            <button type="button" onClick={onToggleTheme} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left">
              <span className="flex items-center gap-2">
                {darkMode ? <Sun size={16} className="text-yellow-300" /> : <Moon size={16} className="text-cyan-300" />}
                <span className="text-sm font-mono text-white/80">{darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
              </span>
              <span className="text-[11px] font-mono text-white/40">{darkMode ? "Light" : "Dark"}</span>
            </button>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-mono tracking-[0.24em] text-purple-300">ACCOUNT</p>
                  <p className="text-sm font-mono text-white/80">{currentUser ? `Signed in as ${currentUser.username}` : "Join the community hub"}</p>
                </div>
                {currentUser ? (
                  <button type="button" onClick={onLogout} className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-[11px] font-mono text-red-300">Log out</button>
                ) : (
                  <button type="button" onClick={onOpenLogin} className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-[11px] font-mono text-cyan-300">Go to login</button>
                )}
              </div>
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


            <div>
              <span className="text-xs font-mono text-white/50">Profile Photo</span>
              <div className="mt-2 flex items-center gap-4">
                {form.photo ? <img src={form.photo} className="w-20 h-20 rounded-2xl object-cover border border-purple-500/30" alt="Profile preview" /> :
                  <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-white/10 flex items-center justify-center"><Camera className="text-white/30" /></div>}
                <label className="cursor-pointer flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white/70 text-xs font-mono">
                  <Camera size={15}/> {form.photo ? "Change Photo" : "Choose Photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) { alert("Please choose an image smaller than 2MB."); return; }
                    const reader = new FileReader();
                    reader.onload = () => update("photo", String(reader.result));
                    reader.readAsDataURL(file);
                  }} />
                </label>
              </div>
              <p className="text-white/25 text-xs font-mono mt-2">For winning profiles, add a clear student photo.</p>
            </div>

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

function CommunityScreen({ onBack, users, currentUser, onAddFriend }: { onBack: () => void; users: AppUser[]; currentUser: AppUser | null; onAddFriend: (friendId: string) => void }) {
  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8"><ArrowLeft size={16}/> Back</button>
        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-white/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-cyan-300 text-[10px] font-mono font-black tracking-[0.28em]">COMMUNITY HUB</p>
              <h2 className="text-2xl font-mono font-black text-white mt-1">Online students and friends</h2>
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-cyan-300 text-xs font-mono">{users.filter((u) => u.isOnline).length} online</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {users.map((user) => (
              <div key={user.id} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 overflow-hidden flex items-center justify-center">
                    {user.photo ? <img src={user.photo} alt={user.username} className="w-full h-full object-cover" /> : <User size={18} className="text-white/50" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-mono font-black text-sm">{user.username}</p>
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${user.isOnline ? "bg-green-400" : "bg-white/25"}`} />
                    </div>
                    <p className="text-white/40 text-[10px] font-mono">{user.school} · {user.provider}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-yellow-300">{user.weeklyXP} XP this week</span>
                  {currentUser && currentUser.id !== user.id && <button onClick={() => onAddFriend(user.id)} className="rounded-full border border-pink-400/20 bg-pink-500/10 px-3 py-1 text-[10px] font-mono text-pink-300">Add Friend</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardScreen({ onBack, users }: { onBack: () => void; users: AppUser[] }) {
  const ranked = [...users].sort((a, b) => b.weeklyXP - a.weeklyXP);
  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8"><ArrowLeft size={16}/> Back</button>
        <div className="rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-500/10 to-white/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-yellow-300 text-[10px] font-mono font-black tracking-[0.28em]">WEEKLY RANKINGS</p>
              <h2 className="text-2xl font-mono font-black text-white mt-1">School-based leaderboard</h2>
            </div>
            <div className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-3 py-1 text-yellow-300 text-xs font-mono">Top {ranked.length}</div>
          </div>
          <div className="space-y-2">
            {ranked.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/15 text-yellow-300 font-mono font-black">{index + 1}</div>
                  <div>
                    <p className="text-white font-mono font-black text-sm">{user.username}</p>
                    <p className="text-white/40 text-[10px] font-mono">{user.school}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-300 font-mono font-black text-sm">{user.weeklyXP} XP</p>
                  <p className="text-white/35 text-[10px] font-mono">{user.role === "admin" ? "Admin" : "Player"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminScreen({ onBack, users, onResetUsers }: { onBack: () => void; users: AppUser[]; onResetUsers: () => void }) {
  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8"><ArrowLeft size={16}/> Back</button>
        <div className="rounded-3xl border border-red-400/20 bg-gradient-to-br from-red-500/10 to-white/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-red-300 text-[10px] font-mono font-black tracking-[0.28em]">ADMIN CONSOLE</p>
              <h2 className="text-2xl font-mono font-black text-white mt-1">Manage CodeQuest players</h2>
            </div>
            <button onClick={onResetUsers} className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-red-300 text-xs font-mono">Reset Demo Accounts</button>
          </div>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                <div>
                  <p className="text-white font-mono font-black text-sm">{user.username}</p>
                  <p className="text-white/40 text-[10px] font-mono">{user.role} · {user.school}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-300 font-mono font-black text-sm">{user.totalXP} XP</p>
                  <p className="text-white/35 text-[10px] font-mono">{user.isOnline ? "Online" : "Offline"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onBack, onLogin, onSwitchToSignup }: { onBack: () => void; onLogin: (user: AppUser) => void; onSwitchToSignup: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [provider, setProvider] = useState<AppUser["provider"]>("local");

  const submit = () => {
    const users = readUsers();
    const existing = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (mode === "login") {
      const found = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
      if (!found) {
        alert("Invalid username or password");
        return;
      }
      const nextUsers = users.map((u) => (u.id === found.id ? { ...u, isOnline: true } : u));
      writeUsers(nextUsers);
      onLogin({ ...found, isOnline: true });
      return;
    }
    if (!username.trim() || !password.trim()) {
      alert("Please enter a username and password");
      return;
    }
    if (existing) {
      alert("That username is already taken");
      return;
    }
    const fresh = makeUser(username.trim(), password, provider, "", school.trim() || "Unknown School");
    const nextUsers = [...users, fresh];
    writeUsers(nextUsers);
    onLogin(fresh);
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8"><ArrowLeft size={16}/> Back</button>
        <div className="rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 to-white/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-purple-300 text-[10px] font-mono font-black tracking-[0.28em]">PLAYER LOGIN</p>
              <h2 className="text-2xl font-mono font-black text-white mt-1">Join the CodeQuest arena</h2>
            </div>
            <div className="flex rounded-full border border-white/10 bg-black/10 p-1">
              <button onClick={() => setMode("login")} className={`rounded-full px-3 py-1 text-[10px] font-mono ${mode === "login" ? "bg-purple-500/20 text-purple-300" : "text-white/50"}`}>Login</button>
              <button onClick={() => setMode("signup")} className={`rounded-full px-3 py-1 text-[10px] font-mono ${mode === "signup" ? "bg-purple-500/20 text-purple-300" : "text-white/50"}`}>Sign up</button>
            </div>
          </div>
          <div className="space-y-3">
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
            {mode === "signup" && <><input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" /><select value={provider} onChange={(e) => setProvider(e.target.value as AppUser["provider"])} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"><option value="local">Local Account</option><option value="google">Continue with Google</option><option value="facebook">Continue with Facebook</option></select></>}
            <button onClick={submit} className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-3 font-mono font-black text-white">{mode === "login" ? "Log In" : "Create Account"}</button>
            <button onClick={onSwitchToSignup} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white/70">{mode === "login" ? "Need an account? Sign up" : "Already have one? Log in"}</button>
          </div>
        </div>
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
    "You can listen to your selected soundtrack while answering by using the Music button.",
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
              style={{ "--hover-color": lang.color } as any}
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
  mode,
  onFinish,
}: {
  langId: string;
  mode: GameMode;
  onFinish: (score: number, xp: number, correct: number) => void;
}) {
  const allQuestions = QUESTIONS[langId] ?? [];
  const debugQuestions = DEBUG_QUESTIONS_BY_LANGUAGE[langId] ?? DEBUG_QUESTIONS;
  const questions = mode === "debug" ? debugQuestions : mode === "speed" ? allQuestions.slice(0, Math.min(5, allQuestions.length)) : mode === "survival" ? Array.from({ length: 12 }, (_, i) => allQuestions[i % Math.max(allQuestions.length, 1)]).filter(Boolean) : allQuestions;
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
  const [enemyHP, setEnemyHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [battleMessage, setBattleMessage] = useState("Choose your attack.");
  const [attackFx, setAttackFx] = useState<"player" | "enemy" | null>(null);
  const [hitFx, setHitFx] = useState(false);
  const [timeLeft, setTimeLeft] = useState(mode === "speed" ? 60 : 0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const finishedRef = useRef(false);
  const battleSkills = ["Code Slash", "Logic Strike", "Debug Blast", "Syntax Smash", "Algorithm Beam", "Quantum Break", "Neon Compile", "Final Function"];

  const playSfx = useCallback((kind: "correct" | "wrong" | "click" | "timer" | "finish") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const frequencies = {
        correct: [660, 880, 1046], wrong: [220, 160], click: [420], timer: [740, 520], finish: [523, 659, 784],
      }[kind];
      osc.type = kind === "wrong" ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(frequencies[0], ctx.currentTime);
      frequencies.slice(1).forEach((f, i) => osc.frequency.setValueAtTime(f, ctx.currentTime + (i + 1) * 0.08));
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(kind === "wrong" ? 0.05 : 0.08, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.27);
      setTimeout(() => ctx.close(), 350);
    } catch {}
  }, [soundEnabled]);

  const currentQ = questions[qIndex];
  const isLast = qIndex === questions.length - 1;

  const finishGame = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    playSfx("finish");
    onFinish(Math.round((correctCount / questions.length) * 100), totalXP, correctCount);
  }, [correctCount, onFinish, playSfx, questions.length, totalXP]);

  useEffect(() => {
    if (mode !== "speed") return;
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    const timer = window.setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearInterval(timer);
  }, [mode, timeLeft, finishGame]);

  useEffect(() => {
    if (mode === "speed" && timeLeft > 0 && timeLeft <= 10) playSfx("timer");
  }, [timeLeft, mode, playSfx]);

  const handleSelect = useCallback((idx: number) => {
    if (answerState !== "idle" || finishedRef.current) return;
    setSelected(idx);
    const correct = idx === currentQ.answer;
    setAnswerState(correct ? "correct" : "wrong");
    setShowExplanation(true);
    setParticleCorrect(correct);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 900);
    playSfx(correct ? "correct" : "wrong");

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

    if (mode === "battle") {
      setHitFx(true);
      setAttackFx(correct ? "player" : "enemy");
      window.setTimeout(() => { setHitFx(false); setAttackFx(null); }, 650);
      if (correct) {
        const damage = 18 + Math.min(streak * 2, 12);
        setEnemyHP((hp) => Math.max(0, hp - damage));
        setBattleMessage(`⚡ ${battleSkills[qIndex % battleSkills.length]}! -${damage} HP`);
      } else {
        setPlayerHP((hp) => Math.max(0, hp - 15));
        setBattleMessage("💥 Code Beast counterattacks! -15 HP");
      }
    }
    if (mode === "survival" && !correct) {
      setPlayerHP((hp) => Math.max(0, hp - 20));
      if (playerHP <= 20) {
        window.setTimeout(() => finishGame(), 700);
      }
    }
  }, [answerState, currentQ, mode, playSfx, qIndex, streak, battleSkills, playerHP, finishGame]);

  const handleNext = () => {
    if (isLast) { finishGame(); return; }
    playSfx("click");
    setQIndex((i) => i + 1);
    setSelected(null);
    setAnswerState("idle");
    setShowExplanation(false);
  };

  const progress = ((qIndex) / questions.length) * 100;

  return (
    <div className="w-full min-h-screen px-3 sm:px-5 lg:px-7 py-4 sm:py-6 overflow-x-hidden">
      <ParticleEffect active={showParticles} correct={particleCorrect} />
      <div className={`w-full mx-auto ${mode === "battle" ? "max-w-[1500px]" : "max-w-5xl"}`}>
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl">{lang.icon}</span>
              <span className="font-mono font-bold text-white truncate">{lang.name}</span>
              <span className="hidden sm:inline text-xs font-mono text-white/30">· {mode.toUpperCase()}</span><span className="hidden md:inline text-[10px] font-mono text-green-300/60">· 🎵 GLOBAL SOUNDTRACK</span>
            </div>
            <div className="flex items-center gap-2">
              {mode === "speed" && (
                <motion.div animate={{ scale: timeLeft <= 10 ? [1, 1.08, 1] : 1 }} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono font-black text-xs ${timeLeft <= 10 ? "border-red-500/60 bg-red-500/15 text-red-300" : "border-amber-400/30 bg-amber-400/10 text-amber-300"}`}>
                  <span>⏱</span> {timeLeft}s
                </motion.div>
              )}
              {mode === "survival" && <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${playerHP <= 30 ? "border-red-500/60 bg-red-500/15 text-red-300" : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"}`}><Heart size={12}/><span className="font-mono font-bold text-xs">{playerHP} HP</span></div>}
              {streak >= 2 && <div className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1"><Flame size={12} className="text-orange-400" /><span className="text-orange-400 font-mono font-bold text-xs">{streak}x</span></div>}
              <span className="text-xs sm:text-sm font-mono text-white/40">{qIndex + 1}/{questions.length}</span>
              <button onClick={() => setSoundEnabled((v) => !v)} className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white" title="Toggle sound effects">
                <Volume2 size={15} className={soundEnabled ? "text-cyan-300" : "text-white/30"} />
              </button>
            </div>
          </div>
          <div className="mt-3"><XPBar current={totalXP} max={xpLevel * 50} level={xpLevel} /></div>
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: lang.color }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>

        <div className={`${mode === "battle" ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-5 lg:items-start" : ""}`}>
          <main className="min-w-0">
            {mode === "battle" && (
              <motion.div animate={{ boxShadow: ["0 0 0 rgba(239,68,68,0)", "0 0 35px rgba(168,85,247,.16)", "0 0 0 rgba(239,68,68,0)"] }} transition={{ repeat: Infinity, duration: 2.5 }}
                className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-red-500/10 via-purple-500/10 to-cyan-500/10 p-3 sm:p-4 mb-5 overflow-hidden relative">
                <div className="flex items-center justify-center gap-3 sm:gap-8 relative">
                  <AnimeCoderAvatar side="enemy" large attacking={attackFx === "enemy"} hit={hitFx && attackFx === "player"} />
                  <div className="text-center min-w-0">
                    <p className="text-[10px] font-mono text-white/30 tracking-[0.25em]">CODE BATTLE</p>
                    <p className="text-xs sm:text-sm font-mono font-black text-purple-300">YOUR SKILL IS YOUR WEAPON</p>
                    <div className="mt-3 text-xs font-mono font-black text-white/70">{battleMessage}</div>
                  </div>
                  <AnimeCoderAvatar side="player" character={ANIME_CHARACTERS[0]} large attacking={attackFx === "player"} hit={hitFx && attackFx === "enemy"} />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-5 mt-3">
                  <div><div className="flex justify-between mb-1"><span className="text-[10px] font-mono text-red-300">CODE BEAST</span><span className="text-[10px] font-mono text-red-300">{enemyHP} HP</span></div><div className="h-3 bg-black/20 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-red-600 to-pink-500" animate={{ width: `${enemyHP}%` }} /></div></div>
                  <div><div className="flex justify-between mb-1"><span className="text-[10px] font-mono text-cyan-300">YOU</span><span className="text-[10px] font-mono text-cyan-300">{playerHP} HP</span></div><div className="h-3 bg-black/20 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" animate={{ width: `${playerHP}%` }} /></div></div>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div key={qIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-bold border" style={{ color: lang.color, borderColor: `${lang.color}40`, backgroundColor: `${lang.color}15` }}>
                    <Target size={11} /> {mode === "debug" ? `${lang.name} Bug Fix` : currentQ.type === "multiple" ? "Multiple Choice" : currentQ.type === "code" ? "Code Challenge" : "True or False"}
                  </div>
                  <span className="text-xs font-mono text-yellow-400/70">+{currentQ.xp} XP</span>
                  {mode === "battle" && <span className="text-xs font-mono text-red-300/70">⚔ {battleSkills[qIndex % battleSkills.length]}</span>}
                </div>

                <h3 className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-white mb-4 leading-snug">{currentQ.question}</h3>
                {currentQ.code && <div className="mb-4"><CodeBlock code={currentQ.code} /></div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {currentQ.options.map((opt, i) => {
                    const isCorrect = i === currentQ.answer;
                    const isSelected = i === selected;
                    let borderColor = "border-white/10"; let bg = "bg-white/5 hover:bg-white/10"; let textColor = "text-white/80"; let icon = null;
                    if (answerState !== "idle") {
                      if (isCorrect) { borderColor = "border-green-500/60"; bg = "bg-green-500/15"; textColor = "text-green-300"; icon = <CheckCircle2 size={18} className="text-green-400 shrink-0" />; }
                      else if (isSelected) { borderColor = "border-red-500/60"; bg = "bg-red-500/15"; textColor = "text-red-300"; icon = <XCircle size={18} className="text-red-400 shrink-0" />; }
                      else { bg = "bg-white/3"; textColor = "text-white/30"; }
                    }
                    return (
                      <motion.button key={i} onClick={() => handleSelect(i)} disabled={answerState !== "idle"}
                        className={`w-full min-w-0 text-left flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all ${borderColor} ${bg} ${textColor} disabled:cursor-default`}
                        whileHover={answerState === "idle" ? { scale: 1.01 } : {}} whileTap={answerState === "idle" ? { scale: .99 } : {}}>
                        <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-mono font-bold shrink-0">{String.fromCharCode(65 + i)}</span>
                        <span className="font-mono text-sm break-words flex-1">{opt}</span>{icon}
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {showExplanation && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className={`rounded-2xl p-4 border mb-4 ${answerState === "correct" ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                        <div className="flex items-start gap-3">
                          {answerState === "correct" ? <CheckCircle2 size={18} className="text-green-400 shrink-0" /> : <XCircle size={18} className="text-red-400 shrink-0" />}
                          <div><p className={`font-mono font-bold text-sm mb-1 ${answerState === "correct" ? "text-green-300" : "text-red-300"}`}>{answerState === "correct" ? "Correct!" : "Not quite!"}</p><p className="text-white/60 text-sm font-mono leading-relaxed">{currentQ.explanation}</p></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {answerState !== "idle" && (
                  <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleNext}
                    className="w-full py-3.5 rounded-2xl font-mono font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg shadow-purple-500/20">
                    {isLast ? "See Results" : "Next Question"} <ArrowRight size={18} />
                  </motion.button>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}


function BugHunterGameScreen({ langId, onFinish }: { langId: string; onFinish: (score: number, xp: number, correct: number) => void }) {
  const qs = DEBUG_QUESTIONS_BY_LANGUAGE[langId] ?? DEBUG_QUESTIONS;
  const lang = LANGUAGES.find(l => l.id === langId)!;
  const [index,setIndex]=useState(0); const [selected,setSelected]=useState<number|null>(null); const [locked,setLocked]=useState(false); const [correct,setCorrect]=useState(0); const [xp,setXp]=useState(0); const [fixed,setFixed]=useState(false);
  const q=qs[index];
  const choose=(i:number)=>{ if(locked)return; setSelected(i); setLocked(true); const ok=i===q.answer; if(ok){setCorrect(c=>c+1);setXp(x=>x+q.xp);setFixed(true);} window.setTimeout(()=>{if(index===qs.length-1){onFinish(Math.round(((correct+(ok?1:0))/qs.length)*100),xp+(ok?q.xp:0),correct+(ok?1:0));}else{setIndex(n=>n+1);setSelected(null);setLocked(false);setFixed(false);}},900); };
  return <div className="min-h-screen p-3 sm:p-6 bg-gradient-to-br from-emerald-950/40 via-black/30 to-cyan-950/30">
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4"><div><p className="text-emerald-300 text-[10px] font-mono font-black tracking-[.3em]">BUG HUNTER // LIVE DEBUGGER</p><h1 className="text-2xl sm:text-4xl text-white font-mono font-black">FIX THE BUG</h1></div><div className="text-right"><p className="text-white/40 text-[10px] font-mono">{lang.icon} {lang.name}</p><p className="text-emerald-300 font-mono font-black">{index+1}/{qs.length}</p></div></div>
      <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-4">
        <div className="rounded-3xl border border-emerald-400/20 bg-[#07130f]/90 overflow-hidden shadow-2xl"><div className="px-4 py-2 border-b border-white/10 flex items-center gap-2"><Bug size={14} className="text-emerald-300"/><span className="text-[10px] font-mono text-white/40">/workspace/{lang.id}/bug-{q.id}</span><span className="ml-auto text-red-300 text-[9px] font-mono">● ERROR DETECTED</span></div><pre className="p-5 text-xs sm:text-sm leading-7 font-mono text-emerald-200 overflow-x-auto whitespace-pre-wrap">{q.code}</pre><div className="border-t border-white/10 p-4 bg-black/20"><p className="text-red-300 font-mono text-xs font-black">Compiler: syntax / logic fault found</p><p className="text-white/40 font-mono text-[10px] mt-1">{q.question}</p></div></div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5"><div className="flex items-center justify-between mb-4"><span className="text-emerald-300 font-mono text-xs font-black">SELECT THE FIX</span><span className="text-yellow-300 font-mono text-xs">+{q.xp} XP</span></div><div className="space-y-2">{q.options.map((o,i)=><motion.button key={i} disabled={locked} onClick={()=>choose(i)} whileTap={{scale:.98}} className={`w-full text-left p-3 rounded-2xl border font-mono text-xs sm:text-sm ${selected===i?(i===q.answer?'border-emerald-400 bg-emerald-500/15 text-emerald-200':'border-red-400 bg-red-500/15 text-red-200'):'border-white/10 bg-black/10 text-white/70 hover:bg-white/10'}`}><span className="inline-flex w-7 h-7 rounded-lg bg-white/10 items-center justify-center mr-2">{String.fromCharCode(65+i)}</span>{o}</motion.button>)}</div>{locked&&<div className={`mt-4 rounded-2xl p-3 border ${selected===q.answer?'border-emerald-400/30 bg-emerald-500/10':'border-red-400/30 bg-red-500/10'}`}><p className="font-mono font-black text-sm">{selected===q.answer?'✓ BUG FIXED':'✕ FIX FAILED'}</p><p className="text-white/50 font-mono text-[10px] mt-1">{q.explanation}</p></div>}{fixed&&<motion.div initial={{scale:.7,opacity:0}} animate={{scale:1,opacity:1}} className="mt-4 text-center text-emerald-300 font-mono font-black">PATCH APPLIED ✓</motion.div>}</div>
      </div>
    </div>
  </div>;
}

function SurvivalGameScreen({ langId, onFinish }: { langId: string; onFinish: (score: number, xp: number, correct: number) => void }) {
  const base=QUESTIONS[langId]??[]; const qs=Array.from({length:10},(_,i)=>base[i%Math.max(1,base.length)]); const lang=LANGUAGES.find(l=>l.id===langId)!;
  const [i,setI]=useState(0); const [hp,setHp]=useState(100); const [combo,setCombo]=useState(0); const [xp,setXp]=useState(0); const [correct,setCorrect]=useState(0); const [locked,setLocked]=useState(false); const [selected,setSelected]=useState<number|null>(null);
  const q=qs[i];
  const answer=(n:number)=>{if(locked)return; const ok=n===q.answer; setSelected(n);setLocked(true); if(ok){setCorrect(c=>c+1);setCombo(c=>c+1);setXp(x=>x+q.xp+Math.min(combo*3,15));}else{setCombo(0);setHp(h=>Math.max(0,h-25));} window.setTimeout(()=>{const nextHp=ok?hp:Math.max(0,hp-25); if(i===qs.length-1||nextHp<=0){onFinish(Math.round(((correct+(ok?1:0))/qs.length)*100),xp+(ok?q.xp:0),correct+(ok?1:0));}else{setI(x=>x+1);setLocked(false);setSelected(null);}},750);};
  return <div className="min-h-screen p-3 sm:p-6 bg-gradient-to-br from-slate-950/80 via-cyan-950/20 to-black"><div className="max-w-5xl mx-auto"><div className="rounded-3xl border border-cyan-400/20 bg-black/50 p-4 mb-4 shadow-[0_0_50px_rgba(6,182,212,.1)]"><div className="flex items-center justify-between"><div><p className="text-cyan-300 text-[10px] font-mono font-black tracking-[.3em]">CODE SURVIVAL // RUNTIME</p><h1 className="text-2xl sm:text-4xl text-white font-mono font-black">STAY ALIVE</h1></div><div className="text-right"><p className="text-red-300 font-mono font-black text-xl">♥ {hp}</p><p className="text-white/35 font-mono text-[9px]">WAVE {i+1}/10</p></div></div><div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-cyan-400" animate={{width:`${hp}%`}}/></div></div><div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-7"><div className="flex justify-between text-[10px] font-mono text-white/40 mb-3"><span>{lang.icon} {lang.name} SURVIVAL</span><span>{combo}x COMBO</span></div><h2 className="text-xl sm:text-3xl font-mono font-black text-white leading-snug mb-5">{q.question}</h2>{q.code&&<CodeBlock code={q.code}/>}<div className="grid sm:grid-cols-2 gap-3 mt-5">{q.options.map((o,n)=><button key={n} disabled={locked} onClick={()=>answer(n)} className={`p-4 rounded-2xl border text-left font-mono text-sm ${selected===n?(n===q.answer?'border-green-400 bg-green-500/15 text-green-200':'border-red-400 bg-red-500/15 text-red-200'):'border-white/10 bg-black/10 text-white/70 hover:bg-white/10'}`}>{String.fromCharCode(65+n)}. {o}</button>)}</div></div></div></div>;
}

function CompilerGameScreen({ langId, onFinish }: { langId: string; onFinish: (score: number, xp: number, correct: number) => void }) {
  const lang=LANGUAGES.find(l=>l.id===langId)!; const qs=COMPILER_CHALLENGES[langId]??COMPILER_CHALLENGES.javascript; const [i,setI]=useState(0); const [value,setValue]=useState(''); const [status,setStatus]=useState<'idle'|'ok'|'fail'>('idle'); const [correct,setCorrect]=useState(0); const [xp,setXp]=useState(0); const q=qs[i];
  const run=()=>{if(status!=='idle')return; const ok=value.trim()===q.expected.trim();setStatus(ok?'ok':'fail');if(ok){setCorrect(c=>c+1);setXp(x=>x+35);}window.setTimeout(()=>{if(i===qs.length-1){onFinish(Math.round(((correct+(ok?1:0))/qs.length)*100),xp+(ok?35:0),correct+(ok?1:0));}else{setI(n=>n+1);setValue('');setStatus('idle');}},900);};
  const rendered=q.code.replace('____',value||'____');
  return <div className="min-h-screen p-3 sm:p-6 bg-[#03050a]"><div className="max-w-6xl mx-auto"><div className="flex items-center justify-between mb-4"><div><p className="text-cyan-300 text-[10px] font-mono font-black tracking-[.3em]">CODEQUEST COMPILER // TERMINAL</p><h1 className="text-2xl sm:text-4xl text-white font-mono font-black">COMPILE & RUN</h1></div><div className="text-right"><p className="text-cyan-300 font-mono font-black">{lang.icon} {lang.name}</p><p className="text-white/35 font-mono text-[9px]">CHALLENGE {i+1}/{qs.length}</p></div></div><div className="grid lg:grid-cols-[1.25fr_.75fr] gap-4"><div className="rounded-3xl border border-cyan-400/20 bg-[#071018] overflow-hidden shadow-[0_0_60px_rgba(6,182,212,.1)]"><div className="flex items-center gap-2 px-4 py-3 border-b border-white/10"><Terminal size={14} className="text-cyan-300"/><span className="text-[10px] font-mono text-white/40">compiler://codequest/{lang.id}</span><span className="ml-auto text-[9px] font-mono text-green-300">READY</span></div><pre className="p-5 text-xs sm:text-sm font-mono leading-7 text-cyan-200 whitespace-pre-wrap overflow-x-auto">{rendered}</pre><div className="border-t border-white/10 p-3 font-mono text-[10px] text-white/35">$ codequest --compile --run<br/><span className={status==='ok'?'text-green-300':status==='fail'?'text-red-300':'text-white/30'}>{status==='ok'?'BUILD SUCCESSFUL ✓':status==='fail'?`BUILD FAILED ✕ Expected: ${q.expected}`:'Waiting for source code...'}</span></div></div><div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-purple-300 font-mono text-xs font-black mb-2">TYPE YOUR ANSWER</p><p className="text-white/60 font-mono text-sm mb-4">{q.prompt}</p><textarea autoFocus value={value} onChange={e=>setValue(e.target.value)} disabled={status!=='idle'} spellCheck={false} className="w-full h-36 rounded-2xl border border-cyan-400/20 bg-[#02050a] text-green-300 p-4 font-mono text-sm outline-none focus:border-cyan-400/60 resize-none" placeholder="Type the missing code here..."/><p className="text-white/30 font-mono text-[9px] mt-2">HINT: {q.hint}</p><button onClick={run} disabled={!value.trim()||status!=='idle'} className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-mono font-black disabled:opacity-30">▶ COMPILE & RUN</button></div></div></div></div>;
}

function DuelSetupScreen({
  profile,
  totalXP,
  selectedLang,
  onSelectLanguage,
  onStart,
  onBack,
}: {
  profile: StudentProfile;
  totalXP: number;
  selectedLang: string | null;
  onSelectLanguage: (lang: string) => void;
  onStart: (friendName: string, friendRank: string, friendPhoto: string, characterId: string) => void;
  onBack: () => void;
}) {
  const [friendName, setFriendName] = useState("");
  const [friendRank, setFriendRank] = useState(RANKS[2].name);
  const [friendPhoto, setFriendPhoto] = useState("");
  const [duelCharacterId, setDuelCharacterId] = useState(ANIME_CHARACTERS[0].id);
  const [characterId, setCharacterId] = useState(ANIME_CHARACTERS[0].id);
  const selectedCharacter = ANIME_CHARACTERS.find((c) => c.id === characterId) ?? ANIME_CHARACTERS[0];

  return (
    <div className="min-h-screen px-5 py-10">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white font-mono text-sm mb-7"><ArrowLeft size={16}/> Back</button>
        <div className="text-center mb-9">
          <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 items-center justify-center shadow-2xl shadow-pink-500/20 mb-4">
            <Swords size={30} className="text-white"/>
          </motion.div>
          <p className="text-pink-300 text-xs font-mono font-bold tracking-[0.3em]">DUEL ARENA</p>
          <h2 className="text-4xl md:text-6xl font-mono font-black text-white mt-2">1V1 FRIEND BATTLE</h2>
          <p className="text-white/35 font-mono text-sm mt-3">Two players. One question. Your coding skill decides the winner.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-7">
          <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-white/5 p-6">
            <p className="text-cyan-300 text-[10px] font-mono font-black tracking-widest mb-4">YOUR PROFILE</p>
            <div className="flex items-center gap-4">
              {profile.photo ? <img src={profile.photo} className="w-20 h-20 rounded-2xl object-cover border border-cyan-400/30" alt="Your profile"/> :
                <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-3xl">👨‍💻</div>}
              <div className="min-w-0">
                <h3 className="text-white font-mono font-black text-xl truncate">{profile.username}</h3>
                <p className="text-white/40 font-mono text-xs">{profile.yearLevel} · {profile.course}</p>
                <div className="mt-2"><RankBadge totalXP={totalXP} compact /></div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 to-white/5 p-6">
            <p className="text-pink-300 text-[10px] font-mono font-black tracking-widest mb-4">FRIEND PROFILE</p>
            <input value={friendName} onChange={(e) => setFriendName(e.target.value)} placeholder="Enter friend's username"
              className="w-full rounded-xl border border-white/10 bg-black/20 text-white placeholder:text-white/25 px-4 py-3 outline-none focus:border-pink-500/50 mb-3"/>
            <select value={friendRank} onChange={(e) => setFriendRank(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#11111f] text-white px-4 py-3 outline-none focus:border-pink-500/50">
              {RANKS.map((r) => <option key={r.name}>{r.name}</option>)}
            </select>
            <label className="mt-3 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white/60 text-xs font-mono">
              <Camera size={14}/> {friendPhoto ? "Friend Photo Added" : "Add Friend Photo"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0]; if (!file) return;
                if (file.size > 2 * 1024 * 1024) { alert("Please choose an image smaller than 2MB."); return; }
                const reader = new FileReader(); reader.onload = () => setFriendPhoto(String(reader.result)); reader.readAsDataURL(file);
              }} />
            </label>
            <p className="text-white/25 font-mono text-[10px] mt-3">This version is local/pass-and-play. Connect it to Supabase Realtime later for true online 1v1.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-white/5 to-cyan-500/10 p-6 mb-7">
          <div className="flex items-center gap-3 mb-5"><Swords className="text-pink-400"/><div><h3 className="text-white font-mono font-black text-lg">Choose Your Anime Fighter</h3><p className="text-white/30 text-xs font-mono">Each fighter has a unique attack aura and battle effect.</p></div></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ANIME_CHARACTERS.map((character) => <motion.button key={character.id} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: .97 }} onClick={() => setCharacterId(character.id)} className={`relative overflow-hidden text-left rounded-2xl border p-4 transition-all ${characterId === character.id ? "border-white/60 bg-white/10 shadow-xl" : "border-white/10 bg-black/10 hover:bg-white/5"}`} style={{ boxShadow: characterId === character.id ? `0 0 35px ${character.color}35` : undefined }}>
              <div className="text-4xl mb-3">{character.emoji}</div><p className="text-white font-mono font-black text-sm">{character.name}</p><p className="text-[9px] font-mono mt-1" style={{ color: character.color }}>{character.title}</p><p className="text-[9px] text-white/30 font-mono mt-2">{character.attack}</p>
            </motion.button>)}
          </div>
          <div className="mt-4 rounded-2xl border p-3 flex items-center gap-3" style={{borderColor: `${selectedCharacter.color}55`, background: `${selectedCharacter.color}12`}}>
            <span className="text-3xl">{selectedCharacter.emoji}</span><div><p className="font-mono font-black text-sm" style={{color:selectedCharacter.color}}>{selectedCharacter.name} locked in</p><p className="text-white/40 text-[10px] font-mono">Attack effect: {selectedCharacter.attack}</p></div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-7">
          <div className="flex items-center gap-3 mb-5"><Code2 className="text-purple-400"/><div><h3 className="text-white font-mono font-black text-lg">Choose the Duel Language</h3><p className="text-white/30 text-xs font-mono">Five questions per duel.</p></div></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LANGUAGES.map((lang) => (
              <button key={lang.id} onClick={() => onSelectLanguage(lang.id)}
                className={`text-left rounded-2xl border p-4 transition-all ${selectedLang === lang.id ? "border-purple-400/60 bg-purple-500/15 shadow-lg shadow-purple-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                <div className="text-2xl mb-2">{lang.icon}</div><p className="text-white font-mono font-bold text-sm">{lang.name}</p>
              </button>
            ))}
          </div>
        </div>

        <button disabled={!selectedLang || !friendName.trim()} onClick={() => onStart(friendName.trim(), friendRank, friendPhoto, characterId)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 text-white font-mono font-black text-lg disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-purple-500/20">
          Enter the Arena <Swords size={19} className="inline ml-2"/>
        </button>
      </div>
    </div>
  );
}

function DuelScreen({
  langId,
  profile,
  totalXP,
  friendName,
  friendRankName,
  friendPhoto,
  characterId,
  onFinish,
}: {
  langId: string;
  profile: StudentProfile;
  totalXP: number;
  friendName: string;
  friendRankName: string;
  friendPhoto: string;
  characterId: string;
  onFinish: () => void;
}) {
  const baseQuestions = QUESTIONS[langId] ?? [];
  const questions = Array.from({ length: 10 }, (_, i) => baseQuestions[i % Math.max(baseQuestions.length, 1)]).filter(Boolean);
  const lang = LANGUAGES.find((l) => l.id === langId)!;
  const selectedCharacter = ANIME_CHARACTERS.find((c) => c.id === characterId) ?? ANIME_CHARACTERS[0];
  const [qIndex, setQIndex] = useState(0);
  const [turn, setTurn] = useState<"you" | "friend">("you");
  const [selected, setSelected] = useState<number | null>(null);
  const [youScore, setYouScore] = useState(0);
  const [friendScore, setFriendScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [attackFx, setAttackFx] = useState<"you" | "friend" | null>(null);
  const [hitFx, setHitFx] = useState(false);
  const [battleText, setBattleText] = useState("READY!");
  const [showDuelClaps, setShowDuelClaps] = useState(false);
  const currentQ = questions[qIndex];

  const playDuelSfx = (correct: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = correct ? "sine" : "sawtooth";
      osc.frequency.setValueAtTime(correct ? 880 : 180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(correct ? 1320 : 90, ctx.currentTime + .22);
      gain.gain.setValueAtTime(.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.09, ctx.currentTime + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .28);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .3);
      setTimeout(() => ctx.close(), 400);
    } catch {}
  };

  const answer = (index: number) => {
    if (locked) return;
    setSelected(index);
    const correct = index === currentQ.answer;
    setLocked(true);
    playDuelSfx(correct);
    setHitFx(true);
    setAttackFx(correct ? turn : turn === "you" ? "friend" : "you");
    setBattleText(correct && turn === "you" ? selectedCharacter.attack : correct ? "SYNTAX STRIKE!" : "COUNTER ATTACK!");
    window.setTimeout(() => { setHitFx(false); setAttackFx(null); }, 650);

    if (turn === "you" && correct) setYouScore((s) => s + 1);
    if (turn === "friend" && correct) setFriendScore((s) => s + 1);

    setTimeout(() => {
      setSelected(null);
      setLocked(false);
      if (turn === "you") setTurn("friend");
      else if (qIndex < questions.length - 1) {
        setQIndex((i) => i + 1);
        setTurn("you");
      } else {
        setShowDuelClaps(true);
        window.setTimeout(() => onFinish(), 3200);
      }
    }, 1500);
  };

  const friendRank = RANKS.find((r) => r.name === friendRankName) ?? RANKS[2];

  return (
    <div className="min-h-screen px-4 py-6 relative overflow-hidden">
      {showDuelClaps && <ClapCelebration />}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-purple-950/20 to-pink-950/20 pointer-events-none"/>
      <div className="max-w-6xl mx-auto relative">
        <div className="flex items-center justify-between mb-5">
          <div><p className="text-purple-300 text-xs font-mono font-black">1V1 CODE ARENA</p><p className="text-white/30 text-xs font-mono mt-1">{lang.icon} {lang.name} · Round {qIndex + 1}/{questions.length}</p></div>
          <button onClick={onFinish} className="text-white/30 hover:text-white text-xs font-mono">Leave Arena</button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <motion.div animate={{ scale: turn === "you" ? 1.02 : 1 }} className={`rounded-3xl border p-4 ${turn === "you" ? "border-cyan-400/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/10" : "border-white/10 bg-white/5"}`}>
            <div className="flex items-center gap-3">
              {profile.photo ? <img src={profile.photo} className="w-14 h-14 rounded-2xl object-cover" alt="You"/> : <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center"><AnimeCoderAvatar side="player" /></div>}
              <div className="min-w-0 flex-1"><p className="text-white font-mono font-black truncate">{profile.username} <span className="text-cyan-300 text-[10px]">YOU</span></p><RankBadge totalXP={totalXP} compact/></div>
              <div className="text-3xl font-mono font-black text-cyan-300">{youScore}</div>
            </div>
          </motion.div>

          <motion.div animate={{ scale: turn === "friend" ? 1.02 : 1 }} className={`rounded-3xl border p-4 ${turn === "friend" ? "border-pink-400/60 bg-pink-500/10 shadow-lg shadow-pink-500/10" : "border-white/10 bg-white/5"}`}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center overflow-hidden">{friendPhoto ? <img src={friendPhoto} className="w-full h-full object-cover" alt="Friend"/> : <AnimeCoderAvatar side="enemy" />}</div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-mono font-black truncate">{friendName} <span className="text-pink-300 text-[10px]">FRIEND</span></p>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border bg-black/10" style={{borderColor: `${friendRank.color}55`}}>
                  <span>{friendRank.icon}</span><div><p className="font-mono font-black text-[10px]" style={{color: friendRank.color}}>{friendRank.name}</p><p className="text-white/30 font-mono text-[8px]">RANK</p></div><Trophy size={12} style={{color: friendRank.color}}/>
                </div>
              </div>
              <div className="text-3xl font-mono font-black text-pink-300">{friendScore}</div>
            </div>
          </motion.div>
        </div>

        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 font-mono text-xs font-bold">
            {turn === "you" ? <><Sparkles size={13}/> {profile.username}'s turn — your answer is your weapon.</> : <><Heart size={13}/> Pass the device to {friendName}</>}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-10 mb-5">
          <AnimeCoderAvatar side="player" character={selectedCharacter} large attacking={attackFx === "you"} hit={hitFx && attackFx === "friend"} />
          <div className="text-center min-w-[80px]">
            <motion.div animate={hitFx ? { scale: [1, 1.35, 1], rotate: [0, 8, -8, 0] } : {}} className="text-3xl sm:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-pink-300">VS</motion.div>
            <p className="text-[9px] sm:text-[10px] font-mono text-yellow-300 tracking-[0.25em] mt-1">{battleText}</p>
          </div>
          <AnimeCoderAvatar side="enemy" character={ANIME_CHARACTERS[(ANIME_CHARACTERS.findIndex((c) => c.id === selectedCharacter.id) + 1) % ANIME_CHARACTERS.length]} large attacking={attackFx === "friend"} hit={hitFx && attackFx === "you"} />
        </div>

        <AnimatePresence>
          {hitFx && (
            <motion.div initial={{ opacity: 0, scale: .3 }} animate={{ opacity: [0, 1, 0], scale: [0.3, 1.2, 1.7] }} exit={{ opacity: 0 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none text-4xl sm:text-7xl font-mono font-black ${
                attackFx === "you" ? "text-cyan-300" : "text-pink-300"
              }`} style={{ textShadow: "0 0 30px currentColor" }}>
              {battleText}
            </motion.div>
          )}
        </AnimatePresence>


        <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/5 p-5 md:p-7 shadow-2xl">
          <div className="flex items-center justify-between mb-4"><span className="text-xs font-mono text-white/35">Question {qIndex + 1}</span><span className="text-xs font-mono text-yellow-300">+{currentQ.xp} XP</span></div>
          <h2 className="text-xl md:text-2xl font-mono font-black text-white leading-relaxed mb-5">{currentQ.question}</h2>
          {currentQ.code && <div className="mb-5"><CodeBlock code={currentQ.code}/></div>}
          <div className="grid md:grid-cols-2 gap-3">
            {currentQ.options.map((option, index) => (
              <button key={option} disabled={locked} onClick={() => answer(index)}
                className={`text-left p-4 rounded-2xl border font-mono text-sm transition-all ${
                  selected === index
                    ? index === currentQ.answer ? "border-green-400/60 bg-green-500/10 text-green-300" : "border-red-400/60 bg-red-500/10 text-red-300"
                    : "border-white/10 bg-black/10 text-white/70 hover:bg-white/10"
                }`}>
                <span className="inline-flex w-7 h-7 rounded-lg bg-white/5 items-center justify-center mr-2 text-xs">{String.fromCharCode(65 + index)}</span>{option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClapCelebration() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setShow(false), 4200);
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      [0, .22, .44, .66, .88].forEach((delay, index) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = "square"; osc.frequency.setValueAtTime(index % 2 ? 210 : 150, ctx.currentTime + delay);
        gain.gain.setValueAtTime(.0001, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(.07, ctx.currentTime + delay + .015);
        gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + delay + .12);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + .13);
      });
      window.setTimeout(() => ctx.close(), 1500);
    } catch {}
    return () => window.clearTimeout(timer);
  }, []);
  if (!show) return null;
  return <div className="fixed inset-0 z-[80] pointer-events-none overflow-hidden">
    <motion.div initial={{opacity:0, y:30, scale:.8}} animate={{opacity:[0,1,1,0], y:[30,0,-10,-50], scale:[.8,1,1.08,1]}} transition={{duration:2.6}} className="absolute left-1/2 top-1/3 -translate-x-1/2 text-5xl sm:text-7xl font-mono font-black text-yellow-300" style={{textShadow:"0 0 30px rgba(250,204,21,.7)"}}>👏 GREAT JOB! 👏</motion.div>
    {Array.from({length:18},(_,i)=><motion.div key={i} initial={{opacity:1,x:"50vw",y:"42vh",scale:.5}} animate={{opacity:0,x:`${8+(i*47)%84}vw`,y:`${20+(i*31)%65}vh`,rotate:360,scale:1.2}} transition={{duration:1.8+i*.03, ease:"easeOut"}} className="absolute text-2xl sm:text-4xl">{i%3===0?"👏":i%3===1?"🎉":"✨"}</motion.div>)}
  </div>;
}

function ResultsScreen({
  langId,
  score,
  xp,
  correct,
  total,
  profile,
  totalXP,
  onPhotoUpdate,
  onReplay,
  onHome,
}: {
  langId: string;
  score: number;
  xp: number;
  correct: number;
  total: number;
  profile: StudentProfile;
  totalXP: number;
  onPhotoUpdate: (photo: string) => void;
  onReplay: () => void;
  onHome: () => void;
}) {
  const lang = LANGUAGES.find((l) => l.id === langId)!;
  const [showClaps, setShowClaps] = useState(true);
  const grade =
    score >= 90 ? { label: "MASTER", color: "#f59e0b", icon: "🏆" } :
    score >= 70 ? { label: "SKILLED", color: "#a78bfa", icon: "⭐" } :
    score >= 50 ? { label: "LEARNING", color: "#06b6d4", icon: "📚" } :
    { label: "KEEP GOING", color: "#f97316", icon: "💪" };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {showClaps && <ClapCelebration />}
      <button onClick={() => setShowClaps(false)} className="fixed top-4 right-4 z-[90] text-[10px] font-mono text-white/40 border border-white/10 rounded-full px-3 py-2 bg-black/20">Skip celebration</button>
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


        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-8 text-left">
          <div className="flex items-center gap-4">
            {profile.photo ? <img src={profile.photo} className="w-20 h-20 rounded-2xl object-cover border border-white/10" alt="Student profile" /> :
              <label className="w-20 h-20 rounded-2xl border border-dashed border-purple-500/50 bg-purple-500/10 flex flex-col items-center justify-center cursor-pointer">
                <Camera size={20} className="text-purple-300"/>
                <span className="text-[9px] text-purple-300 font-mono mt-1">Add Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  if (file.size > 2 * 1024 * 1024) { alert("Please choose an image smaller than 2MB."); return; }
                  const reader = new FileReader(); reader.onload = () => onPhotoUpdate(String(reader.result)); reader.readAsDataURL(file);
                }} />
              </label>}
            <div className="flex-1 min-w-0">
              <p className="text-white font-mono font-black">{profile.username}</p>
              <p className="text-white/50 text-xs font-mono mt-1">{profile.yearLevel} · {profile.course}</p>
              <p className="text-white/40 text-xs font-mono truncate">{profile.school}</p>
              {score >= 70 && !profile.photo && <p className="text-purple-300 text-xs font-mono mt-2">🏆 Add your photo to complete your winning profile.</p>}
            </div>
            <RankBadge totalXP={totalXP} compact />
          </div>
        </div>

        <div className="mb-6"><RankBadge totalXP={totalXP} /></div>

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


function GlobalMusicController({
  selectedTrack,
}: {
  selectedTrack: MusicTrack;
}) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const activeNodesRef = useRef<Array<{ oscillator: OscillatorNode; gain: GainNode }>>([]);
  const selectedTrackRef = useRef(selectedTrack);

  useEffect(() => {
    selectedTrackRef.current = selectedTrack;
  }, [selectedTrack]);

  const stopPlayback = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    activeNodesRef.current.forEach(({ oscillator, gain }) => {
      try {
        gain.gain.cancelScheduledValues(0);
        gain.gain.setValueAtTime(0.0001, 0);
        oscillator.stop(0);
      } catch {}
    });
    activeNodesRef.current = [];

    if (masterGainRef.current) {
      try {
        masterGainRef.current.gain.cancelScheduledValues(0);
        masterGainRef.current.gain.setValueAtTime(0.0001, 0);
      } catch {}
    }
  }, []);

  const startPlayback = useCallback((track: MusicTrack) => {
    if (typeof window === "undefined") return;

    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    stopPlayback();

    const context = audioContextRef.current ?? new AudioContextCtor();
    audioContextRef.current = context;

    if (context.state === "suspended") {
      void context.resume();
    }

    if (!masterGainRef.current) {
      const masterGain = context.createGain();
      masterGain.gain.setValueAtTime(0.0001, context.currentTime);
      masterGain.connect(context.destination);
      masterGain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.25);
      masterGainRef.current = masterGain;
    }

    const style = getMusicStyle(track);
    let noteIndex = 0;

    const playNote = () => {
      const now = context.currentTime;
      const [baseFreq, nextFreq] = style.notes[noteIndex % style.notes.length];
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = style.wave;
      oscillator.frequency.setValueAtTime(baseFreq, now);
      oscillator.frequency.exponentialRampToValueAtTime(nextFreq, now + 0.25);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.03, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      oscillator.connect(gain);
      gain.connect(masterGainRef.current!);
      oscillator.start(now);
      oscillator.stop(now + 0.42);

      oscillator.onended = () => {
        activeNodesRef.current = activeNodesRef.current.filter((item) => item.oscillator !== oscillator);
      };

      activeNodesRef.current.push({ oscillator, gain });
      noteIndex = (noteIndex + 1) % style.notes.length;
    };

    playNote();
    intervalRef.current = window.setInterval(playNote, 700);
  }, [stopPlayback]);

  useEffect(() => {
    const beginPlayback = () => {
      void startPlayback(selectedTrackRef.current);
      window.removeEventListener("pointerdown", beginPlayback);
      window.removeEventListener("keydown", beginPlayback);
    };

    window.addEventListener("pointerdown", beginPlayback);
    window.addEventListener("keydown", beginPlayback);

    return () => {
      window.removeEventListener("pointerdown", beginPlayback);
      window.removeEventListener("keydown", beginPlayback);
    };
  }, [startPlayback]);

  useEffect(() => {
    void startPlayback(selectedTrack);
    return () => stopPlayback();
  }, [selectedTrack, startPlayback, stopPlayback]);

  return null;
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [gameMode, setGameMode] = useState<GameMode>("practice");
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<(typeof SPOTIFY_TRACKS)[number]>(() => {
    try {
      const savedId = localStorage.getItem("codequest-selected-track");
      return SPOTIFY_TRACKS.find((track) => track.id === savedId) ?? SPOTIFY_TRACKS[0];
    } catch { return SPOTIFY_TRACKS[0]; }
  });
  const [musicReturn, setMusicReturn] = useState<"game" | "duel" | "home">("game");
  const [results, setResults] = useState<{ score: number; xp: number; correct: number } | null>(null);
  const [lifetimeXP, setLifetimeXP] = useState(() => Number(localStorage.getItem("codequest-total-xp") || 0));
  const [duelLang, setDuelLang] = useState<string | null>(null);
  const [friendName, setFriendName] = useState("");
  const [friendRankName, setFriendRankName] = useState(RANKS[2].name);
  const [friendPhoto, setFriendPhoto] = useState("");
  const [duelCharacterId, setDuelCharacterId] = useState(ANIME_CHARACTERS[0].id);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("codequest-theme-mode");
    return saved !== "light";
  });
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      return JSON.parse(localStorage.getItem("codequest-profile") || '{"username":"","yearLevel":"","course":"","school":"","photo":""}');
    } catch {
      return { username: "", yearLevel: "", course: "", school: "", photo: "" };
    }
  });
  const [users, setUsers] = useState<AppUser[]>(() => seedDefaultUsers());
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("codequest-current-user");
      return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      return null;
    }
  });

  const totalQs = selectedLang ? (QUESTIONS[selectedLang]?.length ?? 0) : 0;

  useEffect(() => {
    localStorage.setItem("codequest-selected-track", selectedTrack.id);
  }, [selectedTrack]);

  useEffect(() => {
    localStorage.setItem("codequest-theme-mode", darkMode ? "dark" : "light");
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
  }, [darkMode]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("codequest-current-user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("codequest-current-user");
    }
  }, [currentUser]);

  const saveProfile = (next: StudentProfile) => {
    const firstProfile = !profile.username;
    setProfile(next);
    localStorage.setItem("codequest-profile", JSON.stringify(next));
    setScreen(firstProfile ? "guidelines" : "home");
  };

  const continueFromWelcome = () => {
    if (!profile.username || !profile.yearLevel || !profile.course || !profile.school) {
      setScreen("profile");
    } else {
      setScreen("home");
    }
  };

  const startQuest = () => setScreen("modes");

  const addLifetimeXP = (earned: number) => {
    setLifetimeXP((prev) => {
      const next = prev + earned;
      localStorage.setItem("codequest-total-xp", String(next));
      return next;
    });
  };

  const updatePhoto = (photo: string) => {
    const next = { ...profile, photo };
    setProfile(next);
    localStorage.setItem("codequest-profile", JSON.stringify(next));
  };

  const handleLogin = (user: AppUser) => {
    setUsers((prev) => {
      const next = prev.map((item) => ({ ...item, isOnline: item.id === user.id }));
      writeUsers(next);
      return next;
    });
    setCurrentUser({ ...user, isOnline: true });
    setScreen("home");
  };

  const handleLogout = () => {
    if (currentUser) {
      setUsers((prev) => {
        const next = prev.map((item) => (item.id === currentUser.id ? { ...item, isOnline: false } : item));
        writeUsers(next);
        return next;
      });
    }
    setCurrentUser(null);
    setScreen("home");
  };

  const handleAddFriend = (friendId: string) => {
    if (!currentUser) return;
    if (currentUser.friends.includes(friendId)) return;
    const updatedUser = { ...currentUser, friends: [...currentUser.friends, friendId] };
    setCurrentUser(updatedUser);
    setUsers((prev) => {
      const next = prev.map((item) => (item.id === currentUser.id ? { ...item, friends: updatedUser.friends } : item));
      writeUsers(next);
      return next;
    });
  };

  const resetDemoAccounts = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("codequest-users");
    }
    const seeded = seedDefaultUsers();
    setUsers(seeded);
    setCurrentUser(null);
  };

  return (
    <div className={`cq-shell ${darkMode ? "dark-mode" : "light-mode"} min-h-screen text-foreground overflow-x-hidden`}
      style={{ fontFamily: "'JetBrains Mono', 'Inter', monospace" }}>
      <style>{`
        html, body, #root { width: 100%; min-height: 100%; margin: 0; }
        * { box-sizing: border-box; }
        body { overflow-x: hidden; }
        .dark-mode { background: #070711; min-height: 100vh; }
        .light-mode { background: linear-gradient(135deg,#f8fafc,#eef2ff 45%,#ecfeff); color: #111827; min-height: 100vh; }
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
        .light-mode .text-white\/35 { color: #6b7280 !important; }
        .light-mode .text-white\/25 { color: #9ca3af !important; }
        .light-mode .bg-black\/10 { background-color: rgba(255,255,255,.72) !important; }
        .light-mode .bg-black\/15 { background-color: rgba(255,255,255,.72) !important; }
        .light-mode .bg-black\/20 { background-color: rgba(255,255,255,.9) !important; }
        .light-mode .border-white\/10 { border-color: rgba(15,23,42,.14) !important; }
        .light-mode .border-white\/20 { border-color: rgba(15,23,42,.2) !important; }
        .light-mode .text-purple-300 { color: #7c3aed !important; }
        .light-mode .text-cyan-300 { color: #0891b2 !important; }
        .light-mode .text-pink-300 { color: #db2777 !important; }
        .light-mode .text-yellow-300 { color: #b45309 !important; }
        .light-mode .text-green-300 { color: #15803d !important; }
        .light-mode .text-red-300 { color: #dc2626 !important; }
        .light-mode .text-orange-400 { color: #c2410c !important; }
        .light-mode .text-white\/40 { color: #6b7280 !important; }
        .light-mode .text-white\/30 { color: #9ca3af !important; }
        .light-mode input::placeholder { color: #9ca3af !important; }
        .light-mode .text-white\/10 { color: rgba(17,24,39,.15) !important; }
        .light-mode iframe { filter: none; }
        .light-mode { text-shadow: none; }
        .light-mode button, .light-mode input, .light-mode select, .light-mode textarea { filter: contrast(1.05) saturate(1.05); }
        button { -webkit-tap-highlight-color: transparent; }
        .light-mode { background: #f4f7fb !important; color: #111827 !important; }
        .light-mode .bg-black\/35, .light-mode .bg-black\/30, .light-mode .bg-black\/25, .light-mode .bg-black\/20, .light-mode .bg-black\/15 { background-color: rgba(255,255,255,.96) !important; }
        .light-mode .text-white { color: #111827 !important; }
        .light-mode .text-white\/75 { color: #334155 !important; }
        .light-mode .text-white\/55 { color: #475569 !important; }
        .light-mode .text-white\/50, .light-mode .text-white\/45, .light-mode .text-white\/40 { color: #64748b !important; }
        .light-mode .text-white\/35, .light-mode .text-white\/30, .light-mode .text-white\/25 { color: #64748b !important; }
        .light-mode .border-white\/10 { border-color: rgba(15,23,42,.16) !important; }
        .light-mode .border-white\/20 { border-color: rgba(15,23,42,.22) !important; }
        .light-mode .bg-white\/5 { background-color: rgba(15,23,42,.045) !important; }
        .light-mode .bg-white\/10 { background-color: rgba(15,23,42,.075) !important; }
        .light-mode input, .light-mode textarea, .light-mode select { background-color: #ffffff !important; color: #111827 !important; border-color: rgba(15,23,42,.2) !important; }
        .light-mode input::placeholder, .light-mode textarea::placeholder { color: #64748b !important; }
        .cq-shell { width: 100%; max-width: 100vw; overflow-x: clip; }
        .cq-touch { min-height: 44px; }
        .light-mode .text-purple-200 { color: #6d28d9 !important; }
        .light-mode .text-cyan-200 { color: #0e7490 !important; }
        .light-mode .text-pink-200 { color: #be185d !important; }
        .light-mode .text-green-200 { color: #166534 !important; }
        .light-mode .text-yellow-200 { color: #92400e !important; }
        .light-mode .text-white\/15 { color: rgba(15,23,42,.28) !important; }
        .light-mode .bg-purple-500\/10 { background-color: rgba(124,58,237,.10) !important; }
        .light-mode .bg-cyan-500\/10 { background-color: rgba(8,145,178,.10) !important; }
        .light-mode .bg-pink-500\/10 { background-color: rgba(219,39,119,.10) !important; }
        .light-mode .bg-green-500\/10 { background-color: rgba(22,163,74,.10) !important; }
        .light-mode .bg-yellow-500\/10 { background-color: rgba(217,119,6,.10) !important; }
        .light-mode .bg-purple-500\/15 { background-color: rgba(124,58,237,.14) !important; }
        .light-mode .bg-cyan-500\/15 { background-color: rgba(8,145,178,.14) !important; }
        .light-mode .bg-pink-500\/15 { background-color: rgba(219,39,119,.14) !important; }
        .light-mode .bg-green-500\/15 { background-color: rgba(22,163,74,.14) !important; }
        .light-mode .bg-black\/35 { background-color: rgba(255,255,255,.98) !important; }
        .light-mode .bg-black\/25 { background-color: rgba(255,255,255,.98) !important; }
        .light-mode .bg-black\/15 { background-color: rgba(255,255,255,.96) !important; }
        .light-mode .bg-black\/10 { background-color: rgba(255,255,255,.94) !important; }
        .light-mode [class*="shadow-purple"] { box-shadow: 0 12px 35px rgba(99,102,241,.12) !important; }
        .light-mode button:hover { filter: brightness(1.02) saturate(1.08); }
        @media (max-width: 768px) {
          body { min-width: 0; overflow-x: hidden; }
          .cq-shell { padding-left: max(.75rem, env(safe-area-inset-left)); padding-right: max(.75rem, env(safe-area-inset-right)); }
        }
        @media (max-width: 480px) {
          .cq-shell { padding-top: .75rem; padding-bottom: 1rem; }
          button, input, select, textarea { max-width: 100%; }
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: darkMode
            ? `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`
            : `linear-gradient(rgba(17,24,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.04) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <>
        <GlobalMusicController selectedTrack={selectedTrack} />
      </>

      <AnimatePresence mode="wait">

        {screen === "welcome" && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WelcomeScreen onContinue={continueFromWelcome} />
          </motion.div>
        )}

        {screen === "home" && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HomeScreen
              profile={profile}
              darkMode={darkMode}
              onToggleTheme={() => setDarkMode((v) => !v)}
              onProfile={() => setScreen("profile")}
              onGuidelines={() => setScreen("guidelines")}
              onStart={startQuest}
              totalXP={lifetimeXP}
              onDuel={() => setScreen("duel-setup")}
              onMusic={() => { setMusicReturn("home"); setScreen("music"); }}
              selectedTrack={selectedTrack}
              onCommunity={() => setScreen("community")}
              onLeaderboard={() => setScreen("leaderboard")}
              onAdmin={() => setScreen("admin")}
              currentUser={currentUser}
            />
          </motion.div>
        )}

        {screen === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProfileScreen
              profile={profile}
              totalXP={lifetimeXP}
              onSave={saveProfile}
              onBack={() => setScreen("home")}
              darkMode={darkMode}
              onToggleTheme={() => setDarkMode((v) => !v)}
              currentUser={currentUser}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onOpenLogin={() => setScreen("login")}
            />
          </motion.div>
        )}

        {screen === "guidelines" && (
          <motion.div key="guidelines" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GuidelinesScreen onBack={() => setScreen("home")} onContinue={() => setScreen("language")} />
          </motion.div>
        )}

        {screen === "login" && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginScreen onBack={() => setScreen("home")} onLogin={handleLogin} onSwitchToSignup={() => setScreen("login")} />
          </motion.div>
        )}

        {screen === "community" && (
          <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CommunityScreen onBack={() => setScreen("home")} users={users} currentUser={currentUser} onAddFriend={handleAddFriend} />
          </motion.div>
        )}

        {screen === "leaderboard" && (
          <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LeaderboardScreen onBack={() => setScreen("home")} users={users} />
          </motion.div>
        )}

        {screen === "admin" && (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminScreen onBack={() => setScreen("home")} users={users} onResetUsers={resetDemoAccounts} />
          </motion.div>
        )}

        {screen === "modes" && (
          <motion.div key="modes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModesScreen onBack={() => setScreen("home")} onSelect={(mode) => { setGameMode(mode); setScreen("language"); }} />
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

        {screen === "music" && (
          <motion.div key="music" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MusicSelectionScreen
              selectedTrack={selectedTrack}
              onSelect={(track) => {
                setSelectedTrack(track);
                try { localStorage.setItem("codequest-selected-track", track.id); } catch {}
                // The global music controller restarts the current soundtrack and the menu disappears immediately.
                setScreen(musicReturn);
              }}
              onBack={() => setScreen(musicReturn === "duel" ? "duel-setup" : musicReturn === "home" ? "home" : "language")}
            />
          </motion.div>
        )}

        {screen === "game" && selectedLang && (
          <motion.div key={`game-${selectedLang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {gameMode === "compiler" ? (
              <CompilerGameScreen langId={selectedLang} onFinish={(score, xp, correct) => { setResults({ score, xp, correct }); addLifetimeXP(xp); setScreen("results"); }} />
            ) : gameMode === "debug" ? (
              <BugHunterGameScreen langId={selectedLang} onFinish={(score, xp, correct) => { setResults({ score, xp, correct }); addLifetimeXP(xp); setScreen("results"); }} />
            ) : gameMode === "survival" ? (
              <SurvivalGameScreen langId={selectedLang} onFinish={(score, xp, correct) => { setResults({ score, xp, correct }); addLifetimeXP(xp); setScreen("results"); }} />
            ) : (
              <GameScreen langId={selectedLang} mode={gameMode} onFinish={(score, xp, correct) => { setResults({ score, xp, correct }); addLifetimeXP(xp); setScreen("results"); }} />
            )}
          </motion.div>
        )}

        {screen === "duel-setup" && (
          <motion.div key="duel-setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DuelSetupScreen
              profile={profile}
              totalXP={lifetimeXP}
              selectedLang={duelLang}
              onSelectLanguage={setDuelLang}
              onBack={() => setScreen("home")}
              onStart={(name, rank, photo, characterId) => {
                setFriendName(name);
                setFriendRankName(rank);
                setFriendPhoto(photo);
                setDuelCharacterId(characterId);
                setScreen("duel");
              }}
            />
          </motion.div>
        )}

        {screen === "duel" && duelLang && (
          <motion.div key={`duel-${duelLang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DuelScreen
              langId={duelLang}
              profile={profile}
              totalXP={lifetimeXP}
              friendName={friendName}
              friendRankName={friendRankName}
              friendPhoto={friendPhoto}
              characterId={duelCharacterId}
              onFinish={() => setScreen("home")}
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
              total={gameMode === "debug" ? (DEBUG_QUESTIONS_BY_LANGUAGE[selectedLang]?.length ?? 0) : gameMode === "compiler" ? (COMPILER_CHALLENGES[selectedLang]?.length ?? 0) : gameMode === "speed" ? Math.min(5, totalQs) : gameMode === "survival" ? 10 : totalQs}
              profile={profile}
              totalXP={lifetimeXP}
              onPhotoUpdate={updatePhoto}
              onReplay={() => {
                setResults(null);
                setScreen("game");
              }}
              onHome={() => {
                setSelectedLang(null);
                setScreen("home");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
