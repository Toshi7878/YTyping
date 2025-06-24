import { Button } from "@/components/ui/button";
import { INITIAL_STATE } from "@/config/globalConst";
import { LocalClapState, UploadResult } from "@/types";
import { useActionState } from "react";

interface MenuClapButtonProps {
  resultId: number;
  clapOptimisticState: LocalClapState;
  toggleClapAction: (resultId: number) => Promise<UploadResult>;
}

const MenuClapButton = ({
  resultId,
  clapOptimisticState,
  toggleClapAction,
  ...rest
}: MenuClapButtonProps & React.ComponentProps<typeof Button>) => {
  const [state, formAction] = useActionState(async () => {
    const result = await toggleClapAction(resultId);

    return result;
  }, INITIAL_STATE);
  return (
    <form action={formAction}>
      <Button className="w-full" variant="outline" type="submit" {...rest}>
        {clapOptimisticState.hasClap ? "拍手済み" : "記録に拍手"}
      </Button>
    </form>
  );
};

export default MenuClapButton;
