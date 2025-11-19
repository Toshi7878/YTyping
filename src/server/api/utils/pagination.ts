export const createPagination = (cursor: number | null | undefined, pageSize: number) => {
  const page = cursor ?? 0;

  const buildPageResult = <T>(items: T[]): { items: T[]; nextCursor: number | undefined } => {
    if (items.length > pageSize) {
      items.pop();
      return { items, nextCursor: page + 1 };
    }
    return { items, nextCursor: undefined };
  };

  return { limit: pageSize + 1, offset: page * pageSize, buildPageResult };
};
