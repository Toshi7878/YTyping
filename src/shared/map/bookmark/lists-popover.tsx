"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { getSession, useSession } from "@/auth/client";
import type { RouterOutputs } from "@/server/api/trpc";
import { useAddBookmarkListItemMutation, useRemoveBookmarkListItemMutation } from "@/shared/map/bookmark/list-item";
import { useTRPC } from "@/trpc/provider";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Form } from "@/ui/form";
import { ThumbnailImage } from "@/ui/image";
import { InputFormField } from "@/ui/input/input-form-field";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { SelectFormField } from "@/ui/select/select-form-field";
import { Separator } from "@/ui/separator";
import { Spinner } from "@/ui/spinner";
import { TooltipWrapper } from "@/ui/tooltip";
import { H4, Small } from "@/ui/typography";
import { cn } from "@/utils/cn";
import { getYouTubeThumbnailUrl } from "@/utils/youtube";
import { MAX_BOOKMARK_LIST_LENGTH, MapBookmarkListFormSchema } from "@/validator/map/bookmark";

interface BookmarkListPopoverProps {
  mapId: number;
  trigger: React.ReactNode;
  tooltipLabel?: string;
}

export const BookmarkListPopover = ({ mapId, trigger, tooltipLabel }: BookmarkListPopoverProps) => {
  const trpc = useTRPC();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const { data: lists, isLoading } = useQuery(
    trpc.map.bookmark.lists.getByUserId.queryOptions(
      { userId: session?.user?.id ?? 0, includeMapId: mapId },
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
      <TooltipWrapper label={tooltipLabel} asChild>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      </TooltipWrapper>
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
  list: RouterOutputs["map"]["bookmark"]["lists"]["getByUserId"][number];
  onClick: React.ComponentProps<"button">["onClick"];
}

const BookMarkListItem = ({ list, onClick }: BookMarkListItemProps) => {
  const videoId = list.firstMapVideoId;

  return (
    <Button variant="ghost" size="xl" className="justify-between px-1" onClick={onClick}>
      <div className="flex items-center gap-3">
        <ThumbnailImage
          src={videoId ? getYouTubeThumbnailUrl(videoId, "mqdefault") : undefined}
          alt={list.title}
          fallback={<Bookmark className="size-4 text-muted-foreground" fill="currentColor" />}
          size="3xs"
        />
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
  const createListMutation = useMutation(
    trpc.map.bookmark.lists.create.mutationOptions({
      onSuccess: () => {
        const session = getSession();
        queryClient.invalidateQueries(
          trpc.map.bookmark.lists.getByUserId.queryOptions({
            userId: session?.user?.id ?? 0,
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
