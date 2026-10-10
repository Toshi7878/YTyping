"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/auth/client";
import { orpc } from "@/orpc/provider";
import { Button } from "@/ui/button";
import { confirmDialog } from "@/ui/confirm-dialog";
import { toast } from "@/ui/toast";

interface RestoreInvalidResultButtonProps {
  resultId: number;
  className?: string;
}

/** 管理者専用: BANした記録を有効に戻す */
export const RestoreInvalidResultButton = ({ resultId, className }: RestoreInvalidResultButtonProps) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const restore = useMutation(
    orpc.result.invalidation.restore.mutationOptions({
      onSuccess: async () => {
        toast.success("BANを解除しました");
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: orpc.result.list.key() }),
          queryClient.invalidateQueries({ queryKey: orpc.result.ranking.get.key() }),
          queryClient.invalidateQueries({ queryKey: orpc.map.list.key() }),
        ]);
      },
      onError: (error) => toast.error(`BAN解除に失敗しました: ${error.message}`),
    }),
  );

  if (session?.user.role !== "ADMIN") return null;

  const handleClick = async () => {
    const confirmed = await confirmDialog.warning({
      title: "この記録のBANを解除しますか？",
      description: "記録を有効に戻します。ランキングとPPが再計算されます。",
      confirmLabel: "BANを解除する",
    });
    if (confirmed) restore.mutate({ resultId });
  };

  return (
    <Button size="sm" variant="outline" className={className} disabled={restore.isPending} onClick={handleClick}>
      BAN解除
    </Button>
  );
};
