import { nameSchema } from "@/app/user/register/validationSchema";
import CustomCard from "@/components/custom-ui/CustomCard";
import { INITIAL_STATE } from "@/config/global-consts";
import { useUploadToast } from "@/lib/global-hooks/useUploadToast";
import { actions } from "@/server/actions/sendUserNameActions";
import { clientApi } from "@/trpc/client-api";
import {
  Button,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  FormControl,
  Input,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
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

interface FormData {
  newName: string;
}

const NameForm = () => {
  const { data: session, update } = useSession();
  const [isDuplicate, setIsDuplicate] = useState(false); // 重複チェック用のステート

  const {
    register,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      newName: session?.user ? (session.user.name as string) : "",
    },
  });
  const newNameValue = watch("newName");
  const checkNewName = clientApi.userProfileSetting.checkNewName.useQuery({
    newName: newNameValue,
  });

  useEffect(() => {
    if (checkNewName.data?.name) {
      setIsDuplicate(true);
    } else {
      setIsDuplicate(false);
    }
  }, [checkNewName]); // newNameValueが変わるたびに実行

  const upload = async () => {
    const result = await actions(newNameValue);
    return result;
  };

  const [state, formAction] = useFormState(upload, INITIAL_STATE);

  const uploadToast = useUploadToast();

  useEffect(() => {
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
    <Flex as="form" action={formAction} width="100%" gap={2} direction="column">
      <FormControl isInvalid={!!errors.newName}>
        <Input size="lg" {...register("newName")} placeholder="名前を入力" required />
        {isDuplicate && <p style={{ color: "red" }}>この名前は既に使用されています。</p>}
      </FormControl>
      <Button variant="upload" type="submit" width="full" disabled={!isDuplicate}>
        保存
      </Button>
    </Flex>
  );
};

export default ProfileSettingCard;
