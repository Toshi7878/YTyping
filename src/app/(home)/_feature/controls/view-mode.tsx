import { useMutation } from "@tanstack/react-query";
import { TfiLayoutGrid2Alt, TfiLayoutGrid3Alt } from "react-icons/tfi";
import { cn } from "@/lib/tailwind";
import type { MAP_LIST_LAYOUT_TYPES } from "@/server/drizzle/schema";
import { setUserOptions, useMapListLayoutOption } from "@/store/user-options";
import { useTRPC } from "@/trpc/provider";
import { RadioButton, RadioGroup } from "@/ui/radio-group/radio-group";

export const MapListLayoutModeSelector = ({ className }: { className?: string }) => {
  const trpc = useTRPC();
  const layoutType = useMapListLayoutOption();

  const updateListLayout = useMutation(
    trpc.user.option.upsert.mutationOptions({
      onSuccess: (data) => setUserOptions(data),
    }),
  );
  return (
    <RadioGroup
      className={cn("items-center gap-1", className)}
      value={layoutType}
      onValueChange={(value: (typeof MAP_LIST_LAYOUT_TYPES)[number]) => {
        setUserOptions((prev) => ({ ...prev, mapListLayout: value }));
        updateListLayout.mutate({ mapListLayout: value });
      }}
    >
      <RadioButton
        value="THREE_COLUMNS"
        className="size-8"
        variant={layoutType === "THREE_COLUMNS" ? "accent" : "ghost"}
      >
        <TfiLayoutGrid3Alt />
      </RadioButton>
      <RadioButton value="TWO_COLUMNS" className="size-8" variant={layoutType === "TWO_COLUMNS" ? "accent" : "ghost"}>
        <TfiLayoutGrid2Alt />
      </RadioButton>
    </RadioGroup>
  );
};
