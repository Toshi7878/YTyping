import { ResultCardInfo } from "@/app/timeline/ts/type";
import DateDistanceText from "@/components/share-components/text/DateDistanceText";
import Link from "@/components/ui/link/link";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";

interface ResultUserNameProps {
  result?: ResultCardInfo;
}

const ResultUserName = (props: ResultUserNameProps) => {
  const { result } = props;

  const handleLinkClick = useLinkClick();

  return (
    <span className="ml-0 md:ml-6">
      {result ? (
        <>
          <Link
            href={`/user/${result.player.id}`}
            onClick={handleLinkClick}
            className="text-secondary font-bold hover:underline"
          >
            {result.player.name}
          </Link>{" "}
          - <DateDistanceText date={new Date(result.updated_at)} />
        </>
      ) : (
        ""
      )}
    </span>
  );
};

export default ResultUserName;
