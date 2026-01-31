"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
import { UserRole } from "@/features/auth/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { sendMessageAction } from "@/features/messages/actions/send-message-action";
import { CreateMessageValues } from "@/features/messages/schemas/message-schema";
import { UserSelector } from "./user-selector";
import { getAllSubordinates } from "@/features/users/services";
import { UserProfile } from "@/features/auth/types";
import { markdownToHtml } from "@/lib/markdown";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NewMessageFormProps {
  onSuccess?: () => void;
}

export function NewMessageForm({ onSuccess }: NewMessageFormProps) {
  const [isPending, startTransition] = useTransition();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState<"all" | "role" | "user">("all");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [targetUserId, setTargetUserId] = useState("");

  // User selection state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Server Action State
  const [state, action] = useActionState(sendMessageAction, {
    success: false,
  });

  useEffect(() => {
    if (targetType === "user" && users.length === 0) {
      setLoadingUsers(true);
      getAllSubordinates()
        .then(setUsers)
        .finally(() => setLoadingUsers(false));
    }
  }, [targetType, users.length]);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Message envoyé avec succès.");
      // Reset form
      setTitle("");
      setContent("");
      setTargetType("all");
      setSelectedRole(null);
      setTargetUserId("");

      if (onSuccess) onSuccess();
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state.success, state.message, onSuccess]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic client-side validation for UX
    if (!title.trim() || !content.trim()) {
      toast.error("Veuillez remplir le titre et le contenu.");
      return;
    }

    if (targetType === "role" && !selectedRole) {
      toast.error("Veuillez sélectionner un rôle.");
      return;
    }

    if (targetType === "user" && !targetUserId) {
      toast.error("Veuillez sélectionner un utilisateur.");
      return;
    }

    // Convert Markdown to HTML before sending
    // We treat the conversion as part of the submission process
    startTransition(async () => {
      try {
        const htmlContent = await markdownToHtml(content);

        const payload: CreateMessageValues = {
          title,
          content: htmlContent,
          target_role: targetType === "role" ? selectedRole : null,
          target_user_id: targetType === "user" ? parseInt(targetUserId) : null,
        };

        action(payload);
      } catch (error) {
        toast.error("Erreur lors de la préparation du message.");
      }
    });
  };

  return (
    <Card className="w-full bg-transparent border-none">
      <CardHeader>
        <CardTitle>Nouveau Message</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              placeholder="Sujet du message"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              required
              aria-invalid={!!state.errors?.title}
            />
            {state.errors?.title && (
              <p className="text-xs text-red-500">{state.errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Destinataire</Label>
            <div className="flex gap-4 mb-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="target-all"
                  name="targetType"
                  value="all"
                  checked={targetType === "all"}
                  onChange={() => setTargetType("all")}
                  className="h-4 w-4"
                />
                <Label
                  htmlFor="target-all"
                  className="cursor-pointer font-normal"
                >
                  Tout le monde
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="target-role"
                  name="targetType"
                  value="role"
                  checked={targetType === "role"}
                  onChange={() => setTargetType("role")}
                  className="h-4 w-4"
                />
                <Label
                  htmlFor="target-role"
                  className="cursor-pointer font-normal"
                >
                  Par rôle
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="target-user"
                  name="targetType"
                  value="user"
                  checked={targetType === "user"}
                  onChange={() => setTargetType("user")}
                  className="h-4 w-4"
                />
                <Label
                  htmlFor="target-user"
                  className="cursor-pointer font-normal"
                >
                  Utilisateur spécifique
                </Label>
              </div>
            </div>

            {targetType === "role" && (
              <div className="space-y-1">
                <Select
                  value={selectedRole || ""}
                  onValueChange={(val: UserRole) => setSelectedRole(val)}
                  disabled={isPending}
                >
                  <SelectTrigger aria-invalid={!!state.errors?.target_role}>
                    <SelectValue placeholder="Choisir un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserRole)
                      .filter((r) => r !== UserRole.DIRECTEUR)
                      .map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {state.errors?.target_role && (
                  <p className="text-xs text-red-500">
                    {state.errors.target_role}
                  </p>
                )}
              </div>
            )}

            {targetType === "user" && (
              <div className="space-y-1">
                <UserSelector
                  users={users}
                  value={targetUserId}
                  onChange={setTargetUserId}
                  loading={loadingUsers || isPending}
                />
                {state.errors?.target_user_id && (
                  <p className="text-xs text-red-500">
                    {state.errors.target_user_id}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="content">Message</Label>
              <span className="text-xs text-muted-foreground">
                Markdown supporté
              </span>
            </div>
            <Textarea
              id="content"
              placeholder="Contenu de votre message (Markdown supporté)..."
              className="min-h-[250px] font-mono text-sm resize-y custom-scrollbar"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
              required
              aria-invalid={!!state.errors?.content}
            />
            {state.errors?.content && (
              <p className="text-xs text-red-500">{state.errors.content}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Envoyer le message
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
