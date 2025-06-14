import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link/link";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import { useParams } from "next/navigation";

const TypeLinkButton = () => {
  const { id } = useParams();
  const handleLinkClick = useLinkClick();
  return (
    <Link href={`/type/${id}`} onClick={handleLinkClick}>
      <Button size="default" variant="outline" className="text-foreground border-border hover:bg-secondary">
        タイピングページに移動
      </Button>
    </Link>
  );
};

export default TypeLinkButton;
