"use client";

import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { usePathname } from "next/navigation";

const LinkProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <ProgressProvider
      targetPreprocessor={(url) => {
        if (url.pathname === pathname) {
          return url;
        }
        return new URL(url.pathname, window.location.origin);
      }}
      disableSameURL
      height="2px"
      color="var(--color-primary-light)"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};

export default LinkProgressProvider;
