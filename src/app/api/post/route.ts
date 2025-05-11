import { supabase } from "@/lib/supabaseClient";
import { prisma } from "@/server/db";
import { MapLine } from "@/types/map";
import { ParseMap } from "@/util/parse-map/parseMap";

export async function POST(request: Request) {
  try {
    for (let i = 1; i < 1500; i++) {
      const previewTime = await prisma.maps
        .findUnique({
          where: {
            id: i,
          },
          select: {
            preview_time: true,
          },
        })
        .then((result) => {
          return result?.preview_time;
        });

      if (previewTime === "0") {
        console.log("previewTime0 mapId: ", i);
        const rawMapData = await getMap(i);

        const parsedMap = new ParseMap(rawMapData);

        const newPreviewTime = Math.max(0, Number(parsedMap.mapData[parsedMap.startLine]["time"]) + 0.2).toFixed(3);

        await prisma.maps.update({
          where: {
            id: i,
          },
          data: {
            preview_time: newPreviewTime,
          },
        });
      }
    }

    return new Response(JSON.stringify("done"), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}

const getMap = async (mapId: number) => {
  const timestamp = new Date().getTime();

  const { data, error } = await supabase.storage
    .from("map-data") // バケット名を指定
    .download(`public/${mapId}.json?timestamp=${timestamp}`);

  if (error) {
    console.error("Error downloading from Supabase:", error);
    throw error;
  }

  const jsonString = await data.text();
  const rawMapData: MapLine[] = JSON.parse(jsonString);

  return rawMapData;
};
