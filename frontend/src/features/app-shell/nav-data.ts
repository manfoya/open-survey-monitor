import {
  LayoutDashboard,
  Users,
  Settings,
  UserCircle,
  Settings2,
  MapPin,
  Database,
  Mail,
  Ruler,
  Target,
  TableProperties,
  Map,
} from "lucide-react";
import { UserRole } from "../auth/types";

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[]; // Rôles requis pour accéder à cet élément
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Opérations",
    items: [
      { title: "Overview", url: "/overview", icon: LayoutDashboard },
      { title: "Messages", url: "/messages", icon: Mail },
    ],
  },
  {
    label: "Données",
    items: [
      {
        title: "Users",
        url: "/users",
        icon: Users,
        roles: [UserRole.DIRECTEUR, UserRole.SUPERVISEUR, UserRole.CONTROLEUR],
      }, // Tout sauf AGENT
      { title: "Zones", url: "/zones", icon: MapPin },
      {
        title: "Variables",
        url: "/variables",
        icon: Database,
        roles: [UserRole.DIRECTEUR],
      },
    ],
  },
  {
    label: "Missions",
    items: [
      {
        title: "Affectations de zones",
        url: "/affectations-zones",
        icon: MapPin,
        roles: [UserRole.DIRECTEUR],
      },
      {
        title: "Assignations de quotas",
        url: "/quotas-assignments",
        icon: Target,
        roles: [UserRole.DIRECTEUR],
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Paramètres", url: "/user-settings", icon: Settings },
      {
        title: "Paramètres du site",
        url: "/app-settings",
        icon: Settings2,
        roles: [UserRole.DIRECTEUR],
      },
      { title: "Mon Profil", url: "/users/me", icon: UserCircle },
    ],
  },
];

export type NavGroupType = (typeof navGroups)[0];
export type NavItemType = (typeof navGroups)[0]["items"][0];
