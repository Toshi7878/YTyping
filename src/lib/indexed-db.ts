import Dexie, { type EntityTable } from "dexie"
import { useLiveQuery } from "dexie-react-hooks"
import type { MapLine } from "@/server/drizzle/validator/map-json"

interface MapTable {
  videoId: string
  map: MapLine[]
}

interface MapInfoTable {
  videoId: string
  title: string
  artistName: string
  musicSource: string
  creatorComment: string
  tags: string[]
  previewTime: number
}

const db = new Dexie("editMapBackup") as Dexie & {
  map: EntityTable<MapTable & { id: string }, "id">
  mapInfo: EntityTable<MapInfoTable & { id: string }, "id">
}

db.version(20).stores({
  map: "id",
  mapInfo: "id",
})

export const backupMap = async (input: MapTable) => {
  await db.map.put({ ...input, id: "current" })
}

export const backupMapInfo = async (input: MapInfoTable) => {
  await db.mapInfo.put({ ...input, id: "current" })
}

export const clearBackupMapWithInfo = async () => {
  await db.map.clear()
  await db.mapInfo.clear()
}

export const useGetBackupMapInfoLiveQuery = () => {
  const map = useLiveQuery(async () => {
    const map = await db.map.get("current")
    const mapInfo = await db.mapInfo.get("current")

    if (map?.videoId !== mapInfo?.videoId) return
    if (!map || !mapInfo) return
    return mapInfo
  })

  return map
}

export const fetchBackupMap = async () => {
  const map = await db.map.get("current")
  const mapInfo = await db.mapInfo.get("current")

  if (map?.videoId !== mapInfo?.videoId) return
  if (!map || !mapInfo) return
  const { id: _, ...info } = mapInfo

  return { map: map.map, ...info }
}
