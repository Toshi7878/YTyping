"use client";

import CreatedCheck from "@/components/share-components/CreatedCheck";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputFormField } from "@/components/ui/input/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useGetBackupTitleVideoIdLiveQuery } from "@/lib/db";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { RiAddBoxFill } from "react-icons/ri";
import z from "zod";
import { extractYouTubeVideoId } from "../../../../../../utils/extractYTId";

export default function NewMap() {
  return (
    <CreateNewMapModal
      trigger={
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground p-2">
          <RiAddBoxFill size={20} />
        </Button>
      }
    />
  );
}

// Zodスキーマを定義
const formSchema = z.object({
  videoId: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateNewMapModalProps {
  trigger: React.ReactNode;
}

function CreateNewMapModal({ trigger }: CreateNewMapModalProps) {
  const [open, setOpen] = useState(false);
  const backupData = useGetBackupTitleVideoIdLiveQuery();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoId: "",
    },
  });

  const watchedVideoId = form.watch("videoId");
  const extractedVideoId = extractYouTubeVideoId(watchedVideoId);

  const onSubmit = (data: FormData) => {
    const videoId = extractYouTubeVideoId(data.videoId);
    if (videoId) {
      router.push(`/edit?new=${videoId}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipWrapper label="譜面新規作成" delayDuration={600}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      </TooltipWrapper>
      <PopoverContent className="w-[640px] border p-0" side="bottom" align="end" sideOffset={8}>
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">譜面新規作成</h2>
        </div>

        {/* Form コンポーネントの正しい使用法 */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
            <InputFormField
              name="videoId"
              label="譜面を作成したいYouTube動画のURLを入力"
              placeholder="YouTube URLを入力"
            />
            <div className="flex items-center justify-between">
              <CreateMapBackUpButton backupData={backupData} onClose={() => setOpen(false)} />
              <Button size="lg" type="submit" disabled={!extractedVideoId}>
                作成
              </Button>
            </div>
          </form>
        </Form>

        {extractedVideoId && (
          <div className="px-6 pb-6">
            <CreatedCheck videoId={extractedVideoId} />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface CreateMapBackUpButtonProps {
  backupData: { title: string; videoId: string } | undefined;
  onClose: () => void;
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
        onClick={(event) => {
          props.onClose();
        }}
        className={cn(!props.backupData?.videoId && "invisible")}
      >
        <Button variant="outline" size="sm">
          前回のバックアップデータが存在します。
        </Button>
      </Link>
    </TooltipWrapper>
  );
}
