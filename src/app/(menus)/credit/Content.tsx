"use client";

import CustomCard from "@/components/custom-ui/CustomCard";
import { CardBody, Container, Flex, Heading, Link, List, ListItem, Text } from "@chakra-ui/react";

export default function Content() {
  return (
    <Container maxW={"container.lg"} py={8} px={4}>
      <Heading as="h1" size="xl" mb={8}>
        クレジット
      </Heading>
      <CustomCard>
        <BorrowedMaterials />
        <SpecialThanks />
      </CustomCard>
    </Container>
  );
}

const BorrowedMaterials = () => {
  return (
    <CardBody display="flex" flexDirection="column" gap={2}>
      <Heading as="h2" size="lg" mb={4}>
        お借りした素材
      </Heading>
      <List spacing={4}>
        <ListItem>
          <Heading as="h3" size="md" mb={2}>
            <Link href="http://www.kurage-kosho.info/system.html" color="blue.500" isExternal>
              くらげ工匠
            </Link>
            <Text as="span" ml={1}>
              様
            </Text>
          </Heading>
          <Flex flexDirection="column" pl={4}>
            <Text>・打鍵音 ボタン58</Text>
            <Text>・ミス音 ボタン40</Text>
            <Text>・打ち切り音 ボタン68</Text>
          </Flex>
        </ListItem>
      </List>
    </CardBody>
  );
};

const SpecialThanks = () => {
  return (
    <CardBody display="flex" flexDirection="column" gap={2}>
      <Heading as="h2" size="lg" mb={4}>
        スペシャルサンクス
      </Heading>
      <List spacing={8}>
        <ListItem>
          <Heading as="h3" size="md">
            <Link href="http://unsi.nonip.net/" color="blue.500" isExternal>
              みんなの運指表
            </Link>
            <Text as="span" ml={1}>
              様
            </Text>
          </Heading>
        </ListItem>
        <ListItem>
          <Heading as="h3" size="md">
            <Link href="https://typing-tube.net/" color="blue.500" isExternal>
              TypingTube
            </Link>
            <Text as="span" ml={1}>
              様
            </Text>
          </Heading>
        </ListItem>
        <ListItem>
          <Heading as="h3" size="md">
            <Link href="https://github.com/jz5/namatyping" color="blue.500" isExternal>
              ニコ生タイピング
            </Link>
            <Text as="span" ml={1}>
              様
            </Text>
          </Heading>
        </ListItem>
      </List>
    </CardBody>
  );
};
