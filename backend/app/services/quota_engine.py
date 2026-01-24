import operator
from typing import Dict, Any, List

class QuotaEngine:
    """
    Moteur d'évaluation des règles de quotas.
    Compatible avec le format standard React Query Builder.
    """

    # Mapping des opérateurs String -> Fonctions Python
    OPERATORS = {
        "=": operator.eq,
        "!=": operator.ne,
        "<": operator.lt,
        "<=": operator.le,
        ">": operator.gt,
        ">=": operator.ge,
        "in": lambda val, lst: str(val) in [str(x) for x in (lst if isinstance(lst, list) else [lst])],
        "notIn": lambda val, lst: str(val) not in [str(x) for x in (lst if isinstance(lst, list) else [lst])],
        "contains": lambda val, sub: str(sub).lower() in str(val).lower(),
        "beginsWith": lambda val, sub: str(val).lower().startswith(str(sub).lower()),
        "null": lambda val, _: val is None or val == "",
        "notNull": lambda val, _: val is not None and val != "",
    }

    @classmethod
    def check(cls, definition: Dict[str, Any], survey_data: Dict[str, Any]) -> bool:
        """
        Vérifie si les données d'enquête (survey_data) correspondent à la définition du quota.
        """
        if not definition or "rules" not in definition:
            return True # Pas de règles = Tout passe (ou False selon politique)

        return cls._evaluate_group(definition, survey_data)

    @classmethod
    def _evaluate_group(cls, group: Dict[str, Any], data: Dict[str, Any]) -> bool:
        combinator = group.get("combinator", "and").lower()
        rules = group.get("rules", [])
        
        results = []
        for rule in rules:
            # Détection : est-ce un sous-groupe ou une règle feuille ?
            if "combinator" in rule or "rules" in rule:
                results.append(cls._evaluate_group(rule, data))
            else:
                results.append(cls._evaluate_rule(rule, data))

        if combinator == "or":
            return any(results)
        return all(results)

    @classmethod
    def _evaluate_rule(cls, rule: Dict[str, Any], data: Dict[str, Any]) -> bool:
        field = rule.get("field")
        op_key = rule.get("operator")
        target_val = rule.get("value")

        # Récupération de la valeur utilisateur (Safe get)
        user_val = data.get(field)

        # Gestion spéciale pour null/notNull qui n'ont pas besoin de valeur cible
        if op_key in ["null", "notNull"]:
            return cls.OPERATORS[op_key](user_val, None)

        if user_val is None:
            return False # Donnée manquante = critère non rempli

        op_func = cls.OPERATORS.get(op_key)
        if not op_func:
            return False

        # --- TYPAGE DYNAMIQUE ---
        # Essayer de convertir en nombres si l'opérateur est mathématique
        if op_key in ["<", "<=", ">", ">="]:
            try:
                return op_func(float(user_val), float(target_val))
            except (ValueError, TypeError):
                return False # Impossible de comparer mathématiquement

        # Comparaison par défaut (String ou Egalité stricte)
        # On cast en string pour éviter les problèmes "1" vs 1
        if op_key in ["=", "!=", "in", "notIn"]:
             # Note: pour =, on pourrait tenter le float aussi si pertinent
             return op_func(str(user_val), str(target_val))
             
        return op_func(user_val, target_val)