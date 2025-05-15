# predict.py - Python script for ML model predictions
import sys
import json
import pickle
import numpy as np
import os
from pathlib import Path

def load_model(model_path):
    """Load the pickled ML model from disk"""
    try:
        with open(model_path, 'rb') as file:
            model = pickle.load(file)
        return model
    except Exception as e:
        print(json.dumps({"error": f"Failed to load model: {str(e)}"}))
        sys.exit(1)

def predict(model, input_data):
    """Make predictions using the loaded model"""
    try:
        # Convert input data to appropriate format for your model
        # This may vary depending on your specific model requirements
        input_array = np.array([input_data])  # Ensure input is 2D array for model
        
        # Make prediction
        prediction = model.predict(input_array)
        
        # Convert numpy arrays to Python lists for JSON serialization
        if isinstance(prediction, np.ndarray):
            prediction = prediction.tolist()
            
        return prediction
    except Exception as e:
        print(json.dumps({"error": f"Prediction failed: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":  # Fixed variable name here
    try:
        # Get input data from command line arguments
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)
            
        input_json = sys.argv[1]
        print(f"Received input: {input_json}", file=sys.stderr)  # Debug info
        input_data = json.loads(input_json)
            
        # Set the path to your pickled model
        # Look for model in the same directory as this script
        current_dir = Path(__file__).parent  # Fixed variable name here
        model_path = os.path.join(current_dir, 'model.pkl')
            
        print(f"Looking for model at: {model_path}", file=sys.stderr)  # Debug info
            
        if not os.path.exists(model_path):
            print(json.dumps({"error": f"Model file not found at {model_path}"}))
            sys.exit(1)
            
        # Load the model
        model = load_model(model_path)
            
        # Make prediction
        prediction = predict(model, input_data)
            
        # Return the prediction as JSON
        print(json.dumps({"result": prediction}))
    except Exception as e:
        print(json.dumps({"error": f"An error occurred: {str(e)}"}))
        sys.exit(1)