import { useQueryState } from "nuqs";
import { createLoader, createParser, parseAsBoolean, parseAsString } from "nuqs/server";

const parseAsNewMapVideoId = createParser({
  parse(query) {
    const value = parseAsString.parse(query);
    if (value?.length !== 11) return null;

    return value;
  },
  serialize(value) {
    return value;
  },
});
const isBuckupParser = parseAsBoolean.withDefault(false);

export const useIsBuckupQueryState = () => useQueryState("isBuckup", parseAsBoolean.withDefault(false));

export const searchParamsLoader = createLoader({ new: parseAsNewMapVideoId, isBuckup: isBuckupParser });
