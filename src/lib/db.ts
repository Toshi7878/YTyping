import { EditorNewMapBackUpInfoData as NewMapBackUpData } from "@/app/edit/ts/type";
import Dexie, { type EntityTable } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

// id付きのバックアップデータ型
export interface MapBackupData extends NewMapBackUpData {
  id: string;
}

export class AppDB extends Dexie {
  mapBackup!: EntityTable<MapBackupData, "id">;

  constructor() {
    super("AppDB");

    // スキーマ定義
    this.version(16).stores({
      mapBackup: "id", // 固定キーのみ
    });
  }
}

const db = new AppDB();

// 固定キーでバックアップを保存
export const useBackupNewMap = () => {
  return async (input: NewMapBackUpData) => {
    await db.mapBackup.put({ ...input, id: "current" }); // 常に同じキーで上書き
  };
};

export const useDeleteBackupNewMap = () => {
  return async (): Promise<void> => {
    await db.mapBackup.clear();
  };
};

export const useGetBackupTitleVideoIdLiveQuery = () => {
  const backupData = useLiveQuery(() => db.mapBackup.get("current"));

  return backupData ? { title: backupData?.title, videoId: backupData?.videoId } : undefined;
};

export const useFetchBackupData = () => {
  return async () => {
    return await db.mapBackup.get("current");
  };
};
