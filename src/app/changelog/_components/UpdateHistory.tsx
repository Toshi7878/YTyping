"use client";
import { changelog } from "@/config/changelog";
import { ThemeColors } from "@/types";
import { Box, Text, UnorderedList, ListItem, useTheme } from "@chakra-ui/react"; // UnorderedListとListItemを追加
import React from "react";

const UpdateHistory = () => {
  const theme: ThemeColors = useTheme();

  return (
    <Box>
      {changelog.map((update, index) => (
        <Box key={index} mb={12} gap={2} color={theme.colors.text.body}>
          <Text fontWeight="bold">{update.date}</Text>
          <UnorderedList>
            {update.descriptions.map((desc, i) => (
              <ListItem key={i}>{desc}</ListItem>
            ))}
          </UnorderedList>
        </Box>
      ))}
    </Box>
  );
};

export default UpdateHistory;
