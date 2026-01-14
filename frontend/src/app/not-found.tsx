import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MonitorOff, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      {/* Illustration Iconographique */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
        <MonitorOff className="h-24 w-24 text-primary relative" />
      </div>

      {/* Message d'erreur */}
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">
        404
      </h1>
      <h2 className="text-xl font-semibold mb-2">Page introuvable</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        La ressource que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="default" size="lg">
          <Link href="/overview">Retour au Dashboard</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Page d&apos;accueil
          </Link>
        </Button>
      </div>

      {/* Footer technique discret */}
      <p className="mt-16 text-xs text-muted-foreground/50 font-mono">
        Error_Code: ERR_NEXT_ROUTING_NOT_FOUND
      </p>
    </div>
  );
}
