import { useState, useEffect, useCallback, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Music,
  Sun,
  Moon,
  Code2,
  ArrowRight,
  User,
  ArrowLeft,
  Camera,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Swords,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Screen =
  | "welcome"
  | "home"
  | "profile"
  | "guidelines"
  | "modes"
  | "language"
  | "reviewer"
  | "game"
  | "results"
  | "duel-setup"
  | "duel";

type AnswerState = "idle" | "correct" | "wrong";

type GameMode = "practice" | "battle" | "speed";

type Mood =
  | "focused"
  | "happy"
  | "competitive"
  | "chill"
  | "tired"
  | "hyped";

type StudentProfile = {
  username: string;
  yearLevel: string;
  school: string;
  photo: string;
  mood: Mood;
};

type DuelResult = {
  youScore: number;
  friendScore: number;
  friendName: string;
};

type MusicTrack = {
  title: string;
  artist: string;
  category: string;
  spotifySearch: string;
  embedId?: string;
};

// ─── Ranks ───────────────────────────────────────────────────────────────────

const RANKS = [
  {
    name: "Beginner Programmer",
    minXP: 0,
    icon: "🌱",
    color: "#94a3b8",
  },
  {
    name: "Novice Programmer",
    minXP: 100,
    icon: "🛡️",
    color: "#60a5fa",
  },
  {
    name: "Junior Programmer",
    minXP: 250,
    icon: "⚔️",
    color: "#a78bfa",
  },
  {
    name: "Intermediate Programmer",
    minXP: 500,
    icon: "🔥",
    color: "#f59e0b",
  },
  {
    name: "Advanced Programmer",
    minXP: 900,
    icon: "💎",
    color: "#22d3ee",
  },
  {
    name: "Senior Programmer",
    minXP: 1500,
    icon: "👑",
    color: "#fbbf24",
  },
];

function getRank(totalXP: number) {
  return (
    [...RANKS].reverse().find((rank) => totalXP >= rank.minXP) ??
    RANKS[0]
  );
}

// ─── Mood ────────────────────────────────────────────────────────────────────

const MOODS: {
  id: Mood;
  emoji: string;
  label: string;
  color: string;
}[] = [
  {
    id: "focused",
    emoji: "🧠",
    label: "Focused",
    color: "#06b6d4",
  },
  {
    id: "happy",
    emoji: "😄",
    label: "Happy",
    color: "#facc15",
  },
  {
    id: "competitive",
    emoji: "😈",
    label: "Competitive",
    color: "#ef4444",
  },
  {
    id: "chill",
    emoji: "😎",
    label: "Chill",
    color: "#8b5cf6",
  },
  {
    id: "tired",
    emoji: "🥱",
    label: "Tired",
    color: "#64748b",
  },
  {
    id: "hyped",
    emoji: "🔥",
    label: "Hyped",
    color: "#f97316",
  },
];

// ─── Music ───────────────────────────────────────────────────────────────────

const MUSIC_LIBRARY: MusicTrack[] = [
  {
    title: "Palagi",
    artist: "TJ Monterde",
    category: "OPM",
    spotifySearch: "TJ Monterde Palagi",
    embedId: "4rwsFa82o2Bqo5DEj0wUKr",
  },
  {
    title: "Dating Tayo",
    artist: "TJ Monterde",
    category: "OPM",
    spotifySearch: "TJ Monterde Dating Tayo",
    embedId: "78uCp7K1jgwSYTtgv9iPpg",
  },
  {
    title: "Tahanan",
    artist: "TJ Monterde",
    category: "OPM",
    spotifySearch: "TJ Monterde Tahanan",
    embedId: "69WYSAYNAvHrzN4c1Tba0y",
  },
  {
    title: "Multo",
    artist: "OPM",
    category: "OPM",
    spotifySearch: "Multo OPM",
  },
  {
    title: "OPM Chill Mix",
    artist: "Filipino OPM",
    category: "OPM",
    spotifySearch: "OPM chill playlist",
  },

  {
    title: "Taylor Swift",
    artist: "Taylor Swift",
    category: "Taylor Swift",
    spotifySearch: "Taylor Swift",
  },
  {
    title: "Taylor Swift Chill",
    artist: "Taylor Swift",
    category: "Taylor Swift",
    spotifySearch: "Taylor Swift chill playlist",
  },
  {
    title: "Taylor Swift Hits",
    artist: "Taylor Swift",
    category: "Taylor Swift",
    spotifySearch: "Taylor Swift hits",
  },

  {
    title: "The Weeknd",
    artist: "The Weeknd",
    category: "The Weeknd",
    spotifySearch: "The Weeknd",
  },
  {
    title: "The Weeknd Essentials",
    artist: "The Weeknd",
    category: "The Weeknd",
    spotifySearch: "The Weeknd essentials",
  },

  {
    title: "Hinder",
    artist: "Hinder",
    category: "Rock",
    spotifySearch: "Hinder",
  },

  {
    title: "The 1975",
    artist: "The 1975",
    category: "Alternative",
    spotifySearch: "The 1975",
  },

  {
    title: "Alexx Crichton",
    artist: "Alexx Crichton",
    category: "Alternative",
    spotifySearch: "Alexx Crichton",
  },

  {
    title: "Coding Focus",
    artist: "Programming Music",
    category: "Coding",
    spotifySearch: "coding focus music",
    embedId: "6mPNCrmCQgV4ZIRwNFW9w8",
  },
  {
    title: "Coding Focus Pt. 10",
    artist: "Programming Coding Ambient Chill",
    category: "Coding",
    spotifySearch: "coding focus ambient",
    embedId: "6zcjD7iRPz5fgOFAFtQqEJ",
  },
  {
    title: "Late Night Coding",
    artist: "Lo-Fi",
    category: "Lo-Fi",
    spotifySearch: "late night coding lofi",
    embedId: "0p20HotsDDhhAUtJ2KOAg9",
  },
  {
    title: "Lo-Fi Study",
    artist: "Lo-Fi",
    category: "Lo-Fi",
    spotifySearch: "lofi study",
  },
  {
    title: "Deep Focus",
    artist: "Focus Music",
    category: "Focus",
    spotifySearch: "deep focus music",
  },
];

// ─── Sound Effects ───────────────────────────────────────────────────────────

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (!audioContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }

  return audioContext;
}

function playTone(
  frequency: number,
  duration = 0.12,
  type: OscillatorType = "sine",
  volume = 0.04
) {
  try {
    const ctx = getAudioContext();

    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio is optional.
  }
}

function soundCorrect() {
  playTone(660, 0.08, "sine", 0.05);

  setTimeout(() => {
    playTone(880, 0.12, "sine", 0.05);
  }, 80);
}

function soundWrong() {
  playTone(180, 0.18, "sawtooth", 0.04);
}

function soundAttack() {
  playTone(120, 0.08, "square", 0.04);

  setTimeout(() => {
    playTone(70, 0.18, "sawtooth", 0.035);
  }, 70);
}

function soundWin() {
  [523, 659, 784, 1046].forEach((frequency, index) => {
    setTimeout(() => {
      playTone(frequency, 0.18, "sine", 0.05);
    }, index * 100);
  });
}

function soundLose() {
  [400, 320, 220].forEach((frequency, index) => {
    setTimeout(() => {
      playTone(frequency, 0.2, "sawtooth", 0.035);
    }, index * 130);
  });
}

function soundTick() {
  playTone(800, 0.045, "square", 0.025);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function openSpotifySearch(query: string) {
  const url = `https://open.spotify.com/search/${encodeURIComponent(query)}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

function getMood(mood: Mood) {
  return MOODS.find((item) => item.id === mood) ?? MOODS[0];
}

// ─── XP Bar ──────────────────────────────────────────────────────────────────

function XPBar({
  current,
  max,
  level,
}: {
  current: number;
  max: number;
  level: number;
}) {
  const pct = Math.min((current / max) * 100, 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-purple-300 font-black">LV.{level}</span>
        <span className="text-white/40">
          {current}/{max} XP
        </span>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7 }}
        />
      </div>
    </div>
  );
}

// ─── Rank Badge ──────────────────────────────────────────────────────────────

function RankBadge({
  totalXP,
  compact = false,
}: {
  totalXP: number;
  compact?: boolean;
}) {
  const rank = getRank(totalXP);

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className={`flex items-center gap-2 rounded-xl border bg-black/10 ${
        compact ? "px-2.5 py-1.5" : "px-3 py-2"
      }`}
      style={{
        borderColor: `${rank.color}55`,
        boxShadow: `0 0 20px ${rank.color}12`,
      }}
    >
      <span className={compact ? "text-base" : "text-xl"}>
        {rank.icon}
      </span>

      <div>
        <p
          className="font-mono font-black truncate"
          style={{
            color: rank.color,
            fontSize: compact ? 10 : 12,
          }}
        >
          {rank.name}
        </p>

        <p
          className="text-white/30 font-mono"
          style={{
            fontSize: compact ? 8 : 9,
          }}
        >
          {totalXP} XP
        </p>
      </div>

      <Trophy
        size={compact ? 12 : 15}
        style={{ color: rank.color }}
        className="ml-auto shrink-0"
      />
    </motion.div>
  );
}

// ─── Code Block ──────────────────────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-cyan-500/20 bg-[#070711] overflow-hidden shadow-2xl shadow-cyan-500/5"
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />

        <span className="ml-2 text-[10px] text-white/25 font-mono">
          code.preview
        </span>
      </div>

      <pre className="p-5 text-sm md:text-base text-cyan-200/90 font-mono overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </motion.div>
  );
}

// ─── Particles ───────────────────────────────────────────────────────────────

function ParticleEffect({
  active,
  correct,
}: {
  active: boolean;
  correct: boolean;
}) {
  if (!active) return null;

  const color = correct ? "#22c55e" : "#ef4444";

  const particles = Array.from(
    { length: correct ? 18 : 10 },
    (_, index) => index
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      {particles.map((i) => {
        const angle = (i / particles.length) * Math.PI * 2;

        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 15px ${color}`,
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: Math.cos(angle) * 280,
              y: Math.sin(angle) * 280,
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.9,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Music Player ────────────────────────────────────────────────────────────

function MusicPlayer() {
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    "OPM",
    "Taylor Swift",
    "The Weeknd",
    "Rock",
    "Alternative",
    "Coding",
    "Lo-Fi",
    "Focus",
  ];

  const tracks =
    category === "All"
      ? MUSIC_LIBRARY
      : MUSIC_LIBRARY.filter(
          (track) => track.category === category
        );

  const [track, setTrack] = useState(MUSIC_LIBRARY[0]);

  const currentTrack =
    tracks.find((item) => item.title === track.title) ??
    tracks[0] ??
    MUSIC_LIBRARY[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-white/5 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music size={16} className="text-green-400" />

          <div>
            <p className="text-green-300 text-xs font-mono font-black">
              CODEQUEST MUSIC
            </p>

            <p className="text-white/30 text-[9px] font-mono">
              Pick your coding soundtrack
            </p>
          </div>
        </div>

        <span className="text-[9px] text-white/25 font-mono">
          {MUSIC_LIBRARY.length} tracks
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-mono border transition-all ${
              category === item
                ? "bg-green-500/20 border-green-500/50 text-green-300"
                : "bg-white/5 border-white/10 text-white/40"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto mb-4">
        {tracks.map((item) => (
          <button
            key={`${item.artist}-${item.title}`}
            onClick={() => setTrack(item)}
            className={`text-left p-3 rounded-xl border transition-all ${
              currentTrack.title === item.title
                ? "bg-green-500/15 border-green-500/40"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <p className="text-xs font-mono font-bold text-white truncate">
              {item.title}
            </p>

            <p className="text-[9px] text-white/35 font-mono truncate">
              {item.artist}
            </p>
          </button>
        ))}
      </div>

      {currentTrack.embedId ? (
        <iframe
          key={currentTrack.embedId}
          src={`https://open.spotify.com/embed/track/${currentTrack.embedId}?utm_source=generator`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={`Spotify player for ${currentTrack.title}`}
          className="rounded-2xl"
        />
      ) : (
        <button
          onClick={() => openSpotifySearch(currentTrack.spotifySearch)}
          className="w-full rounded-2xl border border-green-500/20 bg-green-500/10 py-5 text-green-300 font-mono text-sm hover:bg-green-500/20 transition-all"
        >
          🎵 Open {currentTrack.artist} on Spotify
        </button>
      )}
    </motion.div>
  );
}

// ─── Mood Selector ───────────────────────────────────────────────────────────

function MoodSelector({
  value,
  onChange,
}: {
  value: Mood;
  onChange: (mood: Mood) => void;
}) {
  return (
    <div>
      <p className="text-xs text-white/40 font-mono mb-2">
        Today's Coding Mood
      </p>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {MOODS.map((mood) => (
          <motion.button
            key={mood.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(mood.id)}
            className={`rounded-xl border p-3 transition-all ${
              value === mood.id
                ? "bg-white/10"
                : "bg-white/5 border-white/10"
            }`}
            style={{
              borderColor:
                value === mood.id
                  ? `${mood.color}88`
                  : undefined,
              boxShadow:
                value === mood.id
                  ? `0 0 20px ${mood.color}18`
                  : undefined,
            }}
          >
            <div className="text-xl">{mood.emoji}</div>

            <div
              className="text-[9px] font-mono mt-1"
              style={{
                color:
                  value === mood.id
                    ? mood.color
                    : undefined,
              }}
            >
              {mood.label}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Welcome Screen ──────────────────────────────────────────────────────────

function WelcomeScreen({
  onContinue,
  darkMode,
  onToggleTheme,
}: {
  onContinue: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Animated background */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px]"
        animate={{
          x: [-200, 200, -100],
          y: [-100, 150, -150],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px]"
        animate={{
          x: [200, -150, 100],
          y: [100, -200, 150],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <button
        onClick={onToggleTheme}
        className="absolute top-5 right-5 z-20 rounded-xl border border-white/10 bg-white/5 p-3 text-white/60"
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          type: "spring",
        }}
        className="relative z-10 max-w-5xl w-full text-center"
      >
        <motion.div
          animate={{
            rotate: [0, -8, 8, -4, 4, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
          className="mx-auto w-24 h-24 rounded-[2rem] bg-gradient-to-br from-purple-600 via-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-purple-500/30"
        >
          <Code2 size={46} className="text-white" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-7 text-purple-300 text-xs md:text-sm font-mono font-black tracking-[0.5em]"
        >
          WELCOME TO THE ARENA
        </motion.p>

        <h1 className="mt-3 text-6xl md:text-9xl font-mono font-black tracking-tighter">
          <span className="text-white">Code</span>

          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400">
            Quest
          </span>
        </h1>

        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
          }}
          className="text-cyan-300 font-mono text-sm md:text-lg"
        >
          YOUR CODE. YOUR SKILL. YOUR LEGEND.
        </motion.div>

        <p className="max-w-2xl mx-auto mt-5 text-white/40 font-mono text-sm md:text-base leading-relaxed">
          Learn programming through challenges, battles,
          speed runs, music, XP, ranks, and 1v1 coding
          battles with your friends.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mt-10">
          {[
            ["⚔️", "1v1 Arena"],
            ["⚡", "Speed Mode"],
            ["📚", "Reviewer"],
            ["🏆", "Rank System"],
          ].map(([icon, title], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5 + index * 0.1,
              }}
              whileHover={{
                y: -6,
                scale: 1.04,
              }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <div className="text-3xl">{icon}</div>

              <p className="text-white/60 font-mono text-xs mt-2">
                {title}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={onContinue}
          whileHover={{
            scale: 1.06,
            boxShadow:
              "0 0 60px rgba(168,85,247,.35)",
          }}
          whileTap={{
            scale: 0.95,
          }}
          className="mt-10 px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-600 text-white font-mono font-black text-lg shadow-2xl"
        >
          Enter CodeQuest
          <ArrowRight
            size={20}
            className="inline ml-3"
          />
        </motion.button>

        <p className="mt-5 text-white/20 text-[10px] font-mono">
          LEARN • BATTLE • CODE • LEVEL UP
        </p>
      </motion.div>
    </div>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────

function HomeScreen({
  onStart,
  onProfile,
  onGuidelines,
  onReviewer,
  onToggleTheme,
  darkMode,
  profile,
  totalXP,
  onDuel,
}: {
  onStart: () => void;
  onProfile: () => void;
  onGuidelines: () => void;
  onReviewer: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
  profile: StudentProfile;
  totalXP: number;
  onDuel: () => void;
}) {
  const mood = getMood(profile.mood);

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center"
            >
              <Code2 size={22} />
            </motion.div>

            <div>
              <p className="text-white font-mono font-black">
                CodeQuest
              </p>

              <p className="text-white/30 text-[9px] font-mono">
                Coding Adventure
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/50"
            >
              {darkMode ? (
                <Sun size={17} />
              ) : (
                <Moon size={17} />
              )}
            </button>

            <button
              onClick={onProfile}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/50"
            >
              <User size={17} />
            </button>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-7 mb-7"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            {profile.photo ? (
              <img
                src={profile.photo}
                className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                alt="Student profile"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-3xl">
                👨‍💻
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-mono font-black text-white">
                  {profile.username || "Code Warrior"}
                </h2>

                <span
                  className="px-2 py-1 rounded-full text-[9px] font-mono"
                  style={{
                    color: mood.color,
                    backgroundColor: `${mood.color}18`,
                  }}
                >
                  {mood.emoji} {mood.label}
                </span>
              </div>

              <p className="text-white/30 text-xs font-mono mt-1">
                {profile.yearLevel} · {profile.school}
              </p>

              <div className="mt-3 max-w-md">
                <RankBadge
                  totalXP={totalXP}
                  compact
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <p className="text-purple-300 text-xs font-mono font-black tracking-[0.35em]">
            READY PLAYER?
          </p>

          <h1 className="text-4xl md:text-6xl font-mono font-black mt-2">
            <span className="text-white">Choose your </span>

            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              challenge.
            </span>
          </h1>

          <p className="text-white/30 font-mono text-sm mt-3">
            Your coding adventure starts here.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <motion.button
            whileHover={{
              y: -8,
              scale: 1.02,
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="text-left rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-white/5 p-6 min-h-[210px]"
          >
            <div className="text-4xl mb-8">🎮</div>

            <h3 className="text-xl text-white font-mono font-black">
              Start Quest
            </h3>

            <p className="text-white/35 text-xs font-mono mt-2">
              Practice, Battle, or Speed Mode.
            </p>
          </motion.button>

          <motion.button
            whileHover={{
              y: -8,
              scale: 1.02,
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onDuel}
            className="text-left rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-500/20 to-white/5 p-6 min-h-[210px]"
          >
            <div className="text-4xl mb-8">⚔️</div>

            <h3 className="text-xl text-white font-mono font-black">
              Friend Arena
            </h3>

            <p className="text-white/35 text-xs font-mono mt-2">
              Battle your friend in a dramatic 1v1.
            </p>
          </motion.button>

          <motion.button
            whileHover={{
              y: -8,
              scale: 1.02,
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onReviewer}
            className="text-left rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-white/5 p-6 min-h-[210px]"
          >
            <div className="text-4xl mb-8">📚</div>

            <h3 className="text-xl text-white font-mono font-black">
              Code Reviewer
            </h3>

            <p className="text-white/35 text-xs font-mono mt-2">
              Review every supported language before playing.
            </p>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            ["⚡", "Speed Mode", "Race the clock"],
            ["🔥", "Streaks", "Build combos"],
            ["🎵", "Music", "Code with your vibe"],
            ["🏆", "Ranks", "Become legendary"],
          ].map(([icon, title, description]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="text-2xl">{icon}</div>

              <p className="text-white font-mono text-xs font-bold mt-2">
                {title}
              </p>

              <p className="text-white/25 font-mono text-[9px] mt-1">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onGuidelines}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-white/50 font-mono text-xs"
          >
            📖 Guidelines
          </button>

          <button
            onClick={onProfile}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-white/50 font-mono text-xs"
          >
            👤 Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────

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

  const update = (
    key: keyof StudentProfile,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    if (
      !form.username.trim() ||
      !form.yearLevel ||
      !form.school.trim()
    ) {
      alert(
        "Please complete your username, year level, and school."
      );
      return;
    }

    onSave({
      username: form.username.trim(),
      yearLevel: form.yearLevel,
      school: form.school.trim(),
      photo: form.photo || "",
      mood: form.mood,
    });
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 font-mono text-sm mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <User className="text-purple-400" />
            </div>

            <div>
              <h2 className="text-2xl font-mono font-black text-white">
                Student Profile
              </h2>

              <p className="text-white/30 text-xs font-mono">
                Customize your CodeQuest identity.
              </p>
            </div>
          </div>

          <RankBadge totalXP={totalXP} />

          <form
            onSubmit={submit}
            className="space-y-5 mt-7"
          >
            <label className="block">
              <span className="text-xs font-mono text-white/40">
                Username
              </span>

              <input
                value={form.username}
                onChange={(e) =>
                  update("username", e.target.value)
                }
                placeholder="e.g. ElmerMak"
                className="w-full mt-2 rounded-xl border border-white/10 bg-black/20 text-white placeholder:text-white/20 px-4 py-3 outline-none focus:border-purple-500/60"
              />
            </label>

            <label className="block">
              <span className="text-xs font-mono text-white/40">
                Year Level
              </span>

              <select
                value={form.yearLevel}
                onChange={(e) =>
                  update("yearLevel", e.target.value)
                }
                className="w-full mt-2 rounded-xl border border-white/10 bg-[#11111f] text-white px-4 py-3 outline-none"
              >
                <option value="">
                  Select year level
                </option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
                <option>5th Year</option>
                <option>Graduate / Other</option>
              </select>
            </label>

            {/* COURSE REMOVED */}

            <label className="block">
              <span className="text-xs font-mono text-white/40">
                School
              </span>

              <input
                value={form.school}
                onChange={(e) =>
                  update("school", e.target.value)
                }
                placeholder="e.g. Your University"
                className="w-full mt-2 rounded-xl border border-white/10 bg-black/20 text-white placeholder:text-white/20 px-4 py-3 outline-none focus:border-purple-500/60"
              />
            </label>

            <MoodSelector
              value={form.mood}
              onChange={(mood) =>
                setForm((previous) => ({
                  ...previous,
                  mood,
                }))
              }
            />

            <div>
              <span className="text-xs font-mono text-white/40">
                Profile Photo
              </span>

              <div className="mt-2 flex items-center gap-4">
                {form.photo ? (
                  <img
                    src={form.photo}
                    className="w-20 h-20 rounded-2xl object-cover border border-purple-500/30"
                    alt="Profile preview"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-white/10 flex items-center justify-center">
                    <Camera className="text-white/30" />
                  </div>
                )}

                <label className="cursor-pointer flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white/60 text-xs font-mono">
                  <Camera size={15} />

                  {form.photo
                    ? "Change Photo"
                    : "Choose Photo"}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file =
                        e.target.files?.[0];

                      if (!file) return;

                      if (
                        file.size >
                        2 * 1024 * 1024
                      ) {
                        alert(
                          "Please choose an image smaller than 2MB."
                        );
                        return;
                      }

                      const reader =
                        new FileReader();

                      reader.onload = () =>
                        update(
                          "photo",
                          String(reader.result)
                        );

                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-black"
            >
              Save Profile
              <CheckCircle2
                size={17}
                className="inline ml-2"
              />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Modes ───────────────────────────────────────────────────────────────────

function ModesScreen({
  onSelect,
  onBack,
}: {
  onSelect: (mode: GameMode) => void;
  onBack: () => void;
}) {
  const modes = [
    {
      id: "practice" as GameMode,
      icon: "🧠",
      title: "Practice Mode",
      desc: "Learn with explanations after every answer.",
      color: "#8b5cf6",
    },
    {
      id: "battle" as GameMode,
      icon: "⚔️",
      title: "Battle Mode",
      desc: "Correct answers damage the Code Beast.",
      color: "#ef4444",
    },
    {
      id: "speed" as GameMode,
      icon: "⚡",
      title: "Speed Mode",
      desc: "Five questions against the clock.",
      color: "#f59e0b",
    },
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 font-mono text-sm mb-10"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="text-center mb-10">
          <p className="text-purple-300 text-xs font-mono tracking-[0.3em]">
            GAME MODE
          </p>

          <h1 className="text-4xl md:text-6xl font-mono font-black text-white mt-2">
            Choose Your Mode
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {modes.map((mode, index) => (
            <motion.button
              key={mode.id}
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.1,
              }}
              whileHover={{
                y: -10,
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={() => onSelect(mode.id)}
              className="text-left rounded-3xl border border-white/10 bg-white/5 p-6 min-h-[260px]"
              style={{
                boxShadow: `0 0 50px ${mode.color}10`,
              }}
            >
              <div className="text-5xl mb-10">
                {mode.icon}
              </div>

              <h2
                className="text-xl font-mono font-black"
                style={{
                  color: mode.color,
                }}
              >
                {mode.title}
              </h2>

              <p className="text-white/35 text-sm font-mono mt-3 leading-relaxed">
                {mode.desc}
              </p>

              {mode.id === "speed" && (
                <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[10px] font-mono">
                  ⏱️ 15 seconds/question
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

const LANGUAGES = [
  {
    id: "python",
    name: "Python",
    desc: "Clean syntax for beginners and AI builders.",
    icon: "🐍",
    bg: "#22d3ee",
    color: "#22d3ee",
  },
  {
    id: "javascript",
    name: "JavaScript",
    desc: "Power the web with interactivity.",
    icon: "⚡",
    bg: "#f59e0b",
    color: "#f59e0b",
  },
  {
    id: "typescript",
    name: "TypeScript",
    desc: "Type-safe JavaScript for robust apps.",
    icon: "🔷",
    bg: "#60a5fa",
    color: "#60a5fa",
  },
  {
    id: "java",
    name: "Java",
    desc: "Classic powerhouse for OOP and enterprise.",
    icon: "☕",
    bg: "#f97316",
    color: "#f97316",
  },
  {
    id: "cpp",
    name: "C++",
    desc: "High-performance programming for systems and games.",
    icon: "⚙️",
    bg: "#a78bfa",
    color: "#a78bfa",
  },
  {
    id: "csharp",
    name: "C#",
    desc: "Modern language for apps and game development.",
    icon: "#️⃣",
    bg: "#34d399",
    color: "#34d399",
  },
  {
    id: "go",
    name: "Go",
    desc: "Simple and fast for scalable services.",
    icon: "🌀",
    bg: "#f43f5e",
    color: "#f43f5e",
  },
  {
    id: "rust",
    name: "Rust",
    desc: "Safe systems programming with zero-cost abstractions.",
    icon: "🦀",
    bg: "#fb923c",
    color: "#fb923c",
  },
];

// ─── Reviewer Content ─────────────────────────────────────────────────────

const QUESTIONS: Record<
  string,
  Array<{
    id: string;
    xp: number;
    question: string;
    code?: string;
    options: string[];
    answer: number;
    explanation: string;
    type?: "multiple" | "code" | "truefalse";
  }>
> = {
  python: [
    {
      id: "python-1",
      xp: 80,
      question: "What does this code print?",
      code: "print(2 + 3)",
      options: ["5", "6", "2", "3"],
      answer: 0,
      explanation: "The expression 2 + 3 evaluates to 5.",
    },
    {
      id: "python-2",
      xp: 90,
      question: "Which keyword defines a function in Python?",
      options: ["class", "def", "function", "loop"],
      answer: 1,
      explanation: "Functions are created with the def keyword.",
    },
  ],
  javascript: [
    {
      id: "javascript-1",
      xp: 80,
      question: "What is the result of 2 + '3' in JavaScript?",
      options: ["5", "23", "Error", "undefined"],
      answer: 1,
      explanation: "JavaScript coerces the number to a string and concatenates it.",
    },
    {
      id: "javascript-2",
      xp: 90,
      question: "What keyword declares a block-scoped variable?",
      options: ["var", "let", "const", "function"],
      answer: 1,
      explanation: "let declares a block-scoped variable.",
    },
  ],
  typescript: [
    {
      id: "typescript-1",
      xp: 85,
      question: "Which type is used for a string value?",
      options: ["number", "boolean", "string", "object"],
      answer: 2,
      explanation: "The string type represents text values.",
    },
  ],
  java: [
    {
      id: "java-1",
      xp: 85,
      question: "Which keyword creates a new object instance?",
      options: ["extends", "implements", "new", "class"],
      answer: 2,
      explanation: "The new keyword allocates a new object instance.",
    },
  ],
  cpp: [
    {
      id: "cpp-1",
      xp: 90,
      question: "Which keyword is used to define a class in C++?",
      options: ["struct", "class", "interface", "function"],
      answer: 1,
      explanation: "Classes are declared with the class keyword.",
    },
  ],
  csharp: [
    {
      id: "csharp-1",
      xp: 85,
      question: "Which keyword is used to create a class in C#?",
      options: ["class", "interface", "struct", "enum"],
      answer: 0,
      explanation: "The class keyword defines a class in C#.",
    },
  ],
  go: [
    {
      id: "go-1",
      xp: 85,
      question: "How do you declare a function in Go?",
      options: ["function name()", "func name()", "def name()", "fn name()"],
      answer: 1,
      explanation: "Go uses the func keyword to declare functions.",
    },
  ],
  rust: [
    {
      id: "rust-1",
      xp: 90,
      question: "Which keyword is used for immutable bindings in Rust?",
      options: ["let", "mut", "const", "static"],
      answer: 0,
      explanation: "let creates immutable bindings by default in Rust.",
    },
  ],
};

// ─── Language ────────────────────────────────────────────────────────────────

function LanguageScreen({
  onSelect,
}: {
  onSelect: (lang: string) => void;
}) {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-cyan-300 text-xs font-mono tracking-[0.35em]">
            SELECT YOUR WEAPON
          </p>

          <h1 className="text-4xl md:text-6xl font-mono font-black text-white mt-2">
            Pick a Language
          </h1>

          <p className="text-white/30 font-mono text-sm mt-3">
            Choose the language you want to master.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {LANGUAGES.map((language, index) => (
            <motion.button
              key={language.id}
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.04,
              }}
              whileHover={{
                y: -7,
                scale: 1.025,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={() =>
                onSelect(language.id)
              }
              className="text-left rounded-2xl border border-white/10 bg-white/5 p-5 relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle at top left, ${language.bg}, transparent 60%)`,
                }}
              />

              <div className="relative">
                <div className="flex justify-between">
                  <span className="text-4xl">
                    {language.icon}
                  </span>

                  <ChevronRight
                    size={18}
                    className="text-white/20"
                  />
                </div>

                <h3 className="text-white font-mono font-black mt-5">
                  {language.name}
                </h3>

                <p className="text-white/30 text-xs mt-2 leading-relaxed">
                  {language.desc}
                </p>

                <div
                  className="mt-4 text-[9px] font-mono"
                  style={{
                    color: language.color,
                  }}
                >
                  7 CHALLENGES
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Reviewer ────────────────────────────────────────────────────────────────

function ReviewerScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [selectedLanguage, setSelectedLanguage] =
    useState<string | null>(null);

  const language =
    LANGUAGES.find(
      (item) => item.id === selectedLanguage
    );

  const questions = selectedLanguage
    ? QUESTIONS[selectedLanguage] ?? []
    : [];

  if (!language) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/40 font-mono text-sm mb-8"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="text-center mb-10">
            <p className="text-cyan-300 text-xs font-mono tracking-[0.3em]">
              STUDY MODE
            </p>

            <h1 className="text-4xl md:text-6xl font-mono font-black text-white mt-2">
              Code Reviewer
            </h1>

            <p className="text-white/30 font-mono text-sm mt-3">
              Review concepts, answers, and explanations
              before entering the arena.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {LANGUAGES.map((lang) => (
              <motion.button
                key={lang.id}
                whileHover={{
                  y: -6,
                  scale: 1.03,
                }}
                onClick={() =>
                  setSelectedLanguage(lang.id)
                }
                className="text-left rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="text-3xl">
                  {lang.icon}
                </div>

                <h3 className="text-white font-mono font-black mt-4">
                  {lang.name}
                </h3>

                <p
                  className="text-[9px] font-mono mt-2"
                  style={{
                    color: lang.color,
                  }}
                >
                  REVIEW 7 TOPICS →
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedLanguage(null)}
          className="flex items-center gap-2 text-white/40 font-mono text-sm mb-6"
        >
          <ArrowLeft size={16} />
          Languages
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="text-5xl">
            {language.icon}
          </div>

          <div>
            <p
              className="text-xs font-mono"
              style={{
                color: language.color,
              }}
            >
              REVIEWER
            </p>

            <h1 className="text-3xl md:text-5xl text-white font-mono font-black">
              {language.name}
            </h1>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex justify-between gap-3 mb-3">
                <span
                  className="text-[10px] font-mono font-black"
                  style={{
                    color: language.color,
                  }}
                >
                  TOPIC {index + 1}
                </span>

                <span className="text-[10px] text-yellow-300/60 font-mono">
                  +{question.xp} XP
                </span>
              </div>

              <h2 className="text-white font-mono font-bold text-sm md:text-base leading-relaxed">
                {question.question}
              </h2>

              {question.code && (
                <div className="mt-4">
                  <CodeBlock code={question.code} />
                </div>
              )}

              <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                <p className="text-green-300 text-xs font-mono font-black">
                  ANSWER
                </p>

                <p className="text-white/70 text-sm font-mono mt-1">
                  {question.options[question.answer]}
                </p>
              </div>

              <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <p className="text-cyan-300 text-xs font-mono font-black">
                  EXPLANATION
                </p>

                <p className="text-white/50 text-xs md:text-sm font-mono leading-relaxed mt-1">
                  {question.explanation}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Speed Timer ─────────────────────────────────────────────────────────────

function SpeedTimer({
  time,
  maxTime,
}: {
  time: number;
  maxTime: number;
}) {
  const percentage =
    Math.max(time, 0) / maxTime * 100;

  const danger = time <= 5;

  return (
    <motion.div
      animate={
        danger
          ? {
              scale: [1, 1.04, 1],
            }
          : {}
      }
      transition={{
        repeat: danger ? Infinity : 0,
        duration: 0.5,
      }}
      className={`rounded-2xl border p-4 ${
        danger
          ? "border-red-500/50 bg-red-500/10"
          : "border-orange-500/20 bg-orange-500/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-xs font-black ${
            danger
              ? "text-red-300"
              : "text-orange-300"
          }`}
        >
          ⏱️ TIME REMAINING
        </span>

        <span
          className={`font-mono text-2xl font-black ${
            danger
              ? "text-red-300"
              : "text-orange-300"
          }`}
        >
          {time}s
        </span>
      </div>

      <div className="h-2 bg-black/20 rounded-full mt-3 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            danger
              ? "bg-red-500"
              : "bg-orange-500"
          }`}
          animate={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Game Screen ─────────────────────────────────────────────────────────────

function GameScreen({
  langId,
  mode,
  onFinish,
}: {
  langId: string;
  mode: GameMode;
  onFinish: (
    score: number,
    xp: number,
    correct: number
  ) => void;
}) {
  const allQuestions = QUESTIONS[langId] ?? [];

  const questions =
    mode === "speed"
      ? allQuestions.slice(0, 5)
      : allQuestions;

  const lang =
    LANGUAGES.find(
      (item) => item.id === langId
    )!;

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] =
    useState<number | null>(null);
  const [answerState, setAnswerState] =
    useState<AnswerState>("idle");

  const [totalXP, setTotalXP] =
    useState(0);

  const [correctCount, setCorrectCount] =
    useState(0);

  const [streak, setStreak] =
    useState(0);

  const [showExplanation, setShowExplanation] =
    useState(false);

  const [showParticles, setShowParticles] =
    useState(false);

  const [particleCorrect, setParticleCorrect] =
    useState(false);

  const [xpLevel, setXpLevel] =
    useState(1);

  const [enemyHP, setEnemyHP] =
    useState(100);

  const [playerHP, setPlayerHP] =
    useState(100);

  const [battleMessage, setBattleMessage] =
    useState("Choose your attack.");

  const [timeLeft, setTimeLeft] =
    useState(mode === "speed" ? 15 : 0);

  const currentQ = questions[qIndex];

  const isLast =
    qIndex === questions.length - 1;

  // Speed timer
  useEffect(() => {
    if (mode !== "speed") return;

    if (answerState !== "idle") return;

    if (timeLeft <= 0) {
      setAnswerState("wrong");
      setSelected(null);
      setShowExplanation(true);
      setStreak(0);
      soundWrong();

      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          soundTick();
          return 0;
        }

        if (previous <= 5) {
          soundTick();
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    mode,
    timeLeft,
    answerState,
  ]);

  const answerQuestion = useCallback(
    (index: number | null) => {
      if (answerState !== "idle") return;

      const correct =
        index !== null &&
        index === currentQ.answer;

      setSelected(index);
      setAnswerState(
        correct ? "correct" : "wrong"
      );
      setShowExplanation(true);
      setParticleCorrect(correct);
      setShowParticles(true);

      window.setTimeout(
        () => setShowParticles(false),
        900
      );

      if (correct) {
        soundCorrect();

        const bonus =
          streak >= 2
            ? Math.round(
                currentQ.xp * 0.5
              )
            : 0;

        const earned =
          currentQ.xp + bonus;

        setTotalXP((previous) => {
          const next =
            previous + earned;

          setXpLevel(
            Math.floor(next / 50) + 1
          );

          return next;
        });

        setCorrectCount(
          (previous) => previous + 1
        );

        setStreak(
          (previous) => previous + 1
        );

        if (mode === "battle") {
          soundAttack();

          setEnemyHP((previous) =>
            Math.max(
              0,
              previous - 20
            )
          );

          setBattleMessage(
            "⚡ CRITICAL HIT! Code Slash!"
          );
        }
      } else {
        soundWrong();

        setStreak(0);

        if (mode === "battle") {
          setPlayerHP((previous) =>
            Math.max(
              0,
              previous - 15
            )
          );

          setBattleMessage(
            "💥 Code Beast counterattacks!"
          );
        }
      }
    },
    [
      answerState,
      currentQ,
      mode,
      streak,
    ]
  );

  // Automatic timeout
  useEffect(() => {
    if (
      mode === "speed" &&
      timeLeft === 0 &&
      answerState === "idle"
    ) {
      answerQuestion(null);
    }
  }, [
    mode,
    timeLeft,
    answerState,
    answerQuestion,
  ]);

  const handleNext = () => {
    if (isLast) {
      onFinish(
        Math.round(
          (correctCount /
            questions.length) *
            100
        ),
        totalXP,
        correctCount
      );

      return;
    }

    setQIndex(
      (previous) => previous + 1
    );

    setSelected(null);
    setAnswerState("idle");
    setShowExplanation(false);

    if (mode === "speed") {
      setTimeLeft(15);
    }
  };

  const progress =
    (qIndex / questions.length) * 100;

  return (
    <div className="min-h-screen px-4 py-5 md:px-8">
      <ParticleEffect
        active={showParticles}
        correct={particleCorrect}
      />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {lang.icon}
            </span>

            <span className="text-white font-mono font-black">
              {lang.name}
            </span>
          </div>

          <span className="text-white/40 font-mono text-xs">
            {qIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="mb-4">
          <MusicPlayer />
        </div>

        {mode === "speed" && (
          <div className="mb-4">
            <SpeedTimer
              time={timeLeft}
              maxTime={15}
            />
          </div>
        )}

        <XPBar
          current={totalXP}
          max={xpLevel * 50}
          level={xpLevel}
        />

        <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-4 mb-5">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
            animate={{
              width: `${progress}%`,
            }}
          />
        </div>

        {mode === "battle" && (
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 rgba(239,68,68,0)",
                "0 0 45px rgba(168,85,247,.25)",
                "0 0 0 rgba(239,68,68,0)",
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
            className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-red-500/10 via-purple-500/10 to-cyan-500/10 p-5 mb-5"
          >
            <div className="flex justify-center gap-5 mb-5">
              <motion.div
                animate={{
                  y: [0, -7, 0],
                  rotate: [-3, 3, -3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                }}
                className="text-5xl"
              >
                👾
              </motion.div>

              <div className="text-center">
                <p className="text-[9px] text-white/30 font-mono tracking-widest">
                  CODE BATTLE
                </p>

                <p className="text-purple-300 font-mono font-black text-xs mt-1">
                  YOUR SKILL IS YOUR WEAPON
                </p>
              </div>

              <motion.div
                animate={{
                  y: [0, 7, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                }}
                className="text-5xl"
              >
                🧑‍💻
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-[9px] font-mono mb-1">
                  <span className="text-red-300">
                    CODE BEAST
                  </span>

                  <span className="text-red-300">
                    {enemyHP} HP
                  </span>
                </div>

                <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-600 to-pink-500"
                    animate={{
                      width: `${enemyHP}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[9px] font-mono mb-1">
                  <span className="text-cyan-300">
                    YOU
                  </span>

                  <span className="text-cyan-300">
                    {playerHP} HP
                  </span>
                </div>

                <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    animate={{
                      width: `${playerHP}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <motion.div
              key={battleMessage}
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="mt-4 rounded-xl bg-black/20 border border-white/10 py-3 text-center"
            >
              <span className="text-xs font-mono font-black text-white/70">
                {battleMessage}
              </span>
            </motion.div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{
              opacity: 0,
              x: 80,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: -80,
              scale: 0.96,
            }}
            transition={{
              duration: 0.35,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-3 py-1 rounded-full border text-[10px] font-mono font-bold"
                style={{
                  color: lang.color,
                  borderColor: `${lang.color}55`,
                  backgroundColor: `${lang.color}15`,
                }}
              >
                {currentQ.type === "multiple"
                  ? "MULTIPLE CHOICE"
                  : currentQ.type === "code"
                  ? "CODE CHALLENGE"
                  : "TRUE / FALSE"}
              </span>

              <span className="text-yellow-300/60 text-[10px] font-mono">
                +{currentQ.xp} XP
              </span>

              {streak >= 2 && (
                <motion.span
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  className="text-orange-300 text-[10px] font-mono"
                >
                  🔥 {streak}x STREAK
                </motion.span>
              )}
            </div>

            <h2 className="text-xl md:text-3xl font-mono font-black text-white leading-relaxed mb-5">
              {currentQ.question}
            </h2>

            {currentQ.code && (
              <div className="mb-5">
                <CodeBlock
                  code={currentQ.code}
                />
              </div>
            )}

            <div className="space-y-3">
              {currentQ.options.map(
                (option, index) => {
                  const isCorrect =
                    index ===
                    currentQ.answer;

                  const isSelected =
                    index === selected;

                  let classes =
                    "border-white/10 bg-white/5 text-white/70";

                  if (
                    answerState !== "idle"
                  ) {
                    if (isCorrect) {
                      classes =
                        "border-green-500/60 bg-green-500/15 text-green-300";
                    } else if (
                      isSelected
                    ) {
                      classes =
                        "border-red-500/60 bg-red-500/15 text-red-300";
                    } else {
                      classes =
                        "border-white/5 bg-white/[0.02] text-white/20";
                    }
                  }

                  return (
                    <motion.button
                      key={index}
                      disabled={
                        answerState !==
                        "idle"
                      }
                      onClick={() =>
                        answerQuestion(
                          index
                        )
                      }
                      whileHover={
                        answerState ===
                        "idle"
                          ? {
                              scale: 1.015,
                              x: 5,
                            }
                          : {}
                      }
                      whileTap={{
                        scale: 0.98,
                      }}
                      className={`w-full text-left p-4 md:p-5 rounded-2xl border transition-all ${classes}`}
                    >
                      <span className="inline-flex w-8 h-8 rounded-lg bg-white/10 items-center justify-center mr-3 text-xs font-mono font-black">
                        {String.fromCharCode(
                          65 + index
                        )}
                      </span>

                      <span className="font-mono text-sm">
                        {option}
                      </span>

                      {answerState !==
                        "idle" &&
                        isCorrect && (
                          <CheckCircle2
                            size={18}
                            className="float-right text-green-400"
                          />
                        )}

                      {answerState !==
                        "idle" &&
                        isSelected &&
                        !isCorrect && (
                          <XCircle
                            size={18}
                            className="float-right text-red-400"
                          />
                        )}
                    </motion.button>
                  );
                }
              )}
            </div>

            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 15,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    height: "auto",
                  }}
                  className="mt-5"
                >
                  <div
                    className={`rounded-2xl border p-5 ${
                      answerState ===
                      "correct"
                        ? "border-green-500/30 bg-green-500/10"
                        : "border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    <div className="flex gap-3">
                      {answerState ===
                      "correct" ? (
                        <CheckCircle2 className="text-green-400 shrink-0" />
                      ) : (
                        <XCircle className="text-red-400 shrink-0" />
                      )}

                      <div>
                        <p
                          className={`font-mono font-black text-sm ${
                            answerState ===
                            "correct"
                              ? "text-green-300"
                              : "text-red-300"
                          }`}
                        >
                          {answerState ===
                          "correct"
                            ? "CORRECT! 🔥"
                            : "NOT QUITE! 💀"}
                        </p>

                        <p className="text-white/50 font-mono text-xs leading-relaxed mt-2">
                          {currentQ.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {answerState !==
              "idle" && (
              <motion.button
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={handleNext}
                className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-600 text-white font-mono font-black"
              >
                {isLast
                  ? "🏆 See Results"
                  : "Next Question →"}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Duel Setup ──────────────────────────────────────────────────────────────

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
  onStart: (
    friendName: string,
    friendRank: string,
    friendPhoto: string
  ) => void;
  onBack: () => void;
}) {
  const [friendName, setFriendName] =
    useState("");

  const [friendRank, setFriendRank] =
    useState(RANKS[2].name);

  const [friendPhoto, setFriendPhoto] =
    useState("");

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 font-mono text-sm mb-8"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="text-center mb-10">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [-4, 4, -4],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
            className="inline-flex text-6xl"
          >
            ⚔️
          </motion.div>

          <p className="text-pink-300 text-xs font-mono tracking-[0.4em] mt-5">
            1V1 FRIEND ARENA
          </p>

          <h1 className="text-4xl md:text-6xl text-white font-mono font-black mt-2">
            DUEL MODE
          </h1>

          <p className="text-white/30 font-mono text-sm mt-3">
            Two coders. One winner. Zero excuses.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-7">
          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">
            <p className="text-cyan-300 text-[10px] font-mono font-black tracking-widest">
              PLAYER ONE
            </p>

            <div className="flex items-center gap-4 mt-4">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  className="w-20 h-20 rounded-2xl object-cover"
                  alt="You"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-3xl">
                  👨‍💻
                </div>
              )}

              <div>
                <h2 className="text-white font-mono font-black text-xl">
                  {profile.username}
                </h2>

                <p className="text-white/30 text-xs font-mono">
                  {profile.yearLevel}
                </p>

                <div className="mt-2">
                  <RankBadge
                    totalXP={totalXP}
                    compact
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-pink-500/20 bg-pink-500/10 p-6">
            <p className="text-pink-300 text-[10px] font-mono font-black tracking-widest">
              PLAYER TWO
            </p>

            <input
              value={friendName}
              onChange={(e) =>
                setFriendName(e.target.value)
              }
              placeholder="Friend username"
              className="w-full mt-4 rounded-xl border border-white/10 bg-black/20 text-white placeholder:text-white/20 px-4 py-3 outline-none focus:border-pink-500/50"
            />

            <select
              value={friendRank}
              onChange={(e) =>
                setFriendRank(e.target.value)
              }
              className="w-full mt-3 rounded-xl border border-white/10 bg-[#11111f] text-white px-4 py-3"
            >
              {RANKS.map((rank) => (
                <option key={rank.name}>
                  {rank.name}
                </option>
              ))}
            </select>

            <label className="mt-3 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white/50 text-xs font-mono">
              <Camera size={14} />
              {friendPhoto
                ? "Friend Photo Added"
                : "Add Friend Photo"}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (!file) return;

                  if (
                    file.size >
                    2 * 1024 * 1024
                  ) {
                    alert(
                      "Please choose an image smaller than 2MB."
                    );
                    return;
                  }

                  const reader =
                    new FileReader();

                  reader.onload = () =>
                    setFriendPhoto(
                      String(reader.result)
                    );

                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-7">
          <div className="flex items-center gap-3 mb-5">
            <Swords className="text-purple-400" />

            <div>
              <h2 className="text-white font-mono font-black">
                Choose Duel Language
              </h2>

              <p className="text-white/25 text-[10px] font-mono">
                Five questions per duel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LANGUAGES.map((language) => (
              <motion.button
                key={language.id}
                whileHover={{
                  scale: 1.04,
                  y: -3,
                }}
                onClick={() =>
                  onSelectLanguage(
                    language.id
                  )
                }
                className={`text-left rounded-2xl border p-4 transition-all ${
                  selectedLang ===
                  language.id
                    ? "border-purple-400/70 bg-purple-500/20 shadow-lg shadow-purple-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="text-2xl">
                  {language.icon}
                </div>

                <p className="text-white font-mono font-bold text-xs mt-2">
                  {language.name}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{
            scale: 1.02,
            boxShadow:
              "0 0 45px rgba(236,72,153,.2)",
          }}
          whileTap={{
            scale: 0.97,
          }}
          disabled={
            !selectedLang ||
            !friendName.trim()
          }
          onClick={() =>
            onStart(
              friendName.trim(),
              friendRank,
              friendPhoto
            )
          }
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 text-white font-mono font-black text-lg disabled:opacity-30"
        >
          ⚔️ ENTER THE ARENA
        </motion.button>
      </div>
    </div>
  );
}

// ─── Duel Screen ─────────────────────────────────────────────────────────────

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
  onFinish: (
    result: DuelResult
  ) => void;
}) {
  const questions = (
    QUESTIONS[langId] ?? []
  ).slice(0, 5);

  const lang =
    LANGUAGES.find(
      (item) => item.id === langId
    )!;

  const [qIndex, setQIndex] =
    useState(0);

  const [turn, setTurn] =
    useState<"you" | "friend">(
      "you"
    );

  const [selected, setSelected] =
    useState<number | null>(null);

  const [youScore, setYouScore] =
    useState(0);

  const [friendScore, setFriendScore] =
    useState(0);

  const [locked, setLocked] =
    useState(false);

  const [attack, setAttack] =
    useState<"you" | "friend" | null>(
      null
    );

  const [emote, setEmote] =
    useState("😎");

  const [resultReady, setResultReady] =
    useState(false);

  const currentQ = questions[qIndex];

  const friendRank =
    RANKS.find(
      (rank) =>
        rank.name === friendRankName
    ) ?? RANKS[2];

  const friendEmotes = [
    "😎",
    "🔥",
    "😂",
    "💀",
    "😤",
    "🤓",
    "😈",
    "🫡",
    "🤯",
    "👏",
  ];

  const randomEmote = () =>
    friendEmotes[
      Math.floor(
        Math.random() *
          friendEmotes.length
      )
    ];

  const answer = (index: number) => {
    if (locked) return;

    setSelected(index);
    setLocked(true);

    const correct =
      index === currentQ.answer;

    if (correct) {
      soundCorrect();

      setAttack(turn);

      setEmote(
        turn === "friend"
          ? randomEmote()
          : "🔥"
      );

      if (turn === "you") {
        setYouScore(
          (previous) => previous + 1
        );
      } else {
        setFriendScore(
          (previous) => previous + 1
        );
      }
    } else {
      soundWrong();

      setEmote(
        turn === "friend"
          ? "😂"
          : "💀"
      );
    }

    setTimeout(() => {
      setAttack(null);

      setSelected(null);
      setLocked(false);

      if (turn === "you") {
        setTurn("friend");
      } else if (
        qIndex <
        questions.length - 1
      ) {
        setQIndex(
          (previous) =>
            previous + 1
        );

        setTurn("you");
      } else {
        setResultReady(true);
      }
    }, 950);
  };

  useEffect(() => {
    if (!resultReady) return;

    const finalResult = {
      youScore,
      friendScore,
      friendName,
    };

    const timer = window.setTimeout(
      () => {
        if (
          youScore >
          friendScore
        ) {
          soundWin();
        } else if (
          friendScore >
          youScore
        ) {
          soundLose();
        }

        onFinish(finalResult);
      },
      1000
    );

    return () =>
      clearTimeout(timer);
  }, [
    resultReady,
    youScore,
    friendScore,
    friendName,
    onFinish,
  ]);

  if (resultReady) {
    const winner =
      youScore > friendScore
        ? "you"
        : friendScore > youScore
        ? "friend"
        : "draw";

    return (
      <DuelWinnerOverlay
        winner={winner}
        profile={profile}
        friendName={friendName}
        friendPhoto={friendPhoto}
        youScore={youScore}
        friendScore={friendScore}
      />
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 relative overflow-hidden">
      {/* Attack animation */}
      <AnimatePresence>
        {attack && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.2,
            }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0.2, 1.7, 2.5],
              rotate: [0, 15, -15],
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            className={`fixed inset-0 z-[100] pointer-events-none flex items-center justify-center ${
              attack === "you"
                ? "text-cyan-300"
                : "text-pink-300"
            }`}
          >
            <div className="text-8xl md:text-[12rem]">
              {attack === "you"
                ? "⚡"
                : "💥"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-pink-300 text-[9px] font-mono tracking-widest">
              1V1 CODE ARENA
            </p>

            <h1 className="text-white font-mono font-black text-xl md:text-2xl">
              {lang.icon} {lang.name}
            </h1>
          </div>

          <div className="text-right">
            <p className="text-white/30 font-mono text-[9px]">
              ROUND
            </p>

            <p className="text-white font-mono font-black">
              {qIndex + 1}/5
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <motion.div
            animate={{
              scale:
                turn === "you"
                  ? 1.04
                  : 1,
            }}
            className={`rounded-3xl border p-5 ${
              turn === "you"
                ? "border-cyan-400/60 bg-cyan-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  className="w-16 h-16 rounded-2xl object-cover"
                  alt="You"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-2xl">
                  👨‍💻
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-white font-mono font-black truncate">
                  {profile.username}
                </p>

                <p className="text-cyan-300 text-[9px] font-mono">
                  YOU
                </p>

                <div className="mt-1">
                  <RankBadge
                    totalXP={totalXP}
                    compact
                  />
                </div>
              </div>

              <div className="text-4xl font-mono font-black text-cyan-300">
                {youScore}
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{
              scale:
                turn === "friend"
                  ? 1.04
                  : 1,
            }}
            className={`rounded-3xl border p-5 ${
              turn === "friend"
                ? "border-pink-400/60 bg-pink-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-pink-500/10 flex items-center justify-center text-2xl">
                {friendPhoto ? (
                  <img
                    src={friendPhoto}
                    className="w-full h-full object-cover"
                    alt="Friend"
                  />
                ) : (
                  "🧑‍💻"
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-mono font-black truncate">
                  {friendName}
                </p>

                <p className="text-pink-300 text-[9px] font-mono">
                  FRIEND
                </p>

                <div className="mt-1">
                  <RankBadge
                    totalXP={
                      friendRank.minXP
                    }
                    compact
                  />
                </div>
              </div>

              <div className="text-4xl font-mono font-black text-pink-300">
                {friendScore}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          key={`${turn}-${qIndex}`}
          initial={{
            opacity: 0,
            scale: 0.8,
            y: 15,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          className="text-center mb-5"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-purple-500/20 bg-purple-500/10">
            <span className="text-xl">
              {turn === "you"
                ? "🔥"
                : emote}
            </span>

            <span className="text-purple-300 font-mono text-xs font-black">
              {turn === "you"
                ? `${profile.username}'s turn`
                : `${friendName}'s turn`}
            </span>
          </div>

          {turn === "friend" && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="text-5xl mt-3"
            >
              {emote}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          key={qIndex}
          initial={{
            opacity: 0,
            x: 80,
            rotateY: 15,
          }}
          animate={{
            opacity: 1,
            x: 0,
            rotateY: 0,
          }}
          className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/5 p-5 md:p-8 shadow-2xl"
        >
          <p className="text-white/30 text-xs font-mono mb-4">
            CODING DUEL QUESTION
          </p>

          <h2 className="text-xl md:text-2xl font-mono font-black text-white leading-relaxed mb-5">
            {currentQ.question}
          </h2>

          {currentQ.code && (
            <div className="mb-5">
              <CodeBlock
                code={currentQ.code}
              />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            {currentQ.options.map(
              (option, index) => (
                <motion.button
                  key={index}
                  disabled={locked}
                  onClick={() =>
                    answer(index)
                  }
                  whileHover={{
                    scale: 1.03,
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  className={`text-left p-4 rounded-2xl border font-mono text-sm ${
                    selected === index
                      ? index ===
                        currentQ.answer
                        ? "border-green-400 bg-green-500/15 text-green-300"
                        : "border-red-400 bg-red-500/15 text-red-300"
                      : "border-white/10 bg-black/10 text-white/70"
                  }`}
                >
                  <span className="inline-flex w-8 h-8 rounded-lg bg-white/10 items-center justify-center mr-2">
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  {option}
                </motion.button>
              )
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Duel Winner ─────────────────────────────────────────────────────────────

function DuelWinnerOverlay({
  winner,
  profile,
  friendName,
  friendPhoto,
  youScore,
  friendScore,
}: {
  winner: "you" | "friend" | "draw";
  profile: StudentProfile;
  friendName: string;
  friendPhoto: string;
  youScore: number;
  friendScore: number;
}) {
  const youWon = winner === "you";
  const friendWon = winner === "friend";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Victory background */}
      <motion.div
        initial={{
          scale: 0,
          opacity: 0,
        }}
        animate={{
          scale: 1.5,
          opacity: 1,
        }}
        transition={{
          duration: 1,
        }}
        className={`absolute w-[500px] h-[500px] rounded-full blur-[100px] ${
          youWon
            ? "bg-cyan-500/20"
            : friendWon
            ? "bg-pink-500/20"
            : "bg-purple-500/20"
        }`}
      />

      <div className="relative z-10 max-w-4xl w-full text-center">
        <motion.div
          initial={{
            opacity: 0,
            y: -50,
            scale: 0.5,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            type: "spring",
            duration: 1,
          }}
          className="text-7xl md:text-9xl"
        >
          {youWon
            ? "🏆"
            : friendWon
            ? "😈"
            : "🤝"}
        </motion.div>

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.4,
          }}
          className="text-xs font-mono tracking-[0.5em] text-white/40 mt-5"
        >
          BATTLE COMPLETE
        </motion.p>

        <motion.h1
          initial={{
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.5,
            type: "spring",
          }}
          className={`text-5xl md:text-8xl font-mono font-black mt-2 ${
            youWon
              ? "text-cyan-300"
              : friendWon
              ? "text-pink-300"
              : "text-purple-300"
          }`}
        >
          {youWon
            ? "YOU WIN!"
            : friendWon
            ? `${friendName.toUpperCase()} WINS!`
            : "DRAW!"}
        </motion.h1>

        <p className="text-white/30 font-mono text-sm mt-3">
          {youWon
            ? "Your coding skills dominated the arena. 🔥"
            : friendWon
            ? "Your friend conquered the code arena. 😈"
            : "Both coders survived the battle. 🤝"}
        </p>

        <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto mt-10">
          <motion.div
            initial={{
              opacity: 0,
              x: -50,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.7,
            }}
            className={`rounded-3xl border p-6 ${
              youWon
                ? "border-cyan-400/60 bg-cyan-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            {profile.photo ? (
              <img
                src={profile.photo}
                className="w-24 h-24 rounded-3xl object-cover mx-auto"
                alt="Winner"
              />
            ) : (
              <div className="text-6xl">
                👨‍💻
              </div>
            )}

            <h2 className="text-white font-mono font-black mt-4">
              {profile.username}
            </h2>

            <p className="text-cyan-300 text-5xl font-mono font-black mt-3">
              {youScore}
            </p>

            <p className="text-white/30 text-[10px] font-mono mt-1">
              POINTS
            </p>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 50,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.8,
            }}
            className={`rounded-3xl border p-6 ${
              friendWon
                ? "border-pink-400/60 bg-pink-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="w-24 h-24 rounded-3xl overflow-hidden mx-auto bg-pink-500/10 flex items-center justify-center text-5xl">
              {friendPhoto ? (
                <img
                  src={friendPhoto}
                  className="w-full h-full object-cover"
                  alt="Friend"
                />
              ) : (
                "🧑‍💻"
              )}
            </div>

            <h2 className="text-white font-mono font-black mt-4">
              {friendName}
            </h2>

            <p className="text-pink-300 text-5xl font-mono font-black mt-3">
              {friendScore}
            </p>

            <p className="text-white/30 text-[10px] font-mono mt-1">
              POINTS
            </p>
          </motion.div>
        </div>

        <div className="mt-8 text-4xl">
          {youWon
            ? "🔥 ⚡ 🏆 ⚡ 🔥"
            : friendWon
            ? "😈 💀 🔥 💀 😈"
            : "🤝 ⚔️ 🤝 ⚔️ 🤝"}
        </div>
      </div>
    </div>
  );
}

// ─── Guidelines ──────────────────────────────────────────────────────────────

function GuidelinesScreen({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const guidelines = [
    "Read every question carefully.",
    "Practice Mode gives explanations after every answer.",
    "Battle Mode turns correct answers into attacks.",
    "Speed Mode gives you 15 seconds per question.",
    "Build streaks to earn bonus XP.",
    "Use Reviewer Mode before difficult challenges.",
    "Use the Music Player to choose your coding soundtrack.",
    "Your profile and XP are stored locally on your device.",
    "1v1 Friend Arena is currently pass-and-play on the same device.",
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 font-mono text-sm mb-8"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="text-5xl">
            📖
          </div>

          <h1 className="text-4xl font-mono font-black text-white mt-3">
            Quest Guidelines
          </h1>
        </div>

        <div className="space-y-3">
          {guidelines.map(
            (item, index) => (
              <motion.div
                key={item}
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: index * 0.05,
                }}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <span className="w-7 h-7 shrink-0 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-mono font-black">
                  {index + 1}
                </span>

                <p className="text-white/60 text-sm font-mono leading-relaxed">
                  {item}
                </p>
              </motion.div>
            )
          )}
        </div>

        <button
          onClick={onContinue}
          className="w-full mt-7 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-black"
        >
          Choose a Language →
        </button>
      </div>
    </div>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

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
  const lang =
    LANGUAGES.find(
      (item) => item.id === langId
    )!;

  const grade =
    score >= 90
      ? {
          label: "MASTER",
          color: "#f59e0b",
          icon: "🏆",
        }
      : score >= 70
      ? {
          label: "SKILLED",
          color: "#a78bfa",
          icon: "⭐",
        }
      : score >= 50
      ? {
          label: "LEARNING",
          color: "#06b6d4",
          icon: "📚",
        }
      : {
          label: "KEEP GOING",
          color: "#f97316",
          icon: "💪",
        };

  useEffect(() => {
    if (score >= 70) {
      soundWin();
    }
  }, [score]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.7,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          type: "spring",
          duration: 0.8,
        }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          animate={{
            rotate: [0, -10, 10, -5, 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1,
          }}
          className="text-7xl"
        >
          {grade.icon}
        </motion.div>

        <p
          className="font-mono font-black text-3xl tracking-widest mt-4"
          style={{
            color: grade.color,
          }}
        >
          {grade.label}
        </p>

        <motion.div
          initial={{
            scale: 0,
          }}
          animate={{
            scale: 1,
          }}
          transition={{
            delay: 0.3,
            type: "spring",
          }}
          className="text-8xl font-mono font-black text-white mt-2"
        >
          {score}%
        </motion.div>

        <p className="text-white/30 font-mono text-sm">
          {correct} of {total} correct
          {" · "}
          +{xp} XP
        </p>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mt-7 text-left">
          <div className="flex items-center gap-4">
            {profile.photo ? (
              <img
                src={profile.photo}
                className="w-20 h-20 rounded-2xl object-cover"
                alt="Student"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center text-3xl">
                👨‍💻
              </div>
            )}

            <div className="flex-1">
              <p className="text-white font-mono font-black">
                {profile.username}
              </p>

              <p className="text-white/30 text-xs font-mono mt-1">
                {profile.yearLevel}
              </p>

              <p className="text-white/30 text-xs font-mono">
                {profile.school}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <RankBadge
            totalXP={totalXP}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-green-400 text-2xl font-mono font-black">
              {correct}
            </p>
            <p className="text-white/25 text-[9px] font-mono">
              CORRECT
            </p>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-red-400 text-2xl font-mono font-black">
              {total - correct}
            </p>
            <p className="text-white/25 text-[9px] font-mono">
              WRONG
            </p>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-yellow-400 text-2xl font-mono font-black">
              +{xp}
            </p>
            <p className="text-white/25 text-[9px] font-mono">
              XP
            </p>
          </div>
        </div>

        <div className="mt-6 text-white/40 font-mono text-xs">
          {lang.icon} {lang.name} complete
        </div>

        <div className="flex gap-3 mt-7">
          <button
            onClick={onReplay}
            className="flex-1 py-4 rounded-xl border border-white/10 bg-white/5 text-white/60 font-mono font-bold"
          >
            <RotateCcw
              size={15}
              className="inline mr-2"
            />
            Retry
          </button>

          <button
            onClick={onHome}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-mono font-bold"
          >
            New Quest
          </button>
        </div>

        {/* Keep the existing file-upload behavior if desired */}
        {!profile.photo && (
          <label className="block mt-4 cursor-pointer text-purple-300 text-xs font-mono">
            📸 Add your profile photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file =
                  e.target.files?.[0];

                if (!file) return;

                if (
                  file.size >
                  2 * 1024 * 1024
                ) {
                  alert(
                    "Please choose an image smaller than 2MB."
                  );
                  return;
                }

                const reader =
                  new FileReader();

                reader.onload = () =>
                  onPhotoUpdate(
                    String(
                      reader.result
                    )
                  );

                reader.readAsDataURL(file);
              }}
            />
          </label>
        )}
      </motion.div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] =
    useState<Screen>("welcome");

  const [gameMode, setGameMode] =
    useState<GameMode>("practice");

  const [selectedLang, setSelectedLang] =
    useState<string | null>(null);

  const [results, setResults] =
    useState<{
      score: number;
      xp: number;
      correct: number;
    } | null>(null);

  const [lifetimeXP, setLifetimeXP] =
    useState(() =>
      Number(
        localStorage.getItem(
          "codequest-total-xp"
        ) || 0
      )
    );

  const [duelLang, setDuelLang] =
    useState<string | null>(null);

  const [friendName, setFriendName] =
    useState("");

  const [friendRankName, setFriendRankName] =
    useState(RANKS[2].name);

  const [friendPhoto, setFriendPhoto] =
    useState("");

  const [duelResult, setDuelResult] =
    useState<DuelResult | null>(null);

  const [darkMode, setDarkMode] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "codequest-theme"
        );

      return saved !== "light";
    });

  const defaultProfile: StudentProfile =
    {
      username: "",
      yearLevel: "",
      school: "",
      photo: "",
      mood: "focused",
    };

  const [profile, setProfile] =
    useState<StudentProfile>(() => {
      try {
        const saved =
          JSON.parse(
            localStorage.getItem(
              "codequest-profile"
            ) || "{}"
          );

        return {
          ...defaultProfile,
          ...saved,
        };
      } catch {
        return defaultProfile;
      }
    });

  const totalQs = selectedLang
    ? QUESTIONS[selectedLang]?.length ?? 0
    : 0;

  useEffect(() => {
    localStorage.setItem(
      "codequest-theme",
      darkMode ? "dark" : "light"
    );

    document.documentElement.style.colorScheme =
      darkMode ? "dark" : "light";
  }, [darkMode]);

  const saveProfile = (
    next: StudentProfile
  ) => {
    setProfile(next);

    localStorage.setItem(
      "codequest-profile",
      JSON.stringify(next)
    );

    setScreen("home");
  };

  const continueFromWelcome = () => {
    if (
      !profile.username ||
      !profile.yearLevel ||
      !profile.school
    ) {
      setScreen("profile");
    } else {
      setScreen("home");
    }
  };

  const addLifetimeXP = (
    earned: number
  ) => {
    setLifetimeXP((previous) => {
      const next =
        previous + earned;

      localStorage.setItem(
        "codequest-total-xp",
        String(next)
      );

      return next;
    });
  };

  const updatePhoto = (
    photo: string
  ) => {
    const next = {
      ...profile,
      photo,
    };

    setProfile(next);

    localStorage.setItem(
      "codequest-profile",
      JSON.stringify(next)
    );
  };

  return (
    <div
      className={`${
        darkMode
          ? "dark-mode"
          : "light-mode"
      } min-h-screen text-foreground overflow-x-hidden`}
      style={{
        fontFamily:
          "'JetBrains Mono', 'Inter', monospace",
      }}
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: darkMode
              ? `
                linear-gradient(
                  rgba(255,255,255,.025) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(255,255,255,.025) 1px,
                  transparent 1px
                )
              `
              : `
                linear-gradient(
                  rgba(17,24,39,.035) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(17,24,39,.035) 1px,
                  transparent 1px
                )
              `,
            backgroundSize:
              "40px 40px",
          }}
        />

        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]"
          animate={{
            x: [-150, 200, -150],
            y: [-100, 100, -100],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px]"
          animate={{
            x: [100, -150, 100],
            y: [100, -100, 100],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {screen === "welcome" && (
            <motion.div
              key="welcome"
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 1.05,
              }}
              transition={{
                duration: 0.35,
              }}
            >
              <WelcomeScreen
                darkMode={darkMode}
                onToggleTheme={() =>
                  setDarkMode(
                    (value) => !value
                  )
                }
                onContinue={
                  continueFromWelcome
                }
              />
            </motion.div>
          )}

          {screen === "home" && (
            <motion.div
              key="home"
              initial={{
                opacity: 0,
                x: 80,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -80,
              }}
            >
              <HomeScreen
                profile={profile}
                totalXP={lifetimeXP}
                darkMode={darkMode}
                onToggleTheme={() =>
                  setDarkMode(
                    (value) => !value
                  )
                }
                onStart={() =>
                  setScreen("modes")
                }
                onProfile={() =>
                  setScreen("profile")
                }
                onGuidelines={() =>
                  setScreen("guidelines")
                }
                onReviewer={() =>
                  setScreen("reviewer")
                }
                onDuel={() =>
                  setScreen(
                    "duel-setup"
                  )
                }
              />
            </motion.div>
          )}

          {screen === "profile" && (
            <motion.div
              key="profile"
              initial={{
                opacity: 0,
                x: 80,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
            >
              <ProfileScreen
                profile={profile}
                totalXP={lifetimeXP}
                onSave={saveProfile}
                onBack={() =>
                  setScreen("home")
                }
              />
            </motion.div>
          )}

          {screen === "guidelines" && (
            <motion.div
              key="guidelines"
              initial={{
                opacity: 0,
                x: 80,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
            >
              <GuidelinesScreen
                onBack={() =>
                  setScreen("home")
                }
                onContinue={() =>
                  setScreen("language")
                }
              />
            </motion.div>
          )}

          {screen === "modes" && (
            <motion.div
              key="modes"
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >
              <ModesScreen
                onBack={() =>
                  setScreen("home")
                }
                onSelect={(mode) => {
                  setGameMode(mode);
                  setScreen("language");
                }}
              />
            </motion.div>
          )}

          {screen === "language" && (
            <motion.div
              key="language"
              initial={{
                opacity: 0,
                y: 50,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <LanguageScreen
                onSelect={(language) => {
                  setSelectedLang(
                    language
                  );

                  setResults(null);

                  setScreen("game");
                }}
              />
            </motion.div>
          )}

          {screen === "reviewer" && (
            <motion.div
              key="reviewer"
              initial={{
                opacity: 0,
                y: 50,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <ReviewerScreen
                onBack={() =>
                  setScreen("home")
                }
              />
            </motion.div>
          )}

          {screen === "game" &&
            selectedLang && (
              <motion.div
                key={`game-${selectedLang}`}
                initial={{
                  opacity: 0,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
              >
                <GameScreen
                  langId={selectedLang}
                  mode={gameMode}
                  onFinish={(
                    score,
                    xp,
                    correct
                  ) => {
                    setResults({
                      score,
                      xp,
                      correct,
                    });

                    addLifetimeXP(xp);

                    setScreen(
                      "results"
                    );
                  }}
                />
              </motion.div>
            )}

          {screen ===
            "duel-setup" && (
            <motion.div
              key="duel-setup"
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >
              <DuelSetupScreen
                profile={profile}
                totalXP={lifetimeXP}
                selectedLang={duelLang}
                onSelectLanguage={
                  setDuelLang
                }
                onBack={() =>
                  setScreen("home")
                }
                onStart={(
                  name,
                  rank,
                  photo
                ) => {
                  setFriendName(name);
                  setFriendRankName(
                    rank
                  );
                  setFriendPhoto(
                    photo
                  );
                  setDuelResult(null);
                  setScreen("duel");
                }}
              />
            </motion.div>
          )}

          {screen === "duel" &&
            duelLang && (
              <motion.div
                key={`duel-${duelLang}`}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
              >
                <DuelScreen
                  langId={duelLang}
                  profile={profile}
                  totalXP={lifetimeXP}
                  friendName={friendName}
                  friendRankName={
                    friendRankName
                  }
                  friendPhoto={
                    friendPhoto
                  }
                  onFinish={(
                    result
                  ) => {
                    setDuelResult(
                      result
                    );

                    // Add a small XP reward for completing a duel.
                    addLifetimeXP(
                      result.youScore *
                        10
                    );

                    setScreen("home");
                  }}
                />
              </motion.div>
            )}

          {screen === "results" &&
            selectedLang &&
            results && (
              <motion.div
                key="results"
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
              >
                <ResultsScreen
                  langId={
                    selectedLang
                  }
                  score={
                    results.score
                  }
                  xp={results.xp}
                  correct={
                    results.correct
                  }
                  total={
                    gameMode ===
                    "speed"
                      ? Math.min(
                          5,
                          totalQs
                        )
                      : totalQs
                  }
                  profile={profile}
                  totalXP={
                    lifetimeXP
                  }
                  onPhotoUpdate={
                    updatePhoto
                  }
                  onReplay={() => {
                    setResults(null);
                    setScreen(
                      "game"
                    );
                  }}
                  onHome={() => {
                    setSelectedLang(
                      null
                    );

                    setScreen(
                      "home"
                    );
                  }}
                />
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
