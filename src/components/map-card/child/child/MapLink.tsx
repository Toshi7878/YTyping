import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import { Link } from "@chakra-ui/next-js";

interface MapLinkProps {
  mapId: number;
}

const MapLink = ({ mapId }: MapLinkProps) => {
  const handleLinkClick = useLinkClick();

  return <Link width="100%" height="100%" position="absolute" href={`/type/${mapId}`} onClick={handleLinkClick} />;
};

export default MapLink;
