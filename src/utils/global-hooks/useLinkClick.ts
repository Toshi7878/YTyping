import { useRouter } from "next/navigation";

export const useLinkClick = () => {
  const router = useRouter();

  return (event: React.MouseEvent<HTMLAnchorElement>, routeType: "push" | "replace" = "push") => {
    if (event.ctrlKey || event.altKey) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    if (routeType === "push") {
      router.push(event.currentTarget.href);
    } else if (routeType === "replace") {
      router.replace(event.currentTarget.href);
    }
  };
};
