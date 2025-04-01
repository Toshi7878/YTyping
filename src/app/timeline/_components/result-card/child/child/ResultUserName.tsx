import { ResultCardInfo } from "@/app/timeline/ts/type";
import DateDistanceText from "@/components/share-components/text/DateDistanceText";
import { ThemeColors } from "@/types";
import { useLinkClick } from "@/util/global-hooks/useLinkClick";
import { Link } from "@chakra-ui/next-js";
import { Text, useTheme } from "@chakra-ui/react";

interface ResultUserNameProps {
  result?: ResultCardInfo;
}

const ResultUserName = (props: ResultUserNameProps) => {
  const { result } = props;

  const handleLinkClick = useLinkClick();
  const theme: ThemeColors = useTheme();

  return (
    <Text as="span" className="ml-0 md:ml-6">
      {result ? (
        <>
          <Link
            href={`/user/${result.player.id}`}
            onClick={handleLinkClick}
            color={theme.colors.secondary.main}
            fontWeight="bold"
          >
            {result.player.name}
          </Link>{" "}
          - <DateDistanceText date={new Date(result.updated_at)} />
        </>
      ) : (
        ""
      )}
    </Text>
  );
};

export default ResultUserName;
