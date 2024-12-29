"use client";

import { ThemeColors } from "@/types";
import { useTheme } from "@chakra-ui/react";
import dynamic from "next/dynamic";

const ColorStyle = () => {
  const theme: ThemeColors = useTheme();

  return (
    <style id="color_style">{`
        #time-range {
  -webkit-appearance: none;
  appearance: none;
   width: 100%;
  cursor: pointer;
  outline: none;
  border-radius: 15px;
   height: 6px;
  background: ${theme.colors.text.body}30;
}

/* Thumb: webkit */
#time-range::-webkit-slider-thumb {
  /* removing default appearance */
  -webkit-appearance: none;
  appearance: none;
  /* creating a custom design */
  height: 15px;
  width: 15px;
  background-color: ${theme.colors.primary.main};
  border-radius: 50%;
  border: none;

  transition: .2s ease-in-out;
}

/* Thumb: Firefox */
#time-range::-moz-range-thumb {
  height: 15px;
  width: 15px;
  background-color: ${theme.colors.primary.main};
  border-radius: 50%;
  border: none;
  transition: .2s ease-in-out;
}

/* Hover, active & focus Thumb: Webkit */

#time-range::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 10px ${theme.colors.primary.main}40
}
#time-range:active::-webkit-slider-thumb {
  box-shadow: 0 0 0 13px ${theme.colors.primary.main}60
}
#time-range:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 13px ${theme.colors.primary.main}60
}

/* Hover, active & focus Thumb: Firfox */

#time-range::-moz-range-thumb:hover {
  box-shadow: 0 0 0 10px ${theme.colors.primary.main}40
}
#time-range:active::-moz-range-thumb {
  box-shadow: 0 0 0 13px ${theme.colors.primary.main}60
}
#time-range:focus::-moz-range-thumb {
  box-shadow: 0 0 0 13px ${theme.colors.primary.main}60
}

      `}</style>
  );
};

export default dynamic(() => Promise.resolve(ColorStyle), { ssr: false });
