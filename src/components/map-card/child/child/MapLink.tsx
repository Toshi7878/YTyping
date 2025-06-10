import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import Link from "next/link";

interface MapLinkProps {
  mapId: number;
}

const MapLink = ({ mapId }: MapLinkProps) => {
  const handleLinkClick = useLinkClick();

  return <Link className="absolute h-full w-full" href={`/type/${mapId}`} onClick={handleLinkClick} />;
};

export default MapLink;
