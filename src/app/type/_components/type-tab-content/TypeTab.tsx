import { ThemeColors } from "@/types";
import { HStack, TabPanel, TabPanels, Tabs, useTheme } from "@chakra-ui/react";
import { useSetTabIndexAtom, useTabIndexAtom } from "../../atoms/stateAtoms";
import TabIcons from "./child/TabIcons";
import TabLists from "./child/TabLists";
import TabRanking from "./tab-ranking/TabRanking";
import TabStatusCard from "./tab-status/TabStatusCard";

interface TypeTabContentProps {
  className?: string;
}

export default function TypeTabContent({ className }: TypeTabContentProps) {
  const tabIndex = useTabIndexAtom();
  const setTabIndex = useSetTabIndexAtom();
  const theme: ThemeColors = useTheme();

  const statusHeight = 208;
  const rankingHeight = 236;
  return (
    <Tabs
      index={tabIndex}
      onChange={(index: number) => setTabIndex(index as 0 | 1)}
      className={className}
      variant="unstyled"
    >
      <HStack
        justifyContent="space-between"
        w="100%"
        borderBottom={`1px solid ${theme.colors.text.body}55`}
        userSelect="none"
      >
        <TabLists tabIndex={tabIndex} />
        <TabIcons />
      </HStack>

      <TabPanels>
        <TabPanel px={0}>
          <TabStatusCard minH={{ base: `${statusHeight * 1.55}px`, md: `${statusHeight}px` }} />
        </TabPanel>

        <TabPanel px={0}>
          <TabRanking minH={{ base: `${rankingHeight * 1.5}px`, md: `${rankingHeight}px` }} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
