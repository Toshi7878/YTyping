"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

interface PageNavigationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  previousText?: string;
  nextText?: string;
  size?: "default" | "sm";
}

const buildPageNumbers = (current: number, total: number): (number | "ellipsis")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
};

export const PageNavigation = ({
  page,
  pageCount,
  onPageChange,
  previousText = "前へ",
  nextText = "次へ",
  size = "default",
}: PageNavigationProps) => {
  if (pageCount <= 1) return null;

  const pageNumbers = buildPageNumbers(page, pageCount);
  const linkSize = size === "sm" ? "sm" : "icon";

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text={previousText}
            size={size}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            aria-disabled={page === 1}
            className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {pageNumbers.map((p, i) =>
          p === "ellipsis" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: 静的なlistで使用する
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                size={linkSize}
                isActive={p === page}
                onClick={() => onPageChange(p)}
                className="cursor-pointer"
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            text={nextText}
            size={size}
            onClick={() => onPageChange(Math.min(pageCount, page + 1))}
            aria-disabled={page === pageCount}
            className={page === pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
