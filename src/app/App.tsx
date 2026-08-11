import { useState, useEffect, useCallback, useRef } from "react";
import type { FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Code2, Zap, Trophy, Star, ArrowRight, RotateCcw, CheckCircle2, XCircle, Flame, Target, BookOpen, ChevronRight, User, GraduationCap, School, BookOpenCheck, Moon, Sun, Music, ArrowLeft, Swords, Shield, Camera, Gamepad2, Crown, Medal, Users, Sparkles, Heart, Volume2 } from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────

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

type Screen = "welcome" | "home" | "profile" | "guidelines" | "modes" | "language" | "game" | "results" | "duel-setup" | "duel";
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


type GameMode = "practice" | "battle" | "speed";

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

function WelcomeScreen({ onContinue, darkMode, onToggleTheme }: { onContinue: () => void; darkMode: boolean; onToggleTheme: () => void }) {
  const guidelines = [
    "Choose a programming language and a game mode.",
    "Answer each coding challenge to earn XP and build your streak.",
    "In Battle Mode, every correct answer is a skill attack against the Code Beast.",
    "Your profile appears on your results card; add a photo to complete your winning profile.",
    "You can edit your student profile anytime from the dashboard.",
    "Choose from a larger Spotify soundtrack list, including TJ Monterde and relaxing coding music, while playing.",
  ];
  return (
    <div className="min-h-screen px-6 py-10 relative overflow-hidden">
      <div className="absolute top-5 right-5">
        <button onClick={onToggleTheme} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/70 font-mono text-xs">
          {darkMode ? <Sun size={15} /> : <Moon size={15} />} {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto pt-16 md:pt-24 relative">
        <div className="text-center mb-12">
          <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 4 }}
            className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-cyan-500 items-center justify-center shadow-2xl shadow-purple-500/30 mb-6">
            <Code2 size={38} className="text-white" />
          </motion.div>
          <p className="text-purple-300 font-mono font-bold tracking-widest text-sm mb-3">WELCOME TO</p>
          <h1 className="text-6xl md:text-8xl font-mono font-black tracking-tight">
            <span className="text-white">Code</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Quest</span>
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto mt-5 text-base md:text-lg font-mono">
            Turn programming questions into a game. Learn, fight, earn XP, and level up your coding skills.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3 mb-5"><BookOpenCheck className="text-cyan-400" /><h2 className="text-xl font-mono font-black text-white">Quick Guidelines</h2></div>
            <div className="space-y-3">
              {guidelines.map((g, i) => <div key={g} className="flex gap-3 text-sm font-mono text-white/60"><span className="text-purple-400 font-bold">{i + 1}.</span><span>{g}</span></div>)}
            </div>
          </div>
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
            <div className="flex items-center gap-3 mb-5"><Swords className="text-purple-400" /><h2 className="text-xl font-mono font-black text-white">Your Mission</h2></div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["⚔️", "Battle", "Attack with correct answers"],
                ["⚡", "Speed", "Answer fast and accurately"],
                ["🧠", "Practice", "Learn with explanations"],
                ["🏆", "Level Up", "Earn XP and rank up"],
              ].map(([icon, title, desc]) => <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4"><div className="text-2xl mb-2">{icon}</div><p className="font-mono font-bold text-white text-sm">{title}</p><p className="font-mono text-xs text-white/40 mt-1">{desc}</p></div>)}
            </div>
          </div>
        </div>

        <div className="text-center">
          <button onClick={onContinue} className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-black text-lg shadow-xl shadow-purple-500/20">
            Continue to CodeQuest <ArrowRight size={20} />
          </button>
          <p className="text-white/30 text-xs font-mono mt-4">Your profile and theme are saved on this device.</p>
        </div>
      </motion.div>
    </div>
  );
}

function MusicPlayer({ compact = false }: { compact?: boolean }) {
  const [track, setTrack] = useState(SPOTIFY_TRACKS[0]);
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
          <p className="text-white/40 text-[10px] font-mono truncate">Spotify soundtrack for your quest.</p>
        </div>
        <span className="ml-auto shrink-0 text-[10px] font-mono text-white/30">{SPOTIFY_TRACKS.length} tracks</span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-thin">
        {categories.map((item) => (
          <button key={item} onClick={() => setCategory(item)}
            className={`shrink-0 px-2.5 py-1.5 rounded-full text-[9px] font-mono border transition-all ${
              category === item ? "bg-green-500/20 border-green-500/40 text-green-300" : "bg-white/5 border-white/10 text-white/50 hover:text-white"
            }`}>
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 max-h-36 overflow-y-auto pr-1">
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

      <iframe
        key={track.id}
        src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator`}
        width="100%" height={compact ? "152" : "152"} frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy" title={`Spotify player for ${track.title}`} className="w-full rounded-2xl"
      />

      <div className="flex items-center gap-2 mt-2 text-[9px] font-mono text-white/35">
        <Volume2 size={11} />
        <span>Spotify controls playback. Press play to start.</span>
      </div>
    </div>
  );
}

function AnimeCoderAvatar({ side = "player", large = false }: { side?: "player" | "enemy"; large?: boolean }) {
  const player = side === "player";
  return (
    <motion.div
      animate={{ y: [0, -4, 0], rotate: player ? [0, 1, 0] : [0, -1, 0] }}
      transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
      className={`${large ? "w-28 h-36" : "w-20 h-24"} relative shrink-0`}
      aria-label={player ? "Anime coding hero" : "Anime code beast"}
    >
      <div className={`absolute left-1/2 -translate-x-1/2 top-0 ${large ? "w-16 h-16" : "w-12 h-12"} rounded-full border-2 ${player ? "border-cyan-300 bg-cyan-500/20" : "border-pink-300 bg-pink-500/20"} shadow-lg`}>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3/4 h-5 rounded-t-full bg-black/60" />
        <div className="absolute top-7 left-2 flex gap-2">
          <span className="w-2 h-1.5 rounded-full bg-white" />
          <span className="w-2 h-1.5 rounded-full bg-white" />
        </div>
        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full ${player ? "bg-cyan-300" : "bg-pink-300"}`} />
      </div>
      <div className={`absolute ${large ? "top-14" : "top-11"} left-1/2 -translate-x-1/2 ${large ? "w-24 h-20" : "w-16 h-14"} rounded-2xl border ${player ? "border-cyan-400/50 bg-cyan-500/15" : "border-pink-400/50 bg-pink-500/15"} flex items-center justify-center`}>
        <Code2 size={large ? 30 : 22} className={player ? "text-cyan-300" : "text-pink-300"} />
      </div>
      <div className={`absolute ${large ? "bottom-0" : "bottom-0"} left-1/2 -translate-x-1/2 w-1/2 h-2 rounded-full ${player ? "bg-cyan-400/30" : "bg-pink-400/30"} blur-md`} />
    </motion.div>
  );
}

function ModesScreen({ onSelect, onBack }: { onSelect: (mode: GameMode) => void; onBack: () => void }) {
  const modes = [
    { id: "practice" as GameMode, icon: "🧠", title: "Practice Mode", desc: "Relaxed learning with explanations after every answer.", color: "#8b5cf6", questions: "7 questions" },
    { id: "battle" as GameMode, icon: "⚔️", title: "Battle Mode", desc: "Your answers become skills. Correct answers attack the Code Beast.", color: "#ef4444", questions: "7 questions" },
    { id: "speed" as GameMode, icon: "⚡", title: "Speed Mode", desc: "Fast-paced challenge. Try to finish all questions quickly.", color: "#f59e0b", questions: "5 questions" },
  ];
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8"><ArrowLeft size={16}/> Back</button>
        <div className="text-center mb-10"><Gamepad2 className="mx-auto text-purple-400 mb-3" size={36}/><h2 className="text-4xl font-mono font-black text-white">Choose Your Mode</h2><p className="text-white/40 font-mono text-sm mt-2">How do you want to test your skills?</p></div>
        <div className="grid md:grid-cols-3 gap-4">
          {modes.map((mode) => <button key={mode.id} onClick={() => onSelect(mode.id)} className="text-left rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all">
            <div className="text-5xl mb-5">{mode.icon}</div><h3 className="text-xl font-mono font-black text-white mb-2">{mode.title}</h3><p className="text-white/50 text-sm font-mono leading-relaxed mb-5">{mode.desc}</p><div className="flex items-center justify-between"><span className="text-xs font-mono" style={{color:mode.color}}>{mode.questions}</span><ArrowRight size={17} className="text-white/30"/></div>
          </button>)}
        </div>
      </div>
    </div>
  );
}

function HomeScreen({
  onStart,
  onProfile,
  onGuidelines,
  onToggleTheme,
  darkMode,
  profile,
  totalXP,
  onDuel,
}: {
  onStart: () => void;
  onProfile: () => void;
  onGuidelines: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
  profile: StudentProfile;
  totalXP: number;
  onDuel: () => void;
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


        {profile.username && (
          <div className="max-w-2xl mx-auto mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-4 text-left">
            {profile.photo ? <img src={profile.photo} className="w-14 h-14 rounded-2xl object-cover border border-white/10" alt="Student profile" /> :
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center"><User className="text-purple-300" /></div>}
            <div className="min-w-0 flex-1">
              <p className="text-white font-mono font-bold">{profile.username}</p>
              <p className="text-white/40 text-xs font-mono">{profile.yearLevel} · {profile.course}</p>
              <p className="text-white/30 text-xs font-mono truncate">{profile.school}</p>
            </div>
            <RankBadge totalXP={totalXP} compact />
          </div>
        )}

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
          "Your Coding Adventure Starts Here"
        </p>
        <p className="text-white/30 text-sm mb-12">
          Choose your mode, pick a language, answer challenges, and level up your coding skills.
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

        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <button onClick={onDuel}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-pink-500/30 bg-pink-500/10 text-pink-300 font-mono font-bold text-sm hover:bg-pink-500/20 transition-all">
            <Users size={16} /> 1v1 Friend Arena
          </button>
          <button onClick={onProfile}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white/60 font-mono font-bold text-sm hover:bg-white/10 transition-all">
            <User size={16} /> Student Profile
          </button>
        </div>
      </motion.div>
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

function ProfileScreen({
  profile,
  totalXP,
  onSave,
  onBack,
}: {
  profile: StudentProfile;
  totalXP: number;
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
  const questions = mode === "speed" ? allQuestions.slice(0, Math.min(5, allQuestions.length)) : allQuestions;
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
  const [timeLeft, setTimeLeft] = useState(mode === "speed" ? 60 : 0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const finishedRef = useRef(false);
  const battleSkills = ["Code Slash", "Logic Strike", "Debug Blast", "Syntax Smash", "Algorithm Beam"];

  const playSfx = useCallback((kind: "correct" | "wrong" | "click" | "timer" | "finish") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const frequencies = {
        correct: [660, 880], wrong: [220, 160], click: [420], timer: [740, 520], finish: [523, 659, 784],
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
      if (correct) {
        setEnemyHP((hp) => Math.max(0, hp - 20));
        setBattleMessage(`⚡ ${battleSkills[qIndex % battleSkills.length]}! -20 HP`);
      } else {
        setPlayerHP((hp) => Math.max(0, hp - 15));
        setBattleMessage("💥 Code Beast counterattacks! -15 HP");
      }
    }
  }, [answerState, currentQ, mode, playSfx, qIndex, streak, battleSkills]);

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
              <span className="hidden sm:inline text-xs font-mono text-white/30">· {mode.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              {mode === "speed" && (
                <motion.div animate={{ scale: timeLeft <= 10 ? [1, 1.08, 1] : 1 }} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono font-black text-xs ${timeLeft <= 10 ? "border-red-500/60 bg-red-500/15 text-red-300" : "border-amber-400/30 bg-amber-400/10 text-amber-300"}`}>
                  <span>⏱</span> {timeLeft}s
                </motion.div>
              )}
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
                  <AnimeCoderAvatar side="enemy" large />
                  <div className="text-center min-w-0">
                    <p className="text-[10px] font-mono text-white/30 tracking-[0.25em]">CODE BATTLE</p>
                    <p className="text-xs sm:text-sm font-mono font-black text-purple-300">YOUR SKILL IS YOUR WEAPON</p>
                    <div className="mt-3 text-xs font-mono font-black text-white/70">{battleMessage}</div>
                  </div>
                  <AnimeCoderAvatar side="player" large />
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
                    <Target size={11} /> {currentQ.type === "multiple" ? "Multiple Choice" : currentQ.type === "code" ? "Code Challenge" : "True or False"}
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

          {mode === "battle" && (
            <aside className="min-w-0 lg:sticky lg:top-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-mono font-black text-green-300 tracking-widest">BATTLE SOUNDTRACK</p>
                <span className="text-[9px] font-mono text-white/30">Desktop side panel · Mobile below battle</span>
              </div>
              <MusicPlayer compact />
            </aside>
          )}
        </div>

        {mode !== "battle" && (
          <div className="mt-5 max-w-2xl mx-auto">
            <MusicPlayer compact />
          </div>
        )}
      </div>
    </div>
  );
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
  onStart: (friendName: string, friendRank: string, friendPhoto: string) => void;
  onBack: () => void;
}) {
  const [friendName, setFriendName] = useState("");
  const [friendRank, setFriendRank] = useState(RANKS[2].name);
  const [friendPhoto, setFriendPhoto] = useState("");

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

        <button disabled={!selectedLang || !friendName.trim()} onClick={() => onStart(friendName.trim(), friendRank, friendPhoto)}
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
  onFinish,
}: {
  langId: string;
  profile: StudentProfile;
  totalXP: number;
  friendName: string;
  friendRankName: string;
  friendPhoto: string;
  onFinish: () => void;
}) {
  const questions = (QUESTIONS[langId] ?? []).slice(0, 5);
  const lang = LANGUAGES.find((l) => l.id === langId)!;
  const [qIndex, setQIndex] = useState(0);
  const [turn, setTurn] = useState<"you" | "friend">("you");
  const [selected, setSelected] = useState<number | null>(null);
  const [youScore, setYouScore] = useState(0);
  const [friendScore, setFriendScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const currentQ = questions[qIndex];

  const answer = (index: number) => {
    if (locked) return;
    setSelected(index);
    const correct = index === currentQ.answer;
    setLocked(true);

    if (turn === "you" && correct) setYouScore((s) => s + 1);
    if (turn === "friend" && correct) setFriendScore((s) => s + 1);

    setTimeout(() => {
      setSelected(null);
      setLocked(false);
      if (turn === "you") setTurn("friend");
      else if (qIndex < questions.length - 1) {
        setQIndex((i) => i + 1);
        setTurn("you");
      } else onFinish();
    }, 700);
  };

  const friendRank = RANKS.find((r) => r.name === friendRankName) ?? RANKS[2];

  return (
    <div className="min-h-screen px-4 py-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-purple-950/20 to-pink-950/20 pointer-events-none"/>
      <div className="max-w-6xl mx-auto relative">
        <div className="flex items-center justify-between mb-5">
          <div><p className="text-purple-300 text-xs font-mono font-black">1V1 CODE ARENA</p><p className="text-white/30 text-xs font-mono mt-1">{lang.icon} {lang.name} · Round {qIndex + 1}/5</p></div>
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
          <AnimeCoderAvatar side="player" large />
          <div className="text-center">
            <div className="text-3xl sm:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-pink-300">VS</div>
            <p className="text-[9px] sm:text-[10px] font-mono text-white/35 tracking-[0.25em] mt-1">CODE WARRIORS</p>
          </div>
          <AnimeCoderAvatar side="enemy" large />
        </div>

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

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [gameMode, setGameMode] = useState<GameMode>("practice");
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [results, setResults] = useState<{ score: number; xp: number; correct: number } | null>(null);
  const [lifetimeXP, setLifetimeXP] = useState(() => Number(localStorage.getItem("codequest-total-xp") || 0));
  const [duelLang, setDuelLang] = useState<string | null>(null);
  const [friendName, setFriendName] = useState("");
  const [friendRankName, setFriendRankName] = useState(RANKS[2].name);
  const [friendPhoto, setFriendPhoto] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("codequest-theme");
    return saved !== "light";
  });
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      return JSON.parse(localStorage.getItem("codequest-profile") || '{"username":"","yearLevel":"","course":"","school":"","photo":""}');
    } catch {
      return { username: "", yearLevel: "", course: "", school: "", photo: "" };
    }
  });

  const totalQs = selectedLang ? (QUESTIONS[selectedLang]?.length ?? 0) : 0;

  useEffect(() => {
    localStorage.setItem("codequest-theme", darkMode ? "dark" : "light");
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
  }, [darkMode]);

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

  return (
    <div className={`${darkMode ? "dark-mode" : "light-mode"} min-h-screen text-foreground overflow-x-hidden`}
      style={{ fontFamily: "'JetBrains Mono', 'Inter', monospace" }}>
      <style>{`
        html, body, #root { width: 100%; min-height: 100%; margin: 0; }
        * { box-sizing: border-box; }
        body { overflow-x: hidden; }
        .dark-mode { background: #070711; min-height: 100vh; }
        .light-mode { background: #eef2ff; color: #111827; min-height: 100vh; }
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

        {screen === "welcome" && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WelcomeScreen darkMode={darkMode} onToggleTheme={() => setDarkMode((v) => !v)} onContinue={continueFromWelcome} />
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
            />
          </motion.div>
        )}

        {screen === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProfileScreen profile={profile} totalXP={lifetimeXP} onSave={saveProfile} onBack={() => setScreen("home")} />
          </motion.div>
        )}

        {screen === "guidelines" && (
          <motion.div key="guidelines" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GuidelinesScreen onBack={() => setScreen("home")} onContinue={() => setScreen("language")} />
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

        {screen === "game" && selectedLang && (
          <motion.div key={`game-${selectedLang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GameScreen
              langId={selectedLang}
              mode={gameMode}
              onFinish={(score, xp, correct) => {
                setResults({ score, xp, correct });
                addLifetimeXP(xp);
                setScreen("results");
              }}
            />
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
              onStart={(name, rank, photo) => {
                setFriendName(name);
                setFriendRankName(rank);
                setFriendPhoto(photo);
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
              total={gameMode === "speed" ? Math.min(5, totalQs) : totalQs}
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
