import { ThemeColors } from "@/types";
import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

const darkTheme: ThemeColors = {
  colors: {
    background: {
      body: "#1f2427",
      card: "#2b3035",
      header: "#375a7f",
    },
    button: {
      sub: {
        hover: "#FFFFFF60",
      },
    },
    border: {
      card: "#FFFFFF",
      badge: "#FFFFFF",
      editorTable: {
        right: "#00000020",
        bottom: "#000000",
      },
    },
    text: {
      body: "#FFFFFF",
      header: {
        normal: "#d3dae3",
        hover: "#FFFFFF",
      },
    },
    primary: {
      main: "#3182CE",
      light: "#4ebafd",
      dark: "#00a3c4",
    },
    secondary: {
      main: "#00bd7e",
      light: "#3cd3bf",
    },
    error: {
      main: "#e53e3e",
      light: "#f57275",
    },

    semantic: {
      perfect: "#ffcc22",
      roma: "#00b5d8",
      kana: "#de781f",
      flick: "#59e04d",
      like: "#f472b6",
      clap: "#ffb825",
      word: {
        correct: "#3182ce",
        next: "#FFF",
        word: "#FFF",
        completed: "#4fd1c5",
      },
    },

    home: {
      card: {
        hover: "0 10px 15px -3px rgba(79, 209, 197, 0.3), 0 4px 6px -2px rgba(79, 209, 197, 0.2)",
      },
    },
  },
};

export default extendTheme({
  config,
  colors: darkTheme.colors,
  styles: {
    global: {
      "body, *": {
        transition: "background-color 0.5s ease",
      },
      body: {
        bg: darkTheme.colors.background.body,
        overflowX: "hidden",
      },
      "::selection": {
        background: darkTheme.colors.primary.main, // 選択時の背景色
        color: darkTheme.colors.text.body, // 選択時のテキスト色
      },
    },
  },
  components: {
    Input: {
      variants: {
        outline: {
          field: {
            borderColor: `${darkTheme.colors.border.card}60`,
            bg: darkTheme.colors.background.body,
          },
        },
        filled: {
          field: {
            bg: darkTheme.colors.background.card,
            borderColor: `${darkTheme.colors.border.card}60`,
            border: "1px",
          },
        },
      },
    },
    Button: {
      variants: {
        upload: {
          bg: darkTheme.colors.primary.main, // ここで背景色を指定
          color: darkTheme.colors.text.body,
          _hover: {
            bg: darkTheme.colors.primary.light,
          },
          _disabled: {
            _hover: {
              backgroundColor: `${darkTheme.colors.primary.main} !important`,
            },
          },
        },
      },
    },
    Badge: {
      variants: {
        typeArea: {
          py: 1,
          px: 4,
          fontSize: { base: "3rem", sm: "2xl", md: "xl" },
          borderRadius: "3xl",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: darkTheme.colors.border.card,
          bg: darkTheme.colors.background.card,
          color: darkTheme.colors.text.body,
          transition: "transform 0.1s ease-in-out",
        },
      },
    },
    Kbd: {
      variants: {
        typeArea: {
          fontSize: { base: "3rem", sm: "2xl", md: "xl" },
          color: darkTheme.colors.text.body,
          bg: darkTheme.colors.background.body,
          borderColor: darkTheme.colors.border.card,
          borderWidth: "1px",
          borderStyle: "solid",
          borderBottomWidth: "1px",
        },
      },
    },
  },
});
