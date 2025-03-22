import { EditorNewMapBackUpInfoData } from "@/app/edit/ts/type";
import { IndexDBOption } from "@/types";
import { MapLine } from "@/types/map";
import Dexie, { type EntityTable } from "dexie";

const db = new Dexie("AppDB") as Dexie & {
  editorNewCreateBak: EntityTable<
    IndexDBOption,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(14).stores({
  editorOption: "optionName", // primary key "id" and unique "optionName"
  editorNewCreateBak: "optionName",
  globalOption: "optionName",
  typingOption: "optionName",
});

export const sendEditorNewCreateBakIndexedDBData = async (
  newMapInfo: EditorNewMapBackUpInfoData,
  newMapData: MapLine[]
) => {
  db.editorNewCreateBak.put({ optionName: "backupMapInfo", value: newMapInfo });
  db.editorNewCreateBak.put({ optionName: "backupMapData", value: newMapData });
};

export const useInitializeEditorCreateBak = () => {
  return async () => {
    await db.editorNewCreateBak.clear();
  };
};

export { db };
