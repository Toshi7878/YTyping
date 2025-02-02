export interface CreateMapBackUpInfo {
  title: string;
  videoId: string;
}

declare type YouTubeEvent<T = any> = {
  data: T;
  target: YTPlayer;
};

export interface UserStatus {
  id: number;
  name: string;
  onlineAt: Date;
  state: "type" | "edit" | "idle" | "askMe";
  mapId: number | null;
  email_hash: string;
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
  getIframe(): Promise<HTMLIFrameElement>;
  getOption(module: string, option: string): Promise<any>;
  getOptions(): Promise<string[]>;
  getOptions(module: string): Promise<object>;
  setOption(module: string, option: string, value: any): Promise<void>;
  setOptions(): Promise<void>;
  cuePlaylist(
    playlist: string | readonly string[],
    index?: number,
    startSeconds?: number,
    suggestedQuality?: string
  ): Promise<void>;
  cuePlaylist(playlist: {
    listType: string;
    list?: string | undefined;
    index?: number | undefined;
    startSeconds?: number | undefined;
    suggestedQuality?: string | undefined;
  }): Promise<void>;
  loadPlaylist(
    playlist: string | readonly string[],
    index?: number,
    startSeconds?: number,
    suggestedQuality?: string
  ): Promise<void>;
  loadPlaylist(playlist: {
    listType: string;
    list?: string | undefined;
    index?: number | undefined;
    startSeconds?: number | undefined;
    suggestedQuality?: string | undefined;
  }): Promise<void>;
  getPlaylist(): Promise<readonly string[]>;
  getPlaylistIndex(): Promise<number>;
  getPlaybackQuality(): Promise<string>;
  getPlaybackRate(): Promise<number>;
  getPlayerState(): Promise<PlayerState>;
  getVideoEmbedCode(): Promise<string>;
  getVideoLoadedFraction(): Promise<number>;
  getVideoUrl(): Promise<string>;
  getVolume(): Promise<number>;
  cueVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): Promise<void>;
  cueVideoById(video: {
    videoId: string;
    startSeconds?: number | undefined;
    endSeconds?: number | undefined;
    suggestedQuality?: string | undefined;
  }): Promise<void>;
  cueVideoByUrl(
    mediaContentUrl: string,
    startSeconds?: number,
    suggestedQuality?: string
  ): Promise<void>;
  cueVideoByUrl(video: {
    mediaContentUrl: string;
    startSeconds?: number | undefined;
    endSeconds?: number | undefined;
    suggestedQuality?: string | undefined;
  }): Promise<void>;
  loadVideoByUrl(
    mediaContentUrl: string,
    startSeconds?: number,
    suggestedQuality?: string
  ): Promise<void>;
  loadVideoByUrl(video: {
    mediaContentUrl: string;
    startSeconds?: number | undefined;
    endSeconds?: number | undefined;
    suggestedQuality?: string | undefined;
  }): Promise<void>;
  loadVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): Promise<void>;
  loadVideoById(video: {
    videoId: string;
    startSeconds?: number | undefined;
    endSeconds?: number | undefined;
    suggestedQuality?: string | undefined;
  }): Promise<void>;
  isMuted(): Promise<boolean>;
  mute(): Promise<void>;
  nextVideo(): Promise<void>;
  pauseVideo(): Promise<void>;
  playVideo(): Promise<void>;
  playVideoAt(index: number): Promise<void>;
  previousVideo(): Promise<void>;
  removeEventListener(event: string, listener: (event: CustomEvent) => void): Promise<void>;
  seekTo(seconds: number, allowSeekAhead: boolean): Promise<void>;
  setLoop(loopPlaylists: boolean): Promise<void>;
  setPlaybackQuality(suggestedQuality: string): Promise<void>;
  setPlaybackRate(suggestedRate: number): Promise<void>;
  setShuffle(shufflePlaylist: boolean): Promise<void>;
  getSize(): Promise<PlayerSize>;
  setSize(width: number, height: number): Promise<object>;
  setVolume(volume: number): Promise<void>;
  stopVideo(): Promise<void>;
  unMute(): Promise<void>;
  on(eventType: "stateChange", listener: (event: CustomEvent & { data: number }) => void): void;
  on(eventType: EventType, listener: (event: CustomEvent) => void): void;
}
