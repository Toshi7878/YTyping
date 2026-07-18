"use client";
import { useRouter } from "@bprogress/next";
import { useStore } from "@tanstack/react-form";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { useRef, useState } from "react";
import { RiAddBoxFill } from "react-icons/ri";
import z from "zod";
import { idb } from "@/app/edit/_feature/indexed-db";
import { CreatedMapListByVideoId } from "@/shared/map/list/created-video";
import { Button } from "@/ui/button";
import { useAppForm } from "@/ui/form-field-item";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { TooltipWrapper } from "@/ui/tooltip";
import { H3 } from "@/ui/typography";
import { cn } from "@/utils/cn";
import { extractYouTubeId } from "../../../../../utils/youtube";

const formSchema = z.object({
  videoId: z.string(),
});

export const NewMapPopover = () => {
  const [open, setOpen] = useState(false);
  const backupMapInfo = idb.backup.useLiveQuery();
  const router = useRouter();

  const form = useAppForm({
    validators: { onChange: formSchema },
    defaultValues: {
      videoId: "",
    },
    onSubmit: async ({ value }) => {
      const videoId = extractYouTubeId(value.videoId);

      if (!videoId) return;

      if (backupMapInfo) {
        const result = confirm(
          "新規作成バックアップデータが存在します。\n新しく譜面を作成する場合、バックアップデータは削除されますが新しく譜面を作成しますか？",
        );
        if (!result) return;
      }

      router.push(`/edit?new=${videoId}`);
      setOpen(false);
    },
  });

  const watchedVideoId = useStore(form.store, (state) => state.values.videoId);
  const extractedVideoId = extractYouTubeId(watchedVideoId);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipWrapper label="譜面新規作成" className="relative bottom-3" asChild>
        <PopoverTrigger asChild>
          <Button variant="unstyled" size="icon" className="text-header-foreground/80 hover:text-header-foreground">
            <RiAddBoxFill size={20} />
          </Button>
        </PopoverTrigger>
      </TooltipWrapper>
      <PopoverContent
        onOpenAutoFocus={() => inputRef.current?.focus()}
        className="p-1 sm:w-[640px]"
        side="bottom"
        align="end"
        sideOffset={8}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 px-6 py-4"
        >
          <H3>譜面新規作成</H3>
          <form.AppField name="videoId">
            {(field) => (
              <field.InputFormField
                label="譜面を作成したいYouTube動画のURLを入力"
                placeholder="YouTube URLを入力"
                autoComplete="off"
                ref={inputRef}
              />
            )}
          </form.AppField>
          <div className="flex flex-wrap-reverse items-center justify-end gap-4 sm:justify-between">
            <CreateMapBackUpButton backupData={backupMapInfo} onOpenChange={setOpen} />
            <Button size="lg" className="w-30" type="submit" disabled={!extractedVideoId}>
              作成
            </Button>
          </div>
        </form>

        {extractedVideoId && (
          <div className="px-6 pb-6">
            <CreatedMapListByVideoId videoId={extractedVideoId} />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

interface CreateMapBackUpButtonProps {
  backupData: { title: string; videoId: string } | undefined;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

function CreateMapBackUpButton(props: CreateMapBackUpButtonProps) {
  return (
    <TooltipWrapper
      label={
        <div>
          <div>タイトル: {props.backupData?.title}</div>
          <div>YouTubeId: {props.backupData?.videoId}</div>
        </div>
      }
      asChild
    >
      <Button variant="outline" size="sm" onClick={() => props.onOpenChange(false)} type="button" asChild>
        <Link
          href={`/edit?new=${props.backupData?.videoId}&isBackup=true`}
          className={cn(!props.backupData?.videoId && "invisible")}
        >
          前回のバックアップデータが存在します。
        </Link>
      </Button>
    </TooltipWrapper>
  );
}
