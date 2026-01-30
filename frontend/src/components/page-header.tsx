import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Retour",
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {backHref && (
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href={backHref} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
