"use client";

import { useTRPC } from "@/trpc/provider";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";

const ByUser = ({ userId }: { userId: string }) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.user.getUserName.queryOptions({ userId: Number(userId) }));
  return (
    <Link href={`/user/${userId}`} className="text-primary-light hover:underline">
      <span>{data?.name}</span>
    </Link>
  );
};

export default ByUser;
