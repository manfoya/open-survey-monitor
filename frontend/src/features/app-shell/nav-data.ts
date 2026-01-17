import {
  LayoutDashboard,
  Users,
  Settings,
  UserCircle,
  Settings2,
  MapPin,
} from "lucide-react";

export const navGroups = [
  {
    label: "Opérations",
    items: [
      { title: "Overview", url: "/overview", icon: LayoutDashboard },
      // { title: "Missions", url: "/missions", icon: ClipboardList },
      { title: "Zones", url: "/zones", icon: MapPin },
    ],
  },
  {
    label: "Données",
    items: [
      { title: "Users", url: "/users", icon: Users },
      // { title: "Dictionnaires", url: "/dictionaries", icon: BookA },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Paramètres", url: "/user-settings", icon: Settings },
      { title: "Paramètres du site", url: "app-settings", icon: Settings2 },
      { title: "Mon Profil", url: "/users/me", icon: UserCircle },
    ],
  },
];
