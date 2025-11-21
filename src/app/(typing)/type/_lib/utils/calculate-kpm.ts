export const calculateLineKpm = ({
  lineTypeCount,
  constantLineTime,
}: {
  lineTypeCount: number;
  constantLineTime: number;
}) => {
  return Math.floor((lineTypeCount / constantLineTime) * 60);
};

export const calculateTotalKpm = ({
  totalTypeCount,
  totalTypeTime,
  constantLineTime,
}: {
  totalTypeCount: number;
  totalTypeTime: number;
  constantLineTime: number;
}) => {
  const newTotalTypeTime = totalTypeTime + constantLineTime;
  return Math.floor((totalTypeCount / newTotalTypeTime) * 60);
};

export const calculateLineRkpm = ({
  lineLatency,
  lineTypeCount,
  constantLineTime,
}: {
  lineLatency: number;
  lineTypeCount: number;
  constantLineTime: number;
}) => {
  const rkpmTime = constantLineTime - lineLatency;
  return lineTypeCount !== 0 ? Math.floor((lineTypeCount / rkpmTime) * 60) : 0;
};
