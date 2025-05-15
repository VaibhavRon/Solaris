import { useState } from 'react';
import axios from 'axios';

const ModelPredictor = () => {
  const [inputData, setInputData] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Parse the input data (assuming comma-separated values)
      const parsedData = inputData.split(',').map(val => parseFloat(val.trim()));
      
      // Check for invalid inputs
      if (parsedData.some(isNaN)) {
        throw new Error('Invalid input format. Please enter valid numeric values separated by commas.');
      }
      
      // Check if we have exactly 2 input values as required by the model
      if (parsedData.length !== 2) {
        throw new Error('The model requires exactly 2 input values.');
      }
      
      // Use the API URL with the proxy setup in vite.config.js
      const response = await axios.post('/api/predict', {
        data: parsedData
      }, {
        withCredentials: true
      });
      
      // Update the prediction state with the response
      setPrediction(response.data.prediction);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Error making prediction. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">ML Model Prediction</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="inputData" className="block text-sm font-medium text-gray-700 mb-1">
            Input Data (comma-separated values)
          </label>
          <textarea
            id="inputData"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            rows="3"
            placeholder="e.g., 1.2494475, -0.611463239"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter exactly 2 numeric values separated by a comma
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Get Prediction'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}
      
      {prediction && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <h2 className="font-semibold text-green-800 mb-2">Prediction Result:</h2>
          <pre className="bg-white p-2 rounded-md overflow-x-auto text-gray-800">
            {typeof prediction.result === 'object' ? (
              JSON.stringify(prediction.result, null, 2)
            ) : (
              prediction.result
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ModelPredictor;