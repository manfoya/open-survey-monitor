# backend/app/models/message.py

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Message(Base):
    """
    Message envoyé par le directeur aux agents ou controleurs.
    """
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # contenu du message
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    
    # date d'envoi
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # ciblage (optionnel) : si null, message pour tout le monde
    # sinon peut être un role (ex: 'agent') ou un user spécifique
    target_role = Column(String, nullable=True) 
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # relations
    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    target_user = relationship("User", foreign_keys=[target_user_id], backref="received_messages")
