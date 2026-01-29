import { Skeleton } from "@/components/ui/skeleton";

export function AppSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Skeleton pour les cartes de paramètres */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
