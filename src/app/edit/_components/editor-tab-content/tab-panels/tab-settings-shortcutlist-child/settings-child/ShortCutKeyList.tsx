import { ThemeColors } from "@/types";
import { Box, Heading, HStack, Kbd, Text, useTheme } from "@chakra-ui/react";

import React from "react";

const shortCutList = [
  { keys: ["←", "→"], description: "3秒スキップ" },
  { keys: ["↑", "↓"], description: "選択ライン移動" },
  { keys: ["S"], description: "追加" },
  { keys: ["Shift+S"], description: "空行を追加" },
  { keys: ["U"], description: "変更" },
  { keys: ["Delete"], description: "削除" },
  { keys: ["Esc"], description: "再生・停止" },
  { keys: ["D"], description: "選択ライン解除" },
  { keys: ["Tab"], description: "次の歌詞をセット(テキストフォーカス時は追加)" },
  { keys: ["Ctrl+Shift+F"], description: "全体よみ置換" },
  { keys: ["Ctrl+Z"], description: "元に戻す" },
  { keys: ["Ctrl+Y"], description: "繰り返し" },
  { keys: ["Enter"], description: "歌詞テキストボックスの選択した文字にRubyタグを挿入" },
  { keys: ["Ctrl+登録済みラインクリック"], description: "ライン直接編集モード" },
];

const ShortCutKeyList = () => {
  const theme: ThemeColors = useTheme();

  return (
    <Box mt={2}>
      <Heading size="sm" mb={4}>
        ショートカットキー 一覧
      </Heading>
      <HStack spacing={6} wrap="wrap" fontSize="md">
        {shortCutList.map((shortcut, index) => (
          <Box key={index}>
            {shortcut.keys.map((key, index) => (
              <Kbd
                key={index}
                fontWeight="bold"
                bg={theme.colors.background.body}
                color={theme.colors.text.body}
                borderColor={`${theme.colors.border.card}80`}
                borderWidth="1px"
                borderStyle="solid"
                mr={1}
              >
                {key}
              </Kbd>
            ))}
            :
            <Text as="span" ml={1}>
              {shortcut.description}
            </Text>
          </Box>
        ))}
      </HStack>
    </Box>
  );
};

export default ShortCutKeyList;
