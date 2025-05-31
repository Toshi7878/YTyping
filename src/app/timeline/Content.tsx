"use client";
import UsersResultList from "./_components/UsersResultList";
import SearchContent from "./_components/search/SearchContent";

export default function Content() {
  return (
    <div className="w-[80%] mx-auto">
      <SearchContent />
      <UsersResultList />
    </div>
  );
}
