"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

// Configuration des traductions
const LABEL_MAP: Record<string, string> = {
  overview: "Tableau de bord",
  users: "Utilisateurs",
  search: "Recherche",
  me: "Mon Profil",
  edit: "Modification",
  missions: "Missions",
  zones: "Zones",
  settings: "Paramètres",
};

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((s) => s !== "overview");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/overview">Aperçu</BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          // --- LOGIQUE DE NETTOYAGE ---
          // 1. On vérifie si c'est un ID (UUID ou long code)
          const isId =
            segment.length > 20 ||
            (/\d/.test(segment) && segment.includes("-"));

          // 2. On cherche la traduction, sinon on affiche l'ID tronqué ou le segment
          let title = LABEL_MAP[segment] || segment;

          if (isId) {
            title = "Détails"; // Ou "Édition" selon le contexte
          } else {
            title = title.charAt(0).toUpperCase() + title.slice(1);
          }

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  // Si c'est un ID, on évite parfois de rendre le lien cliquable
                  // si la page parente n'a pas de contenu
                  <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
