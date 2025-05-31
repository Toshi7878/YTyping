"use client";
import MapList from "./components/MapList";
import SearchContent from "./components/search/SearchContent";

export default function Content() {
  return (
    <div className="w-full">
      <SearchContent />
      <MapList />
    </div>
  );
}
