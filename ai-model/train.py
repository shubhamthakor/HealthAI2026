import os
import json
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from app.utils.preprocessor import (
    load_and_clean_dataset,
    extract_symptoms_vocabulary,
    prepare_training_data
)

def run_training_pipeline():
    print("=== Smart Hospital Disease Prediction - Model Training Pipeline ===")
    
    # 1. Define paths
    csv_path = os.path.join("datasets", "disease_dataset.csv")
    model_dir = "trained_models"
    os.makedirs(model_dir, exist_ok=True)
    
    # 2. Load and Clean Dataset
    print(f"\nStep 1: Loading raw dataset from: {csv_path}...")
    df = load_and_clean_dataset(csv_path)
    print(f"Loaded {df.shape[0]} records successfully.")
    
    # 3. Extract and Save Vocabulary
    print("\nStep 2: Compiling unique symptoms vocabulary...")
    vocabulary = extract_symptoms_vocabulary(df)
    print(f"Extracted {len(vocabulary)} unique symptom features.")
    
    vocab_path = os.path.join(model_dir, "symptoms_vocabulary.json")
    with open(vocab_path, "w", encoding="utf-8") as f:
        json.dump(vocabulary, f, ensure_ascii=False, indent=2)
    print(f"Saved symptoms vocabulary metadata to: {vocab_path}")
    
    # 4. Prepare Training Matrices
    print("\nStep 3: Vectorizing symptoms to feature matrices...")
    X, y = prepare_training_data(df, vocabulary)
    print(f"Feature matrix X shape: {X.shape}")
    print(f"Label vector y shape: {y.shape}")
    
    # 5. Train/Test Split & Accuracy Evaluation
    print("\nStep 4: Splitting dataset into train (80%) and test (20%) subsets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier on training subset...")
    classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    classifier.fit(X_train, y_train)
    
    # Evaluate model predictions
    predictions = classifier.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"\n[EVALUATION RESULTS] Model Accuracy: {accuracy * 100:.2f}%")
    
    print("\nClassification Summary:")
    print(classification_report(y_test, predictions, zero_division=0)[:500] + "...")
    
    # 6. Fit Final Model on Full Dataset for Production
    print("\nStep 5: Training final Random Forest Classifier on 100% of dataset...")
    final_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    final_classifier.fit(X, y)
    
    # 7. Save Final Model Binary
    model_path = os.path.join(model_dir, "disease_classifier.joblib")
    print(f"Saving final trained model binary to: {model_path}...")
    joblib.dump(final_classifier, model_path)
    
    print("\n=== Model training pipeline executed successfully! ===")

if __name__ == "__main__":
    run_training_pipeline()
