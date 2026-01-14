"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { BookmarkListFormFields } from "@/components/shared/bookmark/bookmark-list-popover";
import { InfiniteScrollSpinner } from "@/components/shared/infinite-scroll-spinner";
import { MapCard } from "@/components/shared/map-card/card";
import { useConfirm } from "@/components/ui/alert-dialog/alert-dialog-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import { Small } from "@/components/ui/typography";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";
import { MapBookmarkListFormSchema } from "@/validator/bookmark";
import { serializeUserPageSearchParams, useBookmarkListIdQueryState } from "../_lib/search-params";

type BookmarkList = RouterOutputs["bookmarkList"]["getByUserId"][number];

export const UserBookmarkLists = ({ id }: { id: string }) => {
  const [bookmarkListId] = useBookmarkListIdQueryState();

  if (!bookmarkListId) {
    return <BookmarkListCardList id={id} />;
  }

  return <BookmarkListMapList listId={bookmarkListId} />;
};

const BookmarkListMapList = ({ listId }: { listId: number }) => {
  const trpc = useTRPC();

  const { data, ...pagination } = useSuspenseInfiniteQuery(
    trpc.mapList.get.infiniteQueryOptions(
      { bookmarkListId: listId, sort: { value: "bookmark", desc: true } },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      },
    ),
  );

  return (
    <section>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.pages.map((page, pageIndex) =>
          page.items.map((map) => (
            <MapCard key={map.id} map={map} initialInView={data.pages.length - 1 === pageIndex} />
          )),
        )}
      </div>
      <InfiniteScrollSpinner {...pagination} />
    </section>
  );
};

const BookmarkListCardList = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  const { data: session } = useSession();
  const { data: lists } = useSuspenseQuery(trpc.bookmarkList.getByUserId.queryOptions({ userId: Number(id) }));

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

export const buildBookmarkListUrl = (userId: string, listId: number) => {
  return `/user/${userId}${serializeUserPageSearchParams({ tab: "bookmarks", bookmarkListId: listId })}`;
};
const BookmarkListCard = ({ list, showMenu, id }: { list: BookmarkList; showMenu: boolean; id: string }) => {
  return (
    <Card className="hover-card-shadow-primary py-0 transition-shadow">
      <CardContent className="relative flex items-center justify-between gap-3 px-4 py-4">
        <Link href={buildBookmarkListUrl(id, list.id) as Route} className="absolute size-full" />
        <div className="flex flex-row items-center gap-3">
          <Image
            src={buildYouTubeThumbnailUrl(list.firstMapVideoId ?? "", "mqdefault")}
            alt={list.title}
            width={100}
            height={100}
            className="rounded-sm"
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
  const { data: session } = useSession();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteListMutation = useMutation(
    trpc.bookmarkList.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.bookmarkList.getByUserId.queryFilter({ userId: Number(session?.user?.id) }));
        setOpen(false);
        toast.success("リストを削除しました");
      },
      onError: (error) => {
        toast.error(`削除に失敗しました: ${error.message}`);
      },
    }),
  );

  const confirm = useConfirm();

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: "リストを削除",
      body: "リストを削除してもよろしいですか？この操作は元に戻せません。",
      cancelButton: "キャンセル",
      actionButton: "削除する",
      cancelButtonVariant: "outline",
      actionButtonVariant: "destructive",
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
  const { data: session } = useSession();

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
    trpc.bookmarkList.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.bookmarkList.getByUserId.queryFilter({ userId: Number(session?.user?.id) }));
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
