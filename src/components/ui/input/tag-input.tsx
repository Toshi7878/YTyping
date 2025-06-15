import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import React, { KeyboardEvent, forwardRef, useState } from "react";

export interface TagInputProps {
  tags: string[];
  onTagAdd: (tag: string) => void;
  onTagRemove: (index: number) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  enableDragDrop?: boolean;
  className?: string;
  tagVariant?: VariantProps<typeof badgeVariants>["variant"];
}

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      tags,
      onTagAdd,
      onTagRemove,
      placeholder = "タグを追加",
      maxTags,
      disabled = false,
      enableDragDrop = true,
      className,
      tagVariant = "secondary",
      ...props
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState("");

    const handleAddition = (tagText: string) => {
      const trimmedText = tagText.trim();
      if (!trimmedText) return;

      const isTagAdded = tags.includes(trimmedText);

      if (!isTagAdded && (!maxTags || tags.length < maxTags)) {
        onTagAdd(trimmedText);
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (inputValue.trim()) {
          handleAddition(inputValue);
          setInputValue("");
        }
      } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
        e.preventDefault();
        onTagRemove(tags.length - 1);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      if (!enableDragDrop) return;

      e.preventDefault();
      if (!maxTags || tags.length < maxTags) {
        const text = e.dataTransfer.getData("text").replace(/\s/g, "");
        if (text) {
          handleAddition(text);
        }
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      if (!enableDragDrop) return;
      e.preventDefault();
    };

    return (
      <div className={cn("w-full", className)}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-border/50 focus-within:ring-ring flex min-h-[40px] flex-wrap gap-2 rounded-md border p-2 focus-within:ring-2 focus-within:ring-offset-2"
        >
          {tags.map((tag, index) => (
            <Badge key={`${tag}-${index}`} variant={tagVariant} className="flex items-center gap-1 rounded-xs">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-5 p-0 hover:bg-transparent"
                onClick={() => onTagRemove(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Input
            ref={ref}
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-w-[120px] flex-1 rounded-xs border bg-transparent px-2 py-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled || (maxTags ? tags.length >= maxTags : false)}
            {...props}
          />
        </div>
      </div>
    );
  },
);

TagInput.displayName = "TagInput";

export { TagInput };
