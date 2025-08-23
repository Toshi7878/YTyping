export interface MapLine {
  time: string;
  lyrics: string;
  word: string;
  options?: {
    eternalCSS?: string;
    changeCSS?: string;
    isChangeCSS?: boolean;
    changeVideoSpeed?: number;
  };
}

export interface MapLineEdit extends MapLine {
  lineIndex: number;
}
