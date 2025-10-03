"use client";

import { useParams } from "next/navigation";

export const UserCreatedMapList = () => {
  const { id } = useParams<{ id: string }>();

  return <div>UserCreatedMapList</div>;
};
