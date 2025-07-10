import numpy as np
from PIL import Image
import os
import random

# Try to import TensorFlow, but don't fail if it's not available
try:
    import tensorflow as tf
    TENSORFLOW_AVAILABLE = True
    print("TensorFlow successfully imported!")
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("TensorFlow not available, using simulation mode instead.")

# Path to the pre-trained model
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'dr_retinopathy_model.h5')

# Global variables for the model
model = None
USE_REAL_MODEL = False  # Will be set to True if model loads successfully

def load_model():
    """Load the pre-trained model if TensorFlow is available."""
    global model, USE_REAL_MODEL
    
    if not TENSORFLOW_AVAILABLE:
        print("TensorFlow not available, cannot load the real model.")
        return
    
    try:
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH)
            USE_REAL_MODEL = True
            print(f"Successfully loaded model from {MODEL_PATH}")
        else:
            print(f"Model file not found at {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading model: {e}")

# Try to load the model when this module is imported
if TENSORFLOW_AVAILABLE:
    load_model()

def preprocess_image(image):
    """Preprocess the image for the model."""
    # Resize image to 224x224 (standard size for many models)
    image = image.resize((224, 224))
    
    # Convert to numpy array and normalize
    img_array = np.array(image) / 255.0
    
    if USE_REAL_MODEL:
        # Add batch dimension for TensorFlow model
        img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def predict_disease(image):
    """
    Make a prediction on the given image.
    
    Args:
        image: PIL Image object
        
    Returns:
        dict: Prediction result
    """
    try:
        # Define class names for diabetic retinopathy stages
        class_names = ["No DR", "Mild DR", "Moderate DR", "Severe DR", "Proliferative DR"]
        
        # Preprocess the image
        processed_image = preprocess_image(image)
        
        # Check if we should use the real model
        if USE_REAL_MODEL and model is not None:
            # Use the real trained model for prediction
            print("Using real trained model for prediction")
            prediction = model.predict(processed_image)
            predicted_class = np.argmax(prediction[0])
            probabilities = prediction[0]
            
            # Determine if the eye is healthy or diseased
            if predicted_class == 0:  # No DR class
                status = "Healthy"
            else:
                status = "Diseased"
                
            return {
                "status": status,
                "class": class_names[predicted_class],
                "confidence": float(probabilities[predicted_class]),
                "all_probabilities": {class_name: float(prob) for class_name, prob in zip(class_names, probabilities)},
                "model_type": "Trained TensorFlow Model"
            }
        
        # If real model is not available, use our simulation
        print("Using simulation for prediction (real model not available)")
        
        # Extract image features for simulation
        avg_brightness = np.mean(processed_image)
        avg_red = np.mean(processed_image[:,:,0]) if processed_image.ndim > 2 else 0
        avg_green = np.mean(processed_image[:,:,1]) if processed_image.ndim > 2 else 0
        avg_blue = np.mean(processed_image[:,:,2]) if processed_image.ndim > 2 else 0
        
        # Create a deterministic seed based on image properties
        image_hash = int(avg_brightness * 1000) + int(avg_red * 10000) + int(avg_green * 100000) + int(avg_blue * 1000000)
        random.seed(image_hash)
        
        # Calculate a "disease indicator" score based on multiple factors
        disease_indicator = 0
        
        # Check for very high red with low brightness (potential hemorrhages)
        if avg_red > 0.7 and avg_brightness < 0.4:
            disease_indicator += 3  # Strong indicator
        
        # Check for red/green ratio (healthy retinas usually have balanced red/green)
        red_green_ratio = avg_red / max(avg_green, 0.01)  # Avoid division by zero
        if red_green_ratio > 2.0:
            disease_indicator += 2  # Moderate indicator
        
        # Check for uneven color distribution
        color_variance = np.std([avg_red, avg_green, avg_blue])
        if color_variance > 0.25:
            disease_indicator += 1  # Mild indicator
            
        # Make prediction based on disease indicator score
        if disease_indicator >= 5:
            # Severe or proliferative condition
            predicted_class = random.choices([3, 4], weights=[0.7, 0.3])[0]
        elif disease_indicator >= 3:
            # Moderate condition
            predicted_class = random.choices([2, 3], weights=[0.8, 0.2])[0]
        elif disease_indicator >= 1:
            # Mild condition
            predicted_class = random.choices([1, 2], weights=[0.9, 0.1])[0]
        else:
            # Healthy eye - much more likely now with our conservative approach
            predicted_class = random.choices([0, 1], weights=[0.95, 0.05])[0]
        
        # Generate deterministic but realistic confidence scores
        base_confidence = 0.7 + ((image_hash % 25) / 100)  # Between 0.7 and 0.95
        
        # Create probabilities for all classes
        probabilities = [0.1] * 5  # Initialize with small values
        probabilities[predicted_class] = base_confidence  # Set the predicted class confidence
        
        # Normalize to make sum = 1
        probabilities = [p / sum(probabilities) for p in probabilities]
        
        # Reset the random seed to avoid affecting other parts of the application
        random.seed()
        
        # Determine if the eye is healthy or diseased
        if predicted_class == 0:  # No DR class
            status = "Healthy"
        else:
            status = "Diseased"
            
        return {
            "status": status,
            "class": class_names[predicted_class],
            "confidence": probabilities[predicted_class],
            "all_probabilities": {class_name: float(prob) for class_name, prob in zip(class_names, probabilities)},
            "model_type": "Simulation (TensorFlow not available)"
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "status": "Error during prediction"
        }
