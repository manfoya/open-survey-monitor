import { getSurveys } from "@/features/dashboard/services";
import { SurveysDataTable } from "@/features/dashboard/components/surveys-data-table";
import PageHeader from "@/components/page-header";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  searchParams: {
    page?: string;
    size?: string;
    sort_by?: string;
    sort_order?: string;
    search?: string;
  };
}

export default function Page({ searchParams }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Liste des enquêtes"
        description="Consultez et gérez l'ensemble des enquêtes collectées sur le terrain."
      />
      <div className="mt-6">
        <Suspense fallback={<TableSkeleton />}>
          <SurveyListPageContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function SurveyListPageContent({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || "1");
  const size = parseInt(searchParams.size || "50");
  const sort_order = (searchParams.sort_order as "asc" | "desc") || "asc";

  const data = await getSurveys({ page, size, sort_order });

  if (!data) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
        Impossible de charger les enquêtes. Veuillez vérifier votre connexion ou réessayer plus tard.
      </div>
    );
  }

  return <SurveysDataTable paginatedSurveys={data} />;
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
