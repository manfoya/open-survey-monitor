import { DashboardStats } from "@/features/dashboard/types";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateDashboardStats(): DashboardStats {
  const total_reçus = randomInt(1000, 2000);
  const total_valide = Math.floor(total_reçus * (randomInt(50, 70) / 100));
  const total_complet = total_valide + randomInt(50, 150); // Complets includes Valide + pending validation
  const total_refus = randomInt(20, 100);
  const total_suspect = randomInt(10, 80);
  const total_partiel = total_reçus - total_complet - total_refus;

  // Quotas names remain static for consistency, but stats vary
  const quotas = [
    { id: 1, nom: "Homme 18-34 ans", cible: 200 },
    { id: 2, nom: "Femme 18-34 ans", cible: 200 },
    { id: 3, nom: "Homme 35-54 ans", cible: 300 },
    { id: 4, nom: "Femme 35-54 ans", cible: 300 },
    { id: 5, nom: "Ruraux Global", cible: 500 },
  ];

  const progression_quotas = quotas.map((q) => {
    const fait = randomInt(
      Math.floor(q.cible * 0.2),
      Math.floor(q.cible * 1.1),
    );
    const pourcentage = (fait / q.cible) * 100;
    return {
      ...q,
      fait,
      pourcentage,
      est_atteint: pourcentage >= 100,
    };
  });

  const errorTypes = [
    "Incohérence Âge/Date Naissance",
    "Géolocalisation hors zone",
    "Durée d'entretien trop courte",
    "Saut de question invalide",
    "Manquant non justifié",
    "Numéro de téléphone invalide",
    "Signature manquante",
    "Photo floue",
  ];

  // Pick 3 to 6 random error types
  const shuffledErrors = errorTypes.sort(() => 0.5 - Math.random());
  const selectedErrors = shuffledErrors.slice(0, randomInt(3, 8));

  const repartition_erreurs: Record<string, number> = {};
  selectedErrors.forEach((err) => {
    repartition_erreurs[err] = randomInt(5, 60);
  });

  return {
    total_reçus,
    total_complet,
    total_partiel,
    total_refus,
    total_valide,
    total_suspect,
    progression_quotas,
    repartition_erreurs,
  };
}

export const MOCK_DASHBOARD_STATS_CONTROLLER: DashboardStats = {
  ...generateDashboardStats(),
  repartition_erreurs: null, // Force null for controller scenario
};
