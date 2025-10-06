type PaginationResult<T> = {
  items: T[];
  nextCursor: string | undefined;
};

export const createCursorPager = (pageSize: number) => {
  const paginate = <T>(items: T[], page: number): PaginationResult<T> => {
    let nextCursor: string | undefined;
    if (items.length > pageSize) {
      items.pop();
      nextCursor = String(page + 1);
    }
    return { items, nextCursor };
  };

  const parse = (cursor: string | undefined | null) => {
    const page = cursor ? Number(cursor) : 0;
    const safePage = Number.isNaN(page) ? 0 : page;
    return {
      page: safePage,
      offset: safePage * pageSize,
    };
  };

  return { paginate, parse };
};
