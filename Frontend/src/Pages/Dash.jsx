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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/data`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const newData = await response.json();
        
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

  const devices = [
    { id: 1, name: 'Room Lights', relay: data.relays[0] },
    { id: 2, name: 'Fan', relay: data.relays[1] },
    { id: 3, name: 'AC', relay: data.relays[2] },
    { id: 4, name: 'Solar Panel', relay: data.relays[3] }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Header />
      
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
        
        <SensorReadings data={data} />
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