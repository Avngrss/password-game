import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/useGameStore";
import type { TeamKey } from "../types";

export default function GameScreen() {
  const { roomData, playerName, handleGuess, handleFail, removePlayer } =
    useGameStore();
  if (!roomData || roomData.status !== "PLAYING") return null;

  const playerTeam: TeamKey | null = roomData.teams.A.players.includes(
    playerName || "",
  )
    ? "A"
    : roomData.teams.B.players.includes(playerName || "")
      ? "B"
      : null;

  const isActiveTurn = playerTeam && roomData.turn === playerTeam;
  const turnName = roomData.turn === "A" ? "🔴 Team A" : "🔵 Team B";
  const emptyTeam = !roomData.teams.A.players.length
    ? "A"
    : !roomData.teams.B.players.length
      ? "B"
      : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 max-w-md mx-auto space-y-6">
      <div className="w-full flex justify-between bg-gray-800 p-4 rounded-xl shadow-lg">
        <div
          className={`text-center transition-all ${roomData.turn === "A" ? "scale-110" : "opacity-70"}`}
        >
          <p className="text-red-400 font-bold">🔴 A</p>
          <p className="text-3xl font-bold">{roomData.teams.A.score}</p>
        </div>
        <div
          className={`text-center transition-all ${roomData.turn === "B" ? "scale-110" : "opacity-70"}`}
        >
          <p className="text-blue-400 font-bold">🔵 B</p>
          <p className="text-3xl font-bold">{roomData.teams.B.score}</p>
        </div>
      </div>

      <AnimatePresence>
        {emptyTeam && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-200 text-sm text-center"
          >
            ⚠️ Team {emptyTeam} left — turn skipped automatically
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-2">
        <p className="text-gray-400 uppercase tracking-widest text-sm font-bold">
          CURRENT TURN
        </p>
        <motion.h2
          layout
          className={`text-2xl font-bold ${roomData.turn === playerTeam ? "text-green-400 animate-pulse" : "text-white"}`}
        >
          {turnName} {roomData.turn === playerTeam && "✨ (Your turn!)"}
        </motion.h2>
      </div>

      <motion.div
        layout
        className="bg-gray-800 p-8 rounded-2xl w-full text-center space-y-4 shadow-xl border border-gray-700"
      >
        <p className="text-yellow-400 font-mono text-xs uppercase tracking-widest">
          SECRET WORD
        </p>
        <motion.h1
          key={roomData.word}
          initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-4xl font-extrabold tracking-tight text-white"
        >
          {roomData.word}
        </motion.h1>
        <div className="inline-block px-4 py-1 bg-gray-700 rounded-full text-sm font-semibold border border-gray-600">
          Points: {roomData.points}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isActiveTurn ? (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 gap-4 w-full"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGuess}
              className="py-6 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-xl shadow-lg shadow-green-900/20 transition"
            >
              ✅ GUESSED
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFail}
              className="py-6 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-xl shadow-lg shadow-red-900/20 transition"
            >
              ❌ MISSED
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full text-center py-6 bg-gray-800/50 rounded-xl border border-gray-700"
          >
            <p className="text-gray-400 font-medium">
              ⏳ Waiting for {turnName}...
            </p>
            <p className="text-sm text-gray-500 mt-1">
              You're on {playerTeam === "A" ? "🔴 Team A" : "🔵 Team B"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={removePlayer}
        className="text-red-400 hover:text-red-300 text-sm underline mt-4"
      >
        🚪 Leave Game
      </motion.button>
    </div>
  );
}
