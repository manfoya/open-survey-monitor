"use client";

import { useState } from "react";
import UpdateQuotaAssignmentDialog from "./update-quota-assignment-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { QuotaAssignment } from "../types";
import { ClientRoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import { useCurrentUser } from "@/features/auth/contexts/user-context";
import DeleteQuotaAssignmentForm from "./delete-quota-assignment-form";

interface QuotaAssignmentActionsDropdownProps {
  assignment: QuotaAssignment;
}

export default function QuotaAssignmentActionsDropdown({
  assignment,
}: QuotaAssignmentActionsDropdownProps) {
  const user = useCurrentUser();
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  return (
    <>
      <UpdateQuotaAssignmentDialog
        assignment={assignment}
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
      />
      <ClientRoleGuard allowedRoles={[UserRole.DIRECTEUR]} user={user}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsUpdateOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <DeleteQuotaAssignmentForm
                assignmentId={assignment.id}
                className="w-full"
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ClientRoleGuard>
    </>
  );
}
