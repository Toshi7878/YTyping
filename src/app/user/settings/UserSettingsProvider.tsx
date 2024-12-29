"use client";
import { Provider as JotaiProvider } from "jotai";
import React from "react";
import { getUserSettingsAtomStore } from "./atom/atom";

interface UserSettingsProviderProps {
  children: React.ReactNode;
}

const UserSettingsProvider = ({ children }: UserSettingsProviderProps) => {
  const userSettingsAtomStore = getUserSettingsAtomStore();
  return <JotaiProvider store={userSettingsAtomStore}>{children}</JotaiProvider>;
};

export default UserSettingsProvider;
