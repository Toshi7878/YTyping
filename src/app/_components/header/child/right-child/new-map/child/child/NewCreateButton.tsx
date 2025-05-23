"use client";

import { CreateMapBackUpInfo } from "@/types/global-types";
import { useLinkClick } from "@/util/global-hooks/useLinkClick";
import { Link } from "@chakra-ui/next-js";
import { Button, UseDisclosureReturn } from "@chakra-ui/react";

interface NewCreateButtonProps {
  createMapBackUpInfo: CreateMapBackUpInfo;
  newCreateModalDisclosure: UseDisclosureReturn;
  newID: string;
  createBtnRef: React.RefObject<HTMLButtonElement>;
}

const BACKUP_OVERWRITE_WARNING = "新規作成すると前回のバックアップデータが失われますがよろしいですか？";

export default function NewCreateButton(props: NewCreateButtonProps) {
  const handleLinkClick = useLinkClick();

  return (
    <Link
      href={`/edit?new=${props.newID}`}
      onClick={(event) => {
        const shouldOverwriteBackup = props.createMapBackUpInfo.videoId ? confirm(BACKUP_OVERWRITE_WARNING) : true;

        if (shouldOverwriteBackup) {
          handleLinkClick(event);
          props.newCreateModalDisclosure.onClose();
        } else {
          event.preventDefault();
        }
      }}
    >
      <Button ref={props.createBtnRef} colorScheme="blue" isDisabled={!props.newID}>
        新規作成
      </Button>
    </Link>
  );
}
