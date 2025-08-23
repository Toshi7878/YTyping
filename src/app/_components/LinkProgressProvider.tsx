"use client";

import { AppProgressProvider as ProgressProvider } from "@bprogress/next";

const LinkProgressProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider height="2px" color="var(--color-primary-light)" options={{ showSpinner: false }} shallowRouting>
      {children}
    </ProgressProvider>
  );
};

export default LinkProgressProvider;
