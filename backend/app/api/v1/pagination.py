from typing import Generic, TypeVar, List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Query, Session
from sqlalchemy import func, text
from fastapi import HTTPException, Query as QueryParam
from math import ceil

# Type générique pour les éléments paginés
T = TypeVar('T')

class PaginationParams(BaseModel):
    """Paramètres de pagination avec validation"""
    page: int = Field(default=1, ge=1, description="Numéro de page (commence à 1)")
    size: int = Field(default=50, ge=1, le=1000, description="Taille de page (max 1000)")
    sort_by: Optional[str] = Field(default=None, description="Champ de tri")
    sort_order: str = Field(default="asc", pattern="^(asc|desc)$", description="Ordre de tri")
    search: Optional[str] = Field(default=None, description="Terme de recherche")

class PaginationMeta(BaseModel):
    """Métadonnées de pagination"""
    current_page: int = Field(description="Page actuelle")
    page_size: int = Field(description="Taille de la page")
    total_items: int = Field(description="Nombre total d'éléments")
    total_pages: int = Field(description="Nombre total de pages")

class PaginatedResponse(BaseModel, Generic[T]):
    """Réponse paginée générique"""
    items: List[T] = Field(description="Liste des éléments")
    meta: PaginationMeta = Field(description="Métadonnées de pagination")
    
    model_config = ConfigDict(arbitrary_types_allowed=True)

def create_pagination_params(
    page: int = QueryParam(1, ge=1, description="Numéro de page"),
    size: int = QueryParam(50, ge=1, le=1000, description="Taille de page"),
    sort_by: Optional[str] = QueryParam(None, description="Champ de tri"),
    sort_order: str = QueryParam("asc", description="Ordre de tri (asc/desc)"),
    search: Optional[str] = QueryParam(None, description="Terme de recherche")
) -> PaginationParams:
    """Factory function pour créer des paramètres de pagination avec validation FastAPI"""
    
    # Validation supplémentaire pour sort_order
    if sort_order.lower() not in ["asc", "desc"]:
        raise HTTPException(
            status_code=400,
            detail="sort_order doit être 'asc' ou 'desc'"
        )
    
    return PaginationParams(
        page=page,
        size=size,
        sort_by=sort_by,
        sort_order=sort_order.lower(),
        search=search
    )

def paginate_query(
    query: Query,
    params: PaginationParams,
    allowed_sort_fields: Optional[List[str]] = None,
    search_fields: Optional[List[str]] = None
) -> tuple[Query, int]:
    """
    Applique la pagination, le tri et la recherche à une requête SQLAlchemy.
    
    Args:
        query: Requête SQLAlchemy de base
        params: Paramètres de pagination
        allowed_sort_fields: Liste des champs autorisés pour le tri
        search_fields: Liste des champs où effectuer la recherche
        
    Returns:
        tuple: (requête paginée, nombre total d'éléments)
    """
    try:
        # Compter le total avant pagination
        total_count = query.count()
        
        # Appliquer la recherche si demandée
        if params.search and search_fields:
            search_term = f"%{params.search.lower()}%"
            search_conditions = []
            
            for field in search_fields:
                # Construire la condition de recherche de manière sécurisée
                if "." in field:  # Relation (ex: "user.username")
                    # Pour les relations, on utilise un join si nécessaire
                    search_conditions.append(text(f"LOWER({field}) LIKE :search_term"))
                else:
                    # Pour les champs directs
                    search_conditions.append(text(f"LOWER({field}) LIKE :search_term"))
            
            if search_conditions:
                # Combiner toutes les conditions avec OR
                combined_condition = " OR ".join([str(cond) for cond in search_conditions])
                query = query.filter(text(combined_condition)).params(search_term=search_term)
                
                # Recompter après recherche
                total_count = query.count()
        
        # Appliquer le tri si demandé
        if params.sort_by:
            if allowed_sort_fields and params.sort_by not in allowed_sort_fields:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Tri non autorisé sur le champ '{params.sort_by}'. Champs autorisés: {allowed_sort_fields}"
                )
            
            # Construire l'ordre de tri de manière sécurisée
            order_clause = f"{params.sort_by} {params.sort_order.upper()}"
            query = query.order_by(text(order_clause))
        
        # Calculer l'offset
        offset = (params.page - 1) * params.size
        
        # Appliquer la pagination
        paginated_query = query.offset(offset).limit(params.size)
        
        return paginated_query, total_count
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erreur lors de la pagination: {str(e)}"
        )

def paginate_response(
    items: List[T],
    total_count: int,
    params: PaginationParams
) -> PaginatedResponse[T]:
    """
    Crée une réponse paginée complète avec métadonnées.
    
    Args:
        items: Liste des éléments de la page courante
        total_count: Nombre total d'éléments
        params: Paramètres de pagination utilisés
        
    Returns:
        PaginatedResponse avec items et métadonnées
    """
    total_pages = ceil(total_count / params.size) if params.size > 0 else 0
    
    meta = PaginationMeta(
        current_page=params.page,
        page_size=params.size,
        total_items=total_count,
        total_pages=total_pages
    )
    
    return PaginatedResponse(items=items, meta=meta)

def paginate_sqlalchemy_query(
    query: Query,
    params: PaginationParams,
    allowed_sort_fields: Optional[List[str]] = None,
    search_fields: Optional[List[str]] = None
) -> PaginatedResponse[Any]:
    """
    Fonction complète pour paginer une requête SQLAlchemy.
    Combine paginate_query et paginate_response.
    
    Args:
        query: Requête SQLAlchemy
        params: Paramètres de pagination
        allowed_sort_fields: Champs autorisés pour le tri
        search_fields: Champs pour la recherche textuelle
        
    Returns:
        PaginatedResponse complète
    """
    try:
        # Appliquer pagination et récupérer le total
        paginated_query, total_count = paginate_query(
            query, params, allowed_sort_fields, search_fields
        )
        
        # Exécuter la requête
        items = paginated_query.all()
        
        # Créer la réponse paginée
        return paginate_response(items, total_count, params)
        
    except HTTPException:
        # Re-lancer les HTTPException sans les modifier
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne lors de la pagination: {str(e)}"
        )

# Fonction d'aide pour les listes Python (non-SQLAlchemy)
def paginate_list(
    items: List[T],
    params: PaginationParams
) -> PaginatedResponse[T]:
    """
    Pagine une liste Python en mémoire.
    Utile pour des données déjà chargées ou des résultats de calculs.
    
    Args:
        items: Liste complète des éléments
        params: Paramètres de pagination
        
    Returns:
        PaginatedResponse avec la sous-liste paginée
    """
    total_count = len(items)
    start_index = (params.page - 1) * params.size
    end_index = start_index + params.size
    
    # Extraire la sous-liste pour cette page
    page_items = items[start_index:end_index]
    
    return paginate_response(page_items, total_count, params)

# Exemples d'usage pour documentation
"""
Exemples d'utilisation:

1. Dans un endpoint FastAPI:
@router.get("/users/", response_model=PaginatedResponse[UserOut])
def list_users(
    pagination: PaginationParams = Depends(create_pagination_params),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    return paginate_sqlalchemy_query(
        query, 
        pagination, 
        allowed_sort_fields=["username", "role", "created_at"],
        search_fields=["username", "cspro_code"]
    )

2. Avec une requête complexe:
@router.get("/surveys/", response_model=PaginatedResponse[SurveyOut])  
def list_surveys(
    pagination: PaginationParams = Depends(create_pagination_params),
    db: Session = Depends(get_db)
):
    query = db.query(SurveyData).join(User).filter(SurveyData.status == "complet")
    return paginate_sqlalchemy_query(
        query,
        pagination,
        allowed_sort_fields=["date_entretien", "agent_code", "status"],
        search_fields=["agent_code", "questionnaire_uuid"]
    )
"""