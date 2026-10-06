"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import { useTRPC } from "@/trpc/provider";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { useFieldContext } from "@/ui/form-field-item";
import { Input } from "@/ui/input/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/ui/popover";
import { useDebounce } from "@/utils/hooks/use-debounce";

export interface TargetUser {
  id: number;
  name: string;
}

interface UserMultiSelectFormFieldProps {
  label?: string;
  description?: string;
}

// 重要なお知らせの送信対象ユーザー選択。名前は変更されうるため検索候補の表示にのみ使い、
// 選択結果はid（TargetUser.id）で保持・送信する
export const UserMultiSelectFormField = ({ label, description }: UserMultiSelectFormFieldProps) => {
  const field = useFieldContext<TargetUser[]>();
  const errors = field.state.meta.isTouched ? field.state.meta.errors : [];
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { debounce } = useDebounce(200);
  const trpc = useTRPC();

  const selectedUsers = field.state.value;
  const selectedIds = new Set(selectedUsers.map((u) => u.id));

  const { data: candidates } = useQuery(
    trpc.importantNotice.searchUsers.queryOptions(
      { query: debouncedQuery },
      { enabled: debouncedQuery.trim() !== "", staleTime: 10_000 },
    ),
  );

  const suggestions = (candidates ?? []).filter((u) => u.name !== null && !selectedIds.has(u.id));

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setOpen(true);
    debounce(() => setDebouncedQuery(value));
  };

  const handleAdd = (user: TargetUser) => {
    field.handleChange([...selectedUsers, user]);
    setQuery("");
    setDebouncedQuery("");
    setOpen(false);
  };

  const handleRemove = (id: number) => {
    field.handleChange(selectedUsers.filter((u) => u.id !== id));
  };

  return (
    <Field data-invalid={errors.length > 0}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="gap-1 pr-1">
              {user.name}
              <Button
                type="button"
                variant="unstyled"
                size="icon"
                className="size-4 rounded-full hover:bg-muted-foreground/20"
                onClick={() => handleRemove(user.id)}
                aria-label={`${user.name}を対象から外す`}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      <Popover open={open && suggestions.length > 0} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <Input
            value={query}
            placeholder="ユーザー名で検索"
            aria-invalid={errors.length > 0}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={field.handleBlur}
          />
        </PopoverAnchor>
        <PopoverContent align="start" className="p-1" style={{ width: "var(--radix-popper-anchor-width)" }}>
          <ul>
            {suggestions.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (user.name) handleAdd({ id: user.id, name: user.name });
                  }}
                >
                  <span className="truncate">{user.name}</span>
                  <span className="shrink-0 text-muted-foreground text-xs">#{user.id}</span>
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
};
