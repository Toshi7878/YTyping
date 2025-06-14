import MapLeftThumbnail from "../share-components/MapCardThumbnail";
import { CardWithContent } from "../ui/card";
import MapCardRightInfo from "./child/MapCardRightInfo";

function SkeletonCard() {
  return (
    <CardWithContent variant="map">
      <MapLeftThumbnail size="home" />
      <MapCardRightInfo />
    </CardWithContent>
  );
}

export default SkeletonCard;
