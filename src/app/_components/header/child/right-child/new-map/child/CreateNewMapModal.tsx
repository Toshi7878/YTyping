"use client";

import { EditorNewMapBackUpInfoData } from "@/app/edit/ts/type";
import CustomModalContent from "@/components/custom-ui/CustomModalContent";
import { db } from "@/lib/db";
import { IndexDBOption } from "@/types";
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
  const [createMapBackUpInfo, setCreateMapBackUpInfo] = useState({ title: "", videoId: "" });
  const [createYTURL, setCreateYTURL] = useState("");
  const [newID, setNewID] = useState("");
  const createBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newCreateModalDisclosure.isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [newCreateModalDisclosure.isOpen]);

  useEffect(() => {
    db.editorNewCreateBak.get({ optionName: "backupMapInfo" }).then((data: IndexDBOption | undefined) => {
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
              <CreateMapBackUpButton
                createMapBackUpInfo={createMapBackUpInfo}
                newCreateModalDisclosure={newCreateModalDisclosure}
              />
              <NewCreateButton
                createMapBackUpInfo={createMapBackUpInfo}
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
