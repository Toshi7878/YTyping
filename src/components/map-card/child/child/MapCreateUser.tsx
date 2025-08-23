import DateDistanceText from "@/components/share-components/text/DateDistanceText";
import UserLinkText from "@/components/share-components/text/UserLinkText";
import { RouterOutPuts } from "@/server/api/trpc";

interface MapCreateUserProps {
  map: RouterOutPuts["mapList"]["getByVideoId"][number];
}

const MapCreateUser = (props: MapCreateUserProps) => {
  return (
    <small className="mt-2 block truncate">
      <UserLinkText userId={props.map.creator.id} userName={props.map.creator.name as string} />
      <span className="hidden text-xs md:inline-block">
        <span className="mx-1">
          - <DateDistanceText date={new Date(props.map.updated_at)} />
        </span>
      </span>
    </small>
  );
};

export default MapCreateUser;
