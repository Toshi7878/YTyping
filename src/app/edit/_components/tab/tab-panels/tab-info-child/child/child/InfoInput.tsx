import { useSetCanUpload } from "@/app/edit/atoms/stateAtoms";
import { FormLabel, Input } from "@chakra-ui/react";
import { Dispatch } from "react";

interface InfoInputProps {
  isGeminiLoading?: boolean;
  label: string;
  placeholder: string;
  inputState: string;
  setInputState: Dispatch<string>;
  isRequired?: boolean;
}
const InfoInput = (props: InfoInputProps) => {
  const setCanUpload = useSetCanUpload();
  return (
    <>
      <FormLabel mb="0" width="150px" fontWeight="bold" fontSize="sm">
        {props.label}
      </FormLabel>

      <Input
        isInvalid={!props.isGeminiLoading && props.isRequired && props.inputState === ""}
        placeholder={props.isGeminiLoading ? `${props.label}を生成中` : props.placeholder}
        isDisabled={props.isGeminiLoading}
        size="sm"
        fontWeight={props.isRequired ? "bold" : "normal"}
        value={props.inputState}
        onChange={(e) => {
          setCanUpload(true);
          props.setInputState(e.target.value);
        }}
      />
    </>
  );
};

export default InfoInput;
