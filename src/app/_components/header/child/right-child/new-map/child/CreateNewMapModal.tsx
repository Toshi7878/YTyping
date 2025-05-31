"use client";

import CustomModalContent from "@/components/custom-ui/CustomModalContent";
import { useGetBackupTitleVideoIdLiveQuery } from "@/lib/db";
import { Flex, Modal, ModalBody, ModalFooter, ModalHeader, ModalOverlay, UseDisclosureReturn } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import CreatedCheck from "../../../../../../../components/share-components/CreatedCheck";
import CreateMapBackUpButton from "./child/CreateMapBackUpButton";
import NewCreateButton from "./child/NewCreateButton";
import NewCreateVideoIdInputBox from "./child/NewCreateVideoIdInputBox";

interface CreateNewMapModalProps {
  newCreateModalDisclosure: UseDisclosureReturn;
}

export default function CreateNewMapModal({ newCreateModalDisclosure }: CreateNewMapModalProps) {
  const [createYTURL, setCreateYTURL] = useState("");
  const [newID, setNewID] = useState("");
  const createBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const backupData = useGetBackupTitleVideoIdLiveQuery();

  useEffect(() => {
    if (newCreateModalDisclosure.isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [newCreateModalDisclosure.isOpen]);

  return (
    <Modal isOpen={newCreateModalDisclosure.isOpen} onClose={newCreateModalDisclosure.onClose}>
      <ModalOverlay />
      <CustomModalContent maxW="640px">
        <ModalHeader>譜面新規作成ウィンドウ</ModalHeader>
        <ModalBody>
          <NewCreateVideoIdInputBox
            newCreateModalDisclosure={newCreateModalDisclosure}
            createBtnRef={createBtnRef as any}
            createYTURL={createYTURL}
            setCreateYTURL={setCreateYTURL}
            setNewID={setNewID}
            inputRef={inputRef as any}
          />
        </ModalBody>

        <ModalFooter>
          <Flex direction="column" justify="space-between" align="center" w="100%" minH={"80px"}>
            <Flex justify="space-between" align="center" w="100%">
              <CreateMapBackUpButton backupData={backupData} newCreateModalDisclosure={newCreateModalDisclosure} />
              <NewCreateButton
                backupData={backupData}
                newCreateModalDisclosure={newCreateModalDisclosure}
                newID={newID}
                createBtnRef={createBtnRef as any}
              />
            </Flex>
            {newID ? (
              <Flex>
                <CreatedCheck videoId={newID} />{" "}
              </Flex>
            ) : null}
          </Flex>
        </ModalFooter>
      </CustomModalContent>
    </Modal>
  );
}
