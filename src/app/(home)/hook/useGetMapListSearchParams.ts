import { useSearchParams } from "next/navigation";
import { PARAM_NAME } from "../ts/const/consts";
import { MapListParams } from "../ts/type";

export function useGetMapListParams(): MapListParams {
  const searchParams = useSearchParams();

  const params: MapListParams = {};

  for (const [key, value] of Array.from(searchParams.entries())) {
    if (key in PARAM_NAME) {
      params[key as keyof MapListParams] = value;
    }
  }

  return params;
}
