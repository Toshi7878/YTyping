"use client";

import TextLink from "@/components/ui/text-link";
import { useTRPC } from "@/trpc/provider";
import { useSuspenseQuery } from "@tanstack/react-query";

const ByUser = ({ userId }: { userId: string }) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.user.getUserName.queryOptions({ userId: Number(userId) }));
  return (
    <TextLink href={{ pathname: "/user/[id]", query: { id: userId } }}>
      <span>{data?.name}</span>
    </TextLink>
  );
};

export default ByUser;
