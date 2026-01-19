"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

interface PageSizeSelectorProps {
  pageSizes?: number[];
  currentPageSize?: number;
}

export function PageSizeSelector({ 
  pageSizes = [10, 25, 50, 100], 
  currentPageSize = 25 
}: PageSizeSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageSizeChange = (newPageSize: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page_size", newPageSize);
    params.set("page", "1"); // Retourner à la première page
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Lignes par page :</span>
      <Select value={currentPageSize.toString()} onValueChange={handlePageSizeChange}>
        <SelectTrigger className="w-[80px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizes.map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}