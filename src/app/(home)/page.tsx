import MapList from "./components/MapList";
import SearchContent from "./components/search/SearchContent";
import HomeProvider from "./HomeClientProvider";

export default function Home() {
  return (
    <HomeProvider>
      <div className="w-full">
        <SearchContent />
        <MapList />
      </div>
    </HomeProvider>
  );
}
