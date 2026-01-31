import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Map as MapIcon,
  BarChart3,
  ShieldCheck,
  PieChart,
  Activity,
  Layers,
  Database,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Advanced Fieldwork Quality Control
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
                Monitor your data collection in{" "}
                <span className="text-primary font-semibold">real-time</span>.
                Enforce GPS boundaries, track quotas, and validate variables
                instantly with a robust Python backend.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/login">
                  Live Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
              >
                Documentation
              </Button>
            </div>

            {/* Dashboard Mockup - with heavy shadow and glow affect */}
            <div className="mt-12 relative w-full max-w-5xl rounded-xl border bg-background/50 shadow-2xl overflow-hidden aspect-video">
              <Image
                src="/dashboard_mockup.png"
                alt="Open Survey Monitor Dashboard"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto py-24 px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-3">
          <FeatureCard
            icon={<MapIcon className="h-10 w-10 text-blue-500" />}
            title="Geospatial Intelligence"
            description="Visualize survey locations with precise zone overlays. enforce GPS constraints to ensure fieldwork integrity across regions."
          />
          <FeatureCard
            icon={<PieChart className="h-10 w-10 text-purple-500" />}
            title="Quota Management"
            description="Track sample progress in real-time against strict demographic targets. Auto-stop collection when quotas are met."
          />
          <FeatureCard
            icon={<Activity className="h-10 w-10 text-green-500" />}
            title="Variable Analysis"
            description="Deep dive into survey variables. Analyze distributions, detect anomalies, and ensure data consistency instantly."
          />
        </div>
      </section>

      {/* Technical Deep Dive */}
      <section className="bg-muted/30 border-y py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-16 px-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Technical Trust
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl">
              Built for engineering teams who demand control and reliability.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <TechCard
              icon={<Database className="h-6 w-6" />}
              title="Python Core"
              text="Leverage the power of Python for heavy-duty data processing."
            />
            <TechCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Secure JWT"
              text="Stateless, server-to-server authentication for secure API access."
            />
            <TechCard
              icon={<Layers className="h-6 w-6" />}
              title="Typed API"
              text="End-to-end type safety ensures frontend and backend stay in sync."
            />
            <TechCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Open Source"
              text="Fully transparent codebase. Self-hostable and extensible."
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tighter mb-6">
          Ready to upgrade your monitoring?
        </h2>
        <Button asChild size="lg" variant="secondary">
          <Link
            href="https://github.com/manfoya/open-survey-monitor"
            target="_blank"
          >
            View on GitHub
          </Link>
        </Button>
      </section>
    </div>
  );
}

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
    <Card className="bg-card/50 border-muted/60 transition-all hover:bg-card hover:border-border">
      <CardContent className="pt-8">
        <div className="mb-6 p-3 w-fit rounded-lg bg-background/80 shadow-sm ring-1 ring-inset ring-white/10">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function TechCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background border shadow-sm">
      <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
