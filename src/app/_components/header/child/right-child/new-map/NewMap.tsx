"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RiAddBoxFill } from "react-icons/ri";
import CreateNewMapModal from "./child/CreateNewMapDialog";

export default function NewMap() {
  return (
    <>
      <TooltipProvider>
        <Tooltip delayDuration={600}>
          <TooltipTrigger asChild>
            <CreateNewMapModal
              trigger={
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground p-2">
                  <RiAddBoxFill size={20} />
                </Button>
              }
            />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            譜面新規作成
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
