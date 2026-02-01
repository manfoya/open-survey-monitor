"use client";

import { useState } from "react";
import CreateQuotaAssignmentForm from "./create-quota-assignment-form";
import { UserProfile } from "@/features/auth/types";
import { Quota } from "@/features/quotas/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Target, Plus } from "lucide-react";

interface CreateQuotaAssignmentDialogProps {
  users: UserProfile[];
  quotas: Quota[];
}

export default function CreateQuotaAssignmentDialog({
  users,
  quotas,
}: CreateQuotaAssignmentDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle assignation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assigner un quota</DialogTitle>
          <DialogDescription>
            Assignez un quota à un agent et définissez un objectif.
          </DialogDescription>
        </DialogHeader>
        <CreateQuotaAssignmentForm
          users={users}
          quotas={quotas}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
