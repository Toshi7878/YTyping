import { Input, FormLabel, useTheme } from "@chakra-ui/react";
import { useSetCanUploadAtom } from "@/app/edit/edit-atom/editAtom";
import { ThemeColors } from "@/types";
import { Dispatch } from "react";
import React from "react";

interface InfoInputProps {
  isGeminiLoading?: boolean;
  label: string;
  placeholder: string;
  inputState: string;
  setInputState: Dispatch<string>;
  isRequired?: boolean;
}
const InfoInput = (props: InfoInputProps) => {
  const theme: ThemeColors = useTheme();
  const setCanUpload = useSetCanUploadAtom();
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
        bg={theme.colors.background.body}
        borderColor={`${theme.colors.border.card}60`}
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
