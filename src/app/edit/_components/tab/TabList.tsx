"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <Tabs
      value={TAB_VALUES[tabIndex]}
      onValueChange={(value) => {
        const index = TAB_VALUES.indexOf(value as typeof TAB_VALUES[number]);
        setTabIndex(index as TabIndex);
      }}
      className={`w-full relative ${className || ""}`}
    >
      <TabsList className="h-[25px] w-full grid grid-cols-3 px-0 md:px-8 border-b border-foreground/60">
        {TAB_LIST.map((tabName, index) => {
          return (
            <TabsTrigger
              key={index}
              value={TAB_VALUES[index]}
              className="truncate data-[state=inactive]:opacity-50 hover:bg-muted hover:opacity-80 text-sm"
            >
              {tabName}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="info" className="px-0 pb-0 pt-2">
        <TabInfoUpload />
      </TabsContent>

      <TabsContent value="editor" className="px-0 pb-0 pt-2">
        <TabEditor />
      </TabsContent>
      
      <TabsContent value="settings" className="px-0 pb-0 pt-2">
        <TabSettings />
      </TabsContent>
    </Tabs>
  );
}
