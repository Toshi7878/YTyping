"use server";

import { MapData } from "@/app/type/ts/type";
import { supabase } from "@/lib/supabaseClient";
import { auth } from "@/server/auth";
import { UploadResult } from "@/types";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { EditorSendData } from "../../app/edit/ts/type";

const prisma = new PrismaClient();

const upsertMap = async (
  data: EditorSendData,
  mapId: string,
  userId: number,
  isMapDataEdited: boolean,
  mapData: MapData[],
) => {
  const mapIdNumber = mapId === "new" ? 0 : Number(mapId);
  const upsertedMap = await prisma.map.upsert({
    where: {
      id: mapIdNumber, // 0は存在しないIDとして使用
    },
    update: {
      ...data,
      ...(isMapDataEdited && { updatedAt: new Date() }),
    },
    create: {
      ...data,
      creatorId: userId,
    },
  });

  const newMapId = upsertedMap.id;

  // Supabaseストレージにアップロード
  await supabase.storage
    .from("map-data") // バケット名を指定
    .upload(
      `public/${mapId === "new" ? newMapId : mapId}.json`,
      new Blob([JSON.stringify(mapData, null, 2)], { type: "application/json" }),
      {
        upsert: true, // 既存のファイルを上書きするオプションを追加
      },
    );

  return newMapId; // upsertされたマップのIDを返す
};

export async function actions(
  data: EditorSendData,
  mapData: MapData[],
  isMapDataEdited: boolean,
  mapId: string,
): Promise<UploadResult> {
  const validatedFields = mapSendSchema.safeParse({
    title: data.title,
    creatorComment: data.creatorComment,
    previewTime: data.previewTime,
    tags: data.tags,
    mapData,
    videoId: data.videoId,
    thumbnailQuality: data.thumbnailQuality,
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

    const mapCreatorId = await prisma.map.findUnique({
      where: { id: mapId === "new" ? 0 : Number(mapId) },
      select: {
        creatorId: true,
      },
    });

    if (mapId === "new" || mapCreatorId?.creatorId === userId || userRole === "admin") {
      newMapId = await upsertMap(data, mapId, userId, isMapDataEdited, mapData);
    } else {
      return {
        id: null,
        title: "保存に失敗しました",
        message: "この譜面を保存する権限がありません",
        status: 403,
      };
    }

    revalidatePath(`/api/map-list`);

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

import { z } from "zod";

const lineSchema = z.object({
  time: z.string(),
  lyrics: z.string().optional(),
  word: z.string().optional(),
  options: z
    .object({ eternalCSS: z.string().optional(), changeCSS: z.string().optional() })
    .optional(), // 追加
});

const mapSendSchema = z.object({
  title: z.string().min(1, { message: "タイトルは１文字以上必要です" }),
  creatorComment: z.string().optional(),
  tags: z.array(z.string()).min(2, { message: "タグは2つ以上必要です" }),
  thumbnailQuality: z.enum(["maxresdefault", "mqdefault"]),
  previewTime: z
    .string()
    .min(1, { message: "プレビュータイムを設定してください。" })
    .refine((value) => !isNaN(Number(value)), {
      message: "プレビュータイムは数値である必要があります",
    }),
  mapData: z
    .array(lineSchema)
    .refine(
      (lines) =>
        !lines.some((line) =>
          Object.values(line).some((value) => typeof value === "string" && value.includes("http")),
        ),
      {
        message: "譜面データにはhttpから始まる文字を含めることはできません",
      },
    )
    .refine((lines) => lines.some((line) => line.word && line.word.length > 0), {
      message: "タイピングワードが設定されていません",
    })
    .refine((lines) => lines[lines.length - 1]?.lyrics === "end", {
      message: "最後の歌詞は'end'である必要があります",
    })
    .refine((lines) => lines[0]?.time === "0", {
      message: "最初の時間は0である必要があります",
    })
    .refine((lines) => lines.every((line) => !isNaN(Number(line.time))), {
      message: "timeはすべて数値である必要があります",
    })
    .refine(
      (lines) => {
        const endAfterLineIndex = lines.findIndex((line) => line.lyrics === "end");
        return lines.every((line, index) =>
          endAfterLineIndex < index ? line.lyrics === "end" : true,
        );
      },
      {
        message: "endの後に無効な行があります",
      },
    )
    .refine(
      (lines) => {
        let allCustomStyleLength = 0;

        for (let i = 0; i < lines.length; i++) {
          const eternalCSS = lines[i].options?.eternalCSS;
          const changeCSS = lines[i].options?.changeCSS;
          if (eternalCSS) {
            allCustomStyleLength += eternalCSS.length;
          }

          if (changeCSS) {
            allCustomStyleLength += changeCSS.length;
          }
        }
        return allCustomStyleLength < 10000;
      },
      {
        message: "カスタムCSSの合計文字数は10000文字以下になるようにしてください",
      },
    ),
  videoId: z.string(),
});
