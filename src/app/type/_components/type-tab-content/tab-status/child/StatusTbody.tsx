import { STATUS_LABEL } from "@/app/type/ts/const/consts";
import { statusAtoms } from "@/app/type/type-atoms/gameRenderAtoms";
import { Tbody, Td, Tr } from "@chakra-ui/react";
import StatusLabel from "./child/StatusLabel";
import StatusPointValue from "./child/StatusPointValue";
import StatusUnderline from "./child/StatusUnderline";
import StatusValue from "./child/StatusValue";

const StatusTbody = () => {
  return (
    <Tbody fontSize={"2rem"} fontWeight="bold" fontFamily="mono">
      <Tr>
        {/* 1段目 */}
        {STATUS_LABEL.slice(0, STATUS_LABEL.length / 2).map((label) => {
          return <StatusTd key={label} label={label} />;
        })}
      </Tr>
      <Tr>
        {/* 2段目 */}
        {STATUS_LABEL.slice(STATUS_LABEL.length / 2).map((label) => {
          return <StatusTd key={label} label={label} />;
        })}
      </Tr>
    </Tbody>
  );
};

interface StatusTdProps {
  label: string;
}
const StatusTd = ({ label }: StatusTdProps) => {
  return (
    <Td id={label} width={label === "score" || label === "point" ? "20%" : "14%"}>
      <StatusLabel label={label} />

      <StatusUnderline label={label}>
        {label === "point" ? (
          <StatusPointValue atom={statusAtoms[label]} timeBonusAtom={statusAtoms["timeBonus"]} />
        ) : (
          <StatusValue atom={statusAtoms[label]} />
        )}
      </StatusUnderline>
    </Td>
  );
};

export default StatusTbody;
