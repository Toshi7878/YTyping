import Dexie, { type EntityTable } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import type { RawMapLine } from "@/validator/map/raw-map-json";

interface MapTable {
  videoId: string;
  map: RawMapLine[];
}

interface MapInfoTable {
  videoId: string;
  title: string;
  artistName: string;
  musicSource: string;
  creatorComment: string;
  tags: string[];
  previewTime: number;
}

const db = new Dexie("edit") as Dexie & {
  backupRawMap: EntityTable<MapTable & { id: string }, "id">;
  backupMapMeta: EntityTable<MapInfoTable & { id: string }, "id">;
};

db.version(1).stores({ backupRawMap: "id", backupMapMeta: "id" });

export const editDb = {
  backup: {
    fetch: async () => {
      const map = await db.backupRawMap.get("current");
      const mapInfo = await db.backupMapMeta.get("current");

      if (map?.videoId !== mapInfo?.videoId) return;
      if (!map || !mapInfo) return;
      const { id: _, ...info } = mapInfo;

      return { map: map.map, ...info };
    },

    useLiveQuery: () => {
      return useLiveQuery(async () => {
        const map = await db.backupRawMap.get("current");
        const mapInfo = await db.backupMapMeta.get("current");

        if (map?.videoId !== mapInfo?.videoId) return;
        if (!map || !mapInfo) return;
        return mapInfo;
      });
    },

    upsertMapJson: async (input: MapTable) => {
      await db.backupRawMap.put({ ...input, id: "current" });
    },

    upsertMapInfo: async (input: MapInfoTable) => {
      await db.backupMapMeta.put({ ...input, id: "current" });
    },

    delete: async () => {
      await db.backupRawMap.clear();
      await db.backupMapMeta.clear();
    },
  },
};
