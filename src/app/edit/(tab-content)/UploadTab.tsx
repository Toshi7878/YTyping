import { useState } from "react";

import { Box, Flex, Button, Stack, Badge } from "@chakra-ui/react";

import { WithContext as ReactTags, SEPARATORS } from "react-tag-input";

import "../(style)/reactTags.scss";
import { RootState } from "../(redux)/store";
import { useSelector } from "react-redux";

// Tag 型を自分で定義
export interface Tag {
  id: string;
  className: string;
  [key: string]: string;
}
const UploadTab = () => {
  const [genre, setGenre] = useState("");
  const ytTitle = useSelector((state: RootState) => state.ytTitle.title);

  const [tags, setTags] = useState<Array<Tag>>([]);
  const suggestions = [
    { id: "1", text: "公式MV", className: "" },
    { id: "2", text: "英語", className: "" },
    // 他の提案タグを追加
  ];

  const toggleBadge = (label: string) => {
    setGenre(label);
  };

  const handleDelete = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleAddition = (tag: Tag) => {
    tag.id = tag.id.replace(/^\s+/g, "");
    tag.text = tag.text.replace(/\s+$/, "");

    const isTagAdded = tags.some((tags) => tags.id === tag.id);

    if (!isTagAdded) {
      setTags((prevTags) => {
        return [...prevTags, tag];
      });
    }
  };

  const TAG_MAX_LEN = 10;
  const TAG_MIN_LEN = 2;
  return (
    <Box display="flex" flexDirection="column" gap="5">
      <Box fontWeight="bold">
        {tags.length}
        {tags.length <= 1 ? `/${TAG_MIN_LEN}` : `/${TAG_MAX_LEN}`} タグ, <span>{genre ? 1 : 0}/1 ジャンル</span>
      </Box>

      <Flex>
        <Stack direction="row" spacing={4} wrap="wrap">
          {[
            { label: "J-POP", color: "blue" },
            { label: "ボーカロイド", color: "cyan" },
            { label: "ゲーム", color: "purple" },
            { label: "アニメ", color: "orange" },
            { label: "Vtuber", color: "green" },
            { label: "東方ボーカル", color: "red" },
            { label: "洋楽", color: "pink" },
            { label: "その他", color: "gray" },
          ].map(({ label, color }, index) => {
            const isSelected = genre.includes(label);

            return (
              <Badge
                key={index}
                variant="solid"
                colorScheme={color}
                bg={`${color}.400`}
                px="1"
                border={isSelected ? "2px" : "1px"}
                borderColor="black"
                opacity={isSelected ? "1" : "0.5"}
                transform={isSelected ? "scale(1.1)" : "scale(1)"}
                className={`${isSelected ? "" : "cursor-pointer"} text-xl rounded-lg`}
                _hover={{ opacity: "1" }}
                onClick={() => toggleBadge(label)}
                textTransform="none" // 追加: UpperCaseを解除
              >
                {label}
              </Badge>
            );
          })}
        </Stack>
      </Flex>

      <div
        {...(tags.length !== 0
          ? {
              onDrop: (event) => {
                if (tags.length < TAG_MAX_LEN) {
                  const text = event.dataTransfer.getData("text").replace(/\s/g, "");
                  handleAddition({ id: text, text: text, className: "" });
                }
              },
            }
          : {})}
      >
        <ReactTags
          tags={tags}
          suggestions={suggestions}
          separators={[SEPARATORS.ENTER, SEPARATORS.COMMA]}
          placeholder={`${tags.length <= 1 ? "タグを2つ以上追加してください" : `タグを追加`}`}
          handleDelete={handleDelete}
          handleAddition={handleAddition}
          allowUnique
          allowDragDrop={false}
          inputFieldPosition="inline"
          maxTags={TAG_MAX_LEN}
          handleInputChange={(value, event) => {
            //@ts-ignore
            if (event.nativeEvent.inputType === "insertFromDrop") {
              if (tags.length < TAG_MAX_LEN) {
                handleAddition({ id: value, text: value, className: "" });
                event.target.value = "";
              }
            }
          }}
          inline={false}
        />
      </div>

      <Flex direction="column" wrap="wrap">
        <Stack direction="row" spacing={3} wrap="wrap">
          {[
            "公式MV",
            "英語",
            "多言語",
            "ラップ",
            "同人音楽",
            "セリフ読み",
            "Nightcore",
            "キッズ＆ファミリー",
            "映画",
            "MAD",
            "Remix",
            "音ゲー",
            "電波ソング",
            "簡単",
            "難しい",
            "装飾譜面",
            "ギミック譜面",
          ].map((label, index) => {
            const isSelected = tags.some((tag) => tag.id === label);

            if (isSelected) {
              return "";
            } else {
              return (
                <Badge
                  key={index}
                  variant="solid"
                  colorScheme="teal"
                  bg={`teal.400`}
                  opacity="0.7"
                  className={`cursor-pointer text-sm rounded-lg`}
                  _hover={{ opacity: "1" }}
                  textTransform="none" // 追加: UpperCaseを解除
                  onClick={() => {
                    if (tags.length < TAG_MAX_LEN) {
                      handleAddition({ id: label, text: label, className: "" });
                    }
                  }}
                >
                  {label}
                </Badge>
              );
            }
          })}
        </Stack>
        <small>
          <span className="font-bold">{ytTitle}</span> ← ドラッグ用 (曲名・アーティスト・アニメ名などをタグに追加すると、見つけやすくなります)
        </small>
      </Flex>

      <Button
        disabled={genre === "" || tags.length >= 2}
        variant="solid"
        size="lg"
        colorScheme="blue"
        width="200px"
        border="1px"
        borderColor="black"
        _hover={{ bg: "#3a90f3" }}
        opacity={genre === "" || tags.length <= 1 ? "0.6" : "1"}
        onClick={() => {}}
      >
        保存
      </Button>
    </Box>
  );
};

export default UploadTab;
