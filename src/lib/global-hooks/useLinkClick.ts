import { useCanUploadAtom } from "@/app/edit/edit-atom/editAtom";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

export const useLinkClick = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canUpload = useCanUploadAtom();
  const { data: session } = useSession();

  const userId = session?.user.id || 0;

  // user/1 と user/mypage を同じページと判断するための正規化関数
  const normalizePath = (path: string): string => {
    if (path === `/user/${userId}`) {
      return "/user/mypage";
    }
    return path;
  };

  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.ctrlKey || event.altKey) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const currentNormalized = normalizePath(pathname);
    const targetNormalized = normalizePath(event.currentTarget.pathname);
    console.log(searchParams);
    if (currentNormalized === targetNormalized) {
      router.push(event.currentTarget.href);
      return;
    }

    if (pathname.includes("/edit") && canUpload) {
      const confirmUpload = window.confirm(
        "このページを離れると、行った変更が保存されない可能性があります。"
      );
      if (!confirmUpload) {
        return;
      }
    }

    NProgress.configure({ showSpinner: false });
    NProgress.configure({ trickle: false });
    NProgress.start();
    router.push(event.currentTarget.href);
  };
};
