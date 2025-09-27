"use client";
import {
  useLineResultDrawerState,
  useSceneGroupState,
  useSetLineResultDrawer,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ResultLineList from "./child/result-line-list";

function ResultDrawer() {
  const isOpen = useLineResultDrawerState();
  const sceneGroup = useSceneGroupState();
  const setLineResultDrawer = useSetLineResultDrawer();

  return (
    <Sheet modal={false} open={isOpen} onOpenChange={setLineResultDrawer}>
      <SheetContent forceMount side="right" className="bg-accent/90 w-xs" overlayClassName="bg-transparent">
        <SheetHeader className="py-2">
          <SheetTitle>{sceneGroup === "End" ? "詳細リザルト" : "練習リザルト"}</SheetTitle>
        </SheetHeader>

        <ResultLineList />
      </SheetContent>
    </Sheet>
  );
}

export default ResultDrawer;
