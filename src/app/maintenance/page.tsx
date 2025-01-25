import { Container, Heading, Text, VStack } from "@chakra-ui/react";

const MaintenancePage = () => {
  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={8} align="center">
        <Heading as="h1" size="xl">
          メンテナンス中
        </Heading>
        <Text fontSize="lg" textAlign="center">
          現在サーバーのメンテナンスを実施しています。
        </Text>
        <Text fontSize="md" color="gray.600">
          メンテナンス終了予定：準備中
        </Text>
      </VStack>
    </Container>
  );
};

export default MaintenancePage;
