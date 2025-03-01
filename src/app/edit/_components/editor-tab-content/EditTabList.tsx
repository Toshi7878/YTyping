"use client";
import { db } from "@/lib/db";
import { IndexDBOption, ThemeColors } from "@/types";
import { Tab, TabList, TabPanel, TabPanels, Tabs, useTheme } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  useIsEditYTStartedAtom,
  useSetEditAddTimeOffsetAtom,
  useSetEditWordConvertOptionAtom,
  useSetTabIndexAtom,
  useTabIndexAtom,
} from "../../edit-atom/editAtom";
import { DEFAULT_ADD_ADJUST_TIME } from "../../ts/const/editDefaultValues";
import { EditTabIndex } from "../../ts/type";
import TabEditor from "./tab-panels/TabEditor";
import TabInfoUpload from "./tab-panels/TabInfoUpload";
import TabSettings from "./tab-panels/TabSettingsShortcutList";

interface EditorTabContentProps {
  className?: string;
}

const tabLists = ["情報 & 保存", "エディター", "設定 & ショートカットキー"];
export default function EditorTabContent({ className }: EditorTabContentProps) {
  const tabIndex = useTabIndexAtom();
  const setTabIndex = useSetTabIndexAtom();

  const isYTStarted = useIsEditYTStartedAtom();
  const [isDisabled, setIsDisabled] = useState(true);
  const theme: ThemeColors = useTheme();
  const setSelectedConvertOption = useSetEditWordConvertOptionAtom();
  const setAddTimeOffset = useSetEditAddTimeOffsetAtom();

  useEffect(() => {
    if (isYTStarted && isDisabled) {
      setIsDisabled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYTStarted]);

  useEffect(() => {
    db.editorOption.toArray().then((allData) => {
      const formattedData = allData.reduce((acc, { optionName, value }) => {
        acc[optionName] = value;
        return acc;
      }, {} as IndexDBOption);
      setSelectedConvertOption(formattedData["word-convert-option"] ?? "non_symbol");
      setAddTimeOffset(formattedData["time-offset"] ?? DEFAULT_ADD_ADJUST_TIME);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Tabs
      index={tabIndex}
      onChange={(index) => setTabIndex(index as EditTabIndex)}
      className={className}
      isFitted
      size="sm"
      position="relative"
      variant="line"
      width="100%"
    >
      <TabList
        height="25px"
        px={{ base: "0", md: "8" }}
        borderBottom={`1px solid ${theme.colors.text.body}aa`}
      >
        {tabLists.map((tabName, index) => {
          return (
            <Tab
              key={index}
              opacity={tabIndex === index ? 1 : 0.5}
              color={theme.colors.text.body}
              _hover={{ bg: theme.colors.button.sub.hover, opacity: 0.8 }}
              isTruncated
            >
              {tabName}
            </Tab>
          );
        })}
      </TabList>

      <TabPanels>
        <TabPanel px={0} pb={0} pt={2}>
          <TabInfoUpload />
        </TabPanel>

        <TabPanel px={0} pb={0} pt={2}>
          <TabEditor />
        </TabPanel>
        <TabPanel px={0} pb={0} pt={2}>
          <TabSettings />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
