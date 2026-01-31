import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";
import { GlobalSettings } from "../../types";

interface CommunicationCardProps {
  defaultValues: GlobalSettings;
  disabled: boolean;
}

export function CommunicationCard({
  defaultValues,
  disabled,
}: CommunicationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-indigo-500" />
          Communication
        </CardTitle>
        <CardDescription>
          Message affiché sur le tableau de bord de tous les utilisateurs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="message_du_jour">Message du jour</Label>
          <textarea
            id="message_du_jour"
            name="message_du_jour"
            defaultValue={defaultValues.message_du_jour || ""}
            rows={4}
            disabled={disabled}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Entrez un message à afficher sur le tableau de bord..."
          />
          <div className="text-xs text-muted-foreground">
            Ce message sera affiché sur la page d&apos;accueil de tous les
            utilisateurs
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
