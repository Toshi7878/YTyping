"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import { InputFormField } from "@/components/ui/input/input-form-field";
import { Spinner } from "@/components/ui/spinner";
import { SwitchFormField } from "@/components/ui/switch";
import { Small } from "@/components/ui/typography";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";

type BookmarkList = RouterOutputs["bookmarkList"]["getByUserId"][number];

export const UserBookmarkLists = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  const { data: session } = useSession();
  const { data: lists, isPending } = useQuery(trpc.bookmarkList.getByUserId.queryOptions({ userId: Number(id) }));

  if (isPending) return <Spinner size="lg" />;

  if (!lists || lists.length === 0) {
    return <div className="py-10 text-center text-muted-foreground text-sm">ブックマークリストがありません</div>;
  }

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {lists.map((list) => (
        <BookmarkListCard
          key={list.id}
          list={list}
          userId={Number(id)}
          showMenu={Number(id) === Number(session?.user?.id)}
        />
      ))}
    </section>
  );
};

const EditBookmarkListSchema = z.object({
  title: z.string().trim().min(1),
  isPublic: z.boolean(),
});

const BookmarkListCard = ({ list, userId, showMenu }: { list: BookmarkList; userId: number; showMenu: boolean }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const form = useForm<z.infer<typeof EditBookmarkListSchema>>({
    resolver: zodResolver(EditBookmarkListSchema),
    defaultValues: { title: list.title, isPublic: list.isPublic },
  });

  const updateMutation = useMutation(
    trpc.bookmarkList.update.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries(trpc.bookmarkList.getByUserId.queryOptions({ userId })),
          queryClient.invalidateQueries(trpc.bookmarkList.getForSession.queryOptions()),
        ]);
        toast.success("更新しました");
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const deleteMutation = useMutation(
    trpc.bookmarkList.delete.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries(trpc.bookmarkList.getByUserId.queryOptions({ userId })),
          queryClient.invalidateQueries(trpc.bookmarkList.getForSession.queryOptions()),
        ]);
        toast.success("削除しました");
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  return (
    <Card className="py-0">
      <CardContent className="flex items-center justify-between gap-3 px-4 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Bookmark className="size-4 text-muted-foreground" />
            <div className="truncate font-medium text-sm">{list.title}</div>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Small className="text-muted-foreground">{list.count.toLocaleString()}件</Small>
            <Badge variant={list.isPublic ? "secondary" : "outline"} size="default">
              {list.isPublic ? "公開" : "非公開"}
            </Badge>
          </div>
        </div>

        {showMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Dialog
                onOpenChange={(open) => {
                  if (open) {
                    form.reset({ title: list.title, isPublic: list.isPublic });
                  }
                }}
              >
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Pencil className="size-4" />
                    編集
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>ブックマークリストを編集</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit((data) =>
                        updateMutation.mutate({ listId: list.id, title: data.title, isPublic: data.isPublic }),
                      )}
                      className="grid gap-3"
                    >
                      <InputFormField name="title" label="リスト名" />
                      <SwitchFormField name="isPublic" label="公開" />
                      <DialogFooter>
                        <Button type="submit" disabled={updateMutation.isPending}>
                          更新
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setIsDeleteOpen(true);
                }}
              >
                <Trash2 className="size-4" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardContent>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>リストを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>この操作は取り消せません。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate({ listId: list.id })}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
