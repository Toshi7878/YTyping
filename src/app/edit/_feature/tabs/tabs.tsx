"use client";
import { atom, useAtomValue } from "jotai";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { store, useMapId } from "../provider";
import { EditorCard } from "./editor/card";
import { AddMapInfoFormCard, EditMapInfoFormCard } from "./info-form/card";
import { SettingsCard } from "./settings/card";

export const TAB_NAMES = ["info", "editor", "settings"] as const;
const tabNameAtom = atom<(typeof TAB_NAMES)[number]>("info");
export const setTabName = (value: (typeof TAB_NAMES)[number]) => store.set(tabNameAtom, value);

export const EditTabs = () => {
  const t = useTranslations("editor.tabs");
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
              {t(name)}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="info" keepMounted>
        {mapId ? <EditMapInfoFormCard /> : <AddMapInfoFormCard />}
      </TabsContent>

      <TabsContent value="editor" keepMounted>
        <EditorCard />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsCard />
      </TabsContent>
    </Tabs>
  );
};
