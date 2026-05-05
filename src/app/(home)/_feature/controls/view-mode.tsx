import { useMutation } from "@tanstack/react-query";
import { TfiLayoutGrid2Alt, TfiLayoutGrid3Alt } from "react-icons/tfi";
import { useTRPC } from "@/app/_layout/trpc/provider";
import { setUserOptions, useMapListLayoutOption } from "@/app/_layout/user-options";
import { RadioButton, RadioGroup } from "@/components/ui/radio-group/radio-group";
import { cn } from "@/lib/utils";
import type { MAP_LIST_LAYOUT_TYPES } from "@/server/drizzle/schema";

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
