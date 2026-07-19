import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import type { OpenApiContentType } from "trpc-to-openapi";
import z from "zod";
import { downloadPublicFile } from "@/server/api/lib/storage";
import { mapDifficulties, maps, users } from "@/server/drizzle/schema";
import { getByIdOpenApiResponseSchema } from "@/validator/map/map";
import { type RawMapLine, RawMapLineSchema } from "@/validator/map/raw-map-json";
import { publicProcedure } from "../../../trpc";
import { mapListOpenApiRouter } from "./list";

export const mapOpenApiRouter = {
  get: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/maps/{mapId}",
        protect: false,
        tags: ["Map"],
        summary: "Get map detail by id",
        contentTypes: ["application/json" as OpenApiContentType],
        errorResponses: {
          400: "Invalid input data",
          404: "Not found",
          429: "Too many requests",
          500: "Internal server error",
        },
      },
    })
    .input(z.object({ mapId: z.number() }))
    .output(getByIdOpenApiResponseSchema)
    .query(async ({ input, ctx }) => {
      const { db } = ctx;
      const { mapId } = input;

      const [mapInfo] = await db
        .select({
          id: maps.id,
          media: {
            previewTime: maps.previewTime,
            thumbnailQuality: maps.thumbnailQuality,
            videoId: maps.videoId,
          },
          info: {
            tags: sql<string[]>`(
              SELECT COALESCE(array_agg(t.name ORDER BY t.name), ARRAY[]::varchar[])
              FROM map_tags mt
              JOIN tags t ON t.id = mt.tag_id
              WHERE mt.map_id = ${maps.id}
            )`,
            title: maps.title,
            artistName: maps.artistName,
            source: maps.musicSource,
            duration: maps.duration,
          },
          creator: {
            id: users.id,
            name: users.name,
            comment: maps.creatorComment,
          },
          difficulty: {
            romaKpmMedian: mapDifficulties.romaKpmMedian,
            kanaKpmMedian: mapDifficulties.kanaKpmMedian,
            romaKpmMax: mapDifficulties.romaKpmMax,
            kanaKpmMax: mapDifficulties.kanaKpmMax,
            romaTotalNotes: mapDifficulties.romaTotalNotes,
            kanaTotalNotes: mapDifficulties.kanaTotalNotes,
          },
          createdAt: maps.createdAt,
          updatedAt: maps.updatedAt,
        })
        .from(maps)
        .innerJoin(users, eq(users.id, maps.creatorId))
        .innerJoin(mapDifficulties, eq(mapDifficulties.mapId, maps.id))
        .where(eq(maps.id, mapId))
        .limit(1);

      if (!mapInfo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return mapInfo;
    }),

  getJson: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/maps/{mapId}/json",
        protect: false,
        tags: ["Map"],
        summary: "Get map typing data by id",
        contentTypes: ["application/json" as OpenApiContentType],
        errorResponses: {
          400: "Invalid input data",
          404: "Not found",
          429: "Too many requests",
          500: "Internal server error",
        },
      },
    })
    .input(z.object({ mapId: z.number() }))
    .output(z.array(RawMapLineSchema))
    .query(async ({ input }) => {
      try {
        const data = await downloadPublicFile(`map-json/${input.mapId}.json`);

        if (!data) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Map data not found" });
        }

        const jsonString = new TextDecoder().decode(data);
        const mapJson: RawMapLine[] = JSON.parse(jsonString);

        return mapJson;
      } catch (error) {
        console.error("Error fetching map data from R2:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  list: mapListOpenApiRouter,
} satisfies TRPCRouterRecord;
