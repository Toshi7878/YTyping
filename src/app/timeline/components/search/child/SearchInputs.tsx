import {
  useSearchResultKeyWordsAtom,
  useSetSearchResultKeyWordsAtom,
} from "@/app/timeline/atoms/atoms";
import { useSearchReload } from "@/app/timeline/hooks/useSearchReload";
import { Button, HStack, Input } from "@chakra-ui/react";
import React from "react";

interface SearchInputsProps {
  refetch: () => void;
}

const SearchInputs = ({ refetch }: SearchInputsProps) => {
  const searchKeywords = useSearchResultKeyWordsAtom();
  const setSearchKeywords = useSetSearchResultKeyWordsAtom();
  const searchReload = useSearchReload(refetch);
  return (
    <HStack>
      <Input
        size="md"
        value={searchKeywords.mapKeyWord}
        placeholder="譜面キーワードで絞り込み"
        onChange={(e) =>
          setSearchKeywords({ mapKeyWord: e.target.value, userName: searchKeywords.userName })
        }
      />
      <Input
        size="md"
        placeholder="ユーザーネームで絞り込み"
        value={searchKeywords.userName}
        onChange={(e) =>
          setSearchKeywords({ mapKeyWord: searchKeywords.mapKeyWord, userName: e.target.value })
        }
      />
      <Button width="30%" onClick={searchReload}>
        検索
      </Button>
    </HStack>
  );
};

export default SearchInputs;