from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import cast, String

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.users import User, RoleEnum
# Imports des NOUVEAUX modèles
from app.models.dictionary import Variable, Modalite, VariableDataType
from app.models.quotas import Quota
# Imports des NOUVEAUX schémas
from app.schemas.dictionary import VariableCreate, VariableOut

router = APIRouter()

# --------------------------------------------------------------------------
# 1. ZONE PUBLIQUE / CONFIGURATION (Pour le Frontend Query Builder)
# --------------------------------------------------------------------------

@router.get("/builder-config")
def get_query_builder_config(db: Session = Depends(get_db)):
    """
    Renvoie la configuration formatée pour React Query Builder.
    Utilisé par le Frontend pour générer les champs intelligemment.
    """
    variables = db.query(Variable).filter(Variable.is_quota == True).all()
    fields_config = []

    for var in variables:
        # Base
        field_def = {
            "name": var.slug,
            "label": var.label,
            "placeholder": var.ui_config.get("placeholder", "") if var.ui_config else "",
        }

        # Configuration spécifique par type
        if var.data_type == VariableDataType.NUMBER:
            field_def["inputType"] = "number"
            if var.ui_config:
                # Injecte min, max, step s'ils existent
                field_def.update(var.ui_config)
                
        elif var.data_type == VariableDataType.LIST:
            field_def["inputType"] = "select"
            field_def["valueEditorType"] = "select"
            field_def["values"] = [
                {"name": m.value, "label": m.label} 
                for m in sorted(var.modalites, key=lambda x: x.order or 0)
            ]
            
        elif var.data_type == VariableDataType.DATE:
            field_def["inputType"] = "date"
            
        elif var.data_type == VariableDataType.BOOLEAN:
            field_def["inputType"] = "checkbox"
            field_def["values"] = [{"name": "true", "label": "Oui"}, {"name": "false", "label": "Non"}]

        # Gestion des opérateurs exclus
        if var.excluded_operators:
             # Note: Le frontend devra filtrer sa liste d'opérateurs par défaut 
             # en fonction de cette liste (ou tu peux renvoyer la liste explicite ici)
             field_def["excludedOperators"] = var.excluded_operators

        fields_config.append(field_def)

    return fields_config


# --------------------------------------------------------------------------
# 2. ZONE ADMINISTRATION (CRUD Variables)
# --------------------------------------------------------------------------

@router.post("/", response_model=VariableOut)
def create_variable(
    var_in: VariableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ajouter une nouvelle variable au dictionnaire.
    Réservé au Directeur.
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Réservé au Directeur.")

    # 1. Vérifier unicité du slug
    if db.query(Variable).filter(Variable.slug == var_in.slug).first():
        raise HTTPException(status_code=400, detail=f"La variable '{var_in.slug}' existe déjà.")

    # 2. Création Variable
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

    # 3. Création Modalités (si liste)
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


@router.get("/", response_model=List[VariableOut])
def read_variables(
    quota_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lister les variables (Admin dashboard)."""
    query = db.query(Variable)
    if quota_only:
        query = query.filter(Variable.is_quota == True)
    return query.all()


@router.delete("/{variable_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_variable(
    variable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Supprimer une variable.
    ATTENTION : Vérifie d'abord si elle est utilisée dans un Quota actif.
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Réservé au Directeur.")
        
    var_db = db.query(Variable).filter(Variable.id == variable_id).first()
    if not var_db:
        raise HTTPException(status_code=404, detail="Variable introuvable")

    # --- SÉCURITÉ INTÉGRITÉ ---
    # On vérifie si un quota utilise ce slug dans son JSON.
    # Postgres permet de chercher du texte dans le JSONB.
    # Une approche simple et robuste : chercher le slug en tant que chaîne dans la définition.
    
    slug_to_check = var_db.slug
    
    # Recherche : est-ce que le champ "field": "slug" apparait dans les quotas ?
    # Note : Cette requête dépend de ton moteur DB. Pour Postgres + SQLAlchemy :
    quotas_using_var = db.query(Quota).filter(
        cast(Quota.definition, String).like(f'%"{slug_to_check}"%')
    ).first()

    if quotas_using_var:
        raise HTTPException(
            status_code=400, 
            detail=f"Impossible de supprimer '{var_db.label}'. Elle est utilisée dans le quota '{quotas_using_var.description}'."
        )

    db.delete(var_db)
    db.commit()
    return None