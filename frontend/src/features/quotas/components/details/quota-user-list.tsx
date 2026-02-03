import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuotaAssignment } from "@/features/quotas-assignments/types";
import Link from "next/link";

interface QuotaUserListProps {
  userQuotas: QuotaAssignment[];
}

export default function QuotaUserList({ userQuotas }: QuotaUserListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suivi par Enquêteur</CardTitle>
      </CardHeader>
      <CardContent>
        {userQuotas && userQuotas.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Enquêteur</TableHead>
                <TableHead>Réalisé</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead className="w-[200px]">Progression</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userQuotas.map((uq: QuotaAssignment) => (
                <TableRow key={uq.user_id}>
                  <TableCell>{uq.user.id}</TableCell>
                  <TableCell className="font-medium">
                    <Link
                      className="hover:underline"
                      href={`/users/${uq.user.id}`}
                    >
                      {uq.user.username}
                    </Link>
                  </TableCell>
                  <TableCell>{uq.effectif_actuel}</TableCell>
                  <TableCell>{uq.effectif_cible}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={Math.round(uq.taux_completion)}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs w-8 text-right">
                        {Math.round(uq.taux_completion)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucune donnée de suivi par enquêteur disponible.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
