"use client";

import { useSelector } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/auth/client";
import { useTRPC } from "@/trpc/provider";
import { Button } from "@/ui/button";
import { useAppForm } from "@/ui/form-field-item";
import { UserNameSchema } from "@/validator/user/profile";

interface UserNameInputFormProps {
  placeholder?: string;
}

export const UserNameInputForm = ({ placeholder = "名前を入力" }: UserNameInputFormProps) => {
  const { data: session, refetch: refetchSession } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const trpc = useTRPC();

  // currentName を defaultValues に使い、更新成功時に form.reset() と同時に更新する。
  // session由来の値を直接defaultValuesに使うと、送信成功でform.reset()がisTouchedをクリアした
  // 直後の再レンダリングでdefaultValuesがreset後の値と一致せず、useAppFormの内部effectが
  // 「defaultValuesが変わった」と誤検知して値を巻き戻してしまう
  const [currentName, setCurrentName] = useState(session?.user?.name ?? "");
  const form = useAppForm({
    validators: { onChange: UserNameSchema },
    defaultValues: {
      newName: currentName,
    },
    onSubmit: ({ value }) => {
      updateUserName.mutate({ name: value.newName });
    },
  });
  const isDirty = useSelector(form.store, (state) => state.isDirty);

  const updateUserName = useMutation(
    trpc.auth.updateName.mutationOptions({
      onSuccess: async (_data, variables) => {
        setCurrentName(variables.name);
        form.reset({ newName: variables.name });
        toast.success("名前を更新しました");

        // disableCookieCacheを指定しないと、session cookie cache(5分)が有効な間はDBを見ずに
        // 古いnameのままのセッションが返ってきてしまう(name更新直後は特に古い値が返りやすい)
        await refetchSession({ query: { disableCookieCache: true } });
        if (pathname === "/user/register") {
          router.refresh();
        }
      },
    }),
  );

  const checkNameAvailability = useMutation(
    trpc.user.profile.checkUsernameAvailability.mutationOptions({
      onError: (error) => {
        if (error.data?.code === "CONFLICT") {
          form.setFieldMeta("newName", (prev) => ({
            ...prev,
            errorMap: { ...prev.errorMap, onSubmit: error.message },
          }));
        }
      },
    }),
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <div className="space-y-2">
        <form.AppField name="newName">
          {(field) => (
            <field.MutationInputFormField
              label="名前"
              placeholder={placeholder}
              successMessage="この名前は使用可能です"
              debounceDelay={1000}
              mutation={checkNameAvailability}
            />
          )}
        </form.AppField>
      </div>

      <Button
        type="submit"
        loading={updateUserName.isPending}
        disabled={!checkNameAvailability.isSuccess || !isDirty}
        className="w-full"
      >
        {updateUserName.isPending ? "更新中..." : "名前を決定"}
      </Button>
    </form>
  );
};
