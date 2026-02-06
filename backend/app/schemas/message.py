# backend/app/schemas/message.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageBase(BaseModel):
    title: str
    content: str
    target_role: Optional[str] = None # 'agent', 'controleur', 'superviseur' ou null (tous)
    target_user_id: Optional[int] = None # pour viser une personne precise

class MessageCreate(MessageBase):
    pass

class MessageOut(MessageBase):
    id: int
    sender_id: int
    created_at: datetime
    sender_username: str # champ calculé pour affichage
    recipient_name: Optional[str] = None # champ calculé pour affichage (si cible precise)

    class Config:
        from_attributes = True
