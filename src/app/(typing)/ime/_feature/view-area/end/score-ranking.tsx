import { atom, useAtomValue } from "jotai";
import type { HTMLAttributes } from "react";
import { getBuiltMap } from "../../../_lib/atoms/state";
import { store } from "../../provider";

type UserResult = { name: string; typeCount: number };
const userResultsAtom = atom<UserResult[]>([]);

export const addUserResult = ({ name, typeCount }: UserResult) =>
  store.set(userResultsAtom, (prev) => [...prev, { name, typeCount }]);
export const resetUserResults = () => store.set(userResultsAtom, []);

const scoreRankingAtom = atom((get) => {
  const userResults = get(userResultsAtom);
  const map = getBuiltMap();
  if (!map) return [];
  const scored = userResults
    .sort((a, b) => b.typeCount - a.typeCount)
    .map(({ name, typeCount }) => ({
      name,
      score: Math.round((1000 / map.totalNotes) * typeCount),
    }));
  return scored.map((entry, _, arr) => ({
    ...entry,
    rank: arr.filter((e) => e.score > entry.score).length + 1,
  }));
});

export const ScoreRanking = (props: HTMLAttributes<HTMLDivElement>) => {
  const scoreRanking = useAtomValue(scoreRankingAtom);

  return (
    <div {...props}>
      <ul className="list-none">
        {scoreRanking.map(({ name, score, rank }) => (
          <li key={name}>
            {rank}位 {name}: {score.toFixed(0)}点
          </li>
        ))}
      </ul>
    </div>
  );
};
