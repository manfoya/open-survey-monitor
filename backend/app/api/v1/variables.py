# backend/app/api/v1/variables.py

from typing  import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import cast, String, or_

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.users import User, RoleEnum
# Import des modèles
from app.models.dictionary import Variable, Modalite, VariableDataType
from app.models.quotas import Quota
# Import des schémas (Validation des données)
from app.schemas.dictionary import VariableCreate, VariableOut, VariableUpdate

from app.api.v1.pagination import (
    PaginatedResponse, 
    PaginationParams, 
    create_pagination_params,
    paginate_sqlalchemy_query
)

router = APIRouter()

# --------------------------------------------------------------------------
# 1. ZONE PUBLIQUE / CONFIGURATION (Pour le Frontend Query Builder)
# --------------------------------------------------------------------------

@router.get("/builder-config")
def get_query_builder_config(db: Session = Depends(get_db)):
    """
    Renvoie la configuration formatée pour React Query Builder.
    Utilisé par le Frontend pour générer les champs intelligemment.
    Ne renvoie QUE les variables marquées 'is_quota = True'.
    """
    variables = db.query(Variable).filter(Variable.is_quota == True).all()
    fields_config = []

    for var in variables:
        # Configuration de base
        field_def = {
            "name": var.slug,   # C'est l'ID technique (ex: q01_sexe)
            "label": var.label, # C'est le nom affiché (ex: Sexe du chef)
            "placeholder": var.ui_config.get("placeholder", "") if var.ui_config else "",
        }

        # Configuration spécifique par type de variable
        if var.data_type == VariableDataType.NUMBER:
            field_def["inputType"] = "number"
            if var.ui_config:
                # Injecte min, max, step s'ils existent dans la config
                field_def.update(var.ui_config)
                
        elif var.data_type == VariableDataType.LIST:
            field_def["inputType"] = "select"
            field_def["valueEditorType"] = "select"
            # On trie les options par l'ordre défini, ou par défaut
            field_def["values"] = [
                {"name": m.value, "label": m.label} 
                for m in sorted(var.modalites, key=lambda x: x.order or 0)
            ]
            
        elif var.data_type == VariableDataType.DATE:
            field_def["inputType"] = "date"
            
        elif var.data_type == VariableDataType.BOOLEAN:
            field_def["inputType"] = "checkbox"
            field_def["values"] = [{"name": "true", "label": "Oui"}, {"name": "false", "label": "Non"}]

        elif var.data_type == VariableDataType.TIME:
            field_def["inputType"] = "time"

        # Gestion des opérateurs exclus (ex: pas de ">" pour une ville)
        if var.excluded_operators:
             field_def["excludedOperators"] = var.excluded_operators

        fields_config.append(field_def)

    return fields_config


# --------------------------------------------------------------------------
# 2. ZONE ADMINISTRATION (CRUD Variables)
# --------------------------------------------------------------------------

def _get_settings_variable_slugs(db: Session) -> set:
    """Helper to find all variable slugs used in GlobalSettings"""
    from app.models.settings import GlobalSettings
    from app.models.quotas import Quota
    import json
    
    used_slugs = set()
    
    # Slugs from GlobalSettings
    settings = db.query(GlobalSettings).first()
    if settings:
        mapping_fields = [
            "variable_duree_start", "variable_duree_end",
            "variable_gps_lat", "variable_gps_lon",
            "variable_date_enquete", "variable_indicateur_partiel",
            "variable_id_interne", "variable_code_agent",
            "variable_heure_enquete"
        ]
        for field in mapping_fields:
            val = getattr(settings, field)
            if val:
                used_slugs.add(val)
            
    return used_slugs

@router.get("/all", response_model=List[VariableOut])
def read_all_variables(
    quota_only: bool = False,
    used_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lister TOUTES les variables (Sans pagination).
    Option ?quota_only=true pour ne voir que celles activées pour les quotas.
    Option ?used_only=true pour ne voir que celles utilisées dans les réglages ou quotas.
    """
    query = db.query(Variable)
    if quota_only:
        query = query.filter(Variable.is_quota == True)
    
    if used_only:
        used_slugs = _get_settings_variable_slugs(db)
        query = query.filter(or_(Variable.slug.in_(used_slugs), Variable.is_quota == True))
    
    # On trie par slug alphabétique pour que ce soit propre
    return query.order_by(Variable.slug).all()


@router.get("/", response_model=PaginatedResponse[VariableOut])
def read_variables(
    used_only: bool = False,
    quota_only: bool = False,
    pagination: PaginationParams = Depends(create_pagination_params),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lister les variables avec PAGINATION.
    
    Paramètres :
    - used_only: filtrer les variables utilisées uniquement
    - quota_only: filtrer les variables activables pour les quotas
    - page: numéro de page
    - size: taille de page
    - sort_by: champ de tri
    - search: recherche textuelle
    """
    query = db.query(Variable)
    
    if used_only:
        used_slugs = _get_settings_variable_slugs(db)
        query = query.filter(or_(Variable.slug.in_(used_slugs), Variable.is_quota == True))
        
    if quota_only:
        query = query.filter(Variable.is_quota == True)
        
    return paginate_sqlalchemy_query(
        query,
        pagination,
        allowed_sort_fields=["slug", "label", "id", "created_at"],
        search_fields=["slug", "label"],
        text_sort_fields=["slug", "label"]
    )


@router.post("/", response_model=VariableOut)
def create_variable(
    var_in: VariableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ajouter une nouvelle variable manuellement.
    Utile surtout pour le script automatique, mais accessible au Directeur.
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Réservé au Directeur.")

    # Vérifier si le slug existe déjà
    if db.query(Variable).filter(Variable.slug == var_in.slug).first():
        raise HTTPException(status_code=400, detail=f"La variable '{var_in.slug}' existe déjà.")

    # Création Variable
    new_var = Variable(
        slug=var_in.slug,
        label=var_in.label,
        data_type=var_in.data_type,
        is_quota=var_in.is_quota,
        ui_config=var_in.ui_config,
        excluded_operators=var_in.excluded_operators
    )
    db.add(new_var)
    db.commit()
    db.refresh(new_var)

    # Création des Modalités associées (si type LIST)
    if var_in.data_type == VariableDataType.LIST and var_in.modalites:
        for mod in var_in.modalites:
            new_mod = Modalite(
                variable_id=new_var.id,
                value=mod.value,
                label=mod.label,
                order=mod.order
            )
            db.add(new_mod)
        db.commit()
        db.refresh(new_var)

    return new_var


@router.get("/{variable_id}", response_model=VariableOut)
def read_variable_by_id(
    variable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer une seule variable via son ID.
    Accessble à tout utilisateur connecté.
    """
    var = db.query(Variable).filter(Variable.id == variable_id).first()
    if not var:
        raise HTTPException(status_code=404, detail="Variable introuvable")
    return var


@router.put("/{variable_id}", response_model=VariableOut)
def update_variable(
    variable_id: int,
    var_in: VariableUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Modifier une variable existante.
    CRUCIAL : Cette route NE permet PAS de modifier le 'slug' (identifiant technique).
    On s'en sert pour changer le Label (nom humain), activer is_quota, etc.
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Réservé au Directeur.")

    # 1. Récupérer la variable en base
    var_db = db.query(Variable).filter(Variable.id == variable_id).first()
    if not var_db:
        raise HTTPException(status_code=404, detail="Variable introuvable")

    # 2. Préparer les données de mise à jour
    # exclude_unset=True signifie qu'on ne touche qu'aux champs envoyés par le frontend
    update_data = var_in.model_dump(exclude_unset=True)
    
    # On retire 'modalites' du dictionnaire pour le traiter séparément
    modalites_in = update_data.pop("modalites", None)

    # Mise à jour des champs simples (Label, is_quota, ui_config...)
    for field, value in update_data.items():
        if hasattr(var_db, field):
            setattr(var_db, field, value)

    # 3. Mise à jour des Modalités (ex: Renommer "1" en "Homme")
    if modalites_in is not None and var_db.data_type == VariableDataType.LIST:
        # On charge les modalités existantes pour les modifier
        existing_mods = {m.value: m for m in var_db.modalites}
        
        for mod_data in modalites_in:
            val_cle = mod_data.get("value") # La valeur technique (ex: "1")
            
            if val_cle in existing_mods:
                # Si elle existe, on met à jour son label et son ordre
                existing_mod = existing_mods[val_cle]
                existing_mod.label = mod_data.get("label")
                if mod_data.get("order") is not None:
                    existing_mod.order = mod_data.get("order")
            else:
                # Optionnel : Créer une modalité si elle n'existe pas (rare ici, car géré par le script)
                pass

    db.commit()
    db.refresh(var_db)
    return var_db


@router.delete("/{variable_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_variable(
    variable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Supprimer une variable.
    SÉCURITÉ : Vérifie d'abord si elle est utilisée dans un Quota actif.
    Si oui, bloque la suppression.
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Réservé au Directeur.")
        
    var_db = db.query(Variable).filter(Variable.id == variable_id).first()
    if not var_db:
        raise HTTPException(status_code=404, detail="Variable introuvable")

    # --- VÉRIFICATION D'INTÉGRITÉ ---
    # On cherche si le slug de cette variable est mentionné dans le JSON de définition d'un quota
    slug_to_check = var_db.slug
    
    # Recherche texte brute dans le JSONB (compatible Postgres/SQLite pour le texte)
    quotas_using_var = db.query(Quota).filter(
        cast(Quota.definition, String).like(f'%"{slug_to_check}"%')
    ).first()

    if quotas_using_var:
        raise HTTPException(
            status_code=400, 
            detail=f"Impossible de supprimer '{var_db.label}'. Elle est utilisée par le quota '{quotas_using_var.description}'."
        )

    db.delete(var_db)
    db.commit()
    return None