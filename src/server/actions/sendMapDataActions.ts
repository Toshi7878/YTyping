"use server";

import { supabase } from "@/lib/supabaseClient";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { UploadResult } from "@/types";
import { SendMapDifficulty, SendMapInfo } from "../../app/edit/ts/type";

const upsertMap = async (
  sendMapInfo: SendMapInfo,
  sendMapDifficulty: SendMapDifficulty,
  mapId: string,
  userId: number,
  isMapDataEdited: boolean,
  mapData: MapLine[]
) => {
  return await prisma.$transaction(async (tx) => {
    try {
      const mapIdNumber = mapId === "new" ? 0 : Number(mapId);
      const upsertedMap = await tx.maps.upsert({
        where: {
          id: mapIdNumber,
        },
        update: {
          ...sendMapInfo,
          ...(isMapDataEdited && { updated_at: new Date() }),
        },
        create: {
          ...sendMapInfo,
          creator_id: userId,
        },
      });

      const newMapId = upsertedMap.id;

      await tx.map_difficulties.upsert({
        where: {
          map_id: newMapId,
        },
        update: {
          ...sendMapDifficulty,
        },
        create: {
          map_id: newMapId,
          ...sendMapDifficulty,
        },
      });

      await supabase.storage
        .from("map-data")
        .upload(
          `public/${mapId === "new" ? newMapId : mapId}.json`,
          new Blob([JSON.stringify(mapData, null, 2)], { type: "application/json" }),
          {
            upsert: true,
          }
        );

      return newMapId;
    } catch (error) {
      console.error("Prisma Error:", error);
      if (error instanceof Error) {
        throw new Error(`データベース操作に失敗しました: ${error.message}`);
      }
      throw new Error("データベース操作に失敗しました");
    }
  });
};

export async function actions(
  data: SendMapInfo,
  sendMapDifficulty: SendMapDifficulty,
  mapData: MapLine[],
  isMapDataEdited: boolean,
  mapId: string
): Promise<UploadResult> {
  const validatedFields = mapSendSchema.safeParse({
    title: data.title,
    creatorComment: data.creator_comment,
    previewTime: data.preview_time,
    tags: data.tags,
    mapData,
    videoId: data.video_id,
    thumbnailQuality: data.thumbnail_quality,
    roma_kpm_max: sendMapDifficulty.roma_kpm_max,
  });

  if (!validatedFields.success) {
    return {
      id: null,
      title: "保存に失敗しました",
      message: validatedFields.error.errors[0].message,
      status: 400,
    };
  }
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);
    const userRole = session?.user.role;
    let newMapId: number;

    const mapCreatorId = await prisma.maps.findUnique({
      where: { id: mapId === "new" ? 0 : Number(mapId) },
      select: {
        creator_id: true,
      },
    });

    if (mapId === "new" || mapCreatorId?.creator_id === userId || userRole === "ADMIN") {
      newMapId = await upsertMap(data, sendMapDifficulty, mapId, userId, isMapDataEdited, mapData);
    } else {
      return {
        id: null,
        title: "保存に失敗しました",
        message: "この譜面を保存する権限がありません",
        status: 403,
      };
    }

    return {
      id: mapId === "new" ? newMapId : null,
      title: mapId === "new" ? "アップロード完了" : "アップデート完了",
      message: "",
      status: 200,
    };
  } catch (error) {
    return {
      id: null,
      title: "サーバー側で問題が発生しました",
      message: "しばらく時間をおいてから再度お試しください。",
      status: 500,
      errorObject: error instanceof Error ? error.message : String(error), // エラーオブジェクトを文字列に変換
    };
  }
}

import { MapLine } from "@/types/map";
import { MAX_MAXIMUM_LENGTH, MAX_SHORT_LENGTH } from "@/validator/const";
import { z } from "@/validator/z";
import { thumbnail_quality } from "@prisma/client";

const lineSchema = z.object({
  time: z.string().max(20),
  lyrics: z.string().optional(),
  word: z.string().optional(),
  options: z.object({ eternalCSS: z.string().optional(), changeCSS: z.string().optional() }).optional(),
});

const mapSendSchema = z.object({
  title: z.string().min(1, { message: "タイトルは１文字以上必要です" }).max(MAX_SHORT_LENGTH),
  creatorComment: z.string().max(MAX_MAXIMUM_LENGTH).optional(),
  tags: z.array(z.string().max(MAX_SHORT_LENGTH)).min(2, { message: "タグは2つ以上必要です" }).max(10),
  thumbnailQuality: z.nativeEnum(thumbnail_quality),
  previewTime: z
    .string()
    .min(1, { message: "プレビュータイムを設定してください。" })
    .max(MAX_SHORT_LENGTH)
    .refine((value) => !isNaN(Number(value)), {
      message: "プレビュータイムは数値である必要があります",
    }),
  mapData: z
    .array(lineSchema)
    .refine(
      (lines) =>
        !lines.some((line) => Object.values(line).some((value) => typeof value === "string" && value.includes("http"))),
      { message: "譜面データにはhttpから始まる文字を含めることはできません" }
    )
    .refine((lines) => lines.some((line) => line.word && line.word.length > 0), {
      message: "タイピングワードが設定されていません",
    })
    .refine((lines) => lines[lines.length - 1]?.lyrics === "end", { message: "最後の歌詞は'end'である必要があります" })
    .refine((lines) => lines[0]?.time === "0", { message: "最初の時間は0である必要があります" })
    .refine((lines) => lines.every((line) => !isNaN(Number(line.time))), {
      message: "timeはすべて数値である必要があります",
    })
    .refine(
      (lines) => {
        const endAfterLineIndex = lines.findIndex((line) => line.lyrics === "end");
        return (
          endAfterLineIndex === -1 || lines.every((line, index) => index <= endAfterLineIndex || line.lyrics === "end")
        );
      },
      { message: "endの後に無効な行があります" }
    )
    .refine(
      (lines) => {
        const totalCSSLength = lines.reduce((total, line) => {
          const eternalCSSLength = line.options?.eternalCSS?.length || 0;
          const changeCSSLength = line.options?.changeCSS?.length || 0;
          return total + eternalCSSLength + changeCSSLength;
        }, 0);

        return totalCSSLength < 10000;
      },
      { message: "カスタムCSSの合計文字数は10000文字以下になるようにしてください" }
    ),
  videoId: z.string().length(11),
  roma_kpm_max: z
    .number()
    .refine((val) => Number.isFinite(val), { message: "同じタイムのラインが2つ以上存在しています。" }),
});
