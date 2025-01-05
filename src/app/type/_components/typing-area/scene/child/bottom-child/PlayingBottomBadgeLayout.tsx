import PlayingPracticeBadge from "./child/PlayingPracticeBadge";
import PlayingRetryBadge from "./child/PlayingRetryBadge";
import PlayingSpeedBadge from "./child/PlayingSpeedBadge";

const PlayingBottomBadgeLayout = function () {
  return (
    <>
      <PlayingSpeedBadge />
      <PlayingPracticeBadge />
      <PlayingRetryBadge />
    </>
  );
};

export default PlayingBottomBadgeLayout;
