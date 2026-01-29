"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeSelector } from "@/features/app-shell/components/theme-selector";
import { Palette, Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* En-tête de la page */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Paramètres
        </h1>
        <p className="text-muted-foreground">
          Gérez vos préférences et personnalisez votre expérience.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section Apparence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez l&apos;apparence de l&apos;application selon vos
              préférences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Thème</h4>
                <p className="text-sm text-muted-foreground">
                  Choisissez le thème d&apos;affichage de l&apos;application
                </p>
              </div>
              <ThemeToggle />
            </div>

            <Separator />

            <ThemeSelector />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
