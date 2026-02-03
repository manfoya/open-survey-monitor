import { LoginForm } from "@/features/auth/components/login-form";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous pour accéder au tableau de bord.",
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Chargement du formulaire...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
