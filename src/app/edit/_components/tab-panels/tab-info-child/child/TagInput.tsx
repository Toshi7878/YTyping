import { useMapTagsState, useSetCanUpload, useSetMapTags } from "@/app/edit/_lib/atoms/stateAtoms";
import { TAG_MAX_LEN, TAG_MIN_LEN } from "@/app/edit/_lib/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import { Tag } from "@/types";
import { X } from "lucide-react";
import { KeyboardEvent, useState } from "react";

const TagInput = () => {
  const tags = useMapTagsState();
  const setTags = useSetMapTags();
  const setCanUpload = useSetCanUpload();
  const [inputValue, setInputValue] = useState("");

  const suggestions = [
    { id: "1", text: "公式MV", className: "" },
    { id: "2", text: "英語", className: "" },
  ];

  const handleDelete = (index: number) => {
    setCanUpload(true);
    const deleteTag = tags[index];
    setTags({ type: "delete", payload: deleteTag });
  };

  const handleAddition = (tagText: string) => {
    const trimmedText = tagText.trim();
    if (!trimmedText) return;

    const tag: Tag = {
      id: trimmedText,
      text: trimmedText,
      className: "",
    };

    const isTagAdded = tags.some((existingTag) => existingTag.id === tag.id);

    if (!isTagAdded && tags.length < TAG_MAX_LEN) {
      setCanUpload(true);
      setTags({ type: "add", payload: tag });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddition(inputValue);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      e.preventDefault();
      handleDelete(tags.length - 1);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (tags.length < TAG_MAX_LEN) {
      const text = e.dataTransfer.getData("text").replace(/\s/g, "");
      if (text) {
        handleAddition(text);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex items-center">
      <Label className="w-[150px] font-bold">
        <span>
          タグ {tags.length}
          {tags.length <= 1 ? `/${TAG_MIN_LEN}` : `/${TAG_MAX_LEN}`}
        </span>
      </Label>
      <div 
        className="w-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md min-h-[40px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          {tags.map((tag, index) => (
            <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
              {tag.text}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleDelete(index)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">タグを削除</span>
              </Button>
            </Badge>
          ))}
          <Input
            type="text"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length <= 1 ? "タグを2つ以上追加してください" : "タグを追加"}
            className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[120px]"
            disabled={tags.length >= TAG_MAX_LEN}
          />
        </div>
        {suggestions.length > 0 && inputValue && (
          <div className="mt-1 text-xs text-muted-foreground">
            提案: {suggestions.filter(s => s.text.includes(inputValue)).map(s => s.text).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagInput;
