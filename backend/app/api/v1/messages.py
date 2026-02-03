# backend/app/api/v1/messages.py

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.users import User, RoleEnum
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageOut
from app.models.settings import GlobalSettings

router = APIRouter()

@router.post("/", response_model=MessageOut)
def send_message(
    msg_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    envoi d'un message (réservé au directeur).
    peut cibler tout le monde (target_role=none), un rôle, ou un user.
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="seul le directeur peut envoyer des messages.")

    new_msg = Message(
        sender_id=current_user.id,
        title=msg_in.title,
        content=msg_in.content,
        target_role=msg_in.target_role,
        target_user_id=msg_in.target_user_id
    )
    
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    
    # enrichissement pour la réponse
    new_msg.sender_username = current_user.username
    return new_msg

@router.get("/sent", response_model=List[MessageOut])
def read_sent_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 20
):
    """
    récupère les messages envoyés par le directeur connecté.
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="accès réservé au directeur.")

    messages = db.query(Message).filter(
        Message.sender_id == current_user.id
    ).order_by(desc(Message.created_at)).limit(limit).all()
    
    # injection du nom de l'expéditeur (soi-même)
    for m in messages:
        m.sender_username = current_user.username
        
    return messages

@router.get("/", response_model=List[MessageOut])
def read_my_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 20
):
    """
    récupère les messages pertinents pour l'utilisateur connecté.
    - messages globaux (target_role is null)
    - messages pour son rôle
    - messages privés
    """
    
    # directeur voit tout ce qu'il a envoyé ? ou sa boite de réception ?
    # supposons boite de réception standard + messages globaux
    
    query = db.query(Message).filter(
        or_(
            # 1. messages pour tout le monde
            (Message.target_role.is_(None) & Message.target_user_id.is_(None)),
            # 2. messages pour mon rôle
            (Message.target_role == current_user.role.value),
            # 3. messages privés
            (Message.target_user_id == current_user.id)
        )
    ).order_by(desc(Message.created_at)).limit(limit)
    
    messages = query.all()
    
    # injection du nom de l'expéditeur
    for m in messages:
        m.sender_username = m.sender.username
        
    return messages

# Response: string
@router.get("/day-message", response_model=str)
def read_day_message(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    récupère le message du jour présent dans les paramètres.
    """
    query = db.query(GlobalSettings).first()
    if not query:
        raise HTTPException(status_code=404, detail="Paramètres globaux non trouvés.")
    return query.message_du_jour

