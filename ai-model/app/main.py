from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.predictor import predictor_service

app = FastAPI(
    title="Smart Hospital Disease Detection Microservice",
    description="Python FastAPI ML microservice for classifying patient disease diagnostics from symptom sets.",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    """Trigger live classifier model and vocabulary loading on service initialization"""
    try:
        predictor_service.load_model()
    except Exception as e:
        import sys
        print(f"CRITICAL: Failed to load model at startup: {e}")
        # We do not call sys.exit here because we want the server to stay alive for troubleshooting, 
        # but the /health endpoint will report degraded status.

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """FastAPI service status check validating model loaded states"""
    model_loaded = (predictor_service.model is not None) and (predictor_service.vocabulary is not None)
    return {
        "status": "healthy" if model_loaded else "degraded",
        "model_loaded": model_loaded,
        "message": "FastAPI disease prediction microservice is operational." if model_loaded else "Model files failed to load."
    }

@app.post(
    "/predict", 
    response_model=PredictionResponse, 
    status_code=status.HTTP_200_OK,
    summary="Predict disease from symptoms",
    response_description="Predicted disease key and model confidence score"
)
def predict_disease(payload: PredictionRequest):
    """
    Standard prediction route executing inference via the trained Random Forest classifier.
    
    - **symptoms**: List of strings (e.g., ["chills", "shivering", "watering_from_eyes"])
    """
    if not payload.symptoms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Symptoms list cannot be empty."
        )
        
    try:
        disease, confidence = predictor_service.predict(payload.symptoms)
        return PredictionResponse(
            predictedDisease=disease,
            confidence=round(confidence, 4)
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction service error: {str(e)}"
        )

