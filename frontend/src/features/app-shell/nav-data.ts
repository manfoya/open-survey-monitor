import {
  LayoutDashboard,
  UserSearch,
  Users,
  MapPin,
  ClipboardList,
  BookA,
  Settings,
  UserCircle,
} from "lucide-react";

export const navGroups = [
  {
    label: "Opérations",
    items: [
      { title: "Overview", url: "/overview", icon: LayoutDashboard },
      { title: "Missions", url: "/missions", icon: ClipboardList },
      { title: "Zones", url: "/zones", icon: MapPin },
    ],
  },
  {
    label: "Données",
    items: [
      { title: "Recherche", url: "/users/search", icon: UserSearch },
      { title: "Users", url: "/users", icon: Users },
      { title: "Dictionnaires", url: "/dictionaries", icon: BookA },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Paramètres", url: "/settings", icon: Settings },
      { title: "Mon Profil", url: "/users/me", icon: UserCircle },
    ],
  },
];
