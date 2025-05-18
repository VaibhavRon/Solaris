import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

function DeviceCarbonFootprint({ data, devices }) {
  // Calculate device-specific energy usage and carbon footprint
  const [deviceData, setDeviceData] = useState([]);
  
  // Example fixed power ratings for each device (watts)
  // In a real implementation, you would get this from your actual measurements
  const DEVICE_POWER_RATINGS = {
    1: 60,   // Room Lights: 60W
    2: 80,   // Fan: 80W
    3: 1200, // AC: 1200W
    4: 0     // Solar Panel: 0W (it's a source, not a consumer)
  };
  
  // Carbon emission factors (kg CO2 per kWh)
  const CARBON_FACTORS = {
    GRID: 0.475,  // kg CO2 per kWh (global average)
    SOLAR: 0.041  // kg CO2 per kWh (lifecycle emissions)
  };
  
  useEffect(() => {
    if (!devices || devices.length === 0) return;
    
    const activeDevices = devices.filter(device => device.relay.state && device.id !== 4);
    
    // If solar panel is active, use solar emission factor, otherwise use grid
    const isSolarActive = devices.find(device => device.id === 4)?.relay.state || false;
    const emissionFactor = isSolarActive ? CARBON_FACTORS.SOLAR : CARBON_FACTORS.GRID;
    
    // Calculate carbon footprint for each active device
    const deviceFootprints = activeDevices.map(device => {
      const powerWatts = DEVICE_POWER_RATINGS[device.id] || 0;
      const powerKW = powerWatts / 1000;
      const hourlyEmissions = powerKW * emissionFactor;
      
      return {
        name: device.name,
        value: hourlyEmissions,
        power: powerWatts,
        color: getDeviceColor(device.id)
      };
    });
    
    // If no active devices, add a placeholder
    if (deviceFootprints.length === 0) {
      deviceFootprints.push({
        name: "No Active Devices",
        value: 0,
        power: 0,
        color: "#CBD5E0"
      });
    }
    
    setDeviceData(deviceFootprints);
  }, [devices]);
  
  // Get color based on device ID
  function getDeviceColor(id) {
    const colors = {
      1: "#FBBF24", // Yellow for lights
      2: "#60A5FA", // Blue for fan
      3: "#34D399", // Green for AC
      4: "#F87171"  // Red for Solar Panel
    };
    return colors[id] || "#CBD5E0";
  }
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-gray-600">{`Power: ${payload[0].payload.power} W`}</p>
          <p className="text-gray-600">{`CO₂: ${payload[0].value.toFixed(4)} kg/hr`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Calculate total emissions
  const totalEmissions = deviceData.reduce((sum, device) => sum + device.value, 0);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-green-800 mb-4">Device Carbon Footprint</h2>
      <div className="text-sm text-gray-500 mb-4">
        Breakdown of emissions by device
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-col justify-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Emission Details</h3>
          
          <div className="space-y-4">
            {deviceData.map((device, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: device.color }}
                ></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{device.name}</span>
                    <span>{device.value.toFixed(4)} kg/hr</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: totalEmissions > 0 ? `${(device.value / totalEmissions) * 100}%` : '0%',
                        backgroundColor: device.color 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <span className="font-medium">Total Emissions:</span>
              <span className="font-bold text-green-600">{totalEmissions.toFixed(4)} kg CO₂/hr</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Using {devices.find(device => device.id === 4)?.relay.state ? 'Solar' : 'Grid'} power
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceCarbonFootprint;