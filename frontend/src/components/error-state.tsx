// Composant d'erreur générique réutilisable
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RefreshButton from "@/components/refresh-button";

interface ErrorStateProps {
  title: string;
  message: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  showRefresh?: boolean;
}

export default function ErrorState({
  title,
  message,
  primaryAction,
  showRefresh = true,
}: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="text-destructive mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{message}</p>
          <div className="flex gap-2 justify-center">
            {showRefresh && <RefreshButton />}
            {primaryAction && (
              <Button asChild>
                <Link href={primaryAction.href}>{primaryAction.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
