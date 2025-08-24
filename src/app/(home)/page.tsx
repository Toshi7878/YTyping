import { HydrateClient } from "@/trpc/server";
import MapControlArea from "./_components/MapControlArea";
import MapList from "./_components/MapList";
import HomeProvider from "./HomeClientProvider";

export default function Home() {
  return (
    <HydrateClient>
      <HomeProvider>
        <div className="mx-auto max-w-screen-xl lg:px-8">
          <MapControlArea />
          <MapList />
        </div>
      </HomeProvider>
    </HydrateClient>
  );
}
