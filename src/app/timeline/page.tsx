import SearchContent from "./_components/search/SearchContent";
import UsersResultList from "./_components/UsersResultList";
import TimelineProvider from "./TimelineProvider";

export default async function Home() {
  return (
    <TimelineProvider>
      <div className="mx-auto w-[80%]">
        <SearchContent />
        <UsersResultList />
      </div>
    </TimelineProvider>
  );
}
