import { useState, useEffect, useCallback, useRef } from "react";
import type { FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Code2,
  Zap,
  Trophy,
  Star,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Flame,
  Target,
  BookOpen,
  ChevronRight,
  User,
  GraduationCap,
  School,
  BookOpenCheck,
  Moon,
  Sun,
  Music,
  ArrowLeft,
  Swords,
  Shield,
  Camera,
  Gamepad2,
  Crown,
  Medal,
  Users,
  Sparkles,
  Heart,
  Volume2,
  Palette,
  Pencil,
  Terminal,
  Bug,
  Flame as FlameIcon,
  Menu,
  X,
  Play,
  Pause,
  SkipForward,
  VolumeX,
} from "lucide-react";

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

const BASE_QUESTIONS: Record<string, Question[]> = {
  python: [
    { id: 1, type: "multiple", question: "What keyword do you use to define a function in Python?", options: ["function", "def", "func", "define"], answer: 1, explanation: "`def` is the keyword used to define functions in Python. Example: `def greet(): print('Hello!')`", xp: 10 },
    { id: 2, type: "code", question: "What does this code print?", code: `x = [1, 2, 3, 4, 5]\nprint(x[2])`, options: ["1", "2", "3", "5"], answer: 2, explanation: "Python lists are zero-indexed. `x[2]` accesses the third element, which is `3`.", xp: 15 },
    { id: 3, type: "multiple", question: "Which of these is the correct way to write a comment in Python?", options: ["// This is a comment", "/* Comment */", "# This is a comment", "-- Comment"], answer: 2, explanation: "Python uses `#` for single-line comments. Unlike many languages, there are no `//` or `/* */` comments.", xp: 10 },
    { id: 4, type: "code", question: "What is the output of this code?", code: `name = "Alice"\nprint(f"Hello, {name}!")`, options: ["Hello, name!", "Hello, Alice!", "{name}", "Error"], answer: 1, explanation: "f-strings in Python let you embed variables inside curly braces `{}`. `{name}` becomes `Alice`.", xp: 15 },
    { id: 5, type: "truefalse", question: "In Python, indentation is just a style preference and doesn't affect code execution.", options: ["True", "False"], answer: 1, explanation: "FALSE! Indentation is REQUIRED in Python. It defines code blocks (like function bodies, loops, if-statements).", xp: 10 },
    { id: 6, type: "code", question: "What does this loop print?", code: `for i in range(3):\n    print(i)`, options: ["1 2 3", "0 1 2", "0 1 2 3", "1 2"], answer: 1, explanation: "`range(3)` generates numbers 0, 1, 2. The loop prints each one — so output is `0`, `1`, `2`.", xp: 20 },
    { id: 7, type: "multiple", question: "Which data type would you use to store a list of unique items with no duplicates?", options: ["list", "tuple", "set", "dict"], answer: 2, explanation: "A `set` automatically removes duplicates and only stores unique values. `{1, 2, 3}` is a set.", xp: 20 },
  ],
  javascript: [
    { id: 1, type: "multiple", question: "Which keyword declares a variable that CANNOT be reassigned?", options: ["var", "let", "const", "fixed"], answer: 2, explanation: "`const` declares a constant — once assigned, its value cannot be reassigned. Use `let` for variables that change.", xp: 10 },
    { id: 2, type: "code", question: "What does this code output?", code: `console.log(typeof "Hello");`, options: ["string", "text", "String", "undefined"], answer: 0, explanation: "`typeof` returns a string describing the type. Strings return `\"string\"` (lowercase).", xp: 15 },
    { id: 3, type: "multiple", question: "Which method adds an item to the END of an array?", options: ["push()", "pop()", "shift()", "unshift()"], answer: 0, explanation: "`push()` adds elements to the END. `unshift()` adds to the START. `pop()` removes from end, `shift()` from start.", xp: 10 },
    { id: 4, type: "code", question: "What is the result?", code: `const nums = [1, 2, 3];\nconst doubled = nums.map(n => n * 2);\nconsole.log(doubled);`, options: ["[1, 2, 3]", "[2, 4, 6]", "[3, 4, 5]", "undefined"], answer: 1, explanation: "`.map()` creates a NEW array by applying a function to each element. Each number is doubled → `[2, 4, 6]`.", xp: 20 },
    { id: 5, type: "truefalse", question: "In JavaScript, `===` and `==` always produce the same result.", options: ["True", "False"], answer: 1, explanation: "FALSE! `==` does type coercion (`'5' == 5` is `true`). `===` checks both value AND type (`'5' === 5` is `false`).", xp: 15 },
    { id: 6, type: "multiple", question: "What does an arrow function `() => {}` do differently from a regular function?", options: ["It runs faster", "It has no `this` binding", "It can't take parameters", "It always returns undefined"], answer: 1, explanation: "Arrow functions don't have their own `this` — they inherit it from the surrounding scope. This is key for callbacks.", xp: 20 },
    { id: 7, type: "code", question: "What does this output?", code: `async function greet() {\n  return "Hello!";\n}\nconsole.log(typeof greet());`, options: ["string", "object", "Promise", "undefined"], answer: 1, explanation: "Async functions always return a Promise, even if you return a plain value. `typeof` a Promise is `'object'`.", xp: 25 },
  ],
  html: [
    { id: 1, type: "multiple", question: "Which HTML tag creates the largest heading?", options: ["<h6>", "<h1>", "<heading>", "<title>"], answer: 1, explanation: "`<h1>` is the largest heading. Headings go from `<h1>` (largest) to `<h6>` (smallest).", xp: 10 },
    { id: 2, type: "code", question: "What does this CSS do?", code: `.box {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}`, options: ["Makes the box invisible", "Centers content horizontally only", "Centers content both horizontally and vertically", "Adds a border"], answer: 2, explanation: "`justify-content: center` centers horizontally, `align-items: center` centers vertically — together they center content in both directions.", xp: 15 },
    { id: 3, type: "multiple", question: "Which CSS property controls the space INSIDE an element (between content and border)?", options: ["margin", "padding", "spacing", "gap"], answer: 1, explanation: "`padding` is the space inside the element. `margin` is the space OUTSIDE (between elements).", xp: 10 },
    { id: 4, type: "truefalse", question: "The `<div>` element has special semantic meaning in HTML.", options: ["True", "False"], answer: 1, explanation: "FALSE! `<div>` is a generic container with NO semantic meaning. Use semantic tags like `<header>`, `<nav>`, `<main>`, `<section>` when appropriate.", xp: 10 },
    { id: 5, type: "code", question: "What is wrong with this HTML?", code: `<img src="photo.jpg">`, options: ["Nothing, it's correct", "Missing the alt attribute", "img tags need a closing tag", "src should be href"], answer: 1, explanation: "Always include `alt` text for accessibility! Screen readers and users with slow connections depend on it: `<img src='photo.jpg' alt='description'>`", xp: 15 },
    { id: 6, type: "multiple", question: "Which CSS unit is RELATIVE to the root font size?", options: ["px", "em", "rem", "vh"], answer: 2, explanation: "`rem` (root em) is relative to the root `<html>` element's font-size. `em` is relative to the parent element. `px` is absolute.", xp: 20 },
    { id: 7, type: "code", question: "Which CSS makes text bold?", code: `/* Which property? */\np {\n  ______: bold;\n}`, options: ["text-weight", "font-bold", "font-weight", "weight"], answer: 2, explanation: "`font-weight: bold` makes text bold. You can also use numeric values: `font-weight: 700` equals bold.", xp: 10 },
  ],
  java: [
    { id: 1, type: "multiple", question: "What is the correct way to declare a public integer variable named `score` in Java?", options: ["int public score;", "public int score;", "score int public;", "public score int;"], answer: 1, explanation: "Java syntax: access modifier first (`public`), then type (`int`), then name (`score`). Always in that order.", xp: 10 },
    { id: 2, type: "code", question: "What does this print?", code: `String s = "Hello";\nSystem.out.println(s.length());`, options: ["4", "5", "6", "Error"], answer: 1, explanation: "`\"Hello\"` has 5 characters: H-e-l-l-o. `.length()` returns `5`.", xp: 10 },
    { id: 3, type: "multiple", question: "Java is considered a ________ language because code is compiled to bytecode.", options: ["interpreted", "platform-independent", "scripting", "untyped"], answer: 1, explanation: "Java compiles to bytecode that runs on the JVM (Java Virtual Machine), making it platform-independent — 'Write Once, Run Anywhere'.", xp: 15 },
    { id: 4, type: "truefalse", question: "In Java, `String` is a primitive data type.", options: ["True", "False"], answer: 1, explanation: "FALSE! `String` is a class (object type) in Java. Primitive types are: `int`, `double`, `boolean`, `char`, `byte`, `short`, `long`, `float`.", xp: 15 },
    { id: 5, type: "code", question: "What is the output?", code: `int[] arr = {10, 20, 30};\nSystem.out.println(arr[1]);`, options: ["10", "20", "30", "1"], answer: 1, explanation: "Arrays in Java are zero-indexed. `arr[0]` = 10, `arr[1]` = 20, `arr[2]` = 30.", xp: 15 },
    { id: 6, type: "multiple", question: "Which keyword is used to inherit a class in Java?", options: ["implements", "extends", "inherits", "super"], answer: 1, explanation: "`extends` is used for class inheritance. `implements` is for interfaces. Example: `class Dog extends Animal {}`", xp: 20 },
    { id: 7, type: "multiple", question: "What does `void` mean as a return type?", options: ["Returns null", "Returns 0", "Returns nothing", "Returns empty string"], answer: 2, explanation: "`void` means the method returns NOTHING. It performs an action but doesn't give back a value.", xp: 10 },
  ],
  cpp: [
    { id: 1, type: "multiple", question: "What symbol is used for output in C++?", options: ["print()", "System.out", "cout <<", "console.log"], answer: 2, explanation: "`cout <<` (from `<iostream>`) is C++'s output stream. Example: `cout << \"Hello\" << endl;`", xp: 10 },
    { id: 2, type: "code", question: "What does this code do?", code: `int x = 5;\nint* ptr = &x;\ncout << *ptr;`, options: ["Prints memory address", "Prints 5", "Causes an error", "Prints &x"], answer: 1, explanation: "`&x` gets the address of x. `*ptr` dereferences the pointer — getting the VALUE at that address, which is `5`.", xp: 25 },
    { id: 3, type: "multiple", question: "What does `#include <iostream>` do?", options: ["Imports a class", "Includes the input/output stream library", "Defines the main function", "Compiles the code"], answer: 1, explanation: "`#include` adds a header file to your code. `<iostream>` provides `cin` and `cout` for input/output.", xp: 10 },
    { id: 4, type: "truefalse", question: "C++ automatically manages memory — you never need to free allocated memory manually.", options: ["True", "False"], answer: 1, explanation: "FALSE! C++ requires manual memory management. Use `new` to allocate and `delete` to free memory. Memory leaks happen when you forget `delete`!", xp: 20 },
    { id: 5, type: "code", question: "What is the output?", code: `for (int i = 0; i < 3; i++) {\n  cout << i << " ";\n}`, options: ["1 2 3", "0 1 2", "0 1 2 3", "1 2"], answer: 1, explanation: "`i` starts at 0, runs while `i < 3`. Prints 0, 1, 2 (each followed by a space).", xp: 15 },
    { id: 6, type: "multiple", question: "Which C++ feature allows a function to have the same name but different parameters?", options: ["Overriding", "Overloading", "Templates", "Inheritance"], answer: 1, explanation: "Function overloading lets you define multiple functions with the same name but different parameter types or counts.", xp: 20 },
    { id: 7, type: "multiple", question: "What is `std::` in C++?", options: ["A class name", "Standard library namespace", "A data type", "A compile flag"], answer: 1, explanation: "`std` is the standard namespace. Writing `using namespace std;` lets you skip the `std::` prefix and write `cout` instead of `std::cout`.", xp: 15 },
  ],
  c: [
    { id: 1, type: "multiple", question: "Which function is the starting point of a C program?", options: ["start()", "main()", "begin()", "run()"], answer: 1, explanation: "Every standard C program starts execution from the main() function.", xp: 10 },
    { id: 2, type: "code", question: "What does this code print?", code: `#include <stdio.h>\nint main() {\n  printf("Hello");\n  return 0;\n}`, options: ["Hello", "printf", "Error", "Nothing"], answer: 0, explanation: "printf() displays text on the screen, so this program prints Hello.", xp: 10 },
    { id: 3, type: "multiple", question: "Which header file is commonly used for printf() and scanf()?", options: ["<string.h>", "<math.h>", "<stdio.h>", "<stdlib.h>"], answer: 2, explanation: "<stdio.h> provides standard input and output functions such as printf() and scanf().", xp: 15 },
    { id: 4, type: "truefalse", question: "In C, array indexing starts at 0.", options: ["True", "False"], answer: 0, explanation: "TRUE! The first element of a C array is at index 0.", xp: 10 },
    { id: 5, type: "code", question: "What is the output?", code: `int x = 5;\nint y = 3;\nprintf("%d", x + y);`, options: ["2", "8", "15", "53"], answer: 1, explanation: "The + operator adds 5 and 3, so printf() outputs 8.", xp: 15 },
    { id: 6, type: "multiple", question: "Which symbol is used to get the address of a variable in C?", options: ["*", "&", "#", "@"], answer: 1, explanation: "The & operator is the address-of operator. For example, &x gives the memory address of x.", xp: 20 },
    { id: 7, type: "multiple", question: "Which format specifier is commonly used to print an integer with printf()?", options: ["%s", "%f", "%d", "%c"], answer: 2, explanation: "%d is commonly used for signed integer values with printf().", xp: 15 },
  ],
  typescript: [
    { id: 1, type: "multiple", question: "How do you declare a variable with a specific type in TypeScript?", options: ["let name = string;", "let name: string;", "string let name;", "var name<string>;"], answer: 1, explanation: "TypeScript uses `:` for type annotations. `let name: string = 'Alice'` tells TypeScript `name` must always be a string.", xp: 10 },
    { id: 2, type: "code", question: "What's wrong with this TypeScript code?", code: `let age: number = 25;\nage = "thirty";`, options: ["Nothing, it's fine", "Type error: can't assign string to number", "Missing semicolon", "age is not defined"], answer: 1, explanation: "TypeScript won't allow assigning a `string` to a `number` type. This is exactly what TypeScript protects you from!", xp: 15 },
    { id: 3, type: "multiple", question: "What does the TypeScript type `string | number` mean?", options: ["Only string", "Only number", "Either string or number", "Both string and number at once"], answer: 2, explanation: "`|` creates a Union Type — the value can be EITHER type. `string | number` means it accepts both strings and numbers.", xp: 15 },
    { id: 4, type: "truefalse", question: "TypeScript code runs directly in the browser without any compilation.", options: ["True", "False"], answer: 1, explanation: "FALSE! TypeScript must be compiled (transpiled) to JavaScript before the browser can run it. The `tsc` compiler handles this.", xp: 10 },
    { id: 5, type: "code", question: "What does this interface define?", code: `interface User {\n  name: string;\n  age: number;\n  isAdmin?: boolean;\n}`, options: ["A class with methods", "A data shape — an object with name, age, and optional isAdmin", "A function type", "An enum"], answer: 1, explanation: "Interfaces define the shape of objects. The `?` after `isAdmin` makes it optional — objects can omit it.", xp: 20 },
    { id: 6, type: "multiple", question: "What does the `any` type do in TypeScript?", options: ["Matches only primitive types", "Opts out of type checking entirely", "Makes a variable required", "Creates a generic type"], answer: 1, explanation: "`any` disables type checking for that variable — it accepts anything. Using it too much defeats TypeScript's purpose!", xp: 15 },
    { id: 7, type: "code", question: "What does this generic function do?", code: `function identity<T>(arg: T): T {\n  return arg;\n}`, options: ["Only works with strings", "Returns the same type it receives", "Always returns undefined", "Converts any type to string"], answer: 1, explanation: "Generics (`<T>`) let functions work with any type while preserving type info. `identity(5)` returns a `number`, `identity('hi')` returns a `string`.", xp: 25 },
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
  ],
};

const BONUS_QUESTIONS: Question[] = [
  { id: 1001, type: "multiple", question: "Which data structure follows the FIFO rule?", options: ["Stack", "Queue", "Tree", "Graph"], answer: 1, explanation: "FIFO means First In, First Out, which is the defining behavior of a queue.", xp: 15 },
  { id: 1002, type: "multiple", question: "Which data structure follows the LIFO rule?", options: ["Queue", "Stack", "Heap", "Set"], answer: 1, explanation: "LIFO means Last In, First Out, which is the defining behavior of a stack.", xp: 15 },
  { id: 1003, type: "multiple", question: "What is the main purpose of a loop?", options: ["Repeat instructions", "Create a database", "Delete variables", "Compile hardware"], answer: 0, explanation: "Loops repeat a block of instructions while a condition or iteration rule is satisfied.", xp: 15 },
  { id: 1004, type: "multiple", question: "What does a conditional statement usually do?", options: ["Chooses a path based on a condition", "Always repeats forever", "Stores images", "Connects to Wi-Fi"], answer: 0, explanation: "Conditionals such as if/else choose which code path runs based on a condition.", xp: 15 },
  { id: 1005, type: "multiple", question: "What does an array usually store?", options: ["A collection of values", "Only functions", "Only errors", "Only comments"], answer: 0, explanation: "An array stores multiple values that can be accessed by index in many programming languages.", xp: 15 },
  { id: 1006, type: "multiple", question: "What is a function primarily used for?", options: ["Reusable behavior", "Changing the monitor", "Formatting a hard drive", "Creating a keyboard"], answer: 0, explanation: "Functions package reusable logic so it can be called whenever that behavior is needed.", xp: 15 },
  { id: 1007, type: "truefalse", question: "A variable can store data that a program can use later.", options: ["True", "False"], answer: 0, explanation: "TRUE. Variables give programs named storage locations for values.", xp: 15 },
  { id: 1008, type: "multiple", question: "Which operator is commonly used for logical AND?", options: ["&&", "||", "!", "%%"], answer: 0, explanation: "In many C-style languages, && represents logical AND.", xp: 15 },
  { id: 1009, type: "multiple", question: "Which operator is commonly used for logical OR?", options: ["&&", "||", "!", "=="], answer: 1, explanation: "In many C-style languages, || represents logical OR.", xp: 15 },
  { id: 1010, type: "multiple", question: "What is debugging?", options: ["Finding and fixing program problems", "Adding more RAM", "Designing a logo", "Installing a monitor"], answer: 0, explanation: "Debugging is the process of locating, understanding, and fixing bugs in software.", xp: 20 },
  { id: 1011, type: "multiple", question: "What is an algorithm?", options: ["A step-by-step solution", "A type of monitor", "A keyboard shortcut", "A database password"], answer: 0, explanation: "An algorithm is a defined sequence of steps used to solve a problem or perform a task.", xp: 20 },
  { id: 1012, type: "multiple", question: "What does a compiler generally do?", options: ["Translates source code into a form the computer can execute", "Draws images", "Creates Wi-Fi", "Deletes files"], answer: 0, explanation: "A compiler translates source code into machine code or another executable/intermediate representation.", xp: 20 },
  { id: 1013, type: "truefalse", question: "Good variable names can make code easier to understand.", options: ["True", "False"], answer: 0, explanation: "TRUE. Clear names improve readability and make code easier to maintain.", xp: 20 },
];

const expandTo20 = (base: Question[], languageName = "this language"): Question[] => {
  const normalized = base.slice(0, 20).map((q, i) => ({ ...q, id: i + 1 }));
  const needed = Math.max(0, 20 - normalized.length);
  const extras = Array.from({ length: needed }, (_, i) => {
    const q = BONUS_QUESTIONS[i % BONUS_QUESTIONS.length];
    return {
      ...q,
      id: normalized.length + i + 1,
      question: q.question.replace("this language", languageName),
    };
  });
  return [...normalized, ...extras].slice(0, 20);
};

const QUESTIONS: Record<string, Question[]> = Object.fromEntries(
  Object.entries(BASE_QUESTIONS).map(([id, qs]) => [
    id,
    expandTo20(qs, LANGUAGES.find((l) => l.id === id)?.name ?? id),
  ])
) as Record<string, Question[]>;

type Screen = "welcome" | "home" | "profile" | "guidelines" | "modes" | "language" | "music" | "game" | "results" | "duel-setup" | "duel";
type GameMode = "practice" | "battle" | "speed" | "debug" | "survival" | "compiler";
type AnswerState = "idle" | "correct" | "wrong";

type StudentProfile = {
  username: string;
  yearLevel: string;
  course: string;
  school: string;
  photo: string;
};

const SPOTIFY_TRACKS = [
  { id: "palagi-neo", title: "Palagi", artist: "TJ Monterde-inspired OPM", category: "OPM" },
  { id: "2nbotE8GMs2IYte7WgtZBa", title: "Multo", artist: "Cup of Joe", category: "OPM" },
  { id: "61vyXXtY7OSYFRtSzv5ehw", title: "Mundo", artist: "IV OF SPADES", category: "OPM" },
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

// ─── Sound System (Synthesizer Audio Engine) ───────────────────────────────────

class GlobalSoundSystem {
  private ctx: AudioContext | null = null;
  private currentTrack: MusicTrack = SPOTIFY_TRACKS[0];
  private isPlaying = false;
  private isMuted = false;
  private intervalId: any = null;
  private noteIndex = 0;

  constructor() {}

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setTrack(track: MusicTrack) {
    this.currentTrack = track;
    if (this.isPlaying) {
      this.stop();
      this.start();
    }
  }

  public getTrack() {
    return this.currentTrack;
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getIsMuted() {
    return this.isMuted;
  }

  public start() {
    this.initCtx();
    if (!this.ctx) return;
    this.isPlaying = true;

    if (this.intervalId) clearInterval(this.intervalId);

    const baseFreqs = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
    this.intervalId = setInterval(() => {
      if (!this.isPlaying || this.isMuted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const freq = baseFreqs[(this.noteIndex + Math.floor(Math.random() * 3)) % baseFreqs.length];
        osc.type = this.currentTrack.category === "Focus" ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.42);

        this.noteIndex = (this.noteIndex + 1) % baseFreqs.length;
      } catch (e) {}
    }, 400);
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public playSfx(type: "correct" | "wrong" | "attack" | "hit" | "finish") {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      if (type === "correct") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.36);
      } else if (type === "wrong") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(130, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.31);
      } else if (type === "attack") {
        osc.type = "square";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.21);
      } else if (type === "hit") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.26);
      } else if (type === "finish") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1);
        osc.frequency.setValueAtTime(659.25, now + 0.2);
        osc.frequency.setValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.61);
      }
    } catch (e) {}
  }
}

const globalSound = new GlobalSoundSystem();

// ─── UI Helper Components ─────────────────────────────────────────────────────

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

function GlobalMusicControlBar({
  currentTrack,
  onOpenMusic,
}: {
  currentTrack: MusicTrack;
  onOpenMusic: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(globalSound.getIsPlaying());
  const [isMuted, setIsMuted] = useState(globalSound.getIsMuted());

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const playing = globalSound.togglePlay();
    setIsPlaying(playing);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = globalSound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      onClick={onOpenMusic}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-green-500/30 bg-black/80 backdrop-blur-xl shadow-2xl cursor-pointer hover:border-green-400/60 transition-all group"
    >
      <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-green-500/20 text-green-400">
        <Music size={16} className={isPlaying ? "animate-spin" : ""} style={{ animationDuration: "4s" }} />
      </div>
      <div className="min-w-0 max-w-[130px] sm:max-w-[180px]">
        <p className="text-[11px] font-mono font-black text-white truncate">{currentTrack.title}</p>
        <p className="text-[9px] font-mono text-white/40 truncate">{currentTrack.artist}</p>
      </div>
      <div className="flex items-center gap-1 pl-2 border-l border-white/10">
        <button
          onClick={handleTogglePlay}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={handleToggleMute}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  );
}

// ─── Main Screen Components ───────────────────────────────────────────────────

function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="cq-screen cq-page relative overflow-hidden px-3 sm:px-6 py-3 sm:py-6">
      <div className="cq-hero-card relative mx-auto h-full max-w-[1180px] overflow-hidden">
        <div className="cq-topbar">
          <div className="cq-brand"><span className="cq-brand-mark">CQ</span><span>CODEQUEST</span></div>
          <div className="hidden md:flex items-center gap-7 text-[12px] font-semibold text-slate-700"><span>Modes</span><span>Battle</span><span>1V1</span><span>Insights</span><span>About</span></div>
          <button onClick={onContinue} className="cq-pill-button">Get Started <ArrowRight size={15}/></button>
        </div>
        <div className="grid lg:grid-cols-[1.05fr_.95fr] items-center h-[calc(100%-74px)] gap-4 px-7 sm:px-12 lg:px-16 pb-7">
          <div className="relative z-10">
            <p className="cq-kicker">THE CODING ARENA / 01</p>
            <h1 className="cq-mega-title">CODE<br/><span>QUEST.</span></h1>
            <p className="max-w-xl text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mt-5">A competitive coding world where every correct answer becomes energy, every mistake becomes a lesson, and every battle feels like a final boss.</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <button onClick={onContinue} className="cq-primary-button">Enter the arena <ArrowRight size={18}/></button>
              <div className="cq-stat"><strong>20</strong><span>questions / mode</span></div>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500"><span className="cq-chip">Web based /01</span><span className="cq-chip">Real-time feel /02</span><span className="cq-chip">Global music /03</span></div>
          </div>
          <div className="relative h-full min-h-[320px] flex items-center justify-center">
            <motion.div animate={{ rotate: [0, 360], scale: [1, 1.03, 1] }} transition={{ rotate:{duration:26,repeat:Infinity,ease:"linear"}, scale:{duration:4,repeat:Infinity} }} className="cq-orbit cq-orbit-a" />
            <motion.div animate={{ rotate: [360, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="cq-orbit cq-orbit-b" />
            <motion.div animate={{ y:[0,-10,0], rotate:[0,4,-3,0] }} transition={{ duration:5, repeat:Infinity, ease:"easeInOut" }} className="cq-core-3d">
              <div className="cq-core-inner"><Code2 size={58} strokeWidth={2.4}/></div>
            </motion.div>
            <div className="absolute left-0 bottom-6 max-w-[220px] text-[11px] text-slate-500 leading-relaxed"><strong className="block text-slate-900 text-sm mb-1">The coding software that turns skill into spectacle.</strong> Battle, speedrun, debug, survive and challenge a friend.</div>
            <div className="absolute right-0 top-10 flex flex-col gap-1 text-[10px] font-bold text-slate-500"><span>Web based /01</span><span>Competitive /02</span><span>Global /03</span></div>
          </div>
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
  const rank = getRank(totalXP);
  const questionCount = 20;
  const nextRank = RANKS[RANKS.indexOf(rank) + 1];
  const progress = nextRank
    ? Math.max(4, Math.min(100, ((totalXP - rank.minXP) / Math.max(1, nextRank.minXP - rank.minXP)) * 100))
    : 100;

  return (
    <div className="cq-screen relative overflow-hidden px-3 sm:px-5 lg:px-8 py-4 sm:py-6">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_45%_28%,rgba(139,92,246,.16),transparent_30%),radial-gradient(circle_at_75%_70%,rgba(6,182,212,.12),transparent_30%)]" />

      {/* Profile Identity Header */}
      <div className="relative z-20 flex justify-center">
        <motion.button
          onClick={onProfile}
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2, scale: 1.01 }}
          className="group w-full max-w-[520px] rounded-[28px] border border-white/10 bg-black/25 backdrop-blur-2xl p-3 sm:p-4 shadow-2xl shadow-purple-500/10 text-left"
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
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-8">
          <motion.button onClick={onStart} whileHover={{ scale: 1.03 }} whileTap={{ scale: .98 }} className="w-full sm:w-auto min-w-[250px] px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 text-white font-mono font-black text-lg shadow-2xl shadow-purple-500/20">Start Playing <ArrowRight size={20} className="inline ml-2"/></motion.button>
          <button onClick={onDuel} className="w-full sm:w-auto px-7 py-4 rounded-2xl border border-pink-400/30 bg-pink-500/10 text-pink-300 font-mono font-black text-sm hover:bg-pink-500/15"><Users size={17} className="inline mr-2"/>1v1 Friend Arena</button>
        </div>
      </motion.main>
    </div>
  );
}

function ModesScreen({
  onSelect,
  onBack,
  battleDifficulty,
  onDifficultyChange,
}: {
  onSelect: (mode: GameMode) => void;
  onBack: () => void;
  battleDifficulty: "easy" | "normal" | "hard";
  onDifficultyChange: (d: "easy" | "normal" | "hard") => void;
}) {
  const modes = [
    { id: "practice" as GameMode, icon: "🧠", title: "Practice Mode", desc: "Relaxed learning with explanations after every answer.", color: "#8b5cf6", questions: "20 questions" },
    { id: "battle" as GameMode, icon: "⚔️", title: "Battle Mode", desc: "Correct answers unleash ultra-fast combo attacks against the Cyber Beast.", color: "#ef4444", questions: "20 questions" },
    { id: "speed" as GameMode, icon: "⚡", title: "Speed Mode", desc: "Race the clock and finish before time runs out.", color: "#f59e0b", questions: "20 questions · 60 sec" },
    { id: "debug" as GameMode, icon: "🐛", title: "Bug Hunter", desc: "Open broken code, identify the bug, and fix it.", color: "#22c55e", questions: "20 bug fixes" },
    { id: "survival" as GameMode, icon: "🔥", title: "Code Survival", desc: "Keep your run alive. Wrong answers drain your life.", color: "#06b6d4", questions: "20 lives-on-the-line" },
    { id: "compiler" as GameMode, icon: "⌨️", title: "Compiler Lab", desc: "Type missing code directly into the terminal.", color: "#22d3ee", questions: "20 typing challenges" },
  ];

  return (
    <div className="cq-screen px-4 sm:px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8"><ArrowLeft size={16}/> Back</button>
        <div className="text-center mb-10"><Gamepad2 className="mx-auto text-purple-400 mb-3" size={40}/><h2 className="text-4xl md:text-5xl font-mono font-black text-white">CHOOSE YOUR GAME</h2></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modes.map((mode) => (
            <motion.button key={mode.id} onClick={() => onSelect(mode.id)} whileHover={{ y: -5, scale: 1.01 }} whileTap={{ scale: .98 }}
              className="text-left rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all shadow-xl">
              <div className="text-5xl mb-5">{mode.icon}</div>
              <h3 className="text-xl font-mono font-black text-white mb-2">{mode.title}</h3>
              <p className="text-white/50 text-sm font-mono leading-relaxed mb-5">{mode.desc}</p>
              <div className="flex items-center justify-between"><span className="text-xs font-mono" style={{color:mode.color}}>{mode.questions}</span><ArrowRight size={17} className="text-white/30"/></div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MusicSelectionScreen({
  selectedTrack,
  onSelect,
  onBack,
}: {
  selectedTrack: MusicTrack;
  onSelect: (track: MusicTrack) => void;
  onBack: () => void;
}) {
  const [category, setCategory] = useState("All");
  const categories = ["All", "OPM", "The Weeknd", "Pop", "Rock / Alt", "Focus"];
  const visibleTracks = category === "All" ? SPOTIFY_TRACKS : SPOTIFY_TRACKS.filter((t) => t.category === category);

  return (
    <div className="cq-screen px-3 sm:px-5 py-6 sm:py-8 relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8">
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Music size={40} className="mx-auto text-green-400 mb-3" />
          <h2 className="text-4xl md:text-5xl font-mono font-black text-white">CHOOSE SOUNDTRACK</h2>
        </motion.div>

        <div className="rounded-3xl border border-green-500/20 bg-black/40 p-4 sm:p-6 shadow-2xl">
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
              <motion.button key={track.id} whileHover={{ y: -2 }} whileTap={{ scale: .98 }} onClick={() => {
                onSelect(track);
                globalSound.setTrack(track);
              }}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  selectedTrack.id === track.id ? "border-green-400/60 bg-green-500/15 shadow-lg shadow-green-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}>
                <div className="flex items-center gap-3">
                  <Music size={17} className={selectedTrack.id === track.id ? "text-green-300" : "text-white/50"} />
                  <div className="min-w-0">
                    <p className="font-mono font-black text-sm text-white truncate">{track.title}</p>
                    <p className="font-mono text-[10px] text-white/40 truncate">{track.artist}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
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
  onMusic,
  selectedTrack,
}: {
  profile: StudentProfile;
  totalXP: number;
  onSave: (profile: StudentProfile) => void;
  onBack: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  onMusic: () => void;
  selectedTrack: MusicTrack;
}) {
  const [form, setForm] = useState<StudentProfile>(profile);

  const update = (key: keyof StudentProfile, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      username: form.username.trim() || "Code Warrior",
      yearLevel: form.yearLevel || "1st Year",
      course: form.course.trim() || "Computer Science",
      school: form.school.trim() || "Tech Academy",
      photo: form.photo || "",
    });
  };

  return (
    <div className="cq-screen px-6 py-10">
      <div className="max-w-xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8">
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-purple-400" size={28} />
            <h2 className="text-2xl font-mono font-black text-white">Student Profile</h2>
          </div>

          <div className="mb-5">
            <RankBadge totalXP={totalXP} />
          </div>

          <div className="mb-5 rounded-2xl border border-white/10 bg-black/10 p-4 space-y-2">
            <button type="button" onClick={onMusic} className="flex w-full items-center justify-between rounded-xl border border-green-400/20 bg-green-500/5 px-3 py-3 text-left hover:bg-green-500/10 transition-all">
              <span className="flex items-center gap-2">
                <Music size={16} className="text-green-300 shrink-0" />
                <span className="text-sm font-mono text-white/80">Global Music Track</span>
              </span>
              <span className="text-[10px] font-mono text-green-300 truncate">{selectedTrack.title}</span>
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-mono text-white/50">Username</span>
              <input value={form.username} onChange={(e) => update("username", e.target.value)} className="w-full mt-1 rounded-xl border border-white/10 bg-black/20 text-white px-4 py-2.5 font-mono text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-mono text-white/50">Year Level</span>
              <input value={form.yearLevel} onChange={(e) => update("yearLevel", e.target.value)} className="w-full mt-1 rounded-xl border border-white/10 bg-black/20 text-white px-4 py-2.5 font-mono text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-mono text-white/50">Course</span>
              <input value={form.course} onChange={(e) => update("course", e.target.value)} className="w-full mt-1 rounded-xl border border-white/10 bg-black/20 text-white px-4 py-2.5 font-mono text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-mono text-white/50">School</span>
              <input value={form.school} onChange={(e) => update("school", e.target.value)} className="w-full mt-1 rounded-xl border border-white/10 bg-black/20 text-white px-4 py-2.5 font-mono text-sm" />
            </label>
            <button type="submit" className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold">Save Profile</button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function LanguageScreen({ onSelect, onBack }: { onSelect: (lang: string) => void; onBack: () => void }) {
  return (
    <div className="cq-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8"><ArrowLeft size={16}/> Back</button>
        <div className="text-center mb-10"><h2 className="text-4xl font-mono font-black text-white">Pick Your Language</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANGUAGES.map((lang) => (
            <motion.button key={lang.id} onClick={() => onSelect(lang.id)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="text-left p-6 rounded-2xl border border-white/10 bg-white/5">
              <span className="text-4xl block mb-2">{lang.icon}</span>
              <h3 className="text-xl font-mono font-bold text-white">{lang.name}</h3>
              <p className="text-xs text-white/40 mt-1">{lang.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GuidelinesScreen({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  return (
    <div className="cq-screen px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-8"><ArrowLeft size={16} /> Back</button>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
          <h2 className="text-2xl font-mono font-black text-white mb-4">Quiz Guidelines</h2>
          <ul className="space-y-3 text-white/70 font-mono text-sm mb-6 list-disc pl-5">
            <li>Answer questions accurately to build streak and earn XP.</li>
            <li>In Battle Mode, correct answers hit the Cyber Beast with massive particle fx.</li>
            <li>In 1v1 Arena, players take turns on the same device in a intense real-time clash.</li>
          </ul>
          <button onClick={onContinue} className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold">Choose Language <ArrowRight size={17} className="inline ml-2" /></button>
        </div>
      </div>
    </div>
  );
}

// ─── HIGH-VOLTAGE BATTLE MODE SCREEN ───────────────────────────────────────────

function BattleGameScreen({
  langId,
  onFinish,
}: {
  langId: string;
  onFinish: (score: number, xp: number, correct: number) => void;
}) {
  const questions = QUESTIONS[langId] || QUESTIONS.javascript;
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [playerHP, setPlayerHP] = useState(100);
  const [bossHP, setBossHP] = useState(100);
  const [attackAnim, setAttackAnim] = useState<"player" | "boss" | null>(null);
  const [combo, setCombo] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [fxText, setFxText] = useState<string | null>(null);

  const currentQ = questions[qIndex];

  const handleAnswer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);

    const isCorrect = index === currentQ.answer;

    if (isCorrect) {
      globalSound.playSfx("correct");
      globalSound.playSfx("attack");
      setAttackAnim("player");
      setCombo((c) => c + 1);
      setCorrectCount((c) => c + 1);
      setTotalXP((x) => x + currentQ.xp * (1 + combo * 0.2));
      setBossHP((hp) => Math.max(0, hp - 12));
      setFxText(`CRITICAL HIT! +${Math.round(currentQ.xp * (1 + combo * 0.2))} XP`);
    } else {
      globalSound.playSfx("wrong");
      globalSound.playSfx("hit");
      setAttackAnim("boss");
      setCombo(0);
      setPlayerHP((hp) => Math.max(0, hp - 18));
      setFxText("COUNTERED! -18 HP");
    }

    setTimeout(() => {
      setAttackAnim(null);
      setFxText(null);
      setSelected(null);

      if (qIndex < questions.length - 1 && playerHP > 0 && bossHP > 0) {
        setQIndex((i) => i + 1);
      } else {
        globalSound.playSfx("finish");
        onFinish(Math.round((correctCount / questions.length) * 100), totalXP, correctCount);
      }
    }, 1200);
  };

  return (
    <div className="cq-screen p-4 sm:p-6 relative overflow-hidden bg-slate-950 flex flex-col justify-between">
      {/* Visual FX background pulses */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.15),transparent_70%)] pointer-events-none" />

      {/* Top Combat Stage Header */}
      <div className="relative z-10 grid grid-cols-2 gap-4 max-w-4xl mx-auto w-full border border-red-500/30 bg-black/60 rounded-3xl p-4 backdrop-blur-xl">
        {/* Player Stats */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs font-mono text-cyan-400 font-bold">
            <span>WARRIOR</span>
            <span>{playerHP} HP</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-cyan-500/30">
            <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" animate={{ width: `${playerHP}%` }} />
          </div>
        </div>

        {/* Boss Stats */}
        <div className="flex flex-col gap-1 text-right">
          <div className="flex justify-between items-center text-xs font-mono text-red-400 font-bold">
            <span>CYBER BEAST</span>
            <span>{bossHP} HP</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-red-500/30">
            <motion.div className="h-full bg-gradient-to-r from-red-600 to-orange-500" animate={{ width: `${bossHP}%` }} />
          </div>
        </div>
      </div>

      {/* Center Dynamic Battle Field */}
      <div className="relative z-10 flex items-center justify-between max-w-2xl mx-auto w-full my-6 min-h-[160px]">
        {/* Player Sprite Avatar */}
        <motion.div
          animate={attackAnim === "player" ? { x: [0, 120, 0], scale: [1, 1.3, 1] } : attackAnim === "boss" ? { x: [-10, 10, -10, 0] } : { y: [0, -8, 0] }}
          transition={{ duration: 0.5, repeat: attackAnim ? 0 : Infinity }}
          className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
        >
          <Swords className="text-cyan-300" size={40} />
          {combo > 1 && (
            <span className="absolute -top-3 -right-3 bg-yellow-400 text-black font-mono font-black text-xs px-2 py-0.5 rounded-full shadow-lg">
              {combo}x COMBO
            </span>
          )}
        </motion.div>

        {/* Center FX Overlay */}
        <AnimatePresence>
          {fxText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1.2, y: -20 }}
              exit={{ opacity: 0 }}
              className="font-mono font-black text-xl sm:text-2xl text-yellow-300 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] text-center"
            >
              {fxText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boss Sprite Avatar */}
        <motion.div
          animate={attackAnim === "boss" ? { x: [0, -120, 0], scale: [1, 1.3, 1] } : attackAnim === "player" ? { x: [10, -10, 10, 0] } : { y: [0, 8, 0] }}
          transition={{ duration: 0.5, repeat: attackAnim ? 0 : Infinity }}
          className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-red-500/20 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
        >
          <Flame className="text-red-500" size={44} />
        </motion.div>
      </div>

      {/* Battle Question Box */}
      <div className="relative z-10 max-w-3xl mx-auto w-full bg-black/80 border border-white/10 rounded-3xl p-5 backdrop-blur-2xl">
        <p className="text-xs font-mono text-red-400 font-bold mb-2">BATTLE STAGE {qIndex + 1} / {questions.length}</p>
        <h3 className="text-lg sm:text-xl font-mono font-bold text-white mb-4">{currentQ.question}</h3>
        {currentQ.code && <div className="mb-4"><CodeBlock code={currentQ.code} /></div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              disabled={selected !== null}
              onClick={() => handleAnswer(idx)}
              className={`p-4 rounded-xl text-left font-mono text-sm border transition-all ${
                selected === idx
                  ? idx === currentQ.answer
                    ? "bg-green-500/30 border-green-400 text-white"
                    : "bg-red-500/30 border-red-400 text-white"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-red-400/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HIGH-VOLTAGE 1V1 DUEL ARENA ─────────────────────────────────────────────

function DuelArenaScreen({
  p1Name,
  p2Name,
  langId,
  onFinish,
}: {
  p1Name: string;
  p2Name: string;
  langId: string;
  onFinish: (winner: string, p1Score: number, p2Score: number) => void;
}) {
  const questions = QUESTIONS[langId] || QUESTIONS.javascript;
  const [turn, setTurn] = useState<1 | 2>(1);
  const [qIndex, setQIndex] = useState(0);
  const [p1HP, setP1HP] = useState(100);
  const [p2HP, setP2HP] = useState(100);
  const [selected, setSelected] = useState<number | null>(null);
  const [fx, setFx] = useState<string | null>(null);

  const currentQ = questions[qIndex];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);

    const isCorrect = idx === currentQ.answer;

    if (turn === 1) {
      if (isCorrect) {
        globalSound.playSfx("correct");
        setP2HP((hp) => Math.max(0, hp - 20));
        setFx(`${p1Name} STRIKES FOR 20 DMG!`);
      } else {
        globalSound.playSfx("wrong");
        setP1HP((hp) => Math.max(0, hp - 10));
        setFx(`${p1Name} MISSED! 10 BACKFIRE DMG!`);
      }
    } else {
      if (isCorrect) {
        globalSound.playSfx("correct");
        setP1HP((hp) => Math.max(0, hp - 20));
        setFx(`${p2Name} STRIKES FOR 20 DMG!`);
      } else {
        globalSound.playSfx("wrong");
        setP2HP((hp) => Math.max(0, hp - 10));
        setFx(`${p2Name} MISSED! 10 BACKFIRE DMG!`);
      }
    }

    setTimeout(() => {
      setSelected(null);
      setFx(null);

      if (p1HP <= 0 || p2HP <= 0 || qIndex >= questions.length - 1) {
        const winner = p1HP > p2HP ? p1Name : p2HP > p1HP ? p2Name : "DRAW";
        onFinish(winner, p1HP, p2HP);
      } else {
        setTurn(turn === 1 ? 2 : 1);
        if (turn === 2) setQIndex((i) => i + 1);
      }
    }, 1200);
  };

  return (
    <div className="cq-screen p-4 sm:p-6 relative bg-zinc-950 flex flex-col justify-between">
      {/* 1v1 Status Header */}
      <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto w-full border border-purple-500/30 bg-black/80 rounded-3xl p-4 backdrop-blur-2xl">
        {/* Player 1 Status */}
        <div className={`p-3 rounded-2xl border transition-all ${turn === 1 ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.3)]" : "border-white/5 opacity-60"}`}>
          <div className="flex justify-between items-center text-xs font-mono text-cyan-300 font-bold mb-1">
            <span>P1: {p1Name}</span>
            <span>{p1HP} HP</span>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400" style={{ width: `${p1HP}%` }} />
          </div>
        </div>

        {/* Player 2 Status */}
        <div className={`p-3 rounded-2xl border transition-all ${turn === 2 ? "border-pink-400 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.3)]" : "border-white/5 opacity-60"}`}>
          <div className="flex justify-between items-center text-xs font-mono text-pink-300 font-bold mb-1">
            <span>P2: {p2Name}</span>
            <span>{p2HP} HP</span>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-pink-400" style={{ width: `${p2HP}%` }} />
          </div>
        </div>
      </div>

      {/* Turn Indicator & FX */}
      <div className="text-center my-4">
        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-mono font-black ${turn === 1 ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400" : "bg-pink-500/20 text-pink-300 border border-pink-400"}`}>
          {turn === 1 ? `${p1Name.toUpperCase()}'S TURN` : `${p2Name.toUpperCase()}'S TURN`}
        </span>
        {fx && <p className="mt-2 text-yellow-300 font-mono font-bold text-sm animate-bounce">{fx}</p>}
      </div>

      {/* Question Arena */}
      <div className="max-w-3xl mx-auto w-full bg-black/80 border border-white/10 rounded-3xl p-5">
        <p className="text-xs font-mono text-white/40 mb-2">ROUND {qIndex + 1}</p>
        <h3 className="text-lg font-mono font-bold text-white mb-4">{currentQ.question}</h3>
        {currentQ.code && <div className="mb-4"><CodeBlock code={currentQ.code} /></div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              disabled={selected !== null}
              onClick={() => handleSelect(idx)}
              className={`p-4 rounded-xl text-left font-mono text-sm border transition-all ${
                selected === idx
                  ? idx === currentQ.answer
                    ? "bg-green-500/30 border-green-400 text-white"
                    : "bg-red-500/30 border-red-400 text-white"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Standard Game Screen (Practice, Speed, Bug Hunter, etc.) ────────────────

function StandardGameScreen({
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
  const questions = mode === "debug" ? expandTo20(debugQuestions, langId) : allQuestions.slice(0, 20);

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [totalXP, setTotalXP] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQ = questions[qIndex];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);

    if (idx === currentQ.answer) {
      setAnswerState("correct");
      globalSound.playSfx("correct");
      setCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);
      setTotalXP((x) => x + currentQ.xp);
    } else {
      setAnswerState("wrong");
      globalSound.playSfx("wrong");
      setStreak(0);
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelected(null);
    setAnswerState("idle");
    setShowExplanation(false);

    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      globalSound.playSfx("finish");
      onFinish(Math.round((correctCount / questions.length) * 100), totalXP, correctCount);
    }
  };

  return (
    <div className="cq-screen p-4 sm:p-6 max-w-3xl mx-auto flex flex-col justify-between">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
        <div>
          <span className="text-xs font-mono text-purple-400 font-bold uppercase">{mode} MODE</span>
          <p className="text-white font-mono font-bold text-sm">Question {qIndex + 1} of {questions.length}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-yellow-400 font-bold">STREAK: {streak} 🔥</span>
          <p className="text-cyan-400 font-mono font-bold text-sm">XP: {totalXP}</p>
        </div>
      </div>

      {/* Main Question Box */}
      <div className="bg-black/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
        <h3 className="text-xl font-mono font-bold text-white mb-4">{currentQ.question}</h3>
        {currentQ.code && <div className="mb-4"><CodeBlock code={currentQ.code} /></div>}

        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              disabled={selected !== null}
              onClick={() => handleSelect(idx)}
              className={`w-full p-4 rounded-xl text-left font-mono text-sm border transition-all ${
                selected === idx
                  ? idx === currentQ.answer
                    ? "bg-green-500/30 border-green-400 text-white"
                    : "bg-red-500/30 border-red-400 text-white"
                  : selected !== null && idx === currentQ.answer
                  ? "bg-green-500/20 border-green-500/50 text-white"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {showExplanation && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-xs font-mono text-cyan-300 font-bold mb-1">EXPLANATION</p>
            <p className="text-xs font-mono text-white/70 leading-relaxed">{currentQ.explanation}</p>
            <button onClick={handleNext} className="mt-4 w-full py-3 rounded-xl bg-purple-600 text-white font-mono font-bold hover:bg-purple-500 transition-all">
              {qIndex < questions.length - 1 ? "Next Challenge" : "Complete Quest"}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  score,
  xp,
  correct,
  onHome,
}: {
  score: number;
  xp: number;
  correct: number;
  onHome: () => void;
}) {
  return (
    <div className="cq-screen p-6 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-black/80 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-2xl">
        <Trophy size={50} className="mx-auto text-yellow-400 mb-4" />
        <h2 className="text-3xl font-mono font-black text-white mb-2">QUEST COMPLETE!</h2>
        <p className="text-white/40 font-mono text-sm mb-6">Here is how you performed in the arena.</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-xs font-mono text-white/40">ACCURACY</p>
            <p className="text-2xl font-mono font-black text-green-400">{score}%</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-xs font-mono text-white/40">TOTAL XP</p>
            <p className="text-2xl font-mono font-black text-cyan-400">+{xp}</p>
          </div>
        </div>

        <button onClick={onHome} className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold">
          Return to Arena
        </button>
      </motion.div>
    </div>
  );
}

// ─── Main App Router ──────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selectedLang, setSelectedLang] = useState<string>("javascript");
  const [gameMode, setGameMode] = useState<GameMode>("practice");
  const [battleDifficulty, setBattleDifficulty] = useState<"easy" | "normal" | "hard">("normal");
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack>(SPOTIFY_TRACKS[0]);
  const [darkMode, setDarkMode] = useState(true);

  const [profile, setProfile] = useState<StudentProfile>({
    username: "Code Warrior",
    yearLevel: "1st Year",
    course: "BS Information Technology",
    school: "Tech University",
    photo: "",
  });

  const [totalXP, setTotalXP] = useState(150);
  const [lastResults, setLastResults] = useState({ score: 0, xp: 0, correct: 0 });

  // 1v1 Setup state
  const [p1Name, setP1Name] = useState("Player 1");
  const [p2Name, setP2Name] = useState("Player 2");

  const handleFinishGame = (score: number, xp: number, correct: number) => {
    setLastResults({ score, xp, correct });
    setTotalXP((prev) => prev + xp);
    setScreen("results");
  };

  return (
    <div className={`cq-app min-h-screen ${darkMode ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900"}`}>
      {/* Global Soundtrack Floating Controller */}
      <GlobalMusicControlBar
        currentTrack={selectedTrack}
        onOpenMusic={() => setScreen("music")}
      />

      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <WelcomeScreen key="welcome" onContinue={() => setScreen("home")} />
        )}

        {screen === "home" && (
          <HomeScreen
            key="home"
            profile={profile}
            totalXP={totalXP}
            darkMode={darkMode}
            onStart={() => setScreen("modes")}
            onProfile={() => setScreen("profile")}
            onGuidelines={() => setScreen("guidelines")}
            onToggleTheme={() => setDarkMode(!darkMode)}
            onDuel={() => setScreen("duel-setup")}
          />
        )}

        {screen === "profile" && (
          <ProfileScreen
            key="profile"
            profile={profile}
            totalXP={totalXP}
            darkMode={darkMode}
            selectedTrack={selectedTrack}
            onSave={(p) => { setProfile(p); setScreen("home"); }}
            onBack={() => setScreen("home")}
            onToggleTheme={() => setDarkMode(!darkMode)}
            onMusic={() => setScreen("music")}
          />
        )}

        {screen === "music" && (
          <MusicSelectionScreen
            key="music"
            selectedTrack={selectedTrack}
            onSelect={(t) => { setSelectedTrack(t); setScreen("home"); }}
            onBack={() => setScreen("home")}
          />
        )}

        {screen === "modes" && (
          <ModesScreen
            key="modes"
            battleDifficulty={battleDifficulty}
            onDifficultyChange={setBattleDifficulty}
            onSelect={(mode) => {
              setGameMode(mode);
              setScreen("language");
            }}
            onBack={() => setScreen("home")}
          />
        )}

        {screen === "language" && (
          <LanguageScreen
            key="language"
            onSelect={(lang) => {
              setSelectedLang(lang);
              setScreen("game");
            }}
            onBack={() => setScreen("modes")}
          />
        )}

        {screen === "guidelines" && (
          <GuidelinesScreen
            key="guidelines"
            onContinue={() => setScreen("language")}
            onBack={() => setScreen("home")}
          />
        )}

        {screen === "game" && gameMode === "battle" && (
          <BattleGameScreen
            key="battle-game"
            langId={selectedLang}
            onFinish={handleFinishGame}
          />
        )}

        {screen === "game" && gameMode !== "battle" && (
          <StandardGameScreen
            key="standard-game"
            langId={selectedLang}
            mode={gameMode}
            onFinish={handleFinishGame}
          />
        )}

        {screen === "duel-setup" && (
          <div key="duel-setup" className="cq-screen p-6 flex items-center justify-center">
            <div className="max-w-md w-full bg-black/80 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl">
              <h2 className="text-2xl font-mono font-black text-white mb-4">1v1 Local Arena Setup</h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-mono text-white/50">Player 1 Name</span>
                  <input value={p1Name} onChange={(e) => setP1Name(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-white" />
                </label>
                <label className="block">
                  <span className="text-xs font-mono text-white/50">Player 2 Name</span>
                  <input value={p2Name} onChange={(e) => setP2Name(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-white" />
                </label>
                <button
                  onClick={() => setScreen("duel")}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-mono font-bold"
                >
                  Start 1v1 Battle
                </button>
              </div>
            </div>
          </div>
        )}

        {screen === "duel" && (
          <DuelArenaScreen
            key="duel"
            p1Name={p1Name}
            p2Name={p2Name}
            langId={selectedLang}
            onFinish={(winner, p1, p2) => {
              setLastResults({ score: 100, xp: 100, correct: p1 > p2 ? 10 : 5 });
              setScreen("results");
            }}
          />
        )}

        {screen === "results" && (
          <ResultsScreen
            key="results"
            score={lastResults.score}
            xp={lastResults.xp}
            correct={lastResults.correct}
            onHome={() => setScreen("home")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
