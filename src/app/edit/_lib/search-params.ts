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

export const searchParamsParsers = { new: parseAsNewMapVideoId, isBackup: parseAsBoolean.withDefault(false) };
export const searchParamsLoader = createLoader(searchParamsParsers);
