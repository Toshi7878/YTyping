import MapLeftThumbnail from "../share-components/MapCardThumbnail";
import { Card, CardContent } from "../ui/card";
import MapCardRightInfo from "./child/MapCardRightInfo";

function SkeletonCard() {
  return (
    <Card variant="map">
      <CardContent variant="map">
        <MapLeftThumbnail size="home" />
        <MapCardRightInfo />
      </CardContent>
    </Card>
  );
}

export default SkeletonCard;
