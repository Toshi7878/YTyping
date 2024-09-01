"use client";
import { useEffect, useRef, useState } from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel, useTheme } from "@chakra-ui/react";
import TabEditor from "./tab-panels/TabEditor";
import TabInfoUpload from "./tab-panels/TabInfoUpload";
import TabSettings from "./tab-panels/TabSettings";
import { ThemeColors } from "@/types";
import { useRefs } from "../../edit-contexts/refsProvider";
import {
  isEditYouTubeStartedAtom,
  useSetTabIndexAtom,
  useTabIndexAtom,
} from "../../edit-atom/editAtom";
import { useAtomValue } from "jotai";
import { EditTabIndex } from "../../ts/type";

interface EditorTabContentProps {
  className?: string;
}

const tabLists = ["情報 & 保存", "エディター", "設定"];
export default function EditorTabContent({ className }: EditorTabContentProps) {
  console.log("Tab");

  const editorTabRef = useRef(null);
  const tabIndex = useTabIndexAtom();
  const setTabIndex = useSetTabIndexAtom();

  const isYTStarted = useAtomValue(isEditYouTubeStartedAtom);
  const [isDisabled, setIsDisabled] = useState(true);
  const { setRef } = useRefs();
  const theme: ThemeColors = useTheme();

  useEffect(() => {
    setRef("editorTab", editorTabRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorTabRef]);

  useEffect(() => {
    if (isYTStarted && isDisabled) {
      setIsDisabled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYTStarted]);

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
      <TabList height="25px" px="8" borderBottom={`1px solid ${theme.colors.color}aa`}>
        {tabLists.map((tabName, index) => {
          return (
            <Tab
              key={index}
              opacity={tabIndex === index ? 1 : 0.5}
              color={theme.colors.color}
              _hover={{ bg: "rgba(0, 0, 0, 0.1)" }}
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
          <TabEditor ref={editorTabRef} />
        </TabPanel>
        <TabPanel px={0} pb={0} pt={2}>
          <TabSettings />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}