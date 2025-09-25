import { useTRPC } from "@/trpc/provider";

export const useUserOptionsQueries = () => {
  const trpc = useTRPC();

  return {
    myUserOptions: () =>
      trpc.userOption.getUserOptions.queryOptions(undefined, {
        gcTime: Infinity,
        staleTime: Infinity,
      }),
  };
};
