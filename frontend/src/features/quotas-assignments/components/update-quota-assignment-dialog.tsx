"use client";

import { useState } from "react";
import UpdateQuotaAssignmentForm from "./update-quota-assignment-form";
import { QuotaAssignment } from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Edit } from "lucide-react";

interface UpdateQuotaAssignmentDialogProps {
  assignment: QuotaAssignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateQuotaAssignmentDialog({
  assignment,
  open,
  onOpenChange,
}: UpdateQuotaAssignmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;assignation</DialogTitle>
          <DialogDescription>
            Modifiez les objectifs et le statut de cette assignation.
          </DialogDescription>
        </DialogHeader>
        <UpdateQuotaAssignmentForm
          assignment={assignment}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
