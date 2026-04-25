export const createPagination = (cursor: number | undefined, pageSize: number, maxItems?: number) => {
  const page = cursor ?? 0;
  const offset = page * pageSize;
  const rawLimit = pageSize + 1;
  const limit = maxItems !== undefined ? Math.min(rawLimit, Math.max(0, maxItems - offset)) : rawLimit;

  const buildPageResult = <T>(items: T[]): { items: T[]; nextCursor: number | undefined } => {
    if (items.length > pageSize) {
      items.pop();
      return { items, nextCursor: page + 1 };
    }
    return { items, nextCursor: undefined };
  };

  return { limit, offset, buildPageResult };
};
