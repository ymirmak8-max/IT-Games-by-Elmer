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
    {
      id: 1, type: "multiple",
      question: "What keyword do you use to define a function in Python?",
      options: ["function", "def", "func", "define"],
      answer: 1,
      explanation: "`def` is the keyword used to define functions in Python.",
      xp: 10,
    },
    {
      id: 2, type: "code",
      question: "What does this code print?",
      code: `x = [1, 2, 3, 4, 5]\nprint(x[2])`,
      options: ["1", "2", "3", "5"],
      answer: 2,
      explanation: "Python lists are zero-indexed. `x[2]` accesses the third element.",
      xp: 15,
    },
  ],
  javascript: [
    {
      id: 1, type: "multiple",
      question: "Which keyword declares a variable that CANNOT be reassigned?",
      options: ["var", "let", "const", "fixed"],
      answer: 2,
      explanation: "`const` declares a constant in JavaScript.",
      xp: 10,
    },
  ],
};

const BONUS_QUESTIONS: Question[] = [
  { id: 1001, type: "multiple", question: "Which data structure follows FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], answer: 1, explanation: "FIFO is Queue.", xp: 15 },
  { id: 1002, type: "multiple", question: "Which data structure follows LIFO?", options: ["Queue", "Stack", "Heap", "Set"], answer: 1, explanation: "LIFO is Stack.", xp: 15 },
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

// ─── Music Track Data ─────────────────────────────────────────────────────────

const SPOTIFY_TRACKS = [
  { id: "2nbotE8GMs2IYte7WgtZBa", title: "Multo", artist: "Cup of Joe", category: "OPM" },
  { id: "61vyXXtY7OSYFRtSzv5ehw", title: "Mundo", artist: "IV OF SPADES", category: "OPM" },
  { id: "73yag1G1OoegdWZAtMxY5D", title: "Blinding Lights", artist: "The Weeknd", category: "Pop" },
  { id: "0p20HotsDDhhAUtJ2KOAg9", title: "Relaxing Beats", artist: "Lo Fi Hip Hop", category: "Focus" },
];

type MusicTrack = (typeof SPOTIFY_TRACKS)[number];
type GameMode = "practice" | "battle" | "speed" | "debug" | "survival" | "compiler";
type Screen = "welcome" | "home" | "profile" | "guidelines" | "modes" | "language" | "music" | "game" | "results" | "duel-setup" | "duel";

type StudentProfile = {
  username: string;
  yearLevel: string;
  course: string;
  school: string;
  photo: string;
};

// ─── Reusable Components ─────────────────────────────────────────────────────

function ArenaCombatCore({ side = "player", attacking = false, hit = false }: { side?: "player" | "enemy"; attacking?: boolean; hit?: boolean }) {
  const isPlayer = side === "player";
  return (
    <div className="relative flex items-center justify-center w-36 h-36 sm:w-48 sm:h-48">
      {/* Dynamic Aura background */}
      <motion.div
        animate={{
          scale: attacking ? [1, 1.4, 1] : [1, 1.1, 1],
          opacity: attacking ? [0.4, 0.9, 0.4] : [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`absolute inset-0 rounded-full blur-3xl pointer-events-none ${
          isPlayer ? "bg-cyan-500/40" : "bg-red-500/40"
        }`}
      />

      {/* Cyber Rotating Hex/Orb Shield */}
      <motion.div
        animate={{
          rotate: isPlayer ? [0, 360] : [360, 0],
          x: attacking ? (isPlayer ? [0, 60, 0] : [0, -60, 0]) : hit ? [0, -10, 10, 0] : 0,
        }}
        transition={{ duration: attacking || hit ? 0.4 : 8, repeat: attacking || hit ? 0 : Infinity, ease: "easeInOut" }}
        className={`relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border-2 flex items-center justify-center backdrop-blur-md shadow-2xl ${
          isPlayer
            ? "border-cyan-400 bg-slate-950/80 text-cyan-300 shadow-cyan-500/30"
            : "border-red-500 bg-slate-950/80 text-red-400 shadow-red-500/30"
        }`}
      >
        {isPlayer ? <Code2 size={56} className="drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" /> : <Flame size={56} className="drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />}
      </motion.div>

      {/* Impact Overlay FX */}
      <AnimatePresence>
        {attacking && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 2, opacity: 1 }}
            exit={{ scale: 2.5, opacity: 0 }}
            className={`absolute z-20 font-mono font-black text-2xl tracking-widest ${
              isPlayer ? "text-cyan-300 drop-shadow-[0_0_20px_#06b6d4]" : "text-red-400 drop-shadow-[0_0_20px_#ef4444]"
            }`}
          >
            {isPlayer ? "CRITICAL CODE IMPACT!" : "SYSTEM COUNTER!"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Application Container ─────────────────────────────────────────────

export default function CodeQuestApp() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [mode, setMode] = useState<GameMode>("practice");
  const [langId, setLangId] = useState("javascript");
  const [battleDifficulty, setBattleDifficulty] = useState<"easy" | "normal" | "hard">("normal");
  const [totalXP, setTotalXP] = useState(120);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack>(SPOTIFY_TRACKS[0]);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  
  const [profile, setProfile] = useState<StudentProfile>({
    username: "ElmerMak",
    yearLevel: "3rd Year",
    course: "BSIT",
    school: "State University",
    photo: "",
  });

  // Global Web Audio Synth for Continuous Background Music
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const startMusic = useCallback(() => {
    if (isPlayingMusic) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      audioCtxRef.current = ctx;
      oscRef.current = osc;
      setIsPlayingMusic(true);
    } catch {}
  }, [isPlayingMusic]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Global Background Audio Toggle */}
      <button
        onClick={startMusic}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-cyan-500/30 bg-slate-900/90 px-4 py-2 font-mono text-xs text-cyan-300 backdrop-blur-md shadow-xl hover:border-cyan-400"
      >
        <Music size={14} className={isPlayingMusic ? "animate-spin" : ""} />
        {isPlayingMusic ? `Playing: ${selectedTrack.title}` : "Enable Sound Track"}
      </button>

      {/* Screen Router */}
      {screen === "welcome" && (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,rgba(30,27,75,0.4)_0%,rgba(7,9,14,1)_100%)]">
          <div className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl p-8 sm:p-12 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono font-black text-lg">
                  CQ
                </div>
                <span className="font-mono font-bold text-lg tracking-wider text-white">CODEQUEST</span>
              </div>
              <button onClick={() => setScreen("modes")} className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2 font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20">
                Get Started <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase">THE CODING ARENA / 01</span>
                <h1 className="text-5xl sm:text-7xl font-mono font-black tracking-tight text-white mt-3 leading-none">
                  CODE<br /><span className="text-cyan-400">QUEST.</span>
                </h1>
                <p className="text-slate-400 font-mono text-sm sm:text-base leading-relaxed mt-6">
                  A competitive coding world where every correct answer becomes energy, every mistake becomes a lesson, and every battle feels like a final boss.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button onClick={() => setScreen("modes")} className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black px-7 py-4 font-mono font-black text-sm flex items-center gap-3 transition-all shadow-xl shadow-cyan-500/25">
                    Enter the arena <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center min-h-[280px]">
                <div className="absolute w-72 h-72 rounded-full border border-cyan-500/20 animate-spin" style={{ animationDuration: "20s" }} />
                <div className="absolute w-56 h-56 rounded-full border border-purple-500/20 animate-spin" style={{ animationDuration: "12s" }} />
                <div className="relative z-10 w-24 h-24 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-2xl shadow-cyan-500/30">
                  <Code2 size={48} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Game Modes and 1v1 Arena */}
      {screen === "modes" && (
        <div className="max-w-5xl mx-auto p-6 pt-12">
          <button onClick={() => setScreen("welcome")} className="flex items-center gap-2 text-slate-400 hover:text-white font-mono text-xs mb-8">
            <ArrowLeft size={14} /> Back
          </button>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-mono font-black text-white">CHOOSE YOUR BATTLE</h2>
            <p className="text-slate-400 font-mono text-xs mt-2">Select a combat style to initiate testing.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => { setMode("battle"); setScreen("game"); }}
              className="group text-left rounded-2xl border border-red-500/30 bg-red-950/10 p-6 hover:bg-red-950/20 transition-all shadow-xl"
            >
              <Swords size={32} className="text-red-400 mb-4" />
              <h3 className="font-mono font-black text-lg text-white">Battle Mode</h3>
              <p className="text-slate-400 font-mono text-xs mt-2">High-intensity fighting arena against the system beast.</p>
            </button>

            <button
              onClick={() => { setMode("speed"); setScreen("game"); }}
              className="group text-left rounded-2xl border border-yellow-500/30 bg-yellow-950/10 p-6 hover:bg-yellow-950/20 transition-all shadow-xl"
            >
              <Zap size={32} className="text-yellow-400 mb-4" />
              <h3 className="font-mono font-black text-lg text-white">1v1 Speed Battle</h3>
              <p className="text-slate-400 font-mono text-xs mt-2">Race face-to-face against an opponent or timer in real-time.</p>
            </button>
          </div>
        </div>
      )}

      {/* Battle Mode Interactive Combat Arena */}
      {screen === "game" && (
        <div className="max-w-4xl mx-auto p-6 pt-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
            <button onClick={() => setScreen("modes")} className="flex items-center gap-2 text-slate-400 hover:text-white font-mono text-xs">
              <ArrowLeft size={14} /> Forfeit Battle
            </button>
            <span className="font-mono text-xs text-cyan-400 font-bold uppercase">MODE: {mode.toUpperCase()}</span>
          </div>

          {/* Combat Display Arena */}
          <div className="relative rounded-3xl border border-slate-800 bg-slate-950/80 p-8 mb-8 overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              {/* Player Side */}
              <div className="flex flex-col items-center">
                <ArenaCombatCore side="player" />
                <span className="font-mono font-bold text-sm text-cyan-300 mt-3">{profile.username}</span>
                <div className="w-32 h-2 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div className="h-full bg-cyan-400 w-full" />
                </div>
              </div>

              <div className="text-center font-mono font-black text-2xl text-slate-600">VS</div>

              {/* Enemy Side */}
              <div className="flex flex-col items-center">
                <ArenaCombatCore side="enemy" />
                <span className="font-mono font-bold text-sm text-red-400 mt-3">Code Beast</span>
                <div className="w-32 h-2 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div className="h-full bg-red-500 w-3/4" />
                </div>
              </div>
            </div>
          </div>

          {/* Question Interface */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="font-mono text-xs text-slate-400 mb-2">QUESTION 01 OF 20</p>
            <h3 className="font-mono font-bold text-lg text-white mb-6">Which keyword is used to define a constant in JavaScript?</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["var", "let", "const", "fixed"].map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => alert(`Selected: ${opt}. Energy generated!`)}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/50 hover:bg-slate-900 font-mono text-sm text-left text-slate-200 transition-all"
                >
                  <span className="text-cyan-400 font-bold mr-2">{i + 1}.</span> {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
