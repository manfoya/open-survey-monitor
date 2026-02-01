import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Eye } from "lucide-react";
import { CreateVariableDataType } from "../../types";

export default function JSONPreview({
  data,
}: {
  data: CreateVariableDataType;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Aperçu JSON (Données envoyées)
        </CardTitle>
        <CardDescription>
          Structure des données qui seront envoyées au serveur
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted/50 p-4 rounded-lg text-xs overflow-x-auto font-mono!important">
          {JSON.stringify(data, null, 4)}
        </pre>
      </CardContent>
    </Card>
  );
}
