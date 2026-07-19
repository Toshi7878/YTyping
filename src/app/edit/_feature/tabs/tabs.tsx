"use client";
import { atom, useAtomValue } from "jotai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { store, useMapId } from "../provider";
import { EditorCard } from "./editor/card";
import { AddMapInfoFormCard, EditMapInfoFormCard } from "./info-form/card";
import { SettingsCard } from "./settings/card";

export const TAB_NAMES = ["情報&保存", "エディター", "ショートカットキー&設定"] as const;
const tabNameAtom = atom<(typeof TAB_NAMES)[number]>("情報&保存");
export const setTabName = (value: (typeof TAB_NAMES)[number]) => store.set(tabNameAtom, value);

export const EditTabs = () => {
  const mapId = useMapId();
  const tabName = useAtomValue(tabNameAtom);

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
