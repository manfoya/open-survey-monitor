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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { UserProfile } from "@/features/auth/types";
import { getSubordinates } from "@/features/users/services";
import {
  createUserAction,
  CreateUserState,
} from "@/features/users/actions/create-user-action";
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { errorDiv } from "@/features/app-shell/components/utils";

// Mapping des poids pour la hiérarchie stricte
export const ROLE_WEIGHTS: Record<string, number> = {
  agent: 1,
  controleur: 2,
  superviseur: 3,
  directeur: 4,
};

// Rôles créables (Directeur exclu)
export const ASSIGNABLE_ROLES = [
  { value: "agent", label: "Agent Enquêteur" },
  { value: "controleur", label: "Contrôleur" },
  { value: "superviseur", label: "Superviseur" },
] as const;

export function getRequiredChefRoleLabel(targetRole: string): string {
  switch (targetRole) {
    case "agent":
      return "Contrôleur";
    case "controleur":
      return "Superviseur";
    case "superviseur":
      return "Directeur";
    default:
      return "Supérieur";
  }
}

export function filterEligibleChefs(
  targetRole: string,
  users: UserProfile[],
): UserProfile[] {
  const targetWeight = ROLE_WEIGHTS[targetRole] || 0;
  const requiredChefWeight = targetWeight + 1;
  return users.filter((user) => ROLE_WEIGHTS[user.role] === requiredChefWeight);
}

export default function CreateUserForm() {
  const [targetRole, setTargetRole] = useState<string>("agent");
  const [selectedChef, setSelectedChef] = useState<string>("");
  const [openCombobox, setOpenCombobox] = useState(false); // État pour ouvrir/fermer la combobox

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [formKey, setFormKey] = useState(0);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      setUsersError(null);
      const fetchedUsers = await getSubordinates();
      setUsers(fetchedUsers);
    } catch (error) {
      setUsersError("Erreur lors du chargement des utilisateurs");
      console.error("Erreur:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const eligibleChefs = useMemo(() => {
    return filterEligibleChefs(targetRole, users);
  }, [targetRole, users]);

  useEffect(() => {
    if (
      selectedChef &&
      !eligibleChefs.some((chef) => chef.id.toString() === selectedChef)
    ) {
      setSelectedChef("");
    }
  }, [eligibleChefs, selectedChef]);

  const [state, formAction, isPending] = useActionState(createUserAction, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      setTargetRole("agent");
      setSelectedChef("");
      setFormKey((prev) => prev + 1);
      toast.success("Utilisateur créé avec succès !");
    }
  }, [state.success]);

  const requiredRoleLabel = getRequiredChefRoleLabel(targetRole);

  return (
    <form key={formKey} className="space-y-6" action={formAction}>
      {alertMessage(state)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CHOIX DU RÔLE */}
        <div className="space-y-2">
          <Label htmlFor="role">Rôle à créer</Label>
          <Select
            name="role"
            value={targetRole}
            onValueChange={setTargetRole}
            disabled={isPending}
          >
            <SelectTrigger id="role" aria-invalid={!!state.errors?.role}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNABLE_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground">
            Hiérarchie :{" "}
            {targetRole === "agent"
              ? "Bas de l'échelle"
              : "Niveau intermédiaire"}
          </div>
          {errorDiv(state.errors?.role)}
        </div>

        {/* CHOIX DU CHEF (COMBOBOX AVEC RECHERCHE) */}
        <div className="space-y-2 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="chef_trigger">
              Responsable ({requiredRoleLabel})
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadUsers}
              disabled={isPending || isLoadingUsers}
              className="h-6 px-2 text-xs"
              title="Actualiser la liste"
            >
              <RefreshCw
                className={`h-3 w-3 ${isLoadingUsers ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Input caché pour envoyer la valeur au serveur */}
          <input type="hidden" name="chef_id" value={selectedChef} />

          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <Button
                id="chef_trigger"
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                disabled={
                  isPending || isLoadingUsers || eligibleChefs.length === 0
                }
                className={cn(
                  "w-full justify-between font-normal",
                  !selectedChef && "text-muted-foreground",
                  !!state.errors?.chef_id && "border-red-500", // Style d'erreur visuel
                )}
              >
                {selectedChef
                  ? eligibleChefs.find(
                      (chef) => chef.id.toString() === selectedChef,
                    )?.username
                  : isLoadingUsers
                    ? "Chargement..."
                    : eligibleChefs.length === 0
                      ? `Aucun ${requiredRoleLabel} dispo`
                      : "Sélectionner un responsable..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput
                  placeholder={`Rechercher un ${requiredRoleLabel}...`}
                />
                <CommandList>
                  <CommandEmpty>Aucun responsable trouvé.</CommandEmpty>
                  <CommandGroup>
                    {eligibleChefs.map((chef) => (
                      <CommandItem
                        key={chef.id}
                        value={chef.username} // C'est sur cette valeur que la recherche se fait
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

          {/* Messages d'aide contextuels */}
          {!isLoadingUsers && !usersError && eligibleChefs.length === 0 && (
            <p className="text-xs text-amber-600 font-medium mt-1">
              Aucun <strong>{requiredRoleLabel}</strong> n&apos;a été trouvé
              pour encadrer ce rôle.
            </p>
          )}

          {usersError && (
            <p className="text-xs text-red-600 mt-1">{usersError}</p>
          )}

          {errorDiv(state.errors?.chef_id)}
        </div>
      </div>

      {/* RESTE DU FORMULAIRE (Username, Code, Password) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            placeholder="ex: kavol_dash"
            disabled={isPending}
            defaultValue={state.data?.username}
            aria-invalid={!!state.errors?.username}
          />
          {errorDiv(state.errors?.username)}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cspro_code">Code CSPro</Label>
          <Input
            id="cspro_code"
            name="cspro_code"
            placeholder="ex: 101"
            defaultValue={state.data?.cspro_code?.toString()}
            disabled={isPending}
            aria-invalid={!!state.errors?.cspro_code}
          />
          {errorDiv(state.errors?.cspro_code)}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe temporaire</Label>
        <Input
          id="password"
          name="password"
          type="password"
          disabled={isPending}
          aria-invalid={!!state.errors?.password}
        />
        {errorDiv(state.errors?.password)}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || isLoadingUsers}
      >
        {isPending ? "Création en cours..." : "Créer l'utilisateur"}
      </Button>
    </form>
  );
}

function alertMessage(state: CreateUserState) {
  return (
    <>
      {state.message && !state.success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.success && (
        <Alert className="border-green-600/50 text-green-600 dark:border-green-500 dark:text-green-500 [&>svg]:text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Succès</AlertTitle>
          <AlertDescription>
            Utilisateur créé avec succès ! Le formulaire a été réinitialisé.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
