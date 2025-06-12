import { focusTypingStatusAtoms } from "@/app/(typing)/type/atoms/stateAtoms";
import { STATUS_LABEL } from "@/app/(typing)/type/ts/const/consts";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import StatusLabel from "./child/StatusLabel";
import StatusPointValue from "./child/StatusPointValue";
import StatusUnderline from "./child/StatusUnderline";
import StatusValue from "./child/StatusValue";

const StatusTbody = () => {
  return (
    <TableBody className="text-[2rem] font-bold font-mono">
      <TableRow>
        {/* 1段目 */}
        {STATUS_LABEL.slice(0, STATUS_LABEL.length / 2).map((label) => {
          return <StatusTd key={label} label={label} />;
        })}
      </TableRow>
      <TableRow>
        {/* 2段目 */}
        {STATUS_LABEL.slice(STATUS_LABEL.length / 2).map((label) => {
          return <StatusTd key={label} label={label} />;
        })}
      </TableRow>
    </TableBody>
  );
};

interface StatusTdProps {
  label: string;
}
const StatusTd = ({ label }: StatusTdProps) => {
  return (
    <TableCell id={label} style={{ width: label === "score" || label === "point" ? "20%" : "14%" }}>
      <StatusLabel label={label} />

      <StatusUnderline label={label}>
        {label === "point" ? (
          <StatusPointValue atom={focusTypingStatusAtoms[label]} timeBonusAtom={focusTypingStatusAtoms["timeBonus"]} />
        ) : (
          <StatusValue atom={focusTypingStatusAtoms[label]} />
        )}
      </StatusUnderline>
    </TableCell>
  );
};

export default StatusTbody;
