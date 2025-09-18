"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { MutationInputFormField } from "@/components/ui/input/input-form-field";
import { UserNameSchema } from "@/server/drizzle/validator/user-setting";
import { useTRPC } from "@/trpc/provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface UserNameInputFormProps {
  placeholder?: string;
}

export const UserNameInputForm = ({ placeholder = "名前を入力" }: UserNameInputFormProps) => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const trpc = useTRPC();

  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(UserNameSchema),
    defaultValues: {
      newName: session?.user?.name ?? "",
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
    setError,
  } = form;

  const updateUserName = useMutation(
    trpc.userProfile.updateName.mutationOptions({
      onSuccess: async (newName) => {
        await update({ ...session?.user, name: newName });
        reset({ newName });
        toast.success("名前を更新しました");

        if (pathname === "/user/register") {
          router.push("/");
        }
      },
    }),
  );

  const checkNameAvailability = useMutation(
    trpc.userProfile.isNameAvailable.mutationOptions({
      onError: (error) => {
        if (error.data?.code === "CONFLICT") {
          setError("newName", { message: error.message });
        }
      },
    }),
  );

  const onSubmit = (formData: z.output<typeof UserNameSchema>) => {
    updateUserName.mutate(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="space-y-2">
          <MutationInputFormField
            name="newName"
            label="名前"
            placeholder={placeholder}
            successMessage="この名前は使用可能です"
            debounceDelay={1000}
            mutation={checkNameAvailability}
          />
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
    </Form>
  );
};
