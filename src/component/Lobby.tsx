import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/useGameStore";
import { getRoomIdFromUrl } from "../utils/room";

export default function Lobby() {
  const [inputId, setInputId] = useState("");
  const roomData = useGameStore((s) => s.roomData);
  const playerName = useGameStore((s) => s.playerName);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const createRoom = useGameStore((s) => s.createRoom);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const startGame = useGameStore((s) => s.startGame);
  const leaveRoom = useGameStore((s) => s.leaveRoom);
  const joinTeam = useGameStore((s) => s.joinTeam);

  const teamA = roomData?.teams?.A?.players || [];
  const teamB = roomData?.teams?.B?.players || [];

  useEffect(() => {
    const urlRoom = getRoomIdFromUrl();
    if (urlRoom) setInputId(urlRoom);
  }, []);

  if (!roomData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-screen p-4 max-w-md mx-auto space-y-6"
      >
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold text-blue-400"
        >
          🎮 Password Party
        </motion.h1>
        <p className="text-gray-400 text-center">
          One-word clues. Team battles. Pure chaos.
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full space-y-3 bg-gray-800 p-5 rounded-xl shadow-lg"
        >
          <input
            type="text"
            placeholder="Your Name"
            value={playerName || ""}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
            autoFocus={!!inputId}
          />
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createRoom}
              className="py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition"
            >
              Create Room
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => joinRoom(inputId)}
              disabled={!inputId}
              className="py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Room
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const MIN_PLAYERS_PER_TEAM = 2;
  const totalPlayers = teamA.length + teamB.length;
  const isRoomFull = totalPlayers >= 4;
  const canStart =
    teamA.length >= MIN_PLAYERS_PER_TEAM &&
    teamB.length >= MIN_PLAYERS_PER_TEAM;
  const neededPlayers =
    Math.max(0, MIN_PLAYERS_PER_TEAM - teamA.length) +
    Math.max(0, MIN_PLAYERS_PER_TEAM - teamB.length);
  const statusText = canStart
    ? "🚀 START GAME"
    : isRoomFull
      ? "⚠️ Room is full"
      : `⏳ Waiting for ${neededPlayers} more player${neededPlayers === 1 ? "" : "s"}...`;
  const roomUrl = `${window.location.origin}${window.location.pathname}?room=${roomData.roomId}`;
  const playerInTeam =
    teamA.includes(playerName || "") || teamB.includes(playerName || "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-4 max-w-md mx-auto space-y-6"
    >
      <motion.h1 layout className="text-3xl font-bold text-blue-400">
        🎮 Room: {roomData.roomId}
      </motion.h1>

      <motion.div
        layout
        className="w-full text-center space-y-2 bg-gray-800 p-4 rounded-xl"
      >
        <p className="text-sm text-gray-400">Share this link:</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigator.clipboard.writeText(roomUrl)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm w-full transition"
        >
          📋 Copy Invite Link
        </motion.button>
      </motion.div>

      <motion.div layout className="w-full bg-gray-800 p-4 rounded-xl">
        <h2 className="text-lg font-semibold mb-2">
          Players ({totalPlayers}/4)
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            layout
            className="bg-red-900/50 p-3 rounded-lg min-h-[80px]"
          >
            <p className="text-red-300 font-bold"> Team A ({teamA.length}/2)</p>
            <AnimatePresence>
              {teamA.map((p) => (
                <motion.p
                  key={p}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm"
                >
                  - {p}
                </motion.p>
              ))}
            </AnimatePresence>
          </motion.div>
          <motion.div
            layout
            className="bg-blue-900/50 p-3 rounded-lg min-h-[80px]"
          >
            <p className="text-blue-300 font-bold">
              🔵 Team B ({teamB.length}/2)
            </p>
            <AnimatePresence>
              {teamB.map((p) => (
                <motion.p
                  key={p}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm"
                >
                  - {p}
                </motion.p>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {!playerInTeam && !isRoomFull && playerName && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => joinTeam("A")}
              disabled={teamA.length >= 2}
              className="py-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold transition"
            >
              {" "}
              Join Team A
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => joinTeam("B")}
              disabled={teamB.length >= 2}
              className="py-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold transition"
            >
              {" "}
              Join Team B
            </motion.button>
          </div>
        )}

        {isRoomFull && (
          <p className="text-yellow-400 text-sm text-center mt-3 font-medium">
            ⚠️ Room is full (4/4 players)
          </p>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={startGame}
          disabled={!canStart}
          className="w-full mt-4 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {statusText}
        </motion.button>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={leaveRoom}
        className="text-red-400 hover:text-red-300 text-sm"
      >
        {" "}
        Leave Room
      </motion.button>
    </motion.div>
  );
}
