"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function VariableFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const usedOnly = searchParams.get("used_only") === "true";
  const isQuota = searchParams.get("is_quota") === "true";

  const handleFilterChange = (key: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set(key, "true");
    } else {
      params.delete(key);
    }
    // Reset to first page when filtering
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 px-3 py-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="used_only"
          checked={usedOnly}
          onCheckedChange={(checked) =>
            handleFilterChange("used_only", checked as boolean)
          }
        />
        <Label
          htmlFor="used_only"
          className="text-sm font-medium leading-none cursor-pointer select-none"
        >
          Utilisées uniquement
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_quota"
          checked={isQuota}
          onCheckedChange={(checked) =>
            handleFilterChange("is_quota", checked as boolean)
          }
        />
        <Label
          htmlFor="is_quota"
          className="text-sm font-medium leading-none cursor-pointer select-none"
        >
          Activable pour quotas
        </Label>
      </div>
    </div>
  );
}
