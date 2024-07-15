import { inputModeAtom } from "@/app/type/(atoms)/gameRenderAtoms";
import { InputModeType } from "@/app/type/(ts)/type";
import { Box, HStack, useRadio, useRadioGroup } from "@chakra-ui/react";
import { useAtom } from "jotai";

// 1. Create a component that consumes the `useRadio` hook
function RadioCard(props) {
  const { getInputProps, getRadioProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as="label" minW="33.33%">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        boxShadow="md"
        borderColor="black"
        className="font-bold select-none"
        _checked={{
          bg: "teal.600",
          color: "white",
          borderColor: "teal.600",
          _hover: {
            bg: "teal.600",
          },
        }}
        _focus={{
          boxShadow: "outline",
        }}
        _hover={{
          bg: "teal.300",
        }}
        px={15}
        py={12}
      >
        {props.children}
      </Box>
    </Box>
  );
}

// Step 2: Use the `useRadioGroup` hook to control a group of custom radios.
function ReadyInputModeRadioCards() {
  const options = [
    { value: "roma", label: "ローマ字入力" },
    { value: "kana", label: "かな入力" },
    { value: "flick", label: "フリック入力" },
  ];
  const [, setInputMode] = useAtom(inputModeAtom);
  const { getRootProps, getRadioProps } = useRadioGroup({
    defaultValue: "roma",
    onChange: (value) => {
      console.log(value);
      setInputMode(value as InputModeType);
    },
  });

  const group = getRootProps();

  return (
    <HStack {...group} spacing={0} width={"100%"}>
      {options.map((option) => {
        const radio = getRadioProps({ value: option.value });
        return (
          <RadioCard key={option.value} {...radio} isDisabled={option.value === "flick"}>
            {option.label}
          </RadioCard>
        );
      })}
    </HStack>
  );
}

export default ReadyInputModeRadioCards;