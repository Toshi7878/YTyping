"use client";

import { Box, Flex, Heading } from "@chakra-ui/react";
import { UpdateNameForm } from "../settings/_components/profile-settings/child-forms/UpdateNameForm";

export default function Content() {
  return (
    <Flex direction="column" gap={5} width={{ base: "100%", md: "90vw", "2xl": "50vw" }}>
      <UpdateNameForm
        placeholder="名前を入力してね (後から変更できます)"
        formLabel="名前"
        buttonLabel="名前を決定"
        isAutoFocus={true}
        isHomeRedirect={true}
      />
      <Box>
        <Heading as="h4" size="md" className="font-semibold">
          おしらせ
        </Heading>
        現在開発中のため、データの構成に一貫性をもたせるために予告なくユーザーデータの変更・削除を行う可能性があります。
        ご了承くださいませ。
        <Box>ᓚ₍ ^. .^₎</Box>
      </Box>
    </Flex>
  );
}
