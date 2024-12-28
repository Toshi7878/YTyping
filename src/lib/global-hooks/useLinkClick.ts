import { useCanUploadAtom } from "@/app/edit/edit-atom/editAtom";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import NProgress from "nprogress";

export const useLinkClick = () => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const canUpload = useCanUploadAtom();

  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.ctrlKey || event.altKey) {
      return;
    }
    event.preventDefault();
    event.stopPropagation(); // バブリングを防ぐ

    if (pathname.includes("/edit") && canUpload) {
      const confirmUpload = window.confirm(
        "このページを離れると、行った変更が保存されない可能性があります。",
      );
      if (!confirmUpload) {
        return;
      }
    } else if (pathname === event.currentTarget.pathname) {
      router.push(pathname);
      return;
    }

    NProgress.configure({ showSpinner: false });
    NProgress.configure({ trickle: false });

    NProgress.start();
    router.push(event.currentTarget.href);
  };
};
