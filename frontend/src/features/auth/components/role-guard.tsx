import { getMe } from "@/features/auth/services/auth";
import { UserRole } from "@/features/auth/types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
  fallback?: React.ReactNode;
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
