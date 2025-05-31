import { INITIAL_STATE } from "@/config/consts/globalConst";
import { LocalClapState, UploadResult } from "@/types";
import { Box, Button, ButtonProps } from "@chakra-ui/react";
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
}: MenuClapButtonProps & ButtonProps) => {
  const [state, formAction] = useActionState(async () => {
    const result = await toggleClapAction(resultId);

    return result;
  }, INITIAL_STATE);
  return (
    <Box as="form" action={formAction}>
      <Button width="100%" variant="rankingMenu" type="submit" {...rest}>
        {clapOptimisticState.hasClap ? "拍手済み" : "記録に拍手"}
      </Button>
    </Box>
  );
};

export default MenuClapButton;
