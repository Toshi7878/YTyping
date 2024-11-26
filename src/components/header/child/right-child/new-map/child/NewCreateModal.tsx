"use client";

import {
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Flex,
  UseDisclosureReturn,
} from "@chakra-ui/react";
import { IndexDBOption } from "@/types";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";
import { EditorNewMapBackUpInfoData } from "@/app/edit/ts/type";
import CustomModalContent from "@/components/custom-ui/CustomModalContent";
import CreateMapBackUpButton from "./child/CreateMapBackUpButton";
import NewCreateButton from "./child/NewCreateButton";
import NewCreateVideoIdInputBox from "./child/NewCreateVideoIdInputBox";
import CreatedCheck from "./child/CreatedCheck";

interface NewCreateModalProps {
  newCreateModalDisclosure: UseDisclosureReturn;
}

export default function NewCreateModal({ newCreateModalDisclosure }: NewCreateModalProps) {
  const [createMapBackUpInfo, setCreateMapBackUpInfo] = useState({ title: "", videoId: "" });
  const [createYTURL, setCreateYTURL] = useState("");
  const [newID, setNewID] = useState("");
  const createBtnRef = useRef(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (newCreateModalDisclosure.isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [newCreateModalDisclosure.isOpen]);

  useEffect(() => {
    db.editorNewCreateBak
      .get({ optionName: "backupMapInfo" })
      .then((data: IndexDBOption | undefined) => {
        if (data) {
          const backupMapInfo = data.value as EditorNewMapBackUpInfoData;
          setCreateMapBackUpInfo({ title: backupMapInfo.title, videoId: backupMapInfo.videoId });
        } else {
          setCreateMapBackUpInfo({ title: "", videoId: "" });
        }
      });

    return () => {
      setCreateMapBackUpInfo({ title: "", videoId: "" });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal isOpen={newCreateModalDisclosure.isOpen} onClose={newCreateModalDisclosure.onClose}>
      <ModalOverlay />
      <CustomModalContent maxW="640px">
        <ModalHeader>譜面新規作成ウィンドウ</ModalHeader>
        <ModalBody>
          <NewCreateVideoIdInputBox
            newCreateModalDisclosure={newCreateModalDisclosure}
            createBtnRef={createBtnRef}
            createYTURL={createYTURL}
            setCreateYTURL={setCreateYTURL}
            setNewID={setNewID}
            inputRef={inputRef}
          />
        </ModalBody>

        <ModalFooter>
          <Flex direction="column" justify="space-between" align="center" w="100%" minH={"80px"}>
            <Flex justify="space-between" align="center" w="100%">
              <CreateMapBackUpButton
                createMapBackUpInfo={createMapBackUpInfo}
                newCreateModalDisclosure={newCreateModalDisclosure}
              />
              <NewCreateButton
                createMapBackUpInfo={createMapBackUpInfo}
                newCreateModalDisclosure={newCreateModalDisclosure}
                newID={newID}
                createBtnRef={createBtnRef}
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
