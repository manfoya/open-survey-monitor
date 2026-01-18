import { getMe } from "@/features/auth/services/auth";
import { UserRole, UserProfile } from "@/features/auth/types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

interface ClientRoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
  fallback?: React.ReactNode;
  user: UserProfile | null;
}

// Server Component version (async)
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

// Client Component version (uses passed user data)
export function ClientRoleGuard({
  children,
  allowedRoles,
  fallback = null,
  user,
}: ClientRoleGuardProps) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
