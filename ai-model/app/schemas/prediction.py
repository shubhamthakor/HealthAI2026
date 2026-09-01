from pydantic import BaseModel, Field
from typing import List

class PredictionRequest(BaseModel):
    symptoms: List[str] = Field(
        ..., 
        example=["fever", "headache", "vomiting"],
        description="List of clinical symptom keys extracted from user description"
    )

class PredictionResponse(BaseModel):
    predictedDisease: str = Field(..., description="Predicted disease canonical key (English)")
    confidence: float = Field(..., description="Model prediction probability score (0.0 to 1.0)")
