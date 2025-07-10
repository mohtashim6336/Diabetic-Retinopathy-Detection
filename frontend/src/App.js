import React, { useState } from 'react';
import './App.css';

// Helper function to provide explanations for each classification
const getClassificationExplanation = (classification) => {
  switch(classification) {
    case 'No DR':
      return 'No Diabetic Retinopathy detected. Your eye appears healthy with no signs of damage to the blood vessels in the retina.';
    case 'Mild DR':
      return 'Mild Diabetic Retinopathy detected. This is an early stage with small areas of balloon-like swelling in the retina\'s tiny blood vessels. Regular monitoring is recommended.';
    case 'Moderate DR':
      return 'Moderate Diabetic Retinopathy detected. At this stage, more blood vessels are blocked, decreasing blood supply to areas of the retina. This may begin to affect vision.';
    case 'Severe DR':
      return 'Severe Diabetic Retinopathy detected. Many blood vessels are blocked, causing areas of the retina to be deprived of blood supply. This can lead to significant vision problems.';
    case 'Proliferative DR':
      return 'Proliferative Diabetic Retinopathy detected. This is the most advanced stage where new, fragile blood vessels grow in the retina. These can leak blood and cause severe vision problems or blindness if untreated.';
    default:
      return `${classification} - Please consult with a healthcare professional for more information about this classification.`;
  }
};

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('No file selected');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      
      // Create a preview URL for the selected image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
      
      // Clear previous results and errors
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError("Please select an image file first.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Send the file to the backend API
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error submitting image:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Eye Disease Detection</h1>
        <p>Upload an image of an eye to detect potential diseases</p>
      </header>
      
      <main className="App-main">
        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="file-input-container">
            <input 
              type="file" 
              id="file-input"
              className="file-input"
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <label htmlFor="file-input" className="file-input-label">
              {fileName}
            </label>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || !selectedFile}
          >
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </form>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="results-container">
          {previewUrl && (
            <div className="preview-container">
              <h3>Image Preview</h3>
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="image-preview"
              />
            </div>
          )}
          
          {result && (
            <div className="result-container">
              <div className="result-card">
                <h3>Analysis Results</h3>
                <div>
                  <strong className="result-status">Status: </strong> 
                  <span className={result.status === 'Healthy' ? 'healthy' : 'diseased'}>
                    {result.status}
                  </span>
                </div>
                
                <div>
                  <strong>Classification:</strong> {result.class}
                </div>
                
                <div>
                  <strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%
                </div>
                
                {result.model_type && (
                  <div className="model-type">
                    <strong>Analysis Method:</strong> {result.model_type}
                  </div>
                )}
                
                {result.all_probabilities && (
                  <div className="probabilities">
                    <h4>Detailed Analysis:</h4>
                    <ul>
                      {Object.entries(result.all_probabilities).map(([className, probability]) => (
                        <li key={className}>
                          <strong>{className}:</strong> {(probability * 100).toFixed(2)}%
                        </li>
                      ))}
                    </ul>
                    
                    <div className="explanation-section">
                      <h4>What Does This Mean?</h4>
                      <p>
                        <strong>Status:</strong> {result.status === 'Healthy' ? 
                          'Your eye appears to be healthy with no signs of diabetic retinopathy.' : 
                          'Your eye shows signs that may indicate diabetic retinopathy.'}
                      </p>
                      
                      <p>
                        <strong>Classification:</strong> {getClassificationExplanation(result.class)}
                      </p>
                      
                      <p>
                        <strong>Confidence:</strong> The percentage ({(result.confidence * 100).toFixed(2)}%) represents how confident 
                        the system is in its diagnosis. Higher percentages indicate greater confidence.
                      </p>
                      
                      <h5>Understanding Diabetic Retinopathy (DR):</h5>
                      <ul className="explanation-list">
                        <li><strong>No DR:</strong> A healthy eye with no signs of diabetic retinopathy.</li>
                        <li><strong>Mild DR:</strong> Early stage with small areas of balloon-like swelling in the retina's blood vessels.</li>
                        <li><strong>Moderate DR:</strong> More blood vessels are blocked, decreasing blood supply to areas of the retina.</li>
                        <li><strong>Severe DR:</strong> Many blood vessels are blocked, causing areas of the retina to be deprived of blood supply.</li>
                        <li><strong>Proliferative DR:</strong> The most advanced stage where new, fragile blood vessels grow in the retina and can leak blood.</li>
                      </ul>
                      
                      <div className="disclaimer">
                        <p><strong>Important:</strong> This is for educational purposes only. Always consult with a healthcare professional for proper diagnosis and treatment.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="App-footer">
        <p> 2025 Eye Disease Detection App | For educational purposes only</p>
      </footer>
    </div>
  );
}

export default App;
