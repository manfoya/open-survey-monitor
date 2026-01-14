import { getMe, UserRole } from "@/features/auth/services/auth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
  fallback?: React.ReactNode; // Ce qu'on affiche si pas autorisé (ex: un message ou rien)
}

export async function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
  const user = await getMe();

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
