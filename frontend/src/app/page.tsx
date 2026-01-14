import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="container space-y-6 py-24 text-center md:py-32">
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Surveillez vos sondages <br className="hidden sm:inline" />
          avec une précision <span className="text-primary">Backend</span>.
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Interface open-source pour monitorer vos flux de données Python en
          temps réel. Simple, robuste et typé.
        </p>

        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/login">
              Accéder au Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            Documentation API
          </Button>
        </div>
      </section>

      {/* Features Grid pour tester les Cards */}
      <section className="container py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Zap className="h-10 w-10 text-primary" />}
            title="Temps Réel"
            description="Connexion directe à votre API Python pour un monitoring instantané."
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-primary" />}
            title="Analytique"
            description="Visualisation des données agrégées via des composants performants."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-10 w-10 text-primary" />}
            title="Sécurisé"
            description="Validation Zod et authentification JWT Server-to-Server."
          />
        </div>
      </section>
    </div>
  );
}

// Petit composant interne pour le test
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
