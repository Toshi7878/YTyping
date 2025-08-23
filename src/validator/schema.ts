import { custom_user_active_state, thumbnail_quality } from "@prisma/client";
import { MAX_MAXIMUM_LENGTH, MAX_SHORT_LENGTH } from "./const";
import { z } from "./z";

export const nameSchema = z.object({
  newName: z
    .string()
    .min(1)
    .max(15)
    .refine(
      (val) => !/^[\s\u200B\u3000\t]+|[\s\u200B\u3000\t]+$/.test(val),
      "文字列の両端にスペースを含めることはできません",
    )
    .refine((val) => !/[\u200B]/.test(val), "ゼロ幅スペースを含めることはできません"),
});

export const userOptionSchema = z.object({
  custom_user_active_state: z.nativeEnum(custom_user_active_state),
  hide_user_stats: z.boolean(),
});

const fingerChartUrlBaseSchema = z
  .string()
  .max(100)
  .refine(
    (val) => val === "" || /^http?:\/\/unsi\.nonip\.net\/user\/[0-9]+$/.test(val),
    "URLは「http://unsi.nonip.net/user/{id}」形式のURLである必要があります。",
  );
export const fingerChartUrlApiSchema = fingerChartUrlBaseSchema;
export const fingerChartUrlFormSchema = z.object({ url: fingerChartUrlBaseSchema });

const myKeyboardBaseSchema = z.string().max(MAX_SHORT_LENGTH);
export const myKeyboardApiSchema = myKeyboardBaseSchema;
export const myKeyboardFormSchema = z.object({ myKeyboard: z.string().max(MAX_SHORT_LENGTH) });

const mapInfoBaseSchema = z.object({
  title: z
    .string()
    .min(1, { message: "曲名を入力してください" })
    .max(MAX_SHORT_LENGTH, { message: `曲名は${MAX_SHORT_LENGTH}文字以下にしてください` }),
  artist_name: z
    .string()
    .min(1, { message: "アーティスト名を入力してください" })
    .max(MAX_SHORT_LENGTH, { message: `アーティスト名は${MAX_SHORT_LENGTH}文字以下にしてください` }),
  music_source: z.string().max(MAX_SHORT_LENGTH, { message: `ソースは${MAX_SHORT_LENGTH}文字以下にしてください` }),
  creator_comment: z
    .string()
    .max(MAX_MAXIMUM_LENGTH, { message: `コメントは${MAX_SHORT_LENGTH}文字以下にしてください` }),
  tags: z.array(z.string().max(MAX_SHORT_LENGTH)).min(2, { message: "タグは2つ以上必要です" }).max(10),
  video_id: z.string().length(11),
  preview_time: z
    .string()
    .min(1, { message: "プレビュータイムを設定してください。" })
    .max(MAX_SHORT_LENGTH)
    .refine((value) => !isNaN(Number(value)), {
      message: "プレビュータイムは数値である必要があります",
    }),
});

export const mapInfoFormSchema = mapInfoBaseSchema;
export const mapInfoApiSchema = mapInfoBaseSchema.extend({ thumbnail_quality: z.nativeEnum(thumbnail_quality) });
