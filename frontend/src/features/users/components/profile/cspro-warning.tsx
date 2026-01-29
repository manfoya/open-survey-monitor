import { ShieldCheck } from "lucide-react";

export function CsproWarning() {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4 rounded-lg flex gap-3">
      <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
        Votre <strong>Code CSPro</strong> est requis pour la synchronisation des
        données sur tablette. Si ce code ne correspond pas à votre matériel,
        contactez votre supérieur.
      </p>
    </div>
  );
}
