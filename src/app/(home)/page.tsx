import MapControlArea from "./_components/MapControlArea";
import MapList from "./_components/MapList";
import HomeProvider from "./HomeClientProvider";

export default function Home() {
  return (
    <HomeProvider>
      <div className="w-full">
        <MapControlArea />
        <MapList />
      </div>
    </HomeProvider>
  );
}
