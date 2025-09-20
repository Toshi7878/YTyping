export type YouTubeSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export interface ActiveUserStatus {
  id: number;
  name: string;
  onlineAt: Date;
  state: "type" | "edit" | "idle" | "askMe";
  mapId: number | null;
}

enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  VIDEO_CUED = 5,
}

export interface YTPlayer {
  addEventListener(event: string, listener: (event: CustomEvent) => void): Promise<void>;
  destroy(): Promise<void>;
  getVideoData: () => {
    video_id: string;
  };
  getAvailablePlaybackRates(): Promise<readonly number[]>;
  getAvailableQualityLevels(): Promise<readonly string[]>;
  getCurrentTime(): number;
  getDuration(): number;
  getIframe(): HTMLIFrameElement;
  getOption(module: string, option: string): Promise<any>;
  getOptions(): Promise<string[]>;
  getOptions(module: string): Promise<object>;
  setOption(module: string, option: string, value: any): Promise<void>;
  setOptions(): Promise<void>;
  cuePlaylist(playlist: string | readonly string[], index?: number, startSeconds?: number, suggestedQuality?: string);
  cuePlaylist(playlist: {
    listType: string;
    list?: string | undefined;
    index?: number | undefined;
    startSeconds?: number | undefined;
    suggestedQuality?: string | undefined;
  });
  loadPlaylist(playlist: string | readonly string[], index?: number, startSeconds?: number, suggestedQuality?: string);
  loadPlaylist(playlist: {
    listType: string;
    list?: string | undefined;
    index?: number | undefined;
    startSeconds?: number | undefined;
    suggestedQuality?: string | undefined;
  });
  getPlaybackQuality(): string;
  getPlaybackRate(): number;
  getPlayerState(): PlayerState;
  getVideoEmbedCode(): string;
  getVideoLoadedFraction(): number;
  getVideoUrl(): string;
  getVolume(): number;
  cueVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): Promise<void>;
  cueVideoById(video: {
    videoId: string;
    startSeconds?: number | undefined;
    endSeconds?: number | undefined;
    suggestedQuality?: string | undefined;
  });
  cueVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string);
  cueVideoByUrl(video: {
    mediaContentUrl: string;
    startSeconds?: number | undefined;
    endSeconds?: number | undefined;
    suggestedQuality?: string | undefined;
  });
  loadVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string);
  loadVideoByUrl(video: {
    mediaContentUrl: string;
    startSeconds?: number | undefined;
    endSeconds?: number | undefined;
    suggestedQuality?: string | undefined;
  });
  loadVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string);
  loadVideoById(video: {
    videoId: string;
    startSeconds?: number | undefined;
    endSeconds?: number | undefined;
    suggestedQuality?: string | undefined;
  });
  isMuted();
  mute();
  nextVideo(): void;
  pauseVideo(): void;
  playVideo(): void;
  playVideoAt(index: number): void;
  previousVideo(): void;
  removeEventListener(event: string, listener: (event: CustomEvent) => void): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setLoop(loopPlaylists: boolean): void;
  setPlaybackQuality(suggestedQuality: string): void;
  setPlaybackRate(suggestedRate: number): void;
  setShuffle(shufflePlaylist: boolean): void;
  getSize(): PlayerSize;
  setSize(width: number, height: number): object;
  setVolume(volume: number): void;
  stopVideo(): void;
  unMute(): void;
  on(eventType: "stateChange", listener: (event: CustomEvent & { data: number }) => void): void;
  on(eventType: EventType, listener: (event: CustomEvent) => void): void;
}

type EventType = "ready" | "stateChange" | "playbackQualityChange" | "playbackRateChange" | "error" | "apiChange";

interface PlayerSize {
  width: number;
  height: number;
}
