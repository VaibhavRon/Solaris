import { useState } from 'react';
import axios from 'axios';

const ModelPredictor = () => {
  const [solarPower, setSolarPower] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Parse the input values
      const parsedSolarPower = parseFloat(solarPower.trim());
      const parsedTimeOfDay = parseFloat(timeOfDay.trim());
      
      // Check for invalid inputs
      if (isNaN(parsedSolarPower) || isNaN(parsedTimeOfDay)) {
        throw new Error('Please enter valid numeric values for both fields.');
      }
      
      // Create the input array for the model
      const inputData = [parsedSolarPower, parsedTimeOfDay];
      
      // Use the API URL with the proxy setup in vite.config.js
      const response = await axios.post('/api/predict', {
        data: inputData
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
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Appliance Consumption Predictor</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="solarPower" className="block text-sm font-medium text-gray-700 mb-1">
            Solar Power (watts)
          </label>
          <input
            id="solarPower"
            type="number"
            value={solarPower}
            onChange={(e) => setSolarPower(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="e.g., 724.5"
            step="any"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the current solar power generation in watts
          </p>
        </div>
        
        <div>
          <label htmlFor="timeOfDay" className="block text-sm font-medium text-gray-700 mb-1">
            Time of Day (hours in 24h format)
          </label>
          <input
            id="timeOfDay"
            type="number"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="e.g., 14.5 for 2:30 PM"
            min="0"
            max="24"
            step="0.01"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the time in 24-hour format (e.g., 13.5 for 1:30 PM)
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Predict Appliance Consumption'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}
      
      {prediction && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <h2 className="font-semibold text-green-800 mb-2">Predicted Appliance Consumption:</h2>
          <div className="bg-white p-4 rounded-md overflow-x-auto text-gray-800 flex items-center justify-center">
            <span className="text-2xl font-bold">
               {typeof prediction.result === 'object' ? 
                Array.isArray(prediction.result) ? 
                  Number(prediction.result[0]).toFixed(2) + " watts" :
                  JSON.stringify(prediction.result, null, 2) :
                Number(prediction.result).toFixed(2) + " watts"
              }
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Based on {solarPower} watts of solar power at {timeOfDay} hours
          </p>
        </div>
      )}
    </div>
  );
};

export default ModelPredictor;