"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Plus } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { InputFormField } from "@/components/ui/input/input-form-field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SelectFormField } from "@/components/ui/select/select-form-field";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { H4, Small } from "@/components/ui/typography";
import { useAddBookmarkListItemMutation, useRemoveBookmarkListItemMutation } from "@/lib/mutations/bookmark-list-item";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";
import { MAX_BOOKMARK_LIST_LENGTH, MapBookmarkListFormSchema } from "@/validator/bookmark";

interface BookmarkListPopoverProps {
  mapId: number;
  hasBookmarked: boolean;
  className?: string;
  iconClassName?: string;
  variant?: "ghost" | "unstyled";
}

export const BookmarkListPopover = ({
  mapId,
  hasBookmarked,
  className,
  iconClassName,
  variant = "ghost",
}: BookmarkListPopoverProps) => {
  const trpc = useTRPC();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const { data: lists, isLoading } = useQuery(
    trpc.map.bookmark.list.getByUserId.queryOptions(
      { userId: Number(session?.user?.id), includeMapId: mapId },
      { enabled: !!session?.user?.id && isOpen },
    ),
  );

  const addMapToList = useAddBookmarkListItemMutation();
  const removeMapFromList = useRemoveBookmarkListItemMutation();

  const toggleMap = (listId: number, hasMap: boolean) => {
    if (hasMap) {
      removeMapFromList.mutate({ listId, mapId });
      return;
    }

    addMapToList.mutate({ listId, mapId });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button variant={variant} size="icon" className={cn("dark:hover:bg-primary/35", className)}>
          <Bookmark
            strokeWidth={2.5}
            fill={hasBookmarked ? "currentColor" : "none"}
            className={cn("size-4", hasBookmarked ? "text-primary-light" : "text-muted-foreground", iconClassName)}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <H4 className="px-2 py-2 text-base">
          ブックマークに保存 {lists?.length} / {MAX_BOOKMARK_LIST_LENGTH}件
        </H4>
        <Separator />

        <ul className="grid max-h-48 min-h-48 gap-2 overflow-y-auto px-2 py-2">
          {isLoading ? (
            <Spinner size="lg" />
          ) : (
            <li className="flex flex-col gap-2">
              {lists?.map((list) => (
                <BookMarkListItem key={list.id} list={list} onClick={() => toggleMap(list.id, list.hasMap)} />
              ))}
              {lists?.length === 0 && (
                <div className="text-center text-muted-foreground text-sm">リストがありません</div>
              )}
            </li>
          )}
        </ul>
        <Separator />
        <AddBookmarkListDialogForm mapId={mapId} />
      </PopoverContent>
    </Popover>
  );
};

interface BookMarkListItemProps {
  list: RouterOutputs["map"]["bookmark"]["list"]["getByUserId"][number];
  onClick: React.ComponentProps<"button">["onClick"];
}

const BookMarkListItem = ({ list, onClick }: BookMarkListItemProps) => {
  return (
    <Button variant="ghost" size="xl" className="justify-between px-1" onClick={onClick}>
      <div className="flex items-center gap-3">
        <BookmarkThumbnail videoId={list.firstMapVideoId} />
        <div className="flex flex-col items-start gap-1">
          <span className="flex-1 truncate text-sm">{list.title}</span>
          <div className="flex items-center gap-1">
            <Small className="text-muted-foreground text-xs">{list.isPublic ? "公開" : "非公開"}</Small>
            <Small className="text-muted-foreground text-xs">{list.count}譜面</Small>
          </div>
        </div>
      </div>
      <Bookmark
        className={cn("size-5", list.hasMap ? "text-primary-light" : "text-muted-foreground")}
        fill={list.hasMap ? "currentColor" : "none"}
      />
    </Button>
  );
};

const BookmarkThumbnail = ({ videoId }: { videoId: string | null }) => {
  return (
    <div className="relative aspect-video w-16 shrink-0 overflow-hidden rounded-sm bg-muted">
      {videoId ? (
        <Image src={buildYouTubeThumbnailUrl(videoId, "mqdefault")} alt={videoId} fill className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Bookmark className="size-4 text-muted-foreground" fill="currentColor" />
        </div>
      )}
    </div>
  );
};

const AddBookmarkListDialogForm = ({ mapId }: { mapId: number }) => {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(MapBookmarkListFormSchema),
    defaultValues: {
      title: "",
      visibility: "public" as const,
    },
  });
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const createListMutation = useMutation(
    trpc.map.bookmark.list.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.map.bookmark.list.getByUserId.queryOptions({
            userId: Number(session?.user?.id),
            includeMapId: mapId,
          }),
        );
        form.reset();
        setOpen(false);
        toast.success("リストを作成しました");
      },
      onError: (error) => {
        toast.error(`作成に失敗しました: ${error.message}`);
      },
    }),
  );

  const onSubmit = (data: z.infer<typeof MapBookmarkListFormSchema>) => {
    const { visibility, ...rest } = data;
    createListMutation.mutate({
      ...rest,
      isPublic: visibility === "public",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 py-5">
          <Plus className="size-4" /> 新しいリストを作成
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新しいリストを作成</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <BookmarkListFormFields />
            <Button type="submit">作成</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const BookmarkListFormFields = () => {
  return (
    <>
      <InputFormField name="title" label="リスト名" />
      <SelectFormField
        name="visibility"
        label="公開範囲"
        defaultValue="public"
        options={[
          { value: "public", label: "公開" },
          { value: "private", label: "非公開" },
        ]}
      />
    </>
  );
};
