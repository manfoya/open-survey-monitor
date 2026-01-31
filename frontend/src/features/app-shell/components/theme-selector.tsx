"use client";

import { useTheme } from "next-themes";
import React, { useState } from "react";

interface ThemeOption {
  id: string;
  label: string;
  description: string;
  preview: React.ReactNode;
}

export function ThemeSelector() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Éviter le mismatch d'hydratation
  if (!mounted) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="h-3 bg-muted rounded w-16"></div>
            <div className="aspect-video rounded-md bg-muted"></div>
            <div className="h-3 bg-muted rounded w-20 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  const themes: ThemeOption[] = [
    {
      id: "light",
      label: "CLAIR",
      description: "Thème clair",
      preview: (
        <div className="aspect-video rounded-md border-2 border-muted bg-white p-2">
          <div className="space-y-2">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="h-2 bg-slate-100 rounded w-3/4"></div>
            <div className="h-2 bg-slate-100 rounded w-1/2"></div>
          </div>
        </div>
      ),
    },
    {
      id: "dark",
      label: "SOMBRE",
      description: "Thème sombre",
      preview: (
        <div className="aspect-video rounded-md border-2 border-muted bg-slate-950 p-2">
          <div className="space-y-2">
            <div className="h-2 bg-slate-700 rounded"></div>
            <div className="h-2 bg-slate-800 rounded w-3/4"></div>
            <div className="h-2 bg-slate-800 rounded w-1/2"></div>
          </div>
        </div>
      ),
    },
    {
      id: "system",
      label: "SYSTÈME",
      description: "Suit les préférences système",
      preview: (
        <div
          className={`aspect-video rounded-md border-2 border-muted p-2 ${
            systemTheme === "dark" ? "bg-slate-950" : "bg-white"
          }`}
        >
          <div className="space-y-2">
            <div
              className={`h-2 rounded ${
                systemTheme === "dark" ? "bg-slate-700" : "bg-slate-200"
              }`}
            />
            <div
              className={`h-2 rounded w-3/4 ${
                systemTheme === "dark" ? "bg-slate-800" : "bg-slate-100"
              }`}
            />
            <div
              className={`h-2 rounded w-1/2 ${
                systemTheme === "dark" ? "bg-slate-800" : "bg-slate-100"
              }`}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {themes.map((themeOption) => (
        <div key={themeOption.id} className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {themeOption.label}
          </div>
          <label className="cursor-pointer block">
            <input
              type="radio"
              name="theme"
              value={themeOption.id}
              checked={theme === themeOption.id}
              onChange={() => setTheme(themeOption.id)}
              className="sr-only"
            />
            <div
              className={`relative transition-all duration-200 ${
                theme === themeOption.id
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "hover:ring-1 hover:ring-muted-foreground/50 hover:ring-offset-1"
              }`}
            >
              {themeOption.preview}
              {/* Indicateur de sélection */}
              {theme === themeOption.id && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
              )}
            </div>
          </label>
          <p className="text-xs text-muted-foreground text-center">
            {themeOption.description}
          </p>
        </div>
      ))}
    </div>
  );
}
