import { useSetIsSearching } from "./atoms";

export const useExecuteSearch = () => {
  const setIsSearching = useSetIsSearching();

  return (searchParams: string) => {
    setIsSearching(true);
    window.history.replaceState(null, "", searchParams);
  };
};
