import { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from '../components/Header';
import DeviceControl from '../components/DeviceControl';
import SensorReadings from '../components/SensorReading';
import PowerGraph from '../components/Power';
import VoltageGraph from '../components/Voltage';
import AirQualityGraph from '../components/Aqi';
const API_URL = 'http://192.168.140.203';

function Esp() {
  const [data, setData] = useState({
    voltage1: 0,
    voltage2: 0,
    current: 0,
    power1: 0,
    power2: 0,
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

  const [history, setHistory] = useState({
    voltage: [],
    power: [],
    airQuality: []
  });

  // New state for auto-shutdown alert
  const [autoShutdownAlert, setAutoShutdownAlert] = useState({
    show: false,
    message: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/data`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const newData = await response.json();
        
        // Check for auto-shutdown condition (voltage > 1.0V)
        if (newData.voltage1 > 1.0 || newData.voltage2 > 1.0) {
          const triggeringVoltage = newData.voltage1 > 1.0 ? 'Voltage 1' : 'Voltage 2';
          setAutoShutdownAlert({
            show: true,
            message: `${triggeringVoltage} exceeded 1.0V. Auto-shutdown activated!`
          });
          
          // Update all relay states to OFF
          newData.relays = newData.relays.map(relay => ({ ...relay, state: false }));
          newData.current = 0;
          newData.power1 = 0;
          newData.power2 = 0;
        }
        
        // Check if any relay is active
        const isAnyDeviceActive = newData.relays.some(relay => relay.state);
        
        // Adjust current and power based on device state
        const adjustedData = {
          ...newData,
          current: isAnyDeviceActive ? newData.current : 0,
          power1: isAnyDeviceActive ? newData.power1 : 0,
          power2: isAnyDeviceActive ? newData.power2 : 0
        };
        
        setData(adjustedData);
        
        // Add timestamp to the history
        const timestamp = new Date().toLocaleTimeString();
        
        setHistory(prev => ({
          voltage: [...prev.voltage, {
            time: timestamp,
            voltage1: newData.voltage1,
            voltage2: newData.voltage2
          }].slice(-20), // Keep only the last 20 readings
          power: [...prev.power, {
            time: timestamp,
            power1: adjustedData.power1,
            power2: adjustedData.power2
          }].slice(-20),
          airQuality: [...prev.airQuality, {
            time: timestamp,
            airQuality: newData.airQuality
          }].slice(-20)
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleDevice = async (id) => {
    try {
      const response = await fetch(`${API_URL}/toggle${id}`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to toggle device');
      }
      const result = await response.json();
      if (result.success) {
        // Update the local state to reflect the change
        setData(prevData => {
          const updatedRelays = prevData.relays.map(relay => 
            relay.id === id ? { ...relay, state: !relay.state } : relay
          );
          
          // Check if any relay is now active after the toggle
          const isAnyDeviceActive = updatedRelays.some(relay => relay.state);
          
          return { 
            ...prevData, 
            relays: updatedRelays,
            // Update current and power based on device state
            current: isAnyDeviceActive ? prevData.current : 0,
            power1: isAnyDeviceActive ? prevData.power1 : 0,
            power2: isAnyDeviceActive ? prevData.power2 : 0
          };
        });
      }
    } catch (error) {
      console.error(`Error toggling device ${id}:`, error);
    }
  };

  const emergencyShutdown = async () => {
    if (confirm('Are you sure you want to shut down all devices?')) {
      try {
        const response = await fetch(`${API_URL}/shutdown`, {
          method: 'POST'
        });
        if (!response.ok) {
          throw new Error('Shutdown request failed');
        }
        const result = await response.json();
        if (result.success) {
          // Update all relay states to OFF and set current/power to 0
          setData(prevData => ({
            ...prevData,
            relays: prevData.relays.map(relay => ({ ...relay, state: false })),
            current: 0,
            power1: 0,
            power2: 0
          }));
        }
      } catch (error) {
        console.error('Error during emergency shutdown:', error);
      }
    }
  };

  // Function to dismiss auto-shutdown alert
  const dismissAlert = () => {
    setAutoShutdownAlert({
      show: false,
      message: ''
    });
  };

  const devices = [
    { id: 1, name: 'Room Lights', relay: data.relays[0] },
    { id: 2, name: 'Fan', relay: data.relays[1] },
    { id: 3, name: 'AC', relay: data.relays[2] },
    { id: 4, name: 'Solar Panel', relay: data.relays[3] }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Header />
      
      {/* Auto-shutdown Alert */}
      {autoShutdownAlert.show && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 relative" role="alert">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Automatic Shutdown Activated</p>
              <p className="text-sm">{autoShutdownAlert.message}</p>
            </div>
          </div>
          <button 
            onClick={dismissAlert}
            className="absolute top-0 right-0 mt-4 mr-4 text-red-500 hover:text-red-700"
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-teal-800 mb-4">Device Control</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {devices.map(device => (
              <DeviceControl 
                key={device.id}
                device={device}
                onToggle={() => toggleDevice(device.id)}
              />
            ))}
          </div>
          <button 
            onClick={emergencyShutdown}
            className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Emergency Shutdown
          </button>
        </div>
        
        {/* Voltage Warning Indicator */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-teal-800">Sensor Readings</h2>
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-2 ${
                data.voltage1 > 0.8 || data.voltage2 > 0.8 
                  ? 'bg-red-500 animate-pulse' 
                  : data.voltage1 > 0.5 || data.voltage2 > 0.5
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {data.voltage1 > 0.8 || data.voltage2 > 0.8 
                  ? 'Critical Voltage' 
                  : data.voltage1 > 0.5 || data.voltage2 > 0.5
                    ? 'Warning'
                    : 'Normal'}
              </span>
            </div>
          </div>
          
          <SensorReadings data={data} />
          
          {/* Auto-shutdown threshold indicator */}
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Auto-shutdown threshold:</span>
              <span className="text-sm font-bold text-red-600">1.0V</span>
            </div>
            <div className="mt-2 bg-gray-300 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-red-600 h-full" 
                style={{ 
                  width: `${Math.max(
                    (data.voltage1 / 1.0) * 100, 
                    (data.voltage2 / 1.0) * 100
                  )}%`,
                  maxWidth: '100%'
                }}
              ></div>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>0V</span>
              <span>0.5V</span>
              <span>1.0V</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        <VoltageGraph data={history.voltage} />
        <PowerGraph data={history.power} />
        <AirQualityGraph data={history.airQuality} />
      </div>
    </div>
  );
}

export default Esp;