"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function ActiveFilterCheckbox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isActiveOnly = searchParams.get("active_only") === "true";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handleCheckedChange = (checked: boolean) => {
    router.push(`?${createQueryString("active_only", String(checked))}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="active_only"
        checked={isActiveOnly}
        onCheckedChange={handleCheckedChange}
      />
      <Label htmlFor="active_only">Actifs uniquement</Label>
    </div>
  );
}
