import { prisma } from "@/server/db";
import { NextRequest } from "next/server";
import { generateMapListWhere } from "../map-list/where";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));

  const where = generateMapListWhere({ searchParams, userId });
  try {
    const mapListLength = await prisma.$queryRaw`
    SELECT COUNT(*) as total_count
    FROM maps
    JOIN users AS creator ON maps."creator_id" = creator."id"
    JOIN map_difficulties AS "difficulty" ON maps."id" = "difficulty"."map_id"
    LEFT JOIN map_likes ON maps."id" = map_likes."map_id" AND map_likes."user_id" = ${userId}
    WHERE (${where})`.then((result) => {
      const totalCount = (result as any)[0].total_count;
      return Number(totalCount);
    });

    return new Response(JSON.stringify(mapListLength), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("マップリスト取得エラー:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
