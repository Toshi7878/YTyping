"use client";
import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { RiAddBoxFill } from "react-icons/ri";
import z from "zod";
import { CreatedVideoMapList } from "@/components/shared/created-video-map-list";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputFormField } from "@/components/ui/input/input-form-field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { H3 } from "@/components/ui/typography";
import { useGetBackupMapInfoLiveQuery } from "@/lib/indexed-db";
import { cn } from "@/lib/utils";
import { extractYouTubeId } from "../../../../../utils/extract-youtube-id";

const formSchema = z.object({
  videoId: z.string(),
});

export const NewMapPopover = () => {
  const [open, setOpen] = useState(false);
  const backupMapInfo = useGetBackupMapInfoLiveQuery();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoId: "",
    },
  });

  const watchedVideoId = form.watch("videoId");
  const extractedVideoId = extractYouTubeId(watchedVideoId);

  const onSubmit = async (data: z.output<typeof formSchema>) => {
    const videoId = extractYouTubeId(data.videoId);

    if (!videoId) return;

    if (backupMapInfo) {
      const result = confirm(
        "新規作成バックアップデータが存在します。\n新しく譜面を作成する場合、バックアップデータは削除されますが新しく譜面を作成しますか？",
      );
      if (!result) return;
    }

    router.push(`/edit?new=${videoId}`);
    setOpen(false);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipWrapper label="譜面新規作成" delayDuration={600} className="relative bottom-3">
        <PopoverTrigger asChild>
          <Button variant="unstyled" size="icon" className="hover:text-header-foreground text-header-foreground/80">
            <RiAddBoxFill size={20} />
          </Button>
        </PopoverTrigger>
      </TooltipWrapper>
      <PopoverContent
        onOpenAutoFocus={() => inputRef.current?.focus()}
        className="w-full p-1 md:w-[640px]"
        side="bottom"
        align="end"
        sideOffset={8}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
            <H3>譜面新規作成</H3>
            <InputFormField
              name="videoId"
              label="譜面を作成したいYouTube動画のURLを入力"
              placeholder="YouTube URLを入力"
              autoComplete="off"
              ref={inputRef}
            />
            <div className="flex items-center justify-between">
              <CreateMapBackUpButton backupData={backupMapInfo} onOpenChange={setOpen} />
              <Button size="lg" className="w-30" type="submit" disabled={!extractedVideoId}>
                作成
              </Button>
            </div>
          </form>
        </Form>

        {extractedVideoId && (
          <div className="px-6 pb-6">
            <CreatedVideoMapList videoId={extractedVideoId} />
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
    >
      <Link
        href={`/edit?new=${props.backupData?.videoId}&backup=true`}
        className={cn(!props.backupData?.videoId && "invisible")}
      >
        <Button variant="outline" size="sm" onClick={() => props.onOpenChange(false)} type="button">
          前回のバックアップデータが存在します。
        </Button>
      </Link>
    </TooltipWrapper>
  );
}
