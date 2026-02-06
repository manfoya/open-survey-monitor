import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SurveyPoint } from "../types";

export const SurveyMapPopup = ({ point }: { point: SurveyPoint }) => {
  return (
    <div className="p-2 text-center text-sm">
      <div className="mb-1">
        Enquête de <span className="font-bold">{point.agent}</span> le{" "}
        {format(new Date(point.date), "dd/MM/yyyy", { locale: fr })}
      </div>
      <div
        className={
          point.is_valid ? "text-green-600 font-bold" : "text-red-600 font-bold"
        }
      >
        {point.is_valid ? "VALIDE" : "SUSPECT"}
      </div>
    </div>
  );
};
