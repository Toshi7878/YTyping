"use client";
import { createStore, Provider } from "jotai";
import type React from "react";

export const store = createStore();

interface JotaiProviderProps {
  children: React.ReactNode;
}

export const JotaiProvider = ({ children }: JotaiProviderProps) => {
  return <Provider store={store}>{children}</Provider>;
};
