"use client";
import {
  useLineResultDrawerState,
  useSceneGroupState,
  useSetLineResultDrawer,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ResultLineList from "./child/ResultLineList";

function ResultDrawer() {
  const isOpen = useLineResultDrawerState();
  const setLineResultDrawer = useSetLineResultDrawer();
  const sceneGroup = useSceneGroupState();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && setLineResultDrawer(false)}>
      <SheetContent side="right" className="bg-accent/90 w-xs" overlayClassName="bg-transparent">
        <SheetHeader className="py-2">
          <SheetTitle>{sceneGroup === "End" ? "詳細リザルト" : "練習リザルト"}</SheetTitle>
        </SheetHeader>
        <div className="relative h-full overflow-y-auto px-4">
          <ResultLineList />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ResultDrawer;
