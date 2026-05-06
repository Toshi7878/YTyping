"use client";

import type * as React from "react";
import { useRef } from "react";
import { Button } from "@/ui/button";

type FileImportButtonBaseProps = Omit<React.ComponentProps<typeof Button>, "onClick" | "type"> & {
  accept?: string;
  name?: string;
};

type FileImportButtonProps = FileImportButtonBaseProps &
  (
    | {
        multiple?: false;
        onFileSelect: (file: File) => void | Promise<void>;
        onFilesSelect?: never;
      }
    | {
        multiple: true;
        onFileSelect?: never;
        onFilesSelect: (files: File[]) => void | Promise<void>;
      }
  );

const FileImportButton = (props: FileImportButtonProps) => {
  const { accept, multiple = false, name, children, ...buttonProps } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    if (props.multiple) {
      void props.onFilesSelect(files);
    } else {
      const file = files[0];
      if (file) {
        void props.onFileSelect(file);
      }
    }

    e.target.value = "";
  };

  return (
    <>
      <input
        type="file"
        hidden
        ref={inputRef}
        accept={accept}
        multiple={multiple}
        name={name}
        onChange={handleFileChange}
      />
      <Button {...buttonProps} type="button" onClick={() => inputRef.current?.click()}>
        {children}
      </Button>
    </>
  );
};

export { FileImportButton };
