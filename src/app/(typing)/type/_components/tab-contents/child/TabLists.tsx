import { useSetTabIndex } from "@/app/(typing)/type/atoms/stateAtoms";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
const tabLists = ["ステータス", "ランキング"];

interface TabListsProps {
  tabIndex: number;
}

const TabLists = ({ tabIndex }: TabListsProps) => {
  const setTabIndex = useSetTabIndex();

  useEffect(() => {
    return () => {
      setTabIndex(1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.target.blur();
  };

  return (
    <TabsList className="h-20 md:h-[33px] px-8 w-full bg-transparent">
      <TabsTrigger
        value="status"
        className="text-5xl md:text-xl w-[400px] md:w-[200px] data-[state=active]:opacity-100 opacity-50 hover:bg-black/10"
        style={{
          borderBottom: tabIndex === 0 ? `1px solid #fff` : "",
          color: "#fff"
        }}
        onFocus={handleFocus}
      >
        {tabLists[0]}
      </TabsTrigger>
      <TabsTrigger
        value="ranking"
        className="text-5xl md:text-xl w-[400px] md:w-[200px] data-[state=active]:opacity-100 opacity-50 hover:bg-black/10"
        style={{
          borderBottom: tabIndex === 1 ? `1px solid #fff` : "",
          color: "#fff"
        }}
        onFocus={handleFocus}
      >
        {tabLists[1]}
      </TabsTrigger>
    </TabsList>
  );
};

export default TabLists;
