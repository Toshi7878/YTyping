/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import TabStatus, { TabStatusRef } from "./tab/TabStatus";
import TabRanking from "./tab/TabRanking";
import { useAtom } from "jotai";
import { tabIndexAtom } from "../../(atoms)/gameRenderAtoms";

interface TabContentProps {
  className?: string;
  tabStatusRef: React.RefObject<TabStatusRef>;
}
export default function TabContent({ className, tabStatusRef }: TabContentProps) {
  console.log("Tab");
  const [tabIndex, setTabIndex] = useAtom(tabIndexAtom);

  return (
    <Tabs
      index={tabIndex} // デフォルトの選択されたタブを設定
      onChange={(index: number) => setTabIndex(index as 0 | 1)} // 型を 'number' に変更
      className={className}
      flex={1}
      size="md"
      position="relative"
      variant="line"
      colorScheme="black" // ここで色を指定します
    >
      <TabList height="33px" px="8" borderBottom="1px solid lightgray">
        <Tab
          width="200px"
          opacity={tabIndex === 0 ? 1 : 0.5}
          _hover={{ bg: "rgba(0, 0, 0, 0.1)" }} // ホバー時の背景色を追加
        >
          ステータス
        </Tab>

        <Tab
          width="200px"
          opacity={tabIndex === 1 ? 1 : 0.5}
          _hover={{ bg: "rgba(0, 0, 0, 0.1)" }} // ホバー時の背景色を追加
        >
          ランキング
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel px={0}>
          <TabStatus ref={tabStatusRef} />
        </TabPanel>

        <TabPanel px={0}>
          <TabRanking />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
