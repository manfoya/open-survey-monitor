import { getMe } from "@/features/auth/services/auth";
import { UserRole, UserProfile } from "@/features/auth/types";
import { useCurrentUser } from "@/features/auth/contexts/user-context";

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

// Hook personnalisé pour simplifier l'utilisation avec le Context
export function useRoleGuard() {
  const currentUser = useCurrentUser();
  
  const hasRole = (allowedRoles: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return roles.includes(currentUser.role);
  };

  const RoleGuard = ({ 
    children, 
    allowedRoles, 
    fallback = null 
  }: {
    children: React.ReactNode;
    allowedRoles: UserRole | UserRole[];
    fallback?: React.ReactNode;
  }) => {
    return hasRole(allowedRoles) ? <>{children}</> : <>{fallback}</>;
  };

  return { hasRole, RoleGuard, currentUser };
}
