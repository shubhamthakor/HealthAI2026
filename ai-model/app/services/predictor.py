import os
import json
import joblib
import logging
import numpy as np
from typing import List, Tuple
from app.utils.preprocessor import clean_symptom_string, vectorize_symptoms

# Configure logger
logger = logging.getLogger("predictor_service")
logging.basicConfig(level=logging.INFO)

class PredictorService:
    def __init__(self):
        self.model = None
        self.vocabulary = None
        self.model_path = os.path.join("trained_models", "disease_classifier.joblib")
        self.vocab_path = os.path.join("trained_models", "symptoms_vocabulary.json")

    def load_model(self):
        """Loads the serialized Random Forest model and symptoms vocabulary from disk."""
        logger.info("Initializing PredictorService model loader...")
        
        if not os.path.exists(self.model_path):
            logger.error(f"Classifier model binary not found at: {self.model_path}")
            raise FileNotFoundError(f"Model binary not found at: {self.model_path}")
            
        if not os.path.exists(self.vocab_path):
            logger.error(f"Symptoms vocabulary file not found at: {self.vocab_path}")
            raise FileNotFoundError(f"Vocabulary metadata file not found at: {self.vocab_path}")
            
        # Load the vocabulary metadata
        with open(self.vocab_path, "r", encoding="utf-8") as f:
            self.vocabulary = json.load(f)
        logger.info(f"Loaded symptoms vocabulary with {len(self.vocabulary)} unique classes.")
        
        # Load the model classifier
        self.model = joblib.load(self.model_path)
        logger.info("Random Forest classifier model loaded successfully.")

    def predict(self, symptoms: List[str]) -> Tuple[str, float]:
        """
        Performs inference to predict disease class and calculate prediction confidence.
        
        - Standardizes incoming symptoms.
        - Flags unrecognized symptoms via logging.
        - Raises ValueError if no recognized symptoms are supplied.
        - Vectorizes symptoms and runs classifier prediction.
        """
        if not self.model or not self.vocabulary:
            logger.error("PredictorService.predict called before model/vocabulary was successfully loaded.")
            raise RuntimeError("Model is not initialized. Please call load_model() first.")
            
        # 1. Standardize and clean input symptoms
        cleaned_inputs = [clean_symptom_string(s) for s in symptoms if s]
        
        # 2. Filter inputs to isolate recognized vs unrecognized symptoms
        recognized_symptoms = [s for s in cleaned_inputs if s in self.vocabulary]
        unrecognized_symptoms = [s for s in cleaned_inputs if s not in self.vocabulary]
        
        if unrecognized_symptoms:
            logger.warning(f"Unrecognized symptoms provided: {unrecognized_symptoms}")
            
        if not recognized_symptoms:
            logger.error("Failed prediction attempt: No recognized symptoms were provided in the request.")
            raise ValueError(
                f"No recognized symptoms were provided. Valid symptoms from vocabulary: "
                f"{sorted(unrecognized_symptoms)} are not in vocabulary."
            )
            
        # 3. Vectorize symptoms to fit model inputs
        vector = vectorize_symptoms(recognized_symptoms, self.vocabulary)
        feature_matrix = vector.reshape(1, -1)
        
        # 4. Perform prediction and calculate confidence score
        predicted_disease = self.model.predict(feature_matrix)[0]
        probabilities = self.model.predict_proba(feature_matrix)[0]
        
        # Extract class probability
        class_idx = list(self.model.classes_).index(predicted_disease)
        confidence = float(probabilities[class_idx])
        
        logger.info(f"Inference completed successfully. Predicted: {predicted_disease} (confidence: {confidence:.4f})")
        return predicted_disease, confidence

# Singleton service instance
predictor_service = PredictorService()

