import { Box } from "@chakra-ui/react";

interface MyKeyBoardProps {
  myKeyboard: string;
}

const MyKeyBoard = ({ myKeyboard }: MyKeyBoardProps) => {
  return (
    <Box>
      使用キーボード:
      {myKeyboard ? myKeyboard : "未設定"}
    </Box>
  );
};

export default MyKeyBoard;
