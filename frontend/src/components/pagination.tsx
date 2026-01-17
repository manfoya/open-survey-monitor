"use client";

import { PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, Pagination as ShadcnPagination } from "@/components/ui/pagination";
import { usePathname, useSearchParams } from "next/navigation";
import { generatePagination } from "@/lib/utils";

export default function Pagination({ totalPages }: { totalPages: number }) {

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const allPages = generatePagination(currentPage, totalPages);

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (totalPages > 1) && (
    <ShadcnPagination>
    <PaginationContent>
      { currentPage > 1 && (
        <PaginationItem>
          <PaginationPrevious href={createPageURL(currentPage - 1)} />
        </PaginationItem>
      )}
      {allPages.map((page, index) => {
        if (page === "...") {
          return (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          );
        } else {
          return (
            <PaginationItem key={page}>
              <PaginationLink
                href={createPageURL(page as number)}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        }
      })}
      { currentPage < totalPages && (
        <PaginationItem>
          <PaginationNext href={createPageURL(currentPage + 1)} />
        </PaginationItem>
      )}
    </PaginationContent>
  </ShadcnPagination>
  );
}
