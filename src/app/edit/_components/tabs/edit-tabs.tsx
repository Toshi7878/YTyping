"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSetTabName, useTabNameState } from "../../_lib/atoms/state-atoms";
import { TAB_NAMES } from "../../_lib/const";
import { EditorCard } from "./editor/editor-card";
import { MapInfoFormCard } from "./info-form/map-info-form-card";
import { SettingsCard } from "./settings/settings";

export const EditTabs = () => {
  const tabName = useTabNameState();
  const setTabName = useSetTabName();

  return (
    <Tabs value={tabName} onValueChange={(value) => setTabName(value as (typeof TAB_NAMES)[number])} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {TAB_NAMES.map((name) => {
          return (
            <TabsTrigger
              key={name}
              value={name}
              className={`truncate ${tabName === name ? "opacity-100" : "opacity-50"}`}
            >
              {name}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="情報&保存" forceMount>
        <MapInfoFormCard />
      </TabsContent>

      <TabsContent value="エディター" forceMount>
        <EditorCard />
      </TabsContent>

      <TabsContent value="ショートカットキー&設定">
        <SettingsCard />
      </TabsContent>
    </Tabs>
  );
};
