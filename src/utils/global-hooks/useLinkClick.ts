import { useCanUploadState } from "@/app/edit/_lib/atoms/stateAtoms";
import useHasMapUploadPermission from "@/app/edit/_lib/hooks/useUserEditPermission";
import { usePathname, useRouter } from "next/navigation";

export const useLinkClick = () => {
  const router = useRouter();
  const pathname = usePathname();
  const canUpload = useCanUploadState();
  const hasUploadPermission = useHasMapUploadPermission();

  return (event: React.MouseEvent<HTMLAnchorElement>, routeType: "push" | "replace" = "push") => {
    if (event.ctrlKey || event.altKey) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    if (pathname.includes("/edit") && canUpload && hasUploadPermission) {
      const confirmUpload = window.confirm("このページを離れると、行った変更が保存されない可能性があります。");
      if (!confirmUpload) {
        return;
      }
    }

    if (routeType === "push") {
      router.push(event.currentTarget.href);
    } else if (routeType === "replace") {
      router.replace(event.currentTarget.href);
    }
  };
};
