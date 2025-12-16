# backend/app/api/v1/dictionary.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.users import User, RoleEnum
from app.models.dictionary import Variable, Modalite
from app.schemas.dictionary import VariableCreate, VariableOut

router = APIRouter()

@router.post("/", response_model=VariableOut)
def create_variable_dictionary(
    var_in: VariableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ajouter une nouvelle variable au dictionnaire (avec ses modalités).
    Réservé au Directeur.
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Seul le Directeur peut modifier le dictionnaire.")

    # 1. Vérifier si la variable existe déjà (par son nom CSPro)
    if db.query(Variable).filter(Variable.name == var_in.name).first():
        raise HTTPException(status_code=400, detail=f"La variable '{var_in.name}' existe déjà.")

    # 2. Création de la Variable
    new_var = Variable(
        name=var_in.name,
        label=var_in.label,
        type=var_in.type,
        est_quota=var_in.est_quota
    )
    db.add(new_var)
    db.commit()
    db.refresh(new_var)

    # 3. Création des Modalités associées (si il y en a)
    for mod in var_in.modalites:
        new_mod = Modalite(
            variable_id=new_var.id,
            code=mod.code,
            label=mod.label
        )
        db.add(new_mod)
    
    db.commit()
    db.refresh(new_var) # On rafraîchit pour récupérer les modalités ajoutées
    return new_var

@router.get("/", response_model=List[VariableOut])
def read_dictionary(
    quota_only: bool = False, # Filtre optionnel : voir seulement les variables de quota ?
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lister toutes les variables du dictionnaire.
    Accessible à tout le monde (pour afficher les labels dans le dashboard).
    """
    query = db.query(Variable)
    
    if quota_only:
        query = query.filter(Variable.est_quota == True)
        
    return query.all()

@router.delete("/{variable_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_variable(
    variable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Supprimer une variable (et ses modalités)."""
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Réservé au Directeur.")
        
    var_db = db.query(Variable).filter(Variable.id == variable_id).first()
    if not var_db:
        raise HTTPException(status_code=404, detail="Variable introuvable")
        
    db.delete(var_db)
    db.commit()
    return None
