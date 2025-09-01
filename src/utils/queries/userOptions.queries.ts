import { useTRPC } from "@/trpc/provider";

export const useUserOptionsQueries = () => {
  const trpc = useTRPC();

  return {
    myUserOptions: () =>
      trpc.userOption.getUserOptions.queryOptions(
        {},
        {
          gcTime: Infinity,
          staleTime: Infinity,
        },
      ),
  };
};
