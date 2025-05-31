"use client";

import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, Button, UseDisclosureReturn, useTheme } from "@chakra-ui/react";

import { useLinkClick } from "@/util/global-hooks/useLinkClick";
import { Link } from "@chakra-ui/next-js";
interface CreateMapBackUpButtonProps {
  backupData: { title: string; videoId: string } | undefined;
  newCreateModalDisclosure: UseDisclosureReturn;
}

export default function CreateMapBackUpButton(props: CreateMapBackUpButtonProps) {
  const theme: ThemeColors = useTheme();
  const handleLinkClick = useLinkClick();

  return (
    <CustomToolTip
      label={
        <Box>
          <Box>タイトル: {props.backupData?.title}</Box>
          <Box>YouTubeId: {props.backupData?.videoId}</Box>
        </Box>
      }
      placement="top"
      fontSize="sm"
      isDisabled={props.backupData?.title ? false : true}
    >
      <Link
        fontSize="sm"
        href={`/edit?new=${props.backupData?.videoId}&backup=true`}
        onClick={(event) => {
          handleLinkClick(event);
          props.newCreateModalDisclosure.onClose();
        }}
        visibility={props.backupData?.videoId ? "visible" : "hidden"}
      >
        <Button
          variant="outline"
          size="xs"
          p={4}
          color={`${theme.colors.text.body}`}
          borderColor={`${theme.colors.border.card}50`}
          _hover={{ bg: theme.colors.button.sub.hover }}
        >
          前回のバックアップデータが存在します。
        </Button>
      </Link>
    </CustomToolTip>
  );
}
