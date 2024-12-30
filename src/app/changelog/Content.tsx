"use client";
import nProgress from "nprogress";
import { useEffect } from "react";
import ContentHeading from "./_components/Heading";
import UpdateHistory from "./_components/UpdateHistory";

const Content = () => {
  useEffect(() => {
    window.getSelection()!.removeAllRanges();
    nProgress.done();
  }, []);

  return (
    <>
      <ContentHeading />
      <UpdateHistory />
    </>
  );
};

export default Content;
