import { Metadata } from "next";
import Content from "../_components/Content";
import EditProvider from "../_components/EditProvider";

export const metadata: Metadata = {
  title: `Edit New Map - YTyping`,
  description: "",
};

export default async function Home() {
  return (
    <EditProvider>
      <Content />
    </EditProvider>
  );
}
