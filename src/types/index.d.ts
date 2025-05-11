import { MapLine } from "@/app/(typing)/type/ts/type";
import { EditorNewMapBackUpInfoData } from "@/app/edit/ts/type";

export type HeaderMenu = { title: string; href: string; device?: "PC" };

export type NavItem = {
  title: string;
  menuItem: HeaderMenu[];
  disabled?: boolean;
};

export type LeftNavConfig = {
  items: NavItem[];
};

// react-tag-input Tag 型は時前で定義しなければならない
export interface Tag {
  id: string;
  className: string;
  [key: string]: string;
}

export interface ThemeColors {
  colors: {
    background: {
      body: `#${string}`;
      card: `#${string}`;
      header: `#${string}`;
    };
    text: {
      body: `#${string}`;
      header: {
        normal: `#${string}`;
        hover: `#${string}`;
      };
    };
    button: {
      sub: {
        hover: `#${string}`;
      };
    };
    border: {
      card: `#${string}`;
      badge: `#${string}`;
      editorTable: {
        right: `#${string}`;
        bottom: `#${string}`;
      };
    };
    primary: {
      main: `#${string}`;
      light: `#${string}`;
      dark: `#${string}`;
    };
    secondary: {
      main: `#${string}`;
      light: `#${string}`;
      dark: `#${string}`;
    };
    error: {
      main: `#${string}`;
      light: `#${string}`;
    };

    semantic: {
      perfect: `#${string}`;
      roma: `#${string}`;
      kana: `#${string}`;
      flick: `#${string}`;
      english: `#${string}`;
      other: `#${string}`;
      like: `#${string}`;
      clap: `#${string}`;
      word: {
        correct: string;
        nextChar: string;
        word: string;
        completed: string;
        nextWord: string;
      };
    };

    home: {
      card: {
        hover: string;
      };
    };
  };
}

export type YouTubeSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export interface IndexDBOption {
  id: number;
  optionName: string;
  value: string | number | boolean | EditorNewMapBackUpInfoData | MapLine[];
}

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

export type ValidationUniqueState = "duplicate" | "pending" | "unique";
