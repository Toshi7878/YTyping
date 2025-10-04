type PaginationResult<T> = {
  items: T[];
  nextCursor: string | undefined;
};

export function applyCursorPagination<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  let nextCursor: string | undefined;
  if (items.length > pageSize) {
    items.pop();
    nextCursor = String(page + 1);
  }
  return { items, nextCursor };
}

export function parseCursor(cursor: string | undefined | null, pageSize: number) {
  const page = cursor ? Number(cursor) : 0;
  const safePage = Number.isNaN(page) ? 0 : page;
  return {
    page: safePage,
    offset: safePage * pageSize,
  };
}
