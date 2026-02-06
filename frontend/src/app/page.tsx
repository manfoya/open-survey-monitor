import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4 text-center">
      <div className="max-w-4xl w-full flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Icon */}
        <div className="p-5 bg-primary/10 rounded-full ring-1 ring-primary/20 mb-4">
          <BarChart3 className="h-12 w-12 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight lg:text-6xl text-foreground">
          Tableau de bord{" "}
          <span className="block text-primary mt-2 text-2xl sm:text-4xl">
            Suivi d'Enquête ENSPD-2026
          </span>
        </h1>

        {/* Text Content */}
        <div className="space-y-6 text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-3xl">
          <p>
            Bienvenue sur le tableau de bord de l'
            <strong>Enquête-étudiant 2026</strong>, organisée par l'École
            Nationale de Statistique, de Planification et de Démographie
            (ENSPD).
          </p>
          <p>
            Ce formulaire vous permet d'accéder à la synthèse des données
            collectées dans le cadre de ladite enquête.
          </p>
        </div>

        {/* Login Button */}
        <div className="pt-6 w-full sm:w-auto">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto px-16 h-14 text-lg font-bold shadow-xl hover:shadow-primary/20 transition-all rounded-full"
          >
            <Link href="/login">Se connecter</Link>
          </Button>
        </div>
      </div>

      <footer className="pt-16 bottom-6 text-center text-sm text-muted-foreground/40">
        <p>&copy; {new Date().getFullYear()} ENSPD - Open Survey Monitor</p>
      </footer>
    </div>
  );
}
