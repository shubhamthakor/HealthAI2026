import os
import re
import pandas as pd
import numpy as np
from typing import List, Set, Tuple

def clean_symptom_string(symptom: str) -> str:
    """
    Standardize a symptom string:
    - Lowercase the text.
    - Replace consecutive spaces with a single space and strip borders.
    - Replace all spaces with underscores.
    - Replace consecutive underscores with a single underscore.
    """
    if not isinstance(symptom, str):
        return ""
    
    # 1. Clean consecutive whitespaces and strip boundaries
    s = re.sub(r'\s+', ' ', symptom).strip().lower()
    
    # 2. Replace spaces with underscores
    s = s.replace(" ", "_")
    
    # 3. Strip duplicate underscores
    s = re.sub(r'_+', '_', s)
    
    return s

def load_and_clean_dataset(dataset_path: str) -> pd.DataFrame:
    """
    Loads raw CSV dataset and standardizes symptom features and disease labels.
    """
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Database source CSV file not found at: {dataset_path}")
        
    df = pd.read_csv(dataset_path)
    
    # Strip whitespace from columns
    df.columns = [col.strip() for col in df.columns]
    
    # Get all columns matching symptom fields
    symptom_cols = [col for col in df.columns if col.startswith("Symptom_")]
    
    # Clean symptom columns
    for col in symptom_cols:
        df[col] = df[col].astype(str).apply(clean_symptom_string)
        # Convert empty strings and nan placeholders to None
        df[col] = df[col].replace(['nan', 'null', ''], None)
        
    # Clean disease target column
    if "Disease" in df.columns:
        df["Disease"] = df["Disease"].astype(str).str.strip()
        
    return df

def extract_symptoms_vocabulary(df: pd.DataFrame) -> List[str]:
    """
    Extracts a sorted list of unique symptoms across all Symptom columns in the dataset.
    """
    symptom_cols = [col for col in df.columns if col.startswith("Symptom_")]
    unique_symptoms: Set[str] = set()
    
    for col in symptom_cols:
        # Get non-null cleaned values
        cleaned_vals = df[col].dropna().unique()
        unique_symptoms.update(cleaned_vals)
        
    return sorted(list(unique_symptoms))

def vectorize_symptoms(input_symptoms: List[str], vocabulary: List[str]) -> np.ndarray:
    """
    Transforms a list of clinical symptoms into a binary one-hot vector representation
    based on the compiled vocabulary.
    
    Args:
        input_symptoms: List of strings (symptoms reported by user).
        vocabulary: List of strings (unique symptom classes from training dataset).
        
    Returns:
        np.ndarray: Binary array (1 for presence, 0 for absence) of shape (len(vocabulary),).
    """
    # Clean incoming symptoms to match standard vocabulary format
    cleaned_inputs = {clean_symptom_string(s) for s in input_symptoms if s}
    
    # Generate binary vector
    vector = [1 if symptom in cleaned_inputs else 0 for symptom in vocabulary]
    return np.array(vector, dtype=np.int32)

def prepare_training_data(df: pd.DataFrame, vocabulary: List[str]) -> Tuple[np.ndarray, np.ndarray]:
    """
    Vectorizes the entire cleaned dataframe to return features (X) and labels (y) for model training.
    
    Returns:
        Tuple[np.ndarray, np.ndarray]:
            - X: Binary feature matrix of shape (num_samples, len(vocabulary))
            - y: Label array of shape (num_samples,) containing target diseases
    """
    symptom_cols = [col for col in df.columns if col.startswith("Symptom_")]
    X = []
    y = []
    
    for _, row in df.iterrows():
        # Compile unique symptoms present in the row
        row_symptoms = set(row[symptom_cols].dropna().values)
        
        # Vectorize row
        vector = [1 if s in row_symptoms else 0 for s in vocabulary]
        X.append(vector)
        y.append(row["Disease"])
        
    return np.array(X, dtype=np.int32), np.array(y)
