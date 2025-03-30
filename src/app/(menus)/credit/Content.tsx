"use client";

import { Image } from "@chakra-ui/next-js";
import { Box, CardBody, Divider, Heading, Link, ListItem, OrderedList, Text } from "@chakra-ui/react";

function detectBrowserType() {
  if (typeof window === "undefined") return "chrome";

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (userAgent.indexOf("firefox") > -1) {
    return "firefox";
  } else if (userAgent.indexOf("edg") > -1) {
    return "edge";
  } else if (userAgent.indexOf("safari") > -1 && userAgent.indexOf("chrome") === -1) {
    return "safari";
  } else {
    return "chrome";
  }
}

export default function PreMidManual() {
  const browserType = detectBrowserType();

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
              <Text mt={2}>
                <Link href={browserLinks[browserType].url} color="primary.main" isExternal>
                  {browserLinks[browserType].text}
                </Link>
                から拡張機能をインストールします。
              </Text>
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
                <Image
                  alt="PreMID拡張機能を開いてDiscordアカウントとリンクします。"
                  src={preMidLinks}
                  width="250"
                  border={"solid 1px"}
                  borderColor={"border.card"}
                  mt={2}
                />
              </Box>
            </ListItem>

            <Divider my={4} />

            <ListItem>
              <Text fontWeight="bold">YTypingをプレイする</Text>
              <Text mt={2}>YTypingをプレイすると、自動的にDiscordのステータスに表示されます。</Text>
              <Box mt={2} display="flex" flexDirection="column" gap={4}>
                <Image
                  width="250"
                  alt="スクリーンショット1"
                  src={preMidPresence1}
                  border={"solid 1px"}
                  borderColor={"border.card"}
                />
                <Image
                  width="250"
                  alt="スクリーンショット2"
                  src={preMidPresence2}
                  border={"solid 1px"}
                  borderColor={"border.card"}
                />
              </Box>
            </ListItem>
          </OrderedList>
        </CardBody>
      </CustomCard>
    </Box>
  );
}
