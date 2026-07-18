"use client";

import { useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
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

  const form = useAppForm({
    validators: { onChange: UserNameSchema },
    defaultValues: {
      newName: session?.user?.name ?? "",
    },
    onSubmit: ({ value }) => {
      updateUserName.mutate({ name: value.newName });
    },
  });
  const isDirty = useStore(form.store, (state) => state.isDirty);

  const updateUserName = useMutation(
    trpc.auth.updateName.mutationOptions({
      onSuccess: async (_data, variables) => {
        form.reset({ newName: variables.name });
        toast.success("名前を更新しました");

        refetchSession();
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
