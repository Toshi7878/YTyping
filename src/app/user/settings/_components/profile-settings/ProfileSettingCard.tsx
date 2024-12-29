import { nameSchema } from "@/app/user/register/validationSchema";
import CustomCard from "@/components/custom-ui/CustomCard";
import { INITIAL_STATE } from "@/config/global-consts";
import { useDebounce } from "@/lib/global-hooks/useDebounce";
import { useUploadToast } from "@/lib/global-hooks/useUploadToast";
import { actions } from "@/server/actions/sendUserNameActions";
import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import {
  Button,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Text,
  useTheme,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";

const ProfileSettingCard = () => {
  return (
    <CustomCard>
      <CardHeader mx={8}>プロフィール設定</CardHeader>
      <CardBody mx={8}>
        <Flex width="100%">
          <NameForm />
        </Flex>
      </CardBody>
      <CardFooter mx={8}>Footer</CardFooter>
    </CustomCard>
  );
};

interface NameState {
  nameState: "duplicate" | "pending" | "unique";
}
const NameForm = () => {
  const { data: session, update } = useSession();
  const [nameState, setNameState] = useState<NameState["nameState"]>("unique"); // 重複チェック用のステート
  const debounce = useDebounce(1000);

  const theme: ThemeColors = useTheme();
  const {
    register,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      newName: session?.user ? (session.user.name as string) : "",
    },
  });

  const newNameValue = watch("newName");
  const checkNewName = clientApi.userProfileSetting.checkNewName.useMutation();

  useEffect(() => {
    //TODO: 何も入力されていないときも名前は使用可能ですが出る
    if (session?.user.name !== newNameValue && newNameValue) {
      setNameState("pending");
      debounce(async () => {
        const result = await checkNewName.mutateAsync({
          newName: newNameValue,
        });
        if (result) {
          setNameState("duplicate");
        } else {
          setNameState("unique");
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newNameValue]);

  const upload = async () => {
    if (session?.user.name !== newNameValue) {
      const result = await actions(newNameValue);
      return result;
    }
  };

  const [state, formAction] = useFormState(upload, INITIAL_STATE);

  const uploadToast = useUploadToast();

  useEffect(() => {
    if (state === undefined) {
      return;
    }
    if (state.status !== 0) {
      (async function () {
        uploadToast(state);

        const isSuccess = state.status === 200 ? true : false;

        if (isSuccess) {
          await update({ ...session?.user, name: state.id });
        }
      })();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Flex as="form" action={formAction} width="100%" gap={3} direction="column">
      <FormControl isInvalid={!!errors.newName}>
        <FormLabel htmlFor="newName">名前</FormLabel>
        <Input size="lg" {...register("newName")} placeholder="名前を入力" required />
        {errors.newName && (
          <p style={{ color: theme.colors.error.light }}>{errors.newName.message}</p>
        )}
        <Text
          visibility={session?.user.name !== newNameValue && newNameValue ? "visible" : "hidden"}
          color={
            nameState === "duplicate"
              ? theme.colors.error.light
              : nameState === "unique"
                ? theme.colors.secondary.light
                : theme.colors.text.body
          }
        >
          {nameState === "pending" && <Spinner size="sm" />}
          {nameState === "duplicate"
            ? "この名前は既に使用されています。"
            : nameState === "unique" && "こちらの名前は使用可能です。"}
        </Text>
        <NameFromSubmitButton nameState={nameState} />
      </FormControl>
    </Flex>
  );
};

const NameFromSubmitButton = ({ nameState }: NameState) => {
  const { pending } = useFormStatus(); // useFormStatusを使用

  return (
    <Button
      variant="upload"
      isLoading={pending} // 送信中の状態を判定
      type="submit"
      width="full"
      disabled={nameState !== "unique"}
    >
      名前を変更
    </Button>
  );
};

export default ProfileSettingCard;
