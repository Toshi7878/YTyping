import { HOME_THUBNAIL_HEIGHT, HOME_THUBNAIL_WIDTH } from "@/app/(home)/ts/consts";
import MapLeftThumbnail from "../share-components/MapCardThumbnail";
import MapCard from "./MapCard";
import MapCardRightInfo from "./child/MapCardRightInfo";

function SkeletonCard() {
  return (
    <MapCard>
      <MapLeftThumbnail thumnailWidth={HOME_THUBNAIL_WIDTH} thumnailHeight={HOME_THUBNAIL_HEIGHT} />
      <MapCardRightInfo>
        <></>
      </MapCardRightInfo>
    </MapCard>
  );
}

export default SkeletonCard;
