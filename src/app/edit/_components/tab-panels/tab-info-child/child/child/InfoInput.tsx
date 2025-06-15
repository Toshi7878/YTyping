import { useSetCanUpload } from "@/app/edit/_lib/atoms/stateAtoms";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
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
      <Label className="w-[150px] text-sm font-bold">{props.label}</Label>

      <Input
        className={`h-8 ${!props.isGeminiLoading && props.isRequired && props.inputState === "" ? "border-destructive" : ""} ${props.isRequired ? "font-bold" : ""}`}
        placeholder={props.isGeminiLoading ? `${props.label}を生成中` : props.placeholder}
        disabled={props.isGeminiLoading}
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
