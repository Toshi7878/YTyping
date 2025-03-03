import { typeTicker } from "@/app/type/ts/const/consts";

export const useStartTimer = () => {
  return () => {
    if (!typeTicker.started) {
      typeTicker.start();
    }
  };
};
