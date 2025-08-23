export type YouTubeSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export interface UploadResult {
  id: number | string | null;
  title: string;
  message: string;
  status: number;
  errorObject?: unknown;
}

export interface LocalClapState {
  hasClap: boolean;
  clapCount: number;
}
export interface LocalLikeState {
  hasLike: boolean;
  likeCount: number;
}
