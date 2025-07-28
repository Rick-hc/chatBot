from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class QAData(Base):
    __tablename__ = "qa_data"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False, index=True)
    answer = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    tags = Column(JSON, nullable=True)
    embedding = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())