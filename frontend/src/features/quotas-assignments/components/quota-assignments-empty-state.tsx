import { FileIcon } from "lucide-react";

export function QuotaAssignmentsEmptyState({ query }: { query: string }) {
  if (query) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <FileIcon className="h-10 w-10 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-semibold">Aucun résultat</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Aucune assignation ne correspond à &quot;{query}&quot;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <FileIcon className="h-10 w-10 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-semibold">Aucune assignation</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Aucune assignation de quota n&apos;a été trouvée.
        </p>
      </div>
    </div>
  );
}
