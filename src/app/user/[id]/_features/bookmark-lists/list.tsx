"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { getSession, useSession } from "@/auth/client";
import type { RouterOutputs } from "@/server/api/trpc";
import { BookmarkListFormFields } from "@/shared/map/bookmark/lists-popover";
import { MapList } from "@/shared/map/list/list";
import { useTRPC } from "@/trpc/provider";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { confirmDialog } from "@/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Form } from "@/ui/form";
import { ThumbnailImage } from "@/ui/image";
import { Small } from "@/ui/typography";
import { getYouTubeThumbnailUrl } from "@/utils/youtube";
import { MapBookmarkListFormSchema } from "@/validator/map/bookmark";
import { buildUserBookmarkListUrl, useBookmarkListIdQueryState } from "../search-params";

type BookmarkList = RouterOutputs["map"]["bookmark"]["lists"]["getByUserId"][number];

export const UserBookmarkLists = ({ id }: { id: string }) => {
  const [bookmarkListId] = useBookmarkListIdQueryState();

  if (!bookmarkListId) {
    return <BookmarkListCardList id={id} />;
  }

  return <MapList filterParams={{ bookmarkListId }} sortParams={{ type: "bookmark", isDesc: true }} />;
};

const BookmarkListCardList = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  const { data: session } = useSession();
  const { data: lists } = useSuspenseQuery(trpc.map.bookmark.lists.getByUserId.queryOptions({ userId: Number(id) }));

  if (lists.length === 0) {
    return <div className="py-10 text-center text-muted-foreground text-sm">ブックマークリストがありません</div>;
  }

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {lists.map((list) => (
        <BookmarkListCard key={list.id} list={list} showMenu={Number(id) === Number(session?.user?.id)} id={id} />
      ))}
    </section>
  );
};

const BookmarkListCard = ({ list, showMenu, id }: { list: BookmarkList; showMenu: boolean; id: string }) => {
  return (
    <Card className="hover-card-shadow-primary py-0 transition-shadow">
      <CardContent className="relative flex items-center justify-between gap-3 px-4 py-4">
        <Link href={buildUserBookmarkListUrl(id, list.id)} className="absolute z-1 size-full" />
        <div className="flex flex-row items-center gap-3">
          <ThumbnailImage
            src={getYouTubeThumbnailUrl(list.firstMapVideoId ?? "", "mqdefault")}
            alt={list.title}
            size="2xs"
          />
          <div className="min-w-0">
            <div className="truncate font-medium text-sm">{list.title}</div>

            <div className="mt-1 flex items-center gap-2">
              <Small className="text-muted-foreground">{list.count}件</Small>
              <Badge variant={list.isPublic ? "secondary" : "outline"} size="default">
                {list.isPublic ? "公開" : "非公開"}
              </Badge>
            </div>
          </div>
        </div>

        {showMenu && <BookmarkListMenu list={list} />}
      </CardContent>
    </Card>
  );
};

const BookmarkListMenu = ({ list }: { list: BookmarkList }) => {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteListMutation = useMutation(
    trpc.map.bookmark.lists.delete.mutationOptions({
      onSuccess: () => {
        const session = getSession();
        queryClient.invalidateQueries(
          trpc.map.bookmark.lists.getByUserId.queryFilter({ userId: Number(session?.user?.id) }),
        );
        setOpen(false);
        toast.success("リストを削除しました");
      },
      onError: (error) => {
        toast.error(`削除に失敗しました: ${error.message}`);
      },
    }),
  );

  const handleDelete = async () => {
    const isConfirmed = await confirmDialog.danger({
      title: "リストを削除",
      description: "リストを削除してもよろしいですか？この操作は元に戻せません。",
      confirmLabel: "削除する",
    });
    if (!isConfirmed) return;
    deleteListMutation.mutate({ listId: list.id });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="z-10 shrink-0">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditBookmarkListDialogForm
          list={list}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="size-4" />
              編集
            </DropdownMenuItem>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
          <Trash2 className="size-4" />
          削除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const EditBookmarkListDialogForm = ({ list, trigger }: { list: BookmarkList; trigger: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(MapBookmarkListFormSchema),
    defaultValues: {
      title: list.title,
      visibility: list.isPublic ? ("public" as const) : ("private" as const),
    },
  });
  const {
    formState: { isDirty },
  } = form;

  const updateListMutation = useMutation(
    trpc.map.bookmark.lists.update.mutationOptions({
      onSuccess: () => {
        const session = getSession();
        queryClient.invalidateQueries(trpc.map.bookmark.lists.getByUserId.queryFilter({ userId: session?.user?.id }));
        setOpen(false);
        toast.success("リストを編集しました");
      },
      onError: (error) => {
        toast.error(`編集に失敗しました: ${error.message}`);
      },
    }),
  );

  const onSubmit = (data: z.infer<typeof MapBookmarkListFormSchema>) => {
    const { visibility, ...rest } = data;
    updateListMutation.mutate({ id: list.id, ...rest, isPublic: visibility === "public" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>リストを編集</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <BookmarkListFormFields />
            <Button type="submit" loading={updateListMutation.isPending} disabled={!isDirty}>
              編集
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
