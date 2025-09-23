export type YouTubeSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export interface ActiveUserStatus {
  id: number;
  name: string;
  onlineAt: Date;
  state: "type" | "edit" | "idle" | "askMe";
  mapId: number | null;
}
