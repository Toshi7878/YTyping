import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { X } from "lucide-react";
import React, { KeyboardEvent, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TagInputTag {
  id: string;
  text: string;
  className?: string;
  [key: string]: string | undefined;
}

export interface TagInputProps {
  tags: TagInputTag[];
  onTagAdd: (tag: TagInputTag) => void;
  onTagRemove: (index: number) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: TagInputTag[];
  disabled?: boolean;
  enableDragDrop?: boolean;
  className?: string;
  tagVariant?: "default" | "secondary" | "destructive" | "outline";
  removeButtonAriaLabel?: string;
  suggestionsLabel?: string;
}

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      tags,
      onTagAdd,
      onTagRemove,
      placeholder = "タグを追加",
      maxTags,
      suggestions = [],
      disabled = false,
      enableDragDrop = true,
      className,
      tagVariant = "secondary",
      removeButtonAriaLabel = "タグを削除",
      suggestionsLabel = "提案:",
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState("");

    const handleAddition = (tagText: string) => {
      const trimmedText = tagText.trim();
      if (!trimmedText) return;

      const tag: TagInputTag = {
        id: trimmedText,
        text: trimmedText,
        className: "",
      };

      const isTagAdded = tags.some((existingTag) => existingTag.id === tag.id);

      if (!isTagAdded && (!maxTags || tags.length < maxTags)) {
        onTagAdd(tag);
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

    const filteredSuggestions = suggestions.filter(s => 
      inputValue && s.text.includes(inputValue)
    );

    return (
      <div className={cn("w-full", className)}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-wrap gap-2 p-2 border border-input rounded-md min-h-[40px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        >
          {tags.map((tag, index) => (
            <Badge key={tag.id} variant={tagVariant} className="flex items-center gap-1">
              {tag.text}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onTagRemove(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">{removeButtonAriaLabel}</span>
              </Button>
            </Badge>
          ))}
          <Input
            ref={ref}
            type="text"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[120px]"
            disabled={disabled || (maxTags ? tags.length >= maxTags : false)}
            {...props}
          />
        </div>
        {filteredSuggestions.length > 0 && (
          <div className="mt-1 text-xs text-muted-foreground">
            {suggestionsLabel} {filteredSuggestions.map(s => s.text).join(", ")}
          </div>
        )}
      </div>
    );
  }
);

TagInput.displayName = "TagInput";

export { TagInput };