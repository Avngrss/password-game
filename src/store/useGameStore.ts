import { create } from "zustand";
import {
  ref,
  set as dbSet,
  update,
  onValue,
  type Unsubscribe,
} from "firebase/database";
import { db } from "../firebase";
import type { RoomState, TeamKey } from "../types";
import { generateRoomId, setRoomIdInUrl } from "../utils/room";
import { getRandomWord } from "../utils/words";

const MAX_PLAYERS_TOTAL = 4;
const MAX_PLAYERS_PER_TEAM = 2;

export interface GameState {
  roomId: string | null;
  roomData: RoomState | null;
  playerName: string | null;
  loading: boolean;
  setPlayerName: (name: string) => void;
  createRoom: () => Promise<void>;
  joinRoom: (id: string) => void;
  startGame: () => void;
  handleGuess: () => void;
  handleFail: () => void;
  rematch: () => void;
  leaveRoom: () => void;
  removePlayer: () => void;
  joinTeam: (team: TeamKey) => void;
  _skipEmptyTeam: (turn: TeamKey, teams: RoomState["teams"]) => TeamKey;
}

export const parsePlayers = (data: any): string[] => {
  if (!data) return [];
  if (Array.isArray(data))
    return data.filter((p): p is string => typeof p === "string");
  return Object.values(data).filter((p): p is string => typeof p === "string");
};

export function normalizeRoomData(raw: any, roomId: string): RoomState {
  return {
    status: raw?.status || "LOBBY",
    turn: raw?.turn || "A",
    teams: {
      A: {
        name: raw?.teams?.A?.name || "Team A",
        players: parsePlayers(raw?.teams?.A?.players),
        score: raw?.teams?.A?.score ?? 0,
      },
      B: {
        name: raw?.teams?.B?.name || "Team B",
        players: parsePlayers(raw?.teams?.B?.players),
        score: raw?.teams?.B?.score ?? 0,
      },
    },
    word: raw?.word || null,
    points: raw?.points ?? 5,
    winner: raw?.winner || null,
    hostId: raw?.hostId || "",
    roomId: raw?.roomId || roomId,
  };
}

let unsubscribe: Unsubscribe | null = null;

function subscribeRoom(roomId: string) {
  if (unsubscribe) unsubscribe();
  const roomRef = ref(db, `rooms/${roomId}`);

  unsubscribe = onValue(roomRef, (snapshot) => {
    const raw = snapshot.val();
    if (!raw) {
      useGameStore.setState({ roomData: null, loading: false, roomId: null });
      return;
    }
    useGameStore.setState({
      roomData: normalizeRoomData(raw, roomId),
      loading: false,
    });
  });
}

export const useGameStore = create<GameState>((set, get) => ({
  roomId: null,
  roomData: null,
  playerName: null,
  loading: false,

  setPlayerName: (name: string) => set({ playerName: name }),

  createRoom: async () => {
    const { playerName } = get();
    if (!playerName) return alert("Please enter your name!");
    const id = generateRoomId();
    setRoomIdInUrl(id);
    const initial: RoomState = {
      status: "LOBBY",
      turn: "A",
      teams: {
        A: { name: "Team A", players: [playerName], score: 0 },
        B: { name: "Team B", players: [], score: 0 },
      },
      word: null,
      points: 5,
      winner: null,
      hostId: playerName,
      roomId: id,
    };
    set({ loading: true });
    await dbSet(ref(db, `rooms/${id}`), initial);
    set({ roomId: id, roomData: initial, loading: false });
    subscribeRoom(id);
  },

  joinRoom: (id: string) => {
    const { playerName } = get();
    if (!playerName) return alert("Please enter your name!");
    const cleanId = id.trim().toUpperCase();
    if (!cleanId) return alert("Invalid Room ID!");
    set({ roomId: cleanId, roomData: null, loading: true });
    subscribeRoom(cleanId);
  },

  joinTeam: async (team: TeamKey) => {
    const { roomData, playerName } = get();
    if (!roomData || !playerName || roomData.status !== "LOBBY") return;
    const total =
      roomData.teams.A.players.length + roomData.teams.B.players.length;
    if (total >= MAX_PLAYERS_TOTAL) return alert("Room is full!");
    if (roomData.teams[team].players.length >= MAX_PLAYERS_PER_TEAM)
      return alert(`Team ${team} is full!`);
    if (
      roomData.teams.A.players.includes(playerName) ||
      roomData.teams.B.players.includes(playerName)
    )
      return;

    const newPlayers = [...roomData.teams[team].players, playerName];
    await dbSet(
      ref(db, `rooms/${roomData.roomId}/teams/${team}/players`),
      newPlayers,
    );

    const updated = {
      ...roomData,
      teams: {
        ...roomData.teams,
        [team]: { ...roomData.teams[team], players: newPlayers },
      },
    };
    useGameStore.setState({ roomData: updated });
  },

  startGame: () => {
    const d = get().roomData;
    if (!d || d.status !== "LOBBY") return;
    if (d.teams.A.players.length + d.teams.B.players.length < 4)
      return alert("Wait for 4 players!");

    const optimistic: Partial<RoomState> = {
      status: "PLAYING",
      word: getRandomWord(),
      points: 5,
      turn: "A",
      teams: { A: { ...d.teams.A, score: 0 }, B: { ...d.teams.B, score: 0 } },
    };
    useGameStore.setState({ roomData: { ...d, ...optimistic } });
    update(ref(db, `rooms/${d.roomId}`), optimistic);
  },

  _skipEmptyTeam: (turn: TeamKey, teams: RoomState["teams"]) => {
    if (!teams[turn].players.length) return turn === "A" ? "B" : "A";
    return turn;
  },

  handleGuess: () => {
    const d = get().roomData;
    if (!d || d.status !== "PLAYING") return;
    const current = d.teams[d.turn];
    const newScore = current.score + d.points;
    const isWin = newScore >= 100;
    let nextTurn: TeamKey = get()._skipEmptyTeam(
      d.turn === "A" ? "B" : "A",
      d.teams,
    );

    const optimistic: Partial<RoomState> = {
      teams: { ...d.teams, [d.turn]: { ...current, score: newScore } },
      status: isWin ? "WIN" : "PLAYING",
      winner: isWin ? d.turn : null,
      points: 5,
      word: getRandomWord(),
      turn: nextTurn,
    };
    useGameStore.setState({ roomData: { ...d, ...optimistic } });
    update(ref(db, `rooms/${d.roomId}`), optimistic);
  },

  handleFail: () => {
    const d = get().roomData;
    if (!d || d.status !== "PLAYING") return;
    const nextPts = d.points - 1;
    let nextTurn: TeamKey = get()._skipEmptyTeam(
      d.turn === "A" ? "B" : "A",
      d.teams,
    );
    const reset = nextPts <= 0;

    const optimistic: Partial<RoomState> = {
      points: reset ? 5 : nextPts,
      turn: nextTurn,
      word: reset ? getRandomWord() : d.word,
    };
    useGameStore.setState({ roomData: { ...d, ...optimistic } });
    update(ref(db, `rooms/${d.roomId}`), optimistic);
  },

  rematch: () => {
    const d = get().roomData;
    if (!d) return;
    const optimistic: Partial<RoomState> = {
      status: "PLAYING",
      turn: "A",
      points: 5,
      word: getRandomWord(),
      winner: null,
      teams: { A: { ...d.teams.A, score: 0 }, B: { ...d.teams.B, score: 0 } },
    };
    useGameStore.setState({ roomData: { ...d, ...optimistic } });
    update(ref(db, `rooms/${d.roomId}`), optimistic);
  },

  removePlayer: () => {
    const { roomData, playerName } = get();
    if (!roomData || !playerName) return;

    const teamKey: TeamKey | null = roomData.teams.A.players.includes(
      playerName,
    )
      ? "A"
      : roomData.teams.B.players.includes(playerName)
        ? "B"
        : null;
    if (teamKey) {
      const newPlayers = roomData.teams[teamKey].players.filter(
        (p) => p !== playerName,
      );
      dbSet(
        ref(db, `rooms/${roomData.roomId}/teams/${teamKey}/players`),
        newPlayers,
      ).catch(console.warn);
    }

    if (unsubscribe) unsubscribe();
    window.history.replaceState({}, "", window.location.pathname);
    set({ roomId: null, roomData: null, playerName: null, loading: false });
  },

  leaveRoom: () => get().removePlayer(),
}));
