# Diabetic-Retinopathy-Detection

This is a full-stack web application for  Diabetic Retinopathy Detection. The application consists of a React.js frontend and a Python FastAPI backend.

## Project Structure

```
DL Proj/
├── backend/
│   ├── model/
│   │   ├── __init__.py
│   │   └── model.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── ...
│   ├── package.json
│   └── ...
├── dr_retinopathy_model.h5
└── README.md
```

## Features

- Upload an image of an eye
- Process the image using a pre-trained AI model
- Display the prediction results (healthy or diseased)
- Show detailed classification and confidence scores

## Prerequisites

- Python 3.8 or higher
- Node.js and npm
- TensorFlow 2.x
## Preprocessing*

The preprocessing pipeline consists of the following:
1. Crop & resize all images using the resizing script.
2. Rotate & mirror all images using the rotation script.
3. Update labels for the augmented dataset.
### Crop and Resize All Images

All images were scaled down to 256 by 256. Additionally, some images were dropped from the training set. Scikit-Image raised multiple warnings during resizing, due to these images having no color space. Because of this, any images that were completely black were removed from the training data.
### Rotate and Mirror All Images

All images were rotated and mirrored.Images without retinopathy were mirrored; images that had retinopathy were mirrored, and rotated 90, 120, 180, and 270 degrees.

<p align = "center">
<img align="center" src="images/augmented_dataset.png" alt="Augmented Dataset"/>
</p>

After rotations and mirroring, the class imbalance is rectified, with a few thousand more images having retinopathy.

<p align = "center">
<img align="center" src="images/augmentation_example.png" alt="Augmented Example"/>
</p>

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Start the backend server:
   ```
   python main.py
   ```
   The API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   The application will be available at http://localhost:3000

## Usage

1. Open your web browser and go to http://localhost:3000
2. Click on "Choose an image" to select an image of an eye
3. Click "Analyze Image" to send the image to the backend for processing
4. View the results showing whether the eye is healthy or diseased, along with confidence scores

## API Endpoints

- `GET /`: Root endpoint, returns a welcome message
- `POST /predict`: Accepts an image file and returns prediction results

## Model Information

The application uses a pre-trained model (`dr_retinopathy_model.h5`) for detecting diabetic retinopathy. The model classifies eye images into five categories:
- No DR (Healthy)
- Mild DR
- Moderate DR
- Severe DR
- Proliferative DR

## Technologies Used

- **Frontend**: React.js
- **Backend**: Python, FastAPI
- **AI Model**: TensorFlow/Keras 
- **Image Processing**: Pillow, NumPy

## Results

The current models return the following scores for binary classification (DR vs No DR) on the dataset.
| Model | Accuracy |
| :-----: | :-----: |
| Standard CNN (Training) | 82.2% |
| Standard CNN (Validation) | 82.2% |
| InceptionV3 (Training) | 86.0% |
| InceptionV3 (Validation) | 85.8% |


