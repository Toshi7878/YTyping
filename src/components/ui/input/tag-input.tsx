"use client";

import type { VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import type React from "react";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { badgeVariants } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from "../form";
import { FloatingLabelInput } from "./floating-label-input";

interface TagInputProps {
  tags: string[];
  onTagAdd: (tag: string) => void;
  onTagRemove: (index: number) => void;
  maxTags?: number;
  disabled?: boolean;
  label?: string;
  enableDragDrop?: boolean;
  className?: string;
  tagVariant?: VariantProps<typeof badgeVariants>["variant"];
  maxLength?: number;
}

const TagInput = ({
  tags,
  onTagAdd,
  onTagRemove,
  maxTags,
  disabled = false,
  label = "タグ",
  enableDragDrop = true,
  className,
  tagVariant = "secondary",
  maxLength,
  ref,
  ...props
}: TagInputProps & { ref?: React.Ref<React.ComponentRef<"input">> }) => {
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
        className="flex min-h-[40px] flex-wrap gap-2 rounded-md border border-border/50 p-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        {tags.map((tag, index) => (
          <Badge key={tag} variant={tagVariant} className="flex items-center gap-1 rounded-xs">
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
        <FloatingLabelInput
          ref={ref}
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          label={label}
          className="min-w-[120px] flex-1 rounded-xs border px-2 py-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={disabled}
          {...props}
          maxLength={maxLength}
        />
      </div>
    </div>
  );
};

interface TagInputFormFieldProps {
  name: string;
  label?: string;
  description?: React.ReactNode;
  className?: string;
  maxTags?: number;
  enableDragDrop?: boolean;
  tagVariant?: VariantProps<typeof badgeVariants>["variant"];
  disabledFormMessage?: boolean;
  maxLength?: number;
}

const TagInputFormField = ({
  name,
  label,
  description,
  className,
  maxTags,
  enableDragDrop = true,
  tagVariant = "secondary",
  disabledFormMessage = false,
  maxLength,
}: TagInputFormFieldProps) => {
  const { control, setValue, trigger } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <TagInput
              tags={field.value || []}
              onTagAdd={(tag) => {
                const newTags = [...field.value, tag];
                setValue(name, newTags, { shouldDirty: true, shouldTouch: true });
                void trigger(name);
              }}
              onTagRemove={(index) => {
                const newTags = field.value.filter((_: string, i: number) => i !== index);
                setValue(name, newTags, { shouldDirty: true, shouldTouch: true });
                void trigger(name);
              }}
              label={label}
              maxTags={maxTags}
              enableDragDrop={enableDragDrop}
              tagVariant={tagVariant}
              className={className}
              maxLength={maxLength}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {!disabledFormMessage && <FormMessage />}
        </FormItem>
      )}
    />
  );
};

export { TagInput, TagInputFormField };
