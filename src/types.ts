export type GameStatus = "LOBBY" | "PLAYING" | "WIN";
export type TeamKey = "A" | "B";

export interface TeamData {
  name: string;
  players: string[];
  score: number;
}

export interface RoomState {
  status: GameStatus;
  turn: TeamKey;
  teams: Record<TeamKey, TeamData>;
  word: string | null;
  points: number;
  winner: TeamKey | null;
  hostId: string;
  roomId: string;
}
