import type { WritableAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import type { ReactNode } from "react";

interface AtomsHydratorProps {
  // biome-ignore lint/suspicious/noExplicitAny: any is used to satisfy the type
  atomValues: Iterable<readonly [WritableAtom<unknown, [any], unknown>, unknown]>;
  children: ReactNode;
  dangerouslyForceHydrate?: boolean;
}

export const AtomsHydrator = ({ atomValues, children, dangerouslyForceHydrate = false }: AtomsHydratorProps) => {
  useHydrateAtoms(new Map(atomValues), { dangerouslyForceHydrate });
  return children;
};
