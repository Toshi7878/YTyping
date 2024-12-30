import { Tabs, TabPanels, TabPanel, useTheme, HStack } from "@chakra-ui/react";
import TabRanking from "./tab-ranking/TabRanking";
import { ThemeColors } from "@/types";
import TabStatusCard from "./tab-status/TabStatusCard";
import TabIcons from "./child/TabIcons";
import { useSetTabIndexAtom, useTabIndexAtom } from "../../type-atoms/gameRenderAtoms";
import TabLists from "./child/TabLists";

interface TypeTabContentProps {
  className?: string;
}

export default function TypeTabContent({ className }: TypeTabContentProps) {
  const tabIndex = useTabIndexAtom();
  const setTabIndex = useSetTabIndexAtom();
  const theme: ThemeColors = useTheme();

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
        style={{ userSelect: "none" }}
      >
        <TabLists tabIndex={tabIndex} />
        <TabIcons />
      </HStack>

      <TabPanels>
        <TabPanel px={0}>
          <TabStatusCard height={"208px"} />
        </TabPanel>

        <TabPanel px={0}>
          <TabRanking height={"236px"} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
