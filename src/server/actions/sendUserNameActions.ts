"use server";

import { prisma } from "@/server/db";
import { UploadResult } from "@/types";
import { nameSchema } from "../../validator/schema";
import { auth } from "../auth";

const sendUserName = async (email_hash: string, newName: string) => {};

export async function actions(newName: string): Promise<UploadResult> {
  const session = await auth();

  const validatedFields = nameSchema.safeParse({
    newName,
  });

  if (!validatedFields.success) {
    return {
      id: "",
      title: "名前の更新中にエラーが発生しました",
      message: validatedFields.error.errors[0].message,
      status: 400,
    };
  }

  const email_hash = session?.user?.email;

  try {
    const newName = validatedFields.data!.newName;
    if (email_hash) {
      await prisma.user.update({
        where: { email_hash },
        data: { name: newName },
      });
    }
    return { id: newName, title: "名前が更新されました", message: "", status: 200 };
  } catch (error) {
    return { id: "", title: "名前の更新中にエラーが発生しました", message: "", status: 500 };
  }
}
