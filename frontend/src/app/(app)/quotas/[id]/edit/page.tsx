import { getQuotaById } from "@/features/quotas/services";
import { getAllVariables } from "@/features/variables/services";
import UpdateQuotaForm from "@/features/quotas/components/update-quota-form";
import { notFound } from "next/navigation";
import PageHeader from "@/components/page-header";

export const dynamic = "force-dynamic";

interface EditQuotaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditQuotaPage({ params }: EditQuotaPageProps) {
  const { id } = await params;
  const quotaId = parseInt(id, 10);

  if (isNaN(quotaId)) {
    notFound();
  }

  // Fetch data in parallel
  const [quota, variables] = await Promise.all([
    getQuotaById(quotaId),
    getAllVariables(),
  ]);

  if (!quota) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <PageHeader
        title="Modifier le quota"
        description={`Modifiez les règles et paramètres du quota "${quota.description}".`}
        backHref={`/quotas/${quota.id}`}
      />

      <UpdateQuotaForm quota={quota} variables={variables} />
    </div>
  );
}
