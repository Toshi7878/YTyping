"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/use-theme";
import { ThemeColors } from "@/types";
import { cn } from "@/lib/utils";
import { useSetTabIndex, useTabIndexState } from "../../atoms/stateAtoms";
import { TabIndex } from "../../ts/type";
import TabEditor from "./tab-panels/TabEditor";
import TabInfoUpload from "./tab-panels/TabInfoUpload";
import TabSettings from "./tab-panels/TabSettingsShortcutList";

interface EditorTabContentProps {
  className?: string;
}

const TAB_LIST = ["情報 & 保存", "エディター", "設定 & ショートカットキー"];
const TAB_VALUES = ["info", "editor", "settings"] as const;

export default function EditorTabContent({ className }: EditorTabContentProps) {
  const tabIndex = useTabIndexState();
  const setTabIndex = useSetTabIndex();
  const theme: ThemeColors = useTheme();

  return (
    <Tabs
      value={TAB_VALUES[tabIndex]}
      onValueChange={(value) => setTabIndex(TAB_VALUES.indexOf(value as typeof TAB_VALUES[number]) as TabIndex)}
      className={cn("relative w-full", className)}
    >
      <TabsList 
        className="h-[25px] w-full justify-start rounded-none bg-transparent px-0 md:px-8"
        style={{ borderBottom: `1px solid ${theme.colors.text.body}aa` }}
      >
        {TAB_LIST.map((tabName, index) => {
          return (
            <TabsTrigger
              key={index}
              value={TAB_VALUES[index]}
              className={cn(
                "h-full flex-1 truncate rounded-none border-b-2 border-transparent px-1 pb-1 pt-0 text-sm",
                "hover:opacity-80",
                tabIndex === index ? "opacity-100" : "opacity-50"
              )}
              style={{
                color: theme.colors.text.body,
                backgroundColor: "transparent"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.button.sub.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {tabName}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="info" className="mt-0 px-0 pb-0 pt-2">
        <TabInfoUpload />
      </TabsContent>

      <TabsContent value="editor" className="mt-0 px-0 pb-0 pt-2">
        <TabEditor />
      </TabsContent>

      <TabsContent value="settings" className="mt-0 px-0 pb-0 pt-2">
        <TabSettings />
      </TabsContent>
    </Tabs>
  );
}
