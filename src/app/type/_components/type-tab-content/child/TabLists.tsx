import { useSetTabIndexState } from "@/app/type/atoms/stateAtoms";
import { ThemeColors } from "@/types";
import { Tab, TabList, useTheme } from "@chakra-ui/react";
import { useEffect } from "react";
const tabLists = ["ステータス", "ランキング"];

interface TabListsProps {
  tabIndex: number;
}

const TabLists = ({ tabIndex }: TabListsProps) => {
  const theme: ThemeColors = useTheme();
  const setTabIndex = useSetTabIndexState();

  useEffect(() => {
    return () => {
      setTabIndex(1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <TabList height={{ base: "80px", md: "33px" }} px="8" w="100%">
      {tabLists.map((tabName, index) => {
        return (
          <Tab
            key={index}
            fontSize={{ base: "3rem", md: "xl" }}
            width={{ base: "400px", md: "200px" }}
            opacity={tabIndex === index ? 1 : 0.5}
            borderBottom={tabIndex === index ? `1px solid ${theme.colors.text.body}` : ""}
            color={theme.colors.text.body}
            _hover={{ bg: "rgba(0, 0, 0, 0.1)", color: theme.colors.text.body }}
            _selected={{ color: theme.colors.text.body }}
          >
            {tabName}
          </Tab>
        );
      })}
    </TabList>
  );
};

export default TabLists;
