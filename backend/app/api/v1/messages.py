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

def _get_recipient_name(m: Message) -> str:
    """
    récupère le nom du destinataire du message.
    """
    names_map = {
        "agent": "Agents",
        "controleur": "Contrôleurs",
        "superviseur": "Superviseurs"
    }
    if m.target_user_id:
        # Si target_user est chargé via relation
        if m.target_user:
            return m.target_user.username
        else:
            return f"User #{m.target_user_id}"
    elif m.target_role:
        return names_map.get(m.target_role, m.target_role)
    else:
        return "Tout le monde"

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
    
    # injection du nom de l'expéditeur (soi-même) et du destinataire
    for m in messages:
        m.sender_username = current_user.username
        m.recipient_name = _get_recipient_name(m)
        
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
        if m.sender:
            m.sender_username = f"{m.sender.username} #{m.sender.id}"
        else:
             m.sender_username = f"Admin #{m.sender_id}"
             
        # Pour le destinataire (du point de vue réception)
        if m.target_user_id == current_user.id:
            m.recipient_name = "Moi"
        elif m.target_role == current_user.role.value:
            m.recipient_name = f"Rôle: {m.target_role}"
        elif m.target_role is None and m.target_user_id is None:
            m.recipient_name = "Tous (Global)"
        else:
            m.recipient_name = "Autre"
        
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
    return query.message_du_jour or ""

