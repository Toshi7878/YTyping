import { useSearchParams } from "next/navigation";
import { PARAM_NAME } from "../ts/consts";

export function useGetMapListParams(): Partial<typeof PARAM_NAME> {
  const searchParams = useSearchParams();

  const params: Partial<typeof PARAM_NAME> = {};

  for (const [key, value] of Array.from(searchParams.entries())) {
    if (key in PARAM_NAME) {
      params[key] = value;
    }
  }

  return params;
}
