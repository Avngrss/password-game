import { motion } from "framer-motion";
import { useGameStore } from "../store/useGameStore";

export default function WinScreen() {
  const { roomData, rematch, removePlayer } = useGameStore();
  if (!roomData || roomData.status !== "WIN") return null;

  const winnerName = roomData.winner === "A" ? "🔴 Team A" : "🔵 Team B";
  const winColor = roomData.winner === "A" ? "text-red-400" : "text-blue-400";
  const winBg = roomData.winner === "A" ? "bg-red-900/30" : "bg-blue-900/30";

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-4 max-w-md mx-auto text-center space-y-6 ${winBg}`}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-yellow-400 rounded-full"
            initial={{
              top: "-10%",
              left: `${Math.random() * 100}%`,
              opacity: 1,
            }}
            animate={{
              top: "110%",
              left: `${Math.random() * 100 + (Math.random() - 0.5) * 20}%`,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
      >
        <h1 className={`text-6xl font-extrabold ${winColor} drop-shadow-lg`}>
          🏆
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-4xl font-bold text-white">VICTORY!</h2>
        <p className={`text-2xl font-bold mt-2 ${winColor}`}>{winnerName}</p>
      </motion.div>

      <motion.div
        layout
        className="w-full bg-gray-800 p-6 rounded-xl flex justify-around shadow-lg border border-gray-700"
      >
        <div className="text-center">
          <p className="text-red-400 font-bold">🔴 A</p>
          <p className="text-3xl font-bold">{roomData.teams.A.score}</p>
        </div>
        <div className="text-center">
          <p className="text-blue-400 font-bold">🔵 B</p>
          <p className="text-3xl font-bold">{roomData.teams.B.score}</p>
        </div>
      </motion.div>

      <div className="flex gap-4 w-full mt-4 z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={rematch}
          className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl shadow-lg transition"
        >
          🔄 Rematch
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={removePlayer}
          className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl shadow-lg transition"
        >
          👋 Leave
        </motion.button>
      </div>
    </div>
  );
}
