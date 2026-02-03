import { OverviewMap } from "@/features/dashboard/components/overview-map";
import { getSurveysPoints } from "@/features/dashboard/services";
import { Suspense } from "react";

export default async function Page() {
  return <Suspense fallback={<div>Loading...</div>}>
    <PageAsync />
  </Suspense>;
}

export async function PageAsync() {
  const surveys = await getSurveysPoints();
  return <OverviewMap points={surveys || []} />;
}
