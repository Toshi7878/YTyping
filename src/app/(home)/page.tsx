import MapControlArea from "./components/MapControlArea";
import MapList from "./components/MapList";
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
