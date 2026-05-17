import Lobby from "./component/Lobby";
import GameScreen from "./component/GameScreen";
import WinScreen from "./component/WinScreen";
import { useGameStore } from "./store/useGameStore";

export default function App() {
  const { roomData, loading } = useGameStore();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="text-gray-400 animate-pulse">Connecting to room...</p>
      </div>
    );
  }

  if (!roomData) return <Lobby />;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {roomData.status === "LOBBY" && <Lobby />}
      {roomData.status === "PLAYING" && <GameScreen />}
      {roomData.status === "WIN" && <WinScreen />}
    </main>
  );
}
