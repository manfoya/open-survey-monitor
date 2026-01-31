"use client";

import { useState, useEffect } from "react";

export interface ColumnVisibility {
  [key: string]: boolean;
}

interface UseTableColumnVisibilityOptions<T extends ColumnVisibility> {
  storageKey: string;
  defaultVisibility: T;
}

export function useTableColumnVisibility<T extends ColumnVisibility>({
  storageKey,
  defaultVisibility,
}: UseTableColumnVisibilityOptions<T>) {
  const [columnVisibility, setColumnVisibility] =
    useState<T>(defaultVisibility);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les préférences depuis le localStorage au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setColumnVisibility({ ...defaultVisibility, ...parsed } as T);
      }
    } catch (error) {
      console.warn(
        `Erreur lors du chargement des préférences (${storageKey}):`,
        error,
      );
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey, defaultVisibility]);

  // Sauvegarder dans le localStorage à chaque changement
  const updateColumnVisibility = (newVisibility: T) => {
    setColumnVisibility(newVisibility);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newVisibility));
    } catch (error) {
      console.warn(`Erreur lors de la sauvegarde (${storageKey}):`, error);
    }
  };

  // Réinitialiser aux valeurs par défaut
  const resetColumnVisibility = () => {
    setColumnVisibility(defaultVisibility);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn(
        `Erreur lors de la réinitialisation (${storageKey}):`,
        error,
      );
    }
  };

  return {
    columnVisibility,
    updateColumnVisibility,
    resetColumnVisibility,
    isLoaded,
  };
}
