import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Power, Thermometer, Users, Activity, Home, BarChart, Zap, Wind, X } from 'lucide-react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  // Mock data for devices - in a real app this would come from an API
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: "Living Room AC",
      type: "air_conditioner",
      status: "on",
      voltage: 220,
      currentUsage: 1.2, // in kW
      occupancy: 3,
      temperature: 24,
      fanSpeed: "medium",
      icon: "ac"
    },
    {
      id: 2,
      name: "Master Bedroom Lights",
      type: "light",
      status: "on",
      voltage: 220,
      currentUsage: 0.06, // in kW
      occupancy: 0,
      brightness: 80,
      icon: "light"
    },
    {
      id: 3,
      name: "Kitchen Refrigerator",
      type: "refrigerator",
      status: "on",
      voltage: 220,
      currentUsage: 0.15, // in kW
      temperature: 4,
      icon: "fridge"
    },
    {
      id: 4,
      name: "Home Office PC",
      type: "computer",
      status: "on",
      voltage: 220,
      currentUsage: 0.35, // in kW
      occupancy: 1,
      icon: "pc"
    },
    {
      id: 5,
      name: "Dining Room Lights",
      type: "light",
      status: "off",
      voltage: 220,
      currentUsage: 0, // in kW
      occupancy: 0,
      brightness: 0,
      icon: "light"
    },
    {
      id: 6,
      name: "Bedroom AC",
      type: "air_conditioner",
      status: "off",
      voltage: 220,
      currentUsage: 0, // in kW
      occupancy: 0,
      temperature: 25,
      fanSpeed: "low",
      icon: "ac"
    }
  ]);

  // Mock room data with occupancy sensors
  const [rooms, setRooms] = useState([
    { id: 1, name: "Living Room", occupancy: 3, temperature: 26, humidity: 60 },
    { id: 2, name: "Master Bedroom", occupancy: 0, temperature: 25, humidity: 55 },
    { id: 3, name: "Kitchen", occupancy: 1, temperature: 27, humidity: 65 },
    { id: 4, name: "Home Office", occupancy: 1, temperature: 25, humidity: 50 },
    { id: 5, name: "Dining Room", occupancy: 0, temperature: 26, humidity: 58 }
  ]);

  // Total energy consumption
  const [totalConsumption, setTotalConsumption] = useState({
    current: 0,
    daily: 8.2,
    weekly: 42.5,
    monthly: 156
  });

  // Energy savings from optimization
  const [savings, setSavings] = useState({
    today: 1.4,
    thisWeek: 8.7,
    thisMonth: 32.5,
    percentage: 18
  });

  const [expandedDeviceId, setExpandedDeviceId] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Calculate total current consumption whenever devices change
  useEffect(() => {
    const total = devices.reduce((sum, device) => sum + device.currentUsage, 0);
    setTotalConsumption(prev => ({
      ...prev,
      current: parseFloat(total.toFixed(2))
    }));
  }, [devices]);

  // Toggle device expansion for detailed view
  const toggleDeviceExpansion = (id) => {
    if (expandedDeviceId === id) {
      setExpandedDeviceId(null);
    } else {
      setExpandedDeviceId(id);
    }
  };

  // Toggle device on/off status
  const toggleDeviceStatus = (id) => {
    setDevices(devices.map(device => {
      if (device.id === id) {
        const newStatus = device.status === "on" ? "off" : "on";
        return {
          ...device,
          status: newStatus,
          currentUsage: newStatus === "off" ? 0 : device.type === "air_conditioner" ? 1.2 : 
                        device.type === "light" ? 0.06 : 
                        device.type === "refrigerator" ? 0.15 : 0.35
        };
      }
      return device;
    }));
  };

  // Change device settings
  const updateDeviceSetting = (id, setting, value) => {
    setDevices(devices.map(device => {
      if (device.id === id) {
        return { ...device, [setting]: value };
      }
      return device;
    }));
  };

  // Simulate occupancy-based optimization
  const runOptimization = () => {
    setIsOptimizing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setDevices(devices.map(device => {
        // For each device, check if room is occupied
        const deviceRoom = rooms.find(room => device.name.includes(room.name));
        
        if (deviceRoom) {
          // AC logic - adjust based on occupancy
          if (device.type === "air_conditioner") {
            if (deviceRoom.occupancy === 0) {
              // No one in room - turn off
              return { ...device, status: "off", currentUsage: 0 };
            } else if (deviceRoom.occupancy > 2) {
              // Multiple people - lower temperature for comfort
              const adjustedTemp = device.temperature - 1;
              return { 
                ...device, 
                temperature: adjustedTemp,
                currentUsage: 1.3 // Slightly higher usage due to lower temp
              };
            }
          }
          
          // Light logic - turn off if no occupancy
          if (device.type === "light" && deviceRoom.occupancy === 0) {
            return { ...device, status: "off", currentUsage: 0 };
          }
        }
        
        return device;
      }));
      
      setIsOptimizing(false);
      
      // Update savings to show optimization results
      setSavings(prev => ({
        ...prev,
        today: parseFloat((prev.today + 0.3).toFixed(1)),
        percentage: parseFloat((prev.percentage + 1.5).toFixed(1))
      }));
    }, 2000);
  };

  // Helper function to render device icon
  const renderDeviceIcon = (device) => {
    switch (device.type) {
      case "air_conditioner":
        return <Wind className="h-6 w-6" />;
      case "light":
        return <Zap className="h-6 w-6" />;
      case "refrigerator":
        return <Thermometer className="h-6 w-6" />;
      case "computer":
        return <Activity className="h-6 w-6" />;
      default:
        return <Home className="h-6 w-6" />;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    return status === "on" ? "bg-green-500" : "bg-gray-400";
  };

  return (
    <div className="container mx-auto px-5">
      {/* Dashboard Header */}
      <div className="mb-8 -mx-5">
        <Navbar/>   
      </div>
      
      {/* Energy Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Current Usage</h3>
            <Zap className="h-5 w-5 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-700">{totalConsumption.current} kW</p>
          <p className="text-xs text-gray-500">Real-time consumption</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Daily Average</h3>
            <BarChart className="h-5 w-5 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-700">{totalConsumption.daily} kWh</p>
          <p className="text-xs text-gray-500">Last 24 hours</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Optimization Savings</h3>
            <Activity className="h-5 w-5 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-700">{savings.today} kWh</p>
          <p className="text-xs text-gray-500">Today's savings ({savings.percentage}%)</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Active Devices</h3>
            <Power className="h-5 w-5 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-700">
            {devices.filter(d => d.status === "on").length}/{devices.length}
          </p>
          <p className="text-xs text-gray-500">Devices running now</p>
        </div>
      </div>

      {/* Room Occupancy Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-teal-700 mb-4">Room Occupancy</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {rooms.map(room => (
            <div key={room.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium text-gray-700">{room.name}</h3>
              <div className="flex items-center mt-2">
                <Users className="h-5 w-5 text-teal-600 mr-2" />
                <span className="text-lg font-semibold">
                  {room.occupancy} {room.occupancy === 1 ? 'person' : 'people'}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Temp</span>
                  <span>{room.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Humidity</span>
                  <span>{room.humidity}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Optimization Action */}
      <div className="flex justify-end mb-6">
        <button
          onClick={runOptimization}
          disabled={isOptimizing}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:bg-gray-400"
        >
          {isOptimizing ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Optimizing...
            </>
          ) : (
            <>
              Optimize Based on Occupancy
            </>
          )}
        </button>
      </div>

      {/* Connected Devices List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-teal-700">Connected Devices</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {devices.map(device => (
            <div key={device.id} className="p-4 hover:bg-gray-50">
              {/* Device main info row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${device.status === "on" ? "bg-teal-100" : "bg-gray-100"} mr-4`}>
                    {renderDeviceIcon(device)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{device.name}</h3>
                    <div className="flex items-center">
                      <span 
                        className={`inline-block w-2 h-2 rounded-full ${getStatusColor(device.status)} mr-2`}
                      ></span>
                      <span className="text-sm text-gray-500 capitalize">{device.status}</span>
                      {device.status === "on" && (
                        <span className="ml-4 text-sm font-semibold text-teal-600">
                          {device.currentUsage} kW
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <button
                    onClick={() => toggleDeviceStatus(device.id)}
                    className={`mr-4 p-2 rounded-full ${
                      device.status === "on" ? "bg-teal-100 text-teal-600" : "bg-gray-200 text-gray-600"
                    } hover:bg-teal-200`}
                  >
                    <Power className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => toggleDeviceExpansion(device.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedDeviceId === device.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Expanded device details */}
              {expandedDeviceId === device.id && (
                <div className="mt-4 ml-16 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Voltage</p>
                      <p className="font-medium">{device.voltage}V</p>
                    </div>
                    
                    {device.occupancy !== undefined && (
                      <div>
                        <p className="text-sm text-gray-500">Room Occupancy</p>
                        <p className="font-medium">{device.occupancy} people</p>
                      </div>
                    )}
                    
                    {device.temperature !== undefined && (
                      <div>
                        <p className="text-sm text-gray-500">Temperature</p>
                        <div className="flex items-center">
                          <p className="font-medium">{device.temperature}°C</p>
                          {device.status === "on" && device.type === "air_conditioner" && (
                            <div className="ml-2 flex">
                              <button 
                                onClick={() => updateDeviceSetting(device.id, 'temperature', device.temperature - 1)}
                                className="p-1 text-gray-500 hover:text-teal-700"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => updateDeviceSetting(device.id, 'temperature', device.temperature + 1)}
                                className="p-1 text-gray-500 hover:text-teal-700"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {device.brightness !== undefined && (
                      <div>
                        <p className="text-sm text-gray-500">Brightness</p>
                        <p className="font-medium">{device.brightness}%</p>
                      </div>
                    )}
                    
                    {device.fanSpeed !== undefined && (
                      <div>
                        <p className="text-sm text-gray-500">Fan Speed</p>
                        <p className="font-medium capitalize">{device.fanSpeed}</p>
                      </div>
                    )}
                  </div>
                  
                  {device.type === "air_conditioner" && device.status === "on" && (
                    <div className="mt-4">
                      <p className="text-xs text-teal-600 mb-1">Energy-saving suggestion</p>
                      <p className="text-sm text-gray-600">
                        {device.occupancy === 0 
                          ? "No occupants detected. Consider turning off this device."
                          : device.temperature < 24
                            ? "Temperature is set quite low. Increase by 1-2°C to save energy."
                            : "Current settings are energy-efficient."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Energy consumption tip */}
      <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-start">
        <div className="text-teal-600 mr-3 mt-1">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-medium text-teal-700">Smart Energy Tip</h4>
          <p className="text-sm text-teal-600">
            Your living room AC usage increases when occupancy is above 2 people. Consider using ceiling fans to supplement cooling and raising the AC temperature to save energy.
          </p>
        </div>
        <button className="ml-auto text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;