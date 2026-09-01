import os
import json
import joblib
import numpy as np
from app.utils.preprocessor import clean_symptom_string, vectorize_symptoms

def test_prediction(symptoms_input):
    model_path = os.path.join("trained_models", "disease_classifier.joblib")
    vocab_path = os.path.join("trained_models", "symptoms_vocabulary.json")
    
    if not os.path.exists(model_path) or not os.path.exists(vocab_path):
        print("Error: Trained model files not found. Please train the model first.")
        return
        
    # Load model and vocabulary
    model = joblib.load(model_path)
    with open(vocab_path, "r", encoding="utf-8") as f:
        vocabulary = json.load(f)
        
    print(f"\nTesting with symptoms: {symptoms_input}")
    
    # Preprocess & filter symptoms
    cleaned_symptoms = [clean_symptom_string(s) for s in symptoms_input if s]
    recognized = [s for s in cleaned_symptoms if s in vocabulary]
    unrecognized = [s for s in cleaned_symptoms if s not in vocabulary]
    
    if unrecognized:
        print(f"Warning - Unrecognized symptoms: {unrecognized}")
        
    if not recognized:
        print("Error: No recognized symptoms found. Prediction aborted.")
        return
        
    # Vectorize
    vector = vectorize_symptoms(recognized, vocabulary)
    feature_matrix = vector.reshape(1, -1)
    
    # Predict
    predicted_disease = model.predict(feature_matrix)[0]
    
    # Confidence (probability)
    probabilities = model.predict_proba(feature_matrix)[0]
    class_idx = list(model.classes_).index(predicted_disease)
    confidence = probabilities[class_idx]
    
    print(f"Result:")
    print(f"  - Predicted Disease: {predicted_disease}")
    print(f"  - Confidence: {confidence:.2f} ({confidence * 100:.1f}%)")

if __name__ == "__main__":
    import sys
    # If symptoms are passed as command-line arguments, use them:
    if len(sys.argv) > 1:
        # Split by comma or treat as separate arguments
        symptoms = []
        for arg in sys.argv[1:]:
            symptoms.extend([s.strip() for s in arg.split(",") if s.strip()])
        test_prediction(symptoms)
    else:
        print("=== Interactive Disease Prediction Model Tester ===")
        print("Tip: Enter symptoms separated by commas (e.g., chills, shivering, watering_from_eyes)")
        try:
            while True:
                user_input = input("\nEnter symptoms (or type 'exit' to quit): ").strip()
                if not user_input or user_input.lower() == 'exit':
                    print("Exiting tester.")
                    break
                symptoms = [s.strip() for s in user_input.split(",") if s.strip()]
                if symptoms:
                    test_prediction(symptoms)
                    print("-" * 50)
        except (KeyboardInterrupt, EOFError):
            print("\nExiting tester.")

