"use client";
import { useSceneGroupState, useSceneState } from "@/app/(typing)/type/atoms/stateAtoms";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMemo } from "react";
import ResultLineList from "./child/ResultLineList";

interface ResultDrawerProps {
  drawerClosure: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
  };
}

function ResultDrawer({ drawerClosure }: ResultDrawerProps) {
  const { isOpen, onClose } = drawerClosure;
  const scene = useSceneState();
  const sceneGroup = useSceneGroupState();

  const memoizedResultLineList = useMemo(() => {
    if (sceneGroup === "End" || scene === "practice" || scene === "replay") {
      return <ResultLineList />;
    }
  }, [scene, sceneGroup]);

  const sheetOpen = sceneGroup === "End" ? isOpen : scene === "practice" || scene === "replay" ? true : false;

  return (
    <Sheet open={sheetOpen} onOpenChange={(open) => !open && onClose()}>
      {sheetOpen && (
        <div 
          className="fixed inset-0 bg-transparent z-50" 
          onClick={onClose}
          style={{ display: isOpen ? "block" : "none" }}
        />
      )}
      <SheetContent
        side="right"
        className="h-screen overflow-y-auto pb-14 bg-[#1f2427dd]"
        style={{
          display: isOpen ? "block" : "none",
          width: scene === "practice" ? "20rem" : "24rem",
        }}
      >
        <SheetHeader className="py-2">
          <SheetTitle className="text-white text-base">
            {sceneGroup === "End" ? "詳細リザルト" : "練習リザルト"}
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto relative h-full">
          {memoizedResultLineList}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ResultDrawer;
