"use client";

import { useState, useMemo } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, UserCog, Hash, Shield, Briefcase } from "lucide-react";
import { UserProfile } from "@/features/auth/services/auth";

// Helper pour les couleurs des badges de rôle
const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "directeur": return "bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200"; // Violet
    case "superviseur": return "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"; // Bleu
    case "controleur": return "bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200"; // Orange
    case "agent": return "bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200"; // Gris
    default: return "";
  }
};

interface UsersDataTableProps {
  initialUsers: UserProfile[];
}

export function UsersDataTable({ initialUsers }: UsersDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Logique de filtrage en temps réel
  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      // 1. Filtre Texte (Username ou CSPro)
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.cspro_code &&user.cspro_code.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Filtre Rôle
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [initialUsers, searchTerm, roleFilter]);

  // Fonction pour trouver le nom du chef
  const getChefName = (chefId: number | null) => {
    if (!chefId) return "-";
    // On cherche dans la liste complète initiale
    const chef = null //! getUserById(chefId);
    return chef ? "chef.username" : "Chef (ID: " + chefId + ")";
  };

  return (
    <div className="space-y-4">
      {/* BARRE D'OUTILS (Recherche + Filtre) */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filtrer par rôle" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="agent">Agents</SelectItem>
            <SelectItem value="controleur">Contrôleurs</SelectItem>
            <SelectItem value="superviseur">Superviseurs</SelectItem>
            <SelectItem value="directeur">Directeurs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLEAU DE RÉSULTATS */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[200px]">Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Code CSPro</TableHead>
              <TableHead>Responsable (Chef)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                      {user.username}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} capitalize`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                      <Hash className="h-3 w-3" />
                      {user.cspro_code}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      {user.chef_id ? (
                        <>
                          <Shield className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {getChefName(user.chef_id as number)}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground/50 italic text-xs">Aucun</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Aucun résultat trouvé pour &quot;{searchTerm}&quot;
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-xs text-muted-foreground text-right">
        Affichage de {filteredUsers.length} sur {initialUsers.length} utilisateur(s)
      </div>
    </div>
  );
}