// Composant PageHeader réutilisable
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
    <div className="flex flex-col items-start gap-4 mb-8">
      {backHref && (
        <Button variant="ghost" size="sm" asChild>
          <Link href={backHref} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      )}

      <div className="flex items-start justify-between w-full">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
