import MapControlArea from "./_components/MapControlArea";
import MapList from "./_components/MapList";
import HomeProvider from "./HomeClientProvider";

export default function Home() {
  return (
    <HomeProvider>
      <div className="mx-auto max-w-screen-xl lg:px-8">
        <MapControlArea />
        <MapList />
      </div>
    </HomeProvider>
  );
}
