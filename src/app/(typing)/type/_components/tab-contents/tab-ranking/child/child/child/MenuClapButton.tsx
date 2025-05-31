import { INITIAL_STATE } from "@/config/consts/globalConst";
import { toggleClapServerAction } from "@/server/actions/toggleClapActions";
import { useActionState } from "react";
import { FaHandsClapping } from "react-icons/fa6";

interface MenuClapButtonProps {
  resultId: number;
  hasClap: boolean;
  clapCount: number;
  disabled?: boolean;
}

const MenuClapButton = ({ resultId, hasClap, clapCount, disabled }: MenuClapButtonProps) => {
  const clapAction = async () => {
    const result = await toggleClapServerAction(resultId, !hasClap);
    return result;
  };

  const [state, formAction] = useActionState(clapAction, INITIAL_STATE);

  return (
    <form action={formAction}>
      <button type="submit" disabled={disabled}>
        <FaHandsClapping color={hasClap ? "#ffb825" : "#999"} />
        <span>{clapCount}</span>
      </button>
    </form>
  );
};

export default MenuClapButton;
