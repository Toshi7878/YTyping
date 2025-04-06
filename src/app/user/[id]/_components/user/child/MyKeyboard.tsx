import { Flex, Text } from "@chakra-ui/react";

interface MyKeyBoardProps {
  myKeyboard: string;
}

const MyKeyBoard = ({ myKeyboard }: MyKeyBoardProps) => {
  if (!myKeyboard) {
    return <Text>使用キーボードは未設定です</Text>;
  }

  return (
    <Flex align="center" gap={2}>
      <Text fontWeight="medium">使用キーボード:</Text>
      <Text>{myKeyboard}</Text>
    </Flex>
  );
};

export default MyKeyBoard;
