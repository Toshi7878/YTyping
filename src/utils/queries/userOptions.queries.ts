import { useTRPC } from "@/trpc/trpc";

const INITIAL_DATA = {
  custom_user_active_state: "ONLINE" as const,
  hide_user_stats: false,
};

export const useUserOptionsQueries = () => {
  const trpc = useTRPC();

  return {
    myUserOptions: () =>
      trpc.userOption.getUserOptions.queryOptions(
        {},
        {
          gcTime: Infinity,
          staleTime: Infinity,
          initialData: INITIAL_DATA,
        },
      ),
  };
};
