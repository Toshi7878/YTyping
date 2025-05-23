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
      dark: "#009d69",
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
      english: "#f472b6",
      other: "#ac44cd",
      like: "#f472b6",
      failure: "#AE81FF",
      clap: "#ffb825",
      word: {
        correct: "#3182ce",
        nextChar: "#FFF",
        word: "#FFF",
        completed: "#4fd1c5",
        nextWord: "#999",
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
        rankingMenu: {
          fontSize: { base: "3rem", md: "lg" },
          p: { base: 16, md: 6 },
          _hover: { backgroundColor: darkTheme.colors.button.sub.hover },
        },
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
        endMain: {
          py: "3.2rem",
          width: "430px",
          bg: darkTheme.colors.primary.main,
          cursor: "pointer",
          color: darkTheme.colors.text.body,
          border: "1px",
          borderColor: darkTheme.colors.border.card,
          fontSize: "3xl",
          _hover: {
            backgroundColor: darkTheme.colors.primary.light,
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
        filterSolid: {
          py: 1,
          px: 3,
          borderRadius: "full",
          bg: darkTheme.colors.primary.main,
          color: darkTheme.colors.text.body,
          cursor: "pointer",
        },
        filterOutline: {
          py: 1,
          px: 3,
          borderRadius: "full",
          bg: "transparent",
          color: darkTheme.colors.text.body,
          border: "1px solid",
          borderColor: `${darkTheme.colors.border.card}60`,
          cursor: "pointer",
        },
      },
    },
    Card: {
      variants: {
        practice: {
          container: {
            zIndex: 1,
            py: 4,
            pl: 1,
            mb: 4,
            gap: 1,
            userSelect: "none",
            bg: "background.card",
            color: "text.body",
            outlineColor: "border.card",
            cursor: "pointer",
            boxShadow: "lg",
            _hover: {
              outline: `1px solid ${darkTheme.colors.text.body}`,
            },
          },
          header: {
            py: 0,
          },
          body: {
            py: 0,
            fontSize: "md",
          },
          footer: {
            py: 0,
            fontWeight: "semibold",
            fontSize: "lg",
          },
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
    Drawer: {
      variants: {
        alwaysOpen: {
          parts: ["dialog, dialogContainer"],
          dialog: {
            pointerEvents: "auto",
          },
          dialogContainer: {
            pointerEvents: "none",
          },
        },
      },
    },
  },
});
