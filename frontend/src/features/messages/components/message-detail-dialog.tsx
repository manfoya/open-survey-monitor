"use client";

import { MessageOut } from "@/features/messages/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface MessageDetailDialogProps {
  message: MessageOut | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MessageDetailDialog({
  message,
  open,
  onOpenChange,
}: MessageDetailDialogProps) {
  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{message.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-8">De :</span>
                  <span className="font-medium text-foreground">
                    {message.sender_username}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8">À :</span>
                  <span className="font-medium text-foreground">
                    {message.recipient_name || message.target_role || "Tous"}
                  </span>
                </div>
              </div>
              <span className="text-xs mt-2">
                {new Intl.DateTimeFormat("fr-FR", {
                  dateStyle: "full",
                  timeStyle: "short",
                }).format(new Date(message.created_at))}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 markdown-preview text-sm">
          <div dangerouslySetInnerHTML={{ __html: message.content }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
