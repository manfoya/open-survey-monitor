"use client";

import {
  useState,
  useEffect,
  useMemo,
  useActionState,
  useCallback,
} from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  RefreshCw,
  Check,
  ChevronsUpDown,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Assure-toi que les chemins d'import correspondent à ton projet
import { UserProfile } from "@/features/auth/types";
import { getAllSubordinates } from "@/features/users/services";
import { updateUserAction } from "@/features/users/actions/update-user-action";
import {
  filterEligibleChefs,
  getRequiredChefRoleLabel,
} from "./create-user-form";
import { errorDiv } from "@/features/app-shell/components/utils";

interface UpdateUserFormProps {
  user: UserProfile;
  canChangeChef: boolean;
  onSuccess?: () => void;
}

export default function UpdateUserForm({
  user,
  canChangeChef,
  onSuccess,
}: UpdateUserFormProps) {
  // Initialisation des états
  // On convertit en string pour la gestion des inputs/selects
  const [selectedChef, setSelectedChef] = useState<string>(
    user.chef_id ? user.chef_id.toString() : "",
  );
  const [openCombobox, setOpenCombobox] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]); // subordonnés
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Binding du Server Action
  // On lie l'ID de l'utilisateur à la fonction d'update
  const updateUserWithId = updateUserAction.bind(null, user.id);
  const [state, formAction, isPending] = useActionState(updateUserWithId, {
    success: false,
  });

  // Chargement des utilisateurs (nécessaire pour choisir le chef)
  const loadUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const fetchedUsers = await getAllSubordinates();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Erreur chargement users:", error);
      toast.error("Impossible de charger la liste des responsables");
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filtrage hiérarchique
  const eligibleChefs = useMemo(() => {
    return filterEligibleChefs(user.role, users);
  }, [user.role, users]);

  // Gestion du succès
  useEffect(() => {
    if (state.success) {
      toast.success("Utilisateur mis à jour avec succès");
      if (onSuccess) onSuccess();
    }
  }, [state.success, onSuccess]);

  // Nom du rôle supérieur requis
  const requiredRoleLabel = getRequiredChefRoleLabel(user.role);

  // Nom du chef actuel (utile pour l'affichage read-only ou dans la combobox)
  const currentChefName = useMemo(() => {
    if (!selectedChef) return null;
    return (
      users.find((u) => u.id.toString() === selectedChef)?.username ||
      "Inconnu (ID invalide)"
    );
  }, [selectedChef, users]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Messages d'erreur globaux */}
      {state.message && !state.success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Inputs cachés essentiels */}
      {/* Important : Même si le chef n'est pas modifiable, on envoie sa valeur actuelle */}
      <input type="hidden" name="chef_id" value={selectedChef} />

      <div className="grid grid-cols-1 gap-6">
        {/* INFO CONTEXTE (Read-Only) */}
        <div className="p-4 bg-muted/50 rounded-md text-sm flex items-center justify-between border">
          <div className="space-y-1">
            <p className="text-muted-foreground">Rôle actuel</p>
            <p className="font-semibold capitalize">{user.role}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-muted-foreground">Code CSPro</p>
            <p className="font-mono font-medium">{user.cspro_code ?? "—"}</p>
          </div>
        </div>

        {/* USERNAME */}
        <div className="space-y-2">
          <Label htmlFor="username">Nom d&apos;utilisateur</Label>
          <Input
            id="username"
            name="username"
            placeholder="ex: kavol_dash"
            disabled={isPending}
            defaultValue={state.data?.username || user.username}
            className={state.errors?.username ? "border-red-500" : ""}
          />
          {errorDiv(state.errors?.username)}
        </div>

        {/* SECTION CHEF (Conditionnelle) */}
        <div className="space-y-2 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <Label className="flex items-center gap-2">
              Responsable ({requiredRoleLabel})
              {!canChangeChef && (
                <Lock className="h-3 w-3 text-muted-foreground" />
              )}
            </Label>

            {/* Bouton refresh visible uniquement si on peut modifier */}
            {canChangeChef && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={loadUsers}
                disabled={isPending || isLoadingUsers}
                className="h-6 w-6 p-0"
              >
                <RefreshCw
                  className={cn("h-3 w-3", isLoadingUsers && "animate-spin")}
                />
              </Button>
            )}
          </div>

          {canChangeChef ? (
            /* --- MODE ÉDITION (Combobox) --- */
            <>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    disabled={
                      isPending || isLoadingUsers || eligibleChefs.length === 0
                    }
                    className={cn(
                      "w-full justify-between font-normal",
                      !selectedChef && "text-muted-foreground",
                      state.errors?.chef_id && "border-red-500",
                    )}
                  >
                    {isLoadingUsers
                      ? "Chargement..."
                      : currentChefName || "Sélectionner un responsable..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Rechercher..." />
                    <CommandList>
                      <CommandEmpty>Aucun résultat.</CommandEmpty>
                      <CommandGroup>
                        {eligibleChefs.map((chef) => (
                          <CommandItem
                            key={chef.id}
                            value={chef.username}
                            onSelect={() => {
                              setSelectedChef(chef.id.toString());
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedChef === chef.id.toString()
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{chef.username}</span>
                              <span className="text-[10px] text-muted-foreground uppercase">
                                {chef.role}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {eligibleChefs.length === 0 && !isLoadingUsers && (
                <p className="text-[10px] text-amber-600">
                  Aucun responsable éligible trouvé.
                </p>
              )}
            </>
          ) : (
            /* --- MODE LECTURE SEULE --- */
            <div className="relative">
              <Input
                disabled
                value={
                  isLoadingUsers
                    ? "Chargement..."
                    : currentChefName || "Aucun chef assigné"
                }
                className="bg-muted text-muted-foreground opacity-100" // Opacity pour lisibilité
              />
              {/* On ajoute un hint pour expliquer pourquoi c'est bloqué */}
              <p className="text-[10px] text-muted-foreground mt-1">
                Le changement de hiérarchie n&apos;est pas autorisé pour ce
                profil.
              </p>
            </div>
          )}

          {errorDiv(state.errors?.chef_id)}
        </div>

        {/* PASSWORD (Optionnel) */}
        <div className="space-y-2">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Laisser vide pour conserver l'actuel"
            disabled={isPending}
            className={state.errors?.password ? "border-red-500" : ""}
          />
          {errorDiv(state.errors?.password)}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onSuccess && (
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isPending}
          >
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
