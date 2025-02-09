import Content from "./Content";
import TimelineProvider from "./TimelineProvider";

export default async function Home() {
  return (
    <TimelineProvider>
      <Content />
    </TimelineProvider>
  );
}
