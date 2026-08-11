import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Code2, Zap, Trophy, Star, ArrowRight, RotateCcw, CheckCircle2, XCircle, Flame,
  Target, BookOpenCheck, Moon, Sun, Music, ArrowLeft, Swords, Camera, Gamepad2,
  Users, Sparkles, Heart, Volume2, Clock, ShieldAlert, Award, UserCheck
} from "lucide-react";

// ─── Data & Constants ────────────────────────────────────────────────────────

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

const CHARACTERS = [
  { id: "knight", name: "Code Knight", icon: "🛡️", skill: "Cyber Shield", color: "#3b82f6" },
  { id: "mage", name: "Cyber Mage", icon: "🧙‍♂️", skill: "Syntax Spell", color: "#a855f7" },
  { id: "ninja", name: "Hack Ninja", icon: "🥷", skill: "Logic Strike", color: "#10b981" },
  { id: "samurai", name: "Algo Samurai", icon: "⚔️", skill: "Slice Algorithm", color: "#f43f5e" },
];

const AI_DIFFICULTIES = [
  { id: "easy", name: "Easy AI", hp: 80, damage: 10, color: "#22c55e", icon: "🤖" },
  { id: "medium", name: "Medium AI", hp: 100, damage: 15, color: "#f59e0b", icon: "👾" },
  { id: "hard", name: "Hard AI", hp: 120, damage: 20, color: "#ef4444", icon: "👺" },
  { id: "boss", name: "Code Boss", hp: 150, damage: 25, color: "#a855f7", icon: "🐉" },
];

const ACHIEVEMENTS = [
  { id: "first_win", name: "First Victory", desc: "Win your first 1v1 duel or battle mode", icon: "🏆" },
  { id: "speed_demon", name: "Speed Demon", desc: "Complete Speed Mode with time remaining", icon: "⚡" },
  { id: "streak_3", name: "Hot Streak", desc: "Get a 3-answer streak", icon: "🔥" },
  { id: "level_5", name: "Rising Star", desc: "Reach Level 5 rank", icon: "⭐" },
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
    { id: 1, type: "multiple", question: "What keyword do you use to define a function in Python?", options: ["function", "def", "func", "define"], answer: 1, explanation: "`def` is the keyword used to define functions in Python.", xp: 10 },
    { id: 2, type: "code", question: "What does this code print?", code: `x = [1, 2, 3, 4, 5]\nprint(x[2])`, options: ["1", "2", "3", "5"], answer: 2, explanation: "Python lists are zero-indexed. `x[2]` is 3.", xp: 15 },
    { id: 3, type: "multiple", question: "Which of these is the correct way to write a comment in Python?", options: ["// Comment", "/* Comment */", "# Comment", "-- Comment"], answer: 2, explanation: "Python uses `#` for single-line comments.", xp: 10 },
    { id: 4, type: "code", question: "What is the output of this code?", code: `name = "Alice"\nprint(f"Hello, {name}!")`, options: ["Hello, name!", "Hello, Alice!", "{name}", "Error"], answer: 1, explanation: "f-strings embed variables inside `{}`.", xp: 15 },
    { id: 5, type: "truefalse", question: "In Python, indentation is required to define code blocks.", options: ["True", "False"], answer: 0, explanation: "TRUE! Indentation defines code blocks in Python.", xp: 10 },
  ],
  javascript: [
    { id: 1, type: "multiple", question: "Which keyword declares a variable that CANNOT be reassigned?", options: ["var", "let", "const", "fixed"], answer: 2, explanation: "`const` declares a constant variable.", xp: 10 },
    { id: 2, type: "code", question: "What does this code output?", code: `console.log(typeof "Hello");`, options: ["string", "text", "String", "undefined"], answer: 0, explanation: "`typeof` returns `'string'` for string values.", xp: 15 },
    { id: 3, type: "multiple", question: "Which method adds an item to the END of an array?", options: ["push()", "pop()", "shift()", "unshift()"], answer: 0, explanation: "`push()` adds elements to the end of an array.", xp: 10 },
  ]
};

// ─── Types & Utility Helpers ──────────────────────────────────────────────────

type Screen = "welcome" | "home" | "profile" | "guidelines" | "modes" | "language" | "game" | "results" | "duel-setup" | "duel" | "achievements";
type GameMode = "practice" | "battle" | "speed";
type AnswerState = "idle" | "correct" | "wrong";

type StudentProfile = {
  username: string;
  yearLevel: string;
  course: string;
  school: string;
  photo: string;
};

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

// ─── Helper UI Components ─────────────────────────────────────────────────────

function XPBar({ current, max, level }: { current: number; max: number; level: number }) {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1">
        <Star size={12} className="text-yellow-400" />
        <span className="text-yellow-400 font-mono font-bold text-xs">Lv.{level}</span>
      </div>
      <div className="flex-1 h-2 bg-black/20 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-mono text-foreground-subtle">{current}/{max} XP</span>
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

function RankBadge({ totalXP, compact = false }: { totalXP: number; compact?: boolean }) {
  const rank = getRank(totalXP);
  return (
    <div className={`flex items-center gap-2 rounded-xl border bg-black/10 dark:bg-white/5 ${compact ? "px-2.5 py-1.5" : "px-3 py-2"}`} style={{ borderColor: `${rank.color}55` }}>
      <span className={compact ? "text-base" : "text-xl"}>{rank.icon}</span>
      <div className="min-w-0">
        <p className="font-mono font-black truncate" style={{ color: rank.color, fontSize: compact ? 10 : 12 }}>{rank.name}</p>
        <p className="text-foreground-subtle font-mono" style={{ fontSize: compact ? 8 : 9 }}>{totalXP} XP</p>
      </div>
      <Trophy size={compact ? 12 : 15} style={{ color: rank.color }} className="ml-auto shrink-0" />
    </div>
  );
}

// ─── Main Screens ─────────────────────────────────────────────────────────────

function WelcomeScreen({ onContinue, darkMode, onToggleTheme }: { onContinue: () => void; darkMode: boolean; onToggleTheme: () => void }) {
  return (
    <div className="min-h-screen px-6 py-10 relative overflow-hidden flex flex-col justify-center items-center">
      <div className="absolute top-5 right-5">
        <button onClick={onToggleTheme} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 font-mono text-xs">
          {darkMode ? <Sun size={15} /> : <Moon size={15} />} {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
      <div className="max-w-3xl text-center">
        <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 4 }}
          className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-cyan-500 items-center justify-center shadow-2xl mb-6">
          <Code2 size={38} className="text-white" />
        </motion.div>
        <p className="text-purple-400 font-mono font-bold tracking-widest text-sm mb-3">WELCOME TO</p>
        <h1 className="text-6xl md:text-8xl font-mono font-black tracking-tight mb-4">
          <span>Code</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Quest</span>
        </h1>
        <p className="text-foreground-subtle max-w-xl mx-auto mb-8 font-mono text-sm md:text-base">
          Choose characters, battle AI or friends 1v1, unlock achievements, and master multiple programming languages.
        </p>
        <button onClick={onContinue} className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-black text-lg shadow-xl hover:opacity-90 transition-all">
          Start Quest <ArrowRight size={20} />
        </button>
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
  onAchievements,
}: {
  onStart: () => void;
  onProfile: () => void;
  onGuidelines: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
  profile: StudentProfile;
  totalXP: number;
  onDuel: () => void;
  onAchievements: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-5 right-5 z-10 flex flex-wrap justify-end gap-2">
        <button onClick={onAchievements} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 font-mono text-xs">
          <Award size={14} /> Achievements
        </button>
        <button onClick={onProfile} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 font-mono text-xs">
          <UserCheck size={14} /> {profile.username ? profile.username : "Profile"}
        </button>
        <button onClick={onGuidelines} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 font-mono text-xs">
          <BookOpenCheck size={14} /> Guidelines
        </button>
        <button onClick={onToggleTheme} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 font-mono text-xs">
          {darkMode ? <Sun size={14} /> : <Moon size={14} />} {darkMode ? "Light" : "Dark"}
        </button>
      </div>

      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-xs font-mono text-purple-400">CodeQuest Arena v2.0</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-mono font-black mb-2 tracking-tight">
          <span>Code</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Quest</span>
        </h1>
        <p className="text-foreground-subtle text-sm font-mono mb-8">Gamified Coding Challenges & 1v1 Arena</p>

        {profile.username && (
          <div className="mb-8 p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="text-left">
              <p className="font-mono font-bold">{profile.username}</p>
              <p className="text-xs font-mono text-foreground-subtle">{profile.course} · {profile.yearLevel}</p>
            </div>
            <RankBadge totalXP={totalXP} compact />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button onClick={onStart} className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold text-lg shadow-lg">
            Play Solo Modes <ArrowRight size={18} className="inline ml-1" />
          </button>
          <button onClick={onDuel} className="w-full py-4 rounded-2xl border border-pink-500/40 bg-pink-500/10 text-pink-500 font-mono font-bold text-lg hover:bg-pink-500/20 transition-all">
            <Swords size={18} className="inline mr-2" /> 1v1 Friend Arena
          </button>
        </div>
      </div>
    </div>
  );
}

function AchievementsScreen({ unlockedIds, onBack }: { unlockedIds: string[]; onBack: () => void }) {
  return (
    <div className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-foreground-subtle hover:text-foreground font-mono text-sm mb-6"><ArrowLeft size={16} /> Back</button>
      <h2 className="text-3xl font-mono font-black mb-2">Achievements</h2>
      <p className="text-foreground-subtle font-mono text-sm mb-6">Track your coding milestones.</p>
      
      <div className="space-y-3">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = unlockedIds.includes(ach.id);
          return (
            <div key={ach.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${unlocked ? "border-yellow-500/40 bg-yellow-500/10" : "border-black/10 dark:border-white/10 opacity-50"}`}>
              <div className="text-3xl">{ach.icon}</div>
              <div className="flex-1">
                <h3 className="font-mono font-bold text-sm">{ach.name}</h3>
                <p className="text-xs font-mono text-foreground-subtle">{ach.desc}</p>
              </div>
              <span className="text-xs font-mono font-bold">{unlocked ? "UNLOCKED" : "LOCKED"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModesScreen({ onSelect, onBack }: { onSelect: (mode: GameMode) => void; onBack: () => void }) {
  const modes = [
    { id: "practice" as GameMode, icon: "🧠", title: "Practice Mode", desc: "Relaxed learning with explanations after every answer.", color: "#8b5cf6" },
    { id: "battle" as GameMode, icon: "⚔️", title: "Battle Mode", desc: "Select your Hero and AI Difficulty! Attack the opponent with correct answers.", color: "#ef4444" },
    { id: "speed" as GameMode, icon: "⚡", title: "Speed Mode", desc: "Timed challenge per question! Answer quickly before time runs out.", color: "#f59e0b" },
  ];
  return (
    <div className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-foreground-subtle font-mono text-sm mb-8"><ArrowLeft size={16}/> Back</button>
      <div className="text-center mb-10"><Gamepad2 className="mx-auto text-purple-400 mb-3" size={36}/><h2 className="text-4xl font-mono font-black">Choose Your Mode</h2></div>
      <div className="grid md:grid-cols-3 gap-4">
        {modes.map((mode) => (
          <button key={mode.id} onClick={() => onSelect(mode.id)} className="text-left rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-6 hover:border-purple-500/50 transition-all">
            <div className="text-5xl mb-5">{mode.icon}</div>
            <h3 className="text-xl font-mono font-black mb-2">{mode.title}</h3>
            <p className="text-foreground-subtle text-sm font-mono leading-relaxed">{mode.desc}</p>
          </button>
        ))}
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
  const allQuestions = QUESTIONS[langId] || QUESTIONS["python"];
  const questions = mode === "speed" ? allQuestions.slice(0, 5) : allQuestions;
  const lang = LANGUAGES.find((l) => l.id === langId) || LANGUAGES[0];

  // Battle Mode Options
  const [selectedHero, setSelectedHero] = useState(CHARACTERS[0]);
  const [selectedAI, setSelectedAI] = useState(AI_DIFFICULTIES[1]);
  const [battleStarted, setBattleStarted] = useState(mode !== "battle");

  // State
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [totalXP, setTotalXP] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [xpLevel, setXpLevel] = useState(1);

  // Speed Mode Timer State
  const TIMER_DEFAULT = 15;
  const [timeLeft, setTimeLeft] = useState(TIMER_DEFAULT);

  // Battle HP & Animations
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [playerAction, setPlayerAction] = useState<"idle" | "attack" | "hit">("idle");
  const [enemyAction, setEnemyAction] = useState<"idle" | "attack" | "hit">("idle");

  const currentQ = questions[qIndex];
  const isLast = qIndex === questions.length - 1;

  // Speed Mode Timer Effect
  useEffect(() => {
    if (mode !== "speed" || answerState !== "idle" || !battleStarted) return;
    if (timeLeft <= 0) {
      handleSelect(-1); // Time out wrong answer
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [mode, answerState, timeLeft, battleStarted]);

  const handleSelect = useCallback((idx: number) => {
    if (answerState !== "idle") return;
    setSelected(idx);
    const correct = idx === currentQ.answer;
    setAnswerState(correct ? "correct" : "wrong");
    setShowExplanation(true);

    if (correct) {
      const timeBonus = mode === "speed" ? timeLeft : 0;
      const earned = currentQ.xp + timeBonus;
      setTotalXP((prev) => prev + earned);
      setCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);

      if (mode === "battle") {
        setPlayerAction("attack");
        setTimeout(() => {
          setPlayerAction("idle");
          setEnemyAction("hit");
          setEnemyHP((hp) => Math.max(0, hp - 25));
          setTimeout(() => setEnemyAction("idle"), 500);
        }, 500);
      }
    } else {
      setStreak(0);
      if (mode === "battle") {
        setEnemyAction("attack");
        setTimeout(() => {
          setEnemyAction("idle");
          setPlayerAction("hit");
          setPlayerHP((hp) => Math.max(0, hp - selectedAI.damage));
          setTimeout(() => setPlayerAction("idle"), 500);
        }, 500);
      }
    }
  }, [answerState, currentQ, mode, selectedAI, timeLeft]);

  const handleNext = () => {
    if (isLast) {
      onFinish(Math.round((correctCount / questions.length) * 100), totalXP, correctCount);
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setAnswerState("idle");
    setShowExplanation(false);
    setTimeLeft(TIMER_DEFAULT);
  };

  if (mode === "battle" && !battleStarted) {
    return (
      <div className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
        <h2 className="text-3xl font-mono font-black mb-6 text-center">Battle Mode Setup</h2>
        
        {/* Hero Select */}
        <div className="mb-6">
          <p className="text-xs font-mono font-bold mb-3 text-foreground-subtle">SELECT YOUR HERO</p>
          <div className="grid grid-cols-2 gap-3">
            {CHARACTERS.map((hero) => (
              <button key={hero.id} onClick={() => setSelectedHero(hero)}
                className={`p-4 rounded-2xl border text-left ${selectedHero.id === hero.id ? "border-purple-500 bg-purple-500/10" : "border-black/10 dark:border-white/10"}`}>
                <span className="text-3xl">{hero.icon}</span>
                <p className="font-mono font-bold text-sm mt-2">{hero.name}</p>
                <p className="text-[10px] font-mono text-foreground-subtle">Skill: {hero.skill}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Select */}
        <div className="mb-8">
          <p className="text-xs font-mono font-bold mb-3 text-foreground-subtle">SELECT AI DIFFICULTY</p>
          <div className="grid grid-cols-2 gap-3">
            {AI_DIFFICULTIES.map((ai) => (
              <button key={ai.id} onClick={() => setSelectedAI(ai)}
                className={`p-3 rounded-2xl border text-left ${selectedAI.id === ai.id ? "border-red-500 bg-red-500/10" : "border-black/10 dark:border-white/10"}`}>
                <span className="text-2xl">{ai.icon}</span>
                <p className="font-mono font-bold text-xs mt-1">{ai.name}</p>
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => { setEnemyHP(selectedAI.hp); setBattleStarted(true); }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-red-600 text-white font-mono font-bold text-lg shadow-lg">
          Start Battle
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto flex flex-col justify-between">
      <div>
        {/* Speed Timer Bar */}
        {mode === "speed" && (
          <div className="mb-4 flex items-center justify-between p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
            <span className="flex items-center gap-2 font-mono text-xs font-bold text-yellow-500"><Clock size={16}/> Time Remaining:</span>
            <span className="font-mono font-black text-lg text-yellow-500">{timeLeft}s</span>
          </div>
        )}

        {/* Animated Battle Arena */}
        {mode === "battle" && (
          <div className="mb-6 p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              {/* Hero Sprite Animation */}
              <motion.div animate={playerAction === "attack" ? { x: [0, 40, 0] } : playerAction === "hit" ? { opacity: [1, 0.3, 1] } : { y: [0, -4, 0] }} transition={{ repeat: playerAction === "idle" ? Infinity : 0, duration: 1.5 }} className="text-center">
                <div className="text-5xl mb-2">{selectedHero.icon}</div>
                <p className="text-xs font-mono font-bold">{selectedHero.name}</p>
                <div className="w-24 h-2 bg-black/20 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${(playerHP / 100) * 100}%` }} />
                </div>
              </motion.div>

              <span className="font-mono font-black text-red-500 text-xl">VS</span>

              {/* AI Sprite Animation */}
              <motion.div animate={enemyAction === "attack" ? { x: [0, -40, 0] } : enemyAction === "hit" ? { opacity: [1, 0.3, 1] } : { y: [0, -4, 0] }} transition={{ repeat: enemyAction === "idle" ? Infinity : 0, duration: 1.5 }} className="text-center">
                <div className="text-5xl mb-2">{selectedAI.icon}</div>
                <p className="text-xs font-mono font-bold">{selectedAI.name}</p>
                <div className="w-24 h-2 bg-black/20 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${(enemyHP / selectedAI.hp) * 100}%` }} />
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Question */}
        <h3 className="text-xl font-mono font-bold mb-4">{currentQ.question}</h3>
        {currentQ.code && <div className="mb-4"><CodeBlock code={currentQ.code} /></div>}

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((opt, i) => (
            <button key={i} disabled={answerState !== "idle"} onClick={() => handleSelect(i)}
              className={`w-full p-4 rounded-xl border text-left font-mono text-sm transition-all ${
                selected === i
                  ? i === currentQ.answer ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
                  : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5"
              }`}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {answerState !== "idle" && (
        <button onClick={handleNext} className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold">
          {isLast ? "See Results" : "Next Question"}
        </button>
      )}
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
  onStart: (p1Char: typeof CHARACTERS[0], p2Name: string, p2Char: typeof CHARACTERS[0]) => void;
  onBack: () => void;
}) {
  const [p1Char, setP1Char] = useState(CHARACTERS[0]);
  const [p2Name, setP2Name] = useState("Friend");
  const [p2Char, setP2Char] = useState(CHARACTERS[1]);

  return (
    <div className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-foreground-subtle font-mono text-sm mb-6"><ArrowLeft size={16}/> Back</button>
      <h2 className="text-4xl font-mono font-black text-center mb-8">1v1 Friend Arena</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Player 1 Selection */}
        <div className="p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
          <p className="font-mono font-bold text-cyan-400 mb-2">PLAYER 1: {profile.username || "You"}</p>
          <p className="text-xs font-mono text-foreground-subtle mb-4">Choose Character:</p>
          <div className="grid grid-cols-2 gap-2">
            {CHARACTERS.map((c) => (
              <button key={c.id} onClick={() => setP1Char(c)} className={`p-3 rounded-xl border text-center ${p1Char.id === c.id ? "border-cyan-400 bg-cyan-400/10" : "border-black/10 dark:border-white/10"}`}>
                <span className="text-2xl">{c.icon}</span>
                <p className="text-xs font-mono font-bold mt-1">{c.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Player 2 Selection */}
        <div className="p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
          <input value={p2Name} onChange={(e) => setP2Name(e.target.value)} placeholder="Friend Name" className="font-mono font-bold text-pink-400 bg-transparent border-b border-pink-400 outline-none mb-2 w-full" />
          <p className="text-xs font-mono text-foreground-subtle mb-4">Choose Character:</p>
          <div className="grid grid-cols-2 gap-2">
            {CHARACTERS.map((c) => (
              <button key={c.id} onClick={() => setP2Char(c)} className={`p-3 rounded-xl border text-center ${p2Char.id === c.id ? "border-pink-400 bg-pink-400/10" : "border-black/10 dark:border-white/10"}`}>
                <span className="text-2xl">{c.icon}</span>
                <p className="text-xs font-mono font-bold mt-1">{c.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Language Picker */}
      <div className="mb-8">
        <p className="text-xs font-mono font-bold mb-3">SELECT LANGUAGE</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {LANGUAGES.slice(0, 6).map((lang) => (
            <button key={lang.id} onClick={() => onSelectLanguage(lang.id)} className={`p-3 rounded-xl border text-center font-mono text-xs ${selectedLang === lang.id ? "border-purple-500 bg-purple-500/10" : "border-black/10 dark:border-white/10"}`}>
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <button disabled={!selectedLang} onClick={() => onStart(p1Char, p2Name, p2Char)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-mono font-bold text-lg disabled:opacity-30">
        Enter Battle Arena
      </button>
    </div>
  );
}

function DuelScreen({
  langId,
  profile,
  p1Char,
  p2Name,
  p2Char,
  onFinish,
}: {
  langId: string;
  profile: StudentProfile;
  p1Char: typeof CHARACTERS[0];
  p2Name: string;
  p2Char: typeof CHARACTERS[0];
  onFinish: (winner: string) => void;
}) {
  const questions = (QUESTIONS[langId] || QUESTIONS["python"]).slice(0, 5);
  const [qIndex, setQIndex] = useState(0);
  const [turn, setTurn] = useState<"p1" | "p2">("p1");
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const currentQ = questions[qIndex];

  const handleAnswer = (index: number) => {
    setSelected(index);
    const correct = index === currentQ.answer;

    if (turn === "p1" && correct) setP1Score((s) => s + 1);
    if (turn === "p2" && correct) setP2Score((s) => s + 1);

    setTimeout(() => {
      setSelected(null);
      if (turn === "p1") {
        setTurn("p2");
      } else if (qIndex < questions.length - 1) {
        setQIndex((i) => i + 1);
        setTurn("p1");
      } else {
        const winner = p1Score > p2Score ? (profile.username || "Player 1") : p2Name;
        onFinish(winner);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto flex flex-col justify-between">
      {/* Turn Banner with Animation */}
      <motion.div key={turn} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-4 rounded-2xl border text-center font-mono font-bold mb-6 ${turn === "p1" ? "border-cyan-400 bg-cyan-400/10 text-cyan-400" : "border-pink-400 bg-pink-400/10 text-pink-400"}`}>
        <Sparkles className="inline mr-2" size={18} />
        It's {turn === "p1" ? (profile.username || "Player 1") : p2Name}'s Turn!
      </motion.div>

      {/* Side-by-Side Character Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-2xl border text-center ${turn === "p1" ? "border-cyan-400 bg-cyan-400/10" : "border-black/10 dark:border-white/10"}`}>
          <div className="text-4xl mb-1">{p1Char.icon}</div>
          <p className="font-mono font-bold text-xs">{profile.username || "Player 1"}</p>
          <p className="font-mono text-2xl font-black text-cyan-400 mt-2">{p1Score}</p>
        </div>
        <div className={`p-4 rounded-2xl border text-center ${turn === "p2" ? "border-pink-400 bg-pink-400/10" : "border-black/10 dark:border-white/10"}`}>
          <div className="text-4xl mb-1">{p2Char.icon}</div>
          <p className="font-mono font-bold text-xs">{p2Name}</p>
          <p className="font-mono text-2xl font-black text-pink-400 mt-2">{p2Score}</p>
        </div>
      </div>

      {/* Question & Options */}
      <div>
        <h3 className="text-xl font-mono font-bold mb-4">{currentQ.question}</h3>
        <div className="space-y-3">
          {currentQ.options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(i)} className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-left font-mono text-sm hover:border-purple-500">
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultsScreen({
  winner,
  onHome,
}: {
  winner?: string;
  onHome: () => void;
}) {
  return (
    <div className="min-h-screen px-6 py-12 flex flex-col items-center justify-center text-center">
      {/* Victory Effect */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-7xl mb-4">🏆</motion.div>
      <h2 className="text-4xl font-mono font-black mb-2">{winner ? `${winner} Wins!` : "Challenge Complete!"}</h2>
      <p className="text-foreground-subtle font-mono text-sm mb-8">Great job on finishing the battle.</p>
      <button onClick={onHome} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold">
        Back to Dashboard
      </button>
    </div>
  );
}

// ─── Main App Entry Point ─────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [gameMode, setGameMode] = useState<GameMode>("practice");
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [lifetimeXP, setLifetimeXP] = useState(150);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(["first_win"]);
  const [darkMode, setDarkMode] = useState(true);

  // Duel State
  const [p1Char, setP1Char] = useState(CHARACTERS[0]);
  const [p2Name, setP2Name] = useState("Friend");
  const [p2Char, setP2Char] = useState(CHARACTERS[1]);
  const [duelWinner, setDuelWinner] = useState("");

  const [profile, setProfile] = useState<StudentProfile>({
    username: "ElmerMak",
    yearLevel: "3rd Year",
    course: "BSIT",
    school: "State University",
    photo: "",
  });

  return (
    <div className={`${darkMode ? "dark bg-[#0a0a16] text-white" : "bg-[#f8fafc] text-slate-900"} min-h-screen transition-colors duration-200`}>
      <style>{`
        .text-foreground-subtle { color: ${darkMode ? "rgba(255,255,255,0.6)" : "rgba(15,23,42,0.6)"}; }
      `}</style>

      {screen === "welcome" && <WelcomeScreen darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} onContinue={() => setScreen("home")} />}
      {screen === "home" && (
        <HomeScreen
          profile={profile}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(!darkMode)}
          onProfile={() => setScreen("profile")}
          onGuidelines={() => setScreen("guidelines")}
          onStart={() => setScreen("modes")}
          totalXP={lifetimeXP}
          onDuel={() => setScreen("duel-setup")}
          onAchievements={() => setScreen("achievements")}
        />
      )}
      {screen === "achievements" && <AchievementsScreen unlockedIds={unlockedAchievements} onBack={() => setScreen("home")} />}
      {screen === "modes" && <ModesScreen onBack={() => setScreen("home")} onSelect={(m) => { setGameMode(m); setScreen("game"); }} />}
      {screen === "game" && <GameScreen langId={selectedLang || "python"} mode={gameMode} onFinish={() => setScreen("results")} />}
      {screen === "duel-setup" && (
        <DuelSetupScreen
          profile={profile}
          totalXP={lifetimeXP}
          selectedLang={selectedLang}
          onSelectLanguage={(l) => setSelectedLang(l)}
          onStart={(c1, name2, c2) => { setP1Char(c1); setP2Name(name2); setP2Char(c2); setScreen("duel"); }}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "duel" && (
        <DuelScreen
          langId={selectedLang || "python"}
          profile={profile}
          p1Char={p1Char}
          p2Name={p2Name}
          p2Char={p2Char}
          onFinish={(winner) => { setDuelWinner(winner); setScreen("results"); }}
        />
      )}
      {screen === "results" && <ResultsScreen winner={duelWinner} onHome={() => setScreen("home")} />}
    </div>
  );
}
