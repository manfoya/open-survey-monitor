# backend/app/models/campaign.py

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.core.database import Base
from datetime import datetime

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # Ex: "Enquête Ménage 2026"
    
    # --- CONFIGURATION MYSQL HOSTINGER ---
    # C'est ici que le script de sync va lire ses instructions
    mysql_host = Column(String, nullable=False)
    mysql_user = Column(String, nullable=False)
    mysql_password = Column(String, nullable=False) # Idéalement chiffré
    mysql_db = Column(String, nullable=False)
    mysql_table = Column(String, nullable=False)
    
    # --- CONFIGURATION DU SYNC ---
    # Le curseur pour savoir où on s'est arrêté (évite de tout relire)
    last_synced_id = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)