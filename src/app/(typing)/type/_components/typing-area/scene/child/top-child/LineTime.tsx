import LineKpmText from "./child/LineKpmText";
import LineRemainTimeText from "./child/LineRemainTimeText";

const LineTime = () => {
  return (
    <div>
      <LineKpmText />
      <span className="ml-1 tracking-widest">
        kpm
      </span>
      <span className="mx-3">
        -
      </span>
      残り
      <span className="mr-1">
        <LineRemainTimeText />
      </span>
      秒
    </div>
  );
};

export default LineTime;
