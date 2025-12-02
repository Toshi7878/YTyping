"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMapIdState } from "../../_lib/atoms/hydrate";
import { setTabName, TAB_NAMES, useTabNameState } from "../../_lib/atoms/state";
import { EditorCard } from "./editor/card";
import { AddMapInfoFormCard, EditMapInfoFormCard } from "./info-form/card";
import { SettingsCard } from "./settings/card";

export const EditTabs = () => {
  const mapId = useMapIdState();
  const tabName = useTabNameState();

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
        {mapId ? <EditMapInfoFormCard /> : <AddMapInfoFormCard />}
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
