"use client";
import { Provider } from "jotai";
import type React from "react";
import { getHomeAtomStore } from "../_lib/atoms";

interface JotaiProviderProps {
  children: React.ReactNode;
}

export const JotaiProvider = ({ children }: JotaiProviderProps) => {
  const store = getHomeAtomStore();

  return <Provider store={store}>{children}</Provider>;
};
