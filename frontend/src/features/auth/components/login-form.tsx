"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useActionState, useEffect } from "react";
import { authenticate } from "../actions";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password-input";
import { useSearchParams } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(authenticate, {
    success: false,
    message: "",
  });
  
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || DEFAULT_LOGIN_REDIRECT;
  const sessionExpired = searchParams.get("sessionExpired");

  // Affichage d'un toast si la session a expiré
  useEffect(() => {
    if (sessionExpired) {
      toast.error("Votre session a expiré. Veuillez vous reconnecter.", { duration: 5000 });
    }
  }, [sessionExpired]);

  // Affichage des toasts en fonction de l'état de l'action
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        // On ne toast que si ce n'est pas une erreur de champ (pour éviter les doublons)
        if (!state.errors) toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Se connecter</CardTitle>
          <CardDescription>
            Entrez vos identifiants pour accéder au monitor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            
            <FieldGroup className="space-y-4">
              {/* Champ Username */}
              <div className="space-y-2">
                <FieldLabel htmlFor="username">Nom d&apos;utilisateur</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="user001"
                  required
                  defaultValue={state.data?.username} // Pré-remplissage ici
                  className={state.errors?.username ? "border-destructive" : ""}
                />
                {state.errors?.username && (
                  <p className="text-xs font-medium text-destructive">
                    {state.errors.username[0]}
                  </p>
                )}
              </div>

              {/* Champ Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                </div>
                <PasswordInput 
                  id="password" 
                  name="password" 
                  required 
                  className={state.errors?.password ? "border-destructive" : ""}
                />
                {state.errors?.password && (
                  <p className="text-xs font-medium text-destructive">
                    {state.errors.password[0]}
                  </p>
                )}
              </div>

              {/* Bouton de soumission */}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Vérification..." : "Se connecter"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}