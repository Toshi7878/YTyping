import MapLeftThumbnail from "../share-components/MapCardThumbnail";
import MapCard from "./MapCard";
import MapCardRightInfo from "./child/MapCardRightInfo";

function SkeletonCard() {
  return (
    <MapCard>
      <MapLeftThumbnail size="home" />
      <MapCardRightInfo>
        <></>
      </MapCardRightInfo>
    </MapCard>
  );
}

export default SkeletonCard;
