import SearchContent from "./_components/SearchContent";
import UsersResultList from "./_components/UsersResultList";
import TimelineProvider from "./client-provider";

export default async function Home() {
  return (
    <TimelineProvider>
      <div className="mx-auto w-full space-y-8 lg:w-5xl">
        <SearchContent />
        <UsersResultList />
      </div>
    </TimelineProvider>
  );
}
