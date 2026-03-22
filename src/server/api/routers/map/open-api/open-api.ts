import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import type { OpenApiContentType } from "trpc-to-openapi";
import z from "zod";
import { downloadPublicFile } from "@/server/api/utils/storage";
import { MapDifficulties, Maps, Users } from "@/server/drizzle/schema";
import { getByIdOpenApiResponseSchema } from "@/validator/map/item";
import { type RawMapLine, RawMapLineSchema } from "@/validator/map/raw-map-json";
import { OPENAPI_RATE_LIMITS } from "../../../lib/rate-limit-config";
import { createRateLimitMiddleware, publicProcedure } from "../../../trpc";
import { mapListOpenApiRouter } from "./list";

export const mapOpenApiRouter = {
  get: publicProcedure
    .use(createRateLimitMiddleware(OPENAPI_RATE_LIMITS["/maps/{mapId}"].get))
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
          id: Maps.id,
          media: {
            previewTime: Maps.previewTime,
            thumbnailQuality: Maps.thumbnailQuality,
            videoId: Maps.videoId,
          },
          info: {
            tags: Maps.tags,
            title: Maps.title,
            artistName: Maps.artistName,
            source: Maps.musicSource,
            duration: Maps.duration,
          },
          creator: {
            id: Users.id,
            name: Users.name,
            comment: Maps.creatorComment,
          },
          difficulty: {
            romaKpmMedian: MapDifficulties.romaKpmMedian,
            kanaKpmMedian: MapDifficulties.kanaKpmMedian,
            romaKpmMax: MapDifficulties.romaKpmMax,
            kanaKpmMax: MapDifficulties.kanaKpmMax,
            romaTotalNotes: MapDifficulties.romaTotalNotes,
            kanaTotalNotes: MapDifficulties.kanaTotalNotes,
          },
          createdAt: Maps.createdAt,
          updatedAt: Maps.updatedAt,
        })
        .from(Maps)
        .innerJoin(Users, eq(Users.id, Maps.creatorId))
        .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id))
        .where(eq(Maps.id, mapId))
        .limit(1);

      if (!mapInfo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return mapInfo;
    }),

  getJson: publicProcedure
    .use(createRateLimitMiddleware(OPENAPI_RATE_LIMITS["/maps/{mapId}/json"].get))
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
