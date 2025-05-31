"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputFormField } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGetBackupTitleVideoIdLiveQuery } from "@/lib/db";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CreatedCheck from "../../../../../../../components/share-components/CreatedCheck";
import { extractYouTubeVideoId } from "../extractYTId";
import CreateMapBackUpButton from "./child/CreateMapBackUpButton";
import NewCreateVideoIdInputBox from "./child/NewCreateVideoIdInputBox";

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
  const [createYTURL, setCreateYTURL] = useState("");
  const [newID, setNewID] = useState("");
  const createBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const backupData = useGetBackupTitleVideoIdLiveQuery();
  const router = useRouter();

  // react-hook-formのuseFormを正しく設定
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoId: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
    const videoId = extractYouTubeVideoId(data.videoId);
    setNewID(videoId);
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
            <Button type="submit">作成</Button>
          </form>
        </Form>

        <div className="px-6 py-4">
          <NewCreateVideoIdInputBox
            onClose={() => setOpen(false)}
            createBtnRef={createBtnRef as any}
            createYTURL={createYTURL}
            setCreateYTURL={setCreateYTURL}
            setNewID={setNewID}
            inputRef={inputRef as any}
          />
        </div>

        <div className="flex flex-col justify-between items-center w-full min-h-[80px] px-6 pb-6">
          <div className="flex justify-between items-center w-full">
            <CreateMapBackUpButton backupData={backupData} onClose={() => setOpen(false)} />
          </div>
          {newID && (
            <div className="flex">
              <CreatedCheck videoId={newID} />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
