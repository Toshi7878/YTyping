"use client";

import CustomCard from "@/components/custom-ui/CustomCard";
import { Box, CardBody, Divider, Heading, Link, ListItem, OrderedList, Text } from "@chakra-ui/react";

export default function PreMidManual() {
  return (
    <Box mx="auto" py={8} px={4}>
      <Heading as="h1" size="xl" mb={8}>
        DiscordにYTypingのプレイ中ステータスを表示する
      </Heading>
      <CustomCard>
        <CardBody display="flex" flexDirection="column" gap={6}>
          <Text fontSize="xl">
            PreMiDブラウザ拡張機能を使用すると、DiscordのステータスにYTypingをプレイしていることを表示できます。
          </Text>

          <Heading as="h2" size="lg">
            インストール手順
          </Heading>
          <OrderedList spacing={6}>
            <ListItem>
              <Text fontWeight="bold">PreMiDブラウザ拡張機能をインストールする</Text>
              <Text mt={2}></Text>
            </ListItem>

            <Divider my={4} />

            <ListItem>
              <Text fontWeight="bold">YTypingのプレゼンス設定をPreMiD Storeからインストールする</Text>
              <Text mt={2}>
                <Link href="https://premid.app/store/presences/YTyping" color="primary.main" isExternal>
                  YTyping - PreMiD Store
                </Link>
                からYTypingのプレゼンス設定を追加します。
              </Text>
            </ListItem>

            <Divider my={4} />

            <ListItem>
              <Text fontWeight="bold">PreMiD拡張機能を開いてDiscordアカウントとリンクします。</Text>
              <Box mt={2}>
                <Text>
                  PreMiD拡張機能を初めて開くと、以下の表示が出てくるので、表示したいDiscordアカウントとリンクする
                </Text>
              </Box>
            </ListItem>

            <Divider my={4} />

            <ListItem>
              <Text fontWeight="bold">YTypingをプレイする</Text>
              <Text mt={2}>YTypingをプレイすると、自動的にDiscordのステータスに表示されます。</Text>
              <Box mt={2} display="flex" flexDirection="column" gap={4}></Box>
            </ListItem>
          </OrderedList>
        </CardBody>
      </CustomCard>
    </Box>
  );
}
