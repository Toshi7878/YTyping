"use client";

import { INITIAL_STATE } from "@/config/global-consts";
import { useSuccessToast } from "@/lib/global-hooks/useSuccessToast";
import { Box, Button, FormControl, Input } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { actions } from "../../../server/actions/sendUserNameActions";
import { nameSchema } from "./validationSchema";

interface FormData {
  newName: string;
}

export default function NewNameDialog() {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(nameSchema),
  });
  const newNameValue = watch("newName");

  const upload = async () => {
    const result = await actions(newNameValue);
    return result;
  };

  const [state, formAction] = useFormState(upload, INITIAL_STATE);
  const { data: session, update } = useSession();

  const successToast = useSuccessToast();

  useEffect(() => {
    if (state.status !== 0) {
      (async function () {
        successToast(state);

        const isSuccess = state.status === 200 ? true : false;

        if (isSuccess) {
          await update({ ...session?.user, name: state.id });
          window.location.href = "/";
        }
      })();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction}>
      <div className="grid gap-4 py-4">
        <FormControl isInvalid={!!errors.newName}>
          <Input
            size="lg"
            id="name"
            {...register("newName")}
            placeholder="名前を入力してね"
            required
          />
        </FormControl>
        <Button colorScheme="blue" type="submit">
          保存
        </Button>

        <Box>
          <Box className="text-lg font-semibold">おしらせ</Box>
          現在データベースに保存するデータの構成が煮詰まっていないため、
          データの構成に一貫性をもたせるために予告なくログインデータが削除される可能性があります。
          ご了承くださいませ。
          <br />
          ᓚ₍ ^. .^₎
        </Box>
      </div>
    </form>
  );
}
