import { STATUS_LABEL } from "@/app/type/ts/const/consts";
import { statusAtoms } from "@/app/type/type-atoms/gameRenderAtoms";
import { ThemeColors } from "@/types";
import { Tbody, Td, Tr, useTheme } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { useCallback } from "react";
import StatusPointValue from "./child/StatusPointValue";
import StatusValue from "./child/StatusValue";

const StatusTbody = () => {
  const theme: ThemeColors = useTheme();

  const capitalizeFirstLetter = useCallback((string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }, []);

  const Label = styled.span<{ label: string }>`
    position: relative;
    right: 8px;
    font-size: 80%;
    ${({ label }) => label === "kpm" && `letter-spacing: 0.2em;`}
  `;

  const UnderlinedSpan = styled.span<{ label: string }>`
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      width: ${({ label }) => (label === "score" || label === "point" ? "159px" : "80px")};
      background-color: ${theme.colors.text.body};
    }
  `;

  const TdStyled = styled(Td)<{ id: string }>`
    width: ${({ id }) => (id === "score" || id === "point" ? "20%" : "14%")};
  `;

  return (
    <Tbody fontSize={"2rem"} fontWeight="bold" fontFamily="mono">
      {/* 1段目 */}

      <Tr>
        {STATUS_LABEL.slice(0, STATUS_LABEL.length / 2).map((label) => {
          return (
            <TdStyled key={label} id={label}>
              <Label label={label} className="label">
                {capitalizeFirstLetter(label)}
              </Label>

              <UnderlinedSpan label={label} className="status-underline">
                <StatusValue atom={statusAtoms[label]} />
              </UnderlinedSpan>
            </TdStyled>
          );
        })}
      </Tr>

      {/* 2段目 */}

      <Tr>
        {STATUS_LABEL.slice(STATUS_LABEL.length / 2).map((label) => {
          return (
            <TdStyled key={label} id={label}>
              <Label label={label}>{capitalizeFirstLetter(label)}</Label>

              <UnderlinedSpan label={label} className="status-underline">
                {label === "point" ? (
                  <StatusPointValue
                    atom={statusAtoms[label]}
                    timeBonusAtom={statusAtoms["timeBonus"]}
                  />
                ) : (
                  <StatusValue atom={statusAtoms[label]} />
                )}
              </UnderlinedSpan>
            </TdStyled>
          );
        })}
      </Tr>
    </Tbody>
  );
};

export default StatusTbody;
