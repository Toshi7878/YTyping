"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputFormField } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGetBackupTitleVideoIdLiveQuery } from "@/lib/db";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CreatedCheck from "../../../../../../../components/share-components/CreatedCheck";
import { extractYouTubeVideoId } from "../extractYTId";
import CreateMapBackUpButton from "./child/CreateMapBackUpButton";

// Zodスキーマを定義
const formSchema = z.object({
  videoId: z.string().min(1, {
    message: "YouTube URLは必須です。",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface CreateNewMapModalProps {
  trigger: React.ReactNode;
}

export default function CreateNewMapModal({ trigger }: CreateNewMapModalProps) {
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
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="border w-[640px] p-0" side="bottom" align="end" sideOffset={8}>
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">譜面新規作成</h2>
        </div>

        {/* Form コンポーネントの正しい使用法 */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
            <InputFormField
              control={form.control}
              name="videoId"
              label="譜面を作成したいYouTube動画のURLを入力"
              placeholder="YouTube URLを入力"
            />
            <div className="flex justify-between items-center">
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
