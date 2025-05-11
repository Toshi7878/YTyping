"use client";
import { ThemeColors } from "@/types";
import { Tab, TabList, TabPanel, TabPanels, Tabs, useTheme } from "@chakra-ui/react";
import { useSetTabIndex, useTabIndexState } from "../../atoms/stateAtoms";
import { TabIndex } from "../../ts/type";
import TabEditor from "./tab-panels/TabEditor";
import TabInfoUpload from "./tab-panels/TabInfoUpload";
import TabSettings from "./tab-panels/TabSettingsShortcutList";

interface EditorTabContentProps {
  className?: string;
}

const TAB_LIST = ["情報 & 保存", "エディター", "設定 & ショートカットキー"];
export default function EditorTabContent({ className }: EditorTabContentProps) {
  const tabIndex = useTabIndexState();
  const setTabIndex = useSetTabIndex();
  const theme: ThemeColors = useTheme();

  return (
    <Tabs
      index={tabIndex}
      onChange={(index) => setTabIndex(index as TabIndex)}
      className={className}
      isFitted
      size="sm"
      position="relative"
      variant="line"
      width="100%"
    >
      <TabList height="25px" px={{ base: "0", md: "8" }} borderBottom={`1px solid ${theme.colors.text.body}aa`}>
        {TAB_LIST.map((tabName, index) => {
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
