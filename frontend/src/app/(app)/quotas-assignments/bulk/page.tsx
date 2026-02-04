import { Suspense } from "react";
import { getFieldWorkers } from "@/features/users/services";
import { getQuotas } from "@/features/quotas/services";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import BulkQuotaAssignmentForm from "@/features/quotas-assignments/components/bulk-quota-assignment-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function BulkAssignmentPage() {
  const [users, quotas] = await Promise.all([getFieldWorkers(), getQuotas()]);

  return (
    <RoleGuard allowedRoles={[UserRole.DIRECTEUR]}>
      <div className="container mx-auto py-6">
        <Suspense fallback={<div>Chargement du formulaire...</div>}>
          <BulkQuotaAssignmentForm users={users} quotas={quotas} />
        </Suspense>
      </div>
    </RoleGuard>
  );
}
