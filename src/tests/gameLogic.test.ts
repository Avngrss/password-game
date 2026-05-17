import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useGameStore,
  parsePlayers,
  normalizeRoomData,
} from "../store/useGameStore";
import type { RoomState } from "../types";

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock("firebase/database", () => ({
  getDatabase: vi.fn(() => ({})),
  ref: vi.fn(() => ({})),
  set: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  onValue: vi.fn(() => vi.fn()),
}));

const mockAlert = vi.fn();

describe("Game Core Logic", () => {
  beforeEach(() => {
    useGameStore.setState({
      roomId: null,
      roomData: null,
      playerName: null,
      loading: false,
    });
    vi.clearAllMocks();
    vi.stubGlobal("alert", mockAlert);
  });

  it("parsePlayers работает с массивами, объектами и мусором", () => {
    expect(parsePlayers(["alex", "sam"])).toEqual(["alex", "sam"]);
    expect(parsePlayers({ 0: "alex", 1: "sam" })).toEqual(["alex", "sam"]);
    expect(parsePlayers(null)).toEqual([]);
    expect(parsePlayers([123, "sam", undefined])).toEqual(["sam"]);
  });

  it("normalizeRoomData подставляет дефолты при битых данных", () => {
    const raw = { status: "LOBBY", teams: { A: { players: ["alex"] } } };
    const normalized = normalizeRoomData(raw, "TEST1");
    expect(normalized.teams.B.players).toEqual([]);
    expect(normalized.points).toBe(5);
    expect(normalized.roomId).toBe("TEST1");
    expect(normalized.status).toBe("LOBBY");
  });

  it("startGame переводит статус в PLAYING и выбирает слово", () => {
    const mockRoom: RoomState = {
      status: "LOBBY",
      turn: "A",
      teams: {
        A: { name: "A", players: ["alex", "bob"], score: 0 },
        B: { name: "B", players: ["sam", "eve"], score: 0 },
      },
      word: null,
      points: 5,
      winner: null,
      hostId: "alex",
      roomId: "R1",
    };
    useGameStore.setState({ roomData: mockRoom });

    useGameStore.getState().startGame();
    const state = useGameStore.getState().roomData;
    expect(state?.status).toBe("PLAYING");
    expect(state?.word).toBeTruthy();
    expect(state?.points).toBe(5);
  });

  it("startGame блокирует старт, если игроков < 4", () => {
    const mockRoom: RoomState = {
      status: "LOBBY",
      turn: "A",
      teams: {
        A: { name: "A", players: ["alex"], score: 0 },
        B: { name: "B", players: ["sam"], score: 0 },
      },
      word: null,
      points: 5,
      winner: null,
      hostId: "alex",
      roomId: "R1",
    };
    useGameStore.setState({ roomData: mockRoom });

    useGameStore.getState().startGame();
    expect(mockAlert).toHaveBeenCalledWith("Wait for 4 players!");
  });

  it("handleGuess добавляет очки и передаёт ход", () => {
    const mockRoom: RoomState = {
      status: "PLAYING",
      turn: "A",
      teams: {
        A: { name: "A", players: ["alex", "bob"], score: 10 },
        B: { name: "B", players: ["sam", "eve"], score: 5 },
      },
      word: "BANANA",
      points: 4,
      winner: null,
      hostId: "alex",
      roomId: "R1",
    };
    useGameStore.setState({ roomData: mockRoom });

    useGameStore.getState().handleGuess();
    const state = useGameStore.getState().roomData;
    expect(state?.teams.A.score).toBe(14);
    expect(state?.turn).toBe("B");
    expect(state?.points).toBe(5);
    expect(state?.word).not.toBe("BANANA");
  });

  it("handleFail уменьшает очки и меняет ход, слово остаётся", () => {
    const mockRoom: RoomState = {
      status: "PLAYING",
      turn: "A",
      teams: {
        A: { name: "A", players: ["alex", "bob"], score: 0 },
        B: { name: "B", players: ["sam", "eve"], score: 0 },
      },
      word: "BANANA",
      points: 3,
      winner: null,
      hostId: "alex",
      roomId: "R1",
    };
    useGameStore.setState({ roomData: mockRoom });

    useGameStore.getState().handleFail();
    const state = useGameStore.getState().roomData;
    expect(state?.points).toBe(2);
    expect(state?.turn).toBe("B");
    expect(state?.word).toBe("BANANA");
  });
});
