"use client";

import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type z from "zod";
import { getSession, useSession } from "@/auth/client";
import { orpc } from "@/orpc/provider";
import type { RouterOutputs } from "@/server/api/root";
import { useAddBookmarkListItemMutation, useRemoveBookmarkListItemMutation } from "@/shared/map/bookmark/list-item";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { useAppForm, withForm } from "@/ui/form-field-item";
import { ThumbnailImage } from "@/ui/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Separator } from "@/ui/separator";
import { Spinner } from "@/ui/spinner";
import { toast } from "@/ui/toast";
import { TooltipWrapper } from "@/ui/tooltip";
import { H4, Small } from "@/ui/typography";
import { cn } from "@/utils/cn";
import { getYouTubeThumbnailUrl } from "@/utils/youtube";
import { MAX_BOOKMARK_LIST_LENGTH, MapBookmarkListFormSchema } from "@/validator/map/bookmark";

const bookmarkListFormDefaultValues: z.infer<typeof MapBookmarkListFormSchema> = {
  title: "",
  visibility: "public",
};

interface BookmarkListPopoverProps {
  mapId: number;
  trigger: React.ReactNode;
  tooltipLabel?: string;
}

export const BookmarkListPopover = ({ mapId, trigger, tooltipLabel }: BookmarkListPopoverProps) => {
  const t = useTranslations("bookmark");
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const { data: lists, isLoading } = useQuery(
    orpc.map.bookmark.lists.getByUserId.queryOptions({
      input: session?.user?.id ? { userId: session.user.id, includeMapId: mapId } : skipToken,
      enabled: isOpen,
    }),
  );

  const addMapToList = useAddBookmarkListItemMutation();
  const removeMapFromList = useRemoveBookmarkListItemMutation();

  const toggleMap = (listId: number, hasMap: boolean) => {
    const options = { onSuccess: () => setIsOpen(false) };

    if (hasMap) {
      removeMapFromList.mutate({ listId, mapId }, options);
      return;
    }

    addMapToList.mutate({ listId, mapId }, options);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <TooltipWrapper label={tooltipLabel} asChild>
        <PopoverTrigger render={trigger as React.ReactElement} />
      </TooltipWrapper>
      <PopoverContent className="w-80 p-0" align="end">
        <H4 className="px-2 py-2 text-base">
          {t("saveTitle", { count: lists?.length ?? 0, max: MAX_BOOKMARK_LIST_LENGTH })}
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
              {lists?.length === 0 && <div className="text-center text-muted-foreground text-sm">{t("noLists")}</div>}
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
  const t = useTranslations("bookmark");
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
            <Small className="text-muted-foreground text-xs">{list.isPublic ? t("public") : t("private")}</Small>
            <Small className="text-muted-foreground text-xs">{t("mapCount", { count: list.count })}</Small>
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
  const t = useTranslations("bookmark");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useAppForm({
    validators: { onChange: MapBookmarkListFormSchema },
    defaultValues: bookmarkListFormDefaultValues,
    onSubmit: ({ value }) => {
      const { visibility, ...rest } = value;
      createListMutation.mutate({
        ...rest,
        isPublic: visibility === "public",
      });
    },
  });

  const createListMutation = useMutation(
    orpc.map.bookmark.lists.create.mutationOptions({
      onSuccess: () => {
        const session = getSession();
        void queryClient.invalidateQueries(
          orpc.map.bookmark.lists.getByUserId.queryOptions({
            input: {
              userId: session?.user?.id ?? 0,
              includeMapId: mapId,
            },
          }),
        );
        form.reset();
        setOpen(false);
        toast.success(t("created"));
      },
      onError: (error) => {
        toast.error(t("createFailed", { message: error.message }));
      },
    }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" className="w-full justify-start gap-2 py-5">
            <Plus className="size-4" /> {t("newList")}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("newList")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <BookmarkListFormFields form={form} />
          <Button type="submit">{tCommon("create")}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const BookmarkListFormFields = withForm({
  defaultValues: bookmarkListFormDefaultValues,
  render: function Render({ form }) {
    const t = useTranslations("bookmark");
    return (
      <>
        <form.AppField name="title">{(field) => <field.InputFormField label={t("listName")} />}</form.AppField>
        <form.AppField name="visibility">
          {(field) => (
            <field.SelectFormField
              label={t("visibility")}
              options={[
                { value: "public", label: t("public") },
                { value: "private", label: t("private") },
              ]}
            />
          )}
        </form.AppField>
      </>
    );
  },
});
