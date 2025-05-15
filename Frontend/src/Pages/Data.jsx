import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ToggleLeft, ToggleRight, Droplet, Thermometer, ZapOff, Zap, Wind, Power } from 'lucide-react';

// Change this to your ESP32's IP address when testing directly
const API_URL = 'http://192.168.140.203'; // e.g. 'http://192.168.1.100'

export default function ESP32Dashboard() {
  const [sensorData, setSensorData] = useState({
    voltage: 0,
    current: 0,
    power: 0,
    temperature: 0,
    humidity: 0,
    airQuality: 0,
    relays: [
      { id: 1, state: false },
      { id: 2, state: false },
      { id: 3, state: false },
      { id: 4, state: false }
    ]
  });
 
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true for direct ESP32 connection

  // Fetch current data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // For direct connection to ESP32, use its IP address
        const response = await fetch(`${API_URL}/data`, {
          // Enable CORS request
          mode: 'cors',
          headers: {
            'Accept': 'application/json'
          }
        });
       
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
       
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON but got ${contentType}`);
        }
       
        const data = await response.json();
        setSensorData(data);
       
        // Add timestamp to historical data
        setHistoricalData(prevData => {
          const newData = [...prevData, {
            ...data,
            timestamp: new Date().toLocaleTimeString(),
            // Ensure power exists
            power: data.power || (data.voltage * data.current)
          }];
          // Keep only last 20 entries
          return newData.slice(-20);
        });
       
        setLoading(false);
        // Reset error state on successful fetch
        if (error) {
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(`Failed to connect to ESP32: ${err.message}. Please check your connection.`);
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, error]);

  const toggleRelay = async (relayId) => {
    try {
      const response = await fetch(`${API_URL}/toggle${relayId}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
     
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
     
      // Update immediately for better UX instead of waiting for next poll
      setSensorData(prevData => {
        const updatedRelays = [...prevData.relays];
        const relayIndex = relayId - 1;
        if (updatedRelays[relayIndex]) {
          updatedRelays[relayIndex].state = !updatedRelays[relayIndex].state;
        }
        return { ...prevData, relays: updatedRelays };
      });
    } catch (err) {
      console.error(`Failed to toggle relay ${relayId}:`, err);
      setError(`Failed to toggle relay ${relayId}: ${err.message}. Please check your connection.`);
    }
  };

  const emergencyShutdown = async () => {
    try {
      const response = await fetch(`${API_URL}/shutdown`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
     
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
     
      // Update UI immediately
      setSensorData(prevData => {
        const updatedRelays = prevData.relays.map(relay => ({ ...relay, state: false }));
        return { ...prevData, relays: updatedRelays };
      });
    } catch (err) {
      console.error('Failed to execute emergency shutdown:', err);
      setError(`Failed to execute emergency shutdown: ${err.message}. Please check your connection.`);
    }
  };

  const getAirQualityStatus = (value) => {
    if (value < 50) return { text: 'Good', color: 'text-green-500' };
    if (value < 100) return { text: 'Moderate', color: 'text-yellow-500' };
    if (value < 150) return { text: 'Unhealthy for Sensitive Groups', color: 'text-orange-500' };
    if (value < 200) return { text: 'Unhealthy', color: 'text-red-500' };
    if (value < 300) return { text: 'Very Unhealthy', color: 'text-purple-500' };
    return { text: 'Hazardous', color: 'text-rose-800' };
  };

  const airQualityStatus = getAirQualityStatus(sensorData.airQuality);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">Login Required</h2>
          <p className="text-gray-600 mb-6 text-center">
            Please log in to access the ESP32 dashboard.
          </p>
          <div className="flex justify-center">
            <a
              href="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-lg">Loading sensor data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">ESP32 Environment Monitor</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <a
              href="/logout"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </a>
          </div>
        </div>

        {/* Current readings cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Power</h2>
              {sensorData.current > 0.1 ? <Zap size={24} className="text-yellow-500" /> : <ZapOff size={24} className="text-gray-500" />}
            </div>
            <div className="flex flex-col mt-2">
              <p className="text-sm text-gray-500">Voltage</p>
              <p className="text-2xl font-bold">{sensorData.voltage?.toFixed(2) || '0.00'} V</p>
            </div>
            <div className="flex flex-col mt-2">
              <p className="text-sm text-gray-500">Current</p>
              <p className="text-2xl font-bold">{sensorData.current?.toFixed(2) || '0.00'} A</p>
            </div>
            <div className="flex flex-col mt-2">
              <p className="text-sm text-gray-500">Power</p>
              <p className="text-2xl font-bold">
                {(sensorData.power || (sensorData.voltage * sensorData.current))?.toFixed(2) || '0.00'} W
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Climate</h2>
              <Thermometer size={24} className="text-red-500" />
            </div>
            <div className="flex flex-col mt-2">
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="text-2xl font-bold">{sensorData.temperature?.toFixed(1) || '0.0'} °C</p>
            </div>
            <div className="flex flex-col mt-2">
              <p className="text-sm text-gray-500">Humidity</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold mr-2">{sensorData.humidity?.toFixed(1) || '0.0'}%</p>
                <Droplet size={20} className="text-blue-500" />
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Air Quality</h2>
              <Wind size={24} className="text-blue-500" />
            </div>
            <div className="flex flex-col mt-2">
              <p className="text-sm text-gray-500">AQI</p>
              <p className="text-2xl font-bold">{sensorData.airQuality || '0'}</p>
              <p className={`text-lg ${airQualityStatus.color}`}>{airQualityStatus.text}</p>
            </div>
            <div className="relative pt-1 mt-2">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${Math.min(100, (sensorData.airQuality || 0) / 5)}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    sensorData.airQuality < 50 ? 'bg-green-500' :
                    sensorData.airQuality < 100 ? 'bg-yellow-500' :
                    sensorData.airQuality < 150 ? 'bg-orange-500' :
                    sensorData.airQuality < 200 ? 'bg-red-500' :
                    sensorData.airQuality < 300 ? 'bg-purple-500' : 'bg-rose-800'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Relay control */}
        <div className={`p-4 rounded-lg shadow-md mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Relay Controls</h2>
            <button
              onClick={emergencyShutdown}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold flex items-center"
            >
              <Power size={16} className="mr-2" />
              Emergency Off
            </button>
          </div>
         
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sensorData.relays && sensorData.relays.map((relay) => (
              <div key={relay.id} className={`p-4 rounded-lg border ${relay.state ? 'border-green-500 bg-green-50' : 'border-gray-300'} ${darkMode && relay.state ? 'bg-green-900' : darkMode ? 'bg-gray-700' : ''}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Relay {relay.id}</span>
                  <button
                    onClick={() => toggleRelay(relay.id)}
                    className="flex items-center focus:outline-none"
                    aria-label={`Toggle relay ${relay.id}`}
                  >
                    {relay.state ?
                      <ToggleRight size={32} className="text-green-500" /> :
                      <ToggleLeft size={32} className="text-gray-500" />
                    }
                  </button>
                </div>
                <p className="text-sm mt-1">
                  Status: <span className={`font-bold ${relay.state ? 'text-green-500' : 'text-gray-500'}`}>
                    {relay.state ? 'ON' : 'OFF'}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Historical data charts */}
        <div className={`p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Sensor History</h2>
         
          <div className="h-64 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historicalData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ccc"} />
                <XAxis dataKey="timestamp" stroke={darkMode ? "#aaa" : "#666"} />
                <YAxis yAxisId="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip contentStyle={darkMode ? { backgroundColor: '#333', borderColor: '#555', color: '#fff' } : {}} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
         
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historicalData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ccc"} />
                <XAxis dataKey="timestamp" stroke={darkMode ? "#aaa" : "#666"} />
                <YAxis yAxisId="left" stroke="#ff7300" />
                <YAxis yAxisId="right" orientation="right" stroke="#0088fe" />
                <Tooltip contentStyle={darkMode ? { backgroundColor: '#333', borderColor: '#555', color: '#fff' } : {}} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="voltage" name="Voltage (V)" stroke="#ff7300" />
                <Line yAxisId="right" type="monotone" dataKey="current" name="Current (A)" stroke="#0088fe" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
       
        <footer className="mt-6 text-center text-sm text-gray-500">
          <p>ESP32 Environment Monitor &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}
