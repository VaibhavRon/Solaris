import { useState, useEffect } from 'react';
import Header from '../components/Header';
import CarbonFootprintGraph from '../components/Carbon_footprint';
import DeviceCarbonFootprint from '../components/Device_carbon';

// Carbon emission factors (kg CO2 per kWh)
const CARBON_FACTORS = {
  GRID: 0.475, // kg CO2 per kWh (global average)
  SOLAR: 0.041, // kg CO2 per kWh (lifecycle emissions)
};

const API_URL = 'http://192.168.140.203';

function CarbonFootprintPage() {
  const [data, setData] = useState({
    power1: 0,
    power2: 0,
    relays: [
      { id: 1, state: false, name: 'Room Lights' },
      { id: 2, state: false, name: 'Fan' },
      { id: 3, state: false, name: 'AC' },
      { id: 4, state: false, name: 'Solar Panel' }
    ]
  });

  const [history, setHistory] = useState({
    carbonFootprint: [],
    deviceEmissions: []
  });

  const [totalEmissions, setTotalEmissions] = useState(0);
  const [dailyEmissions, setDailyEmissions] = useState(0);
  const [weeklyEmissions, setWeeklyEmissions] = useState(0);
  const [monthlySavings, setMonthlySavings] = useState(0);

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
        
        // Adjust power based on device state
        const adjustedData = {
          ...newData,
          power1: isAnyDeviceActive ? newData.power1 : 0,
          power2: isAnyDeviceActive ? newData.power2 : 0
        };
        
        setData(adjustedData);
        
        // Add timestamp to the history
        const timestamp = new Date().toLocaleTimeString();
        
        // Calculate carbon footprint
        // Solar panel is relay 4
        const isSolarActive = newData.relays[3].state;
        
        // Total power in kW (convert from W)
        const totalPower = (adjustedData.power1 + adjustedData.power2) / 1000;
        
        // Carbon emissions in kg CO2 per hour
        // If solar is active, use solar emission factor, otherwise use grid
        const emissionFactor = isSolarActive ? CARBON_FACTORS.SOLAR : CARBON_FACTORS.GRID;
        const hourlyEmissions = totalPower * emissionFactor;
        
        // Emissions during this 5-second interval (convert from hourly to per 5 seconds)
        const intervalEmissions = hourlyEmissions * (5 / 3600);
        
        // Update total emissions
        setTotalEmissions(prev => prev + intervalEmissions);
        
        // Calculate savings if using solar vs grid
        const gridEmissions = totalPower * CARBON_FACTORS.GRID;
        const solarEmissions = totalPower * CARBON_FACTORS.SOLAR;
        const savedEmissions = isSolarActive ? (gridEmissions - solarEmissions) : 0;
        
        // Calculate device-specific emissions
        const deviceEmissions = newData.relays
          .filter(relay => relay.id !== 4 && relay.state) // Exclude solar panel
          .map(relay => {
            // Assuming equal power distribution among active devices
            // This is simplified; in a real scenario, you'd want device-specific power measurements
            const activeDevices = newData.relays.filter(r => r.id !== 4 && r.state).length;
            const devicePower = activeDevices > 0 ? totalPower / activeDevices : 0;
            const deviceHourlyEmissions = devicePower * emissionFactor;
            
            return {
              id: relay.id,
              name: getDeviceName(relay.id),
              emissions: deviceHourlyEmissions,
              power: devicePower * 1000 // Convert back to W for display
            };
          });
        
        // Update history
        setHistory(prev => {
          const updatedCarbonFootprint = [...prev.carbonFootprint, {
            time: timestamp,
            emissions: hourlyEmissions,
            source: isSolarActive ? 'Solar' : 'Grid',
            totalPower: totalPower,
            savings: savedEmissions
          }].slice(-60); // Keep last 60 readings (5 minutes with 5-second intervals)
          
          // Update daily and weekly emissions (simple calculation for demo)
          const newDailyEmissions = hourlyEmissions * 24;
          const newWeeklyEmissions = newDailyEmissions * 7;
          setDailyEmissions(newDailyEmissions);
          setWeeklyEmissions(newWeeklyEmissions);
          
          // Calculate monthly savings if using solar all month
          const newMonthlySavings = (CARBON_FACTORS.GRID - CARBON_FACTORS.SOLAR) * totalPower * 24 * 30;
          setMonthlySavings(newMonthlySavings);
          
          return {
            carbonFootprint: updatedCarbonFootprint,
            deviceEmissions: deviceEmissions
          };
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getDeviceName = (id) => {
    const deviceNames = {
      1: 'Room Lights',
      2: 'Fan',
      3: 'AC',
      4: 'Solar Panel'
    };
    return deviceNames[id] || `Device ${id}`;
  };

  const devices = [
    { id: 1, name: 'Room Lights', relay: data.relays[0] },
    { id: 2, name: 'Fan', relay: data.relays[1] },
    { id: 3, name: 'AC', relay: data.relays[2] },
    { id: 4, name: 'Solar Panel', relay: data.relays[3] }
  ];

  // Calculate emission reduction percentage
  const emissionReduction = data.relays[3].state && totalEmissions > 0 
    ? ((CARBON_FACTORS.GRID - CARBON_FACTORS.SOLAR) / CARBON_FACTORS.GRID * 100).toFixed(1)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Header />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-teal-800 mb-4">Carbon Footprint Analysis</h1>
        <p className="text-gray-700 mb-6">
          Monitor and analyze your carbon emissions in real-time. See the impact of using solar power
          versus grid power and track your contribution to environmental sustainability.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Current Rate</h3>
          <p className="text-3xl font-bold text-green-600">
            {history.carbonFootprint.length > 0 
              ? `${history.carbonFootprint[history.carbonFootprint.length - 1].emissions.toFixed(4)}`
              : '0.0000'} <span className="text-xl">kg/hr</span>
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Total Emissions</h3>
          <p className="text-3xl font-bold text-green-600">
            {totalEmissions.toFixed(4)} <span className="text-xl">kg CO₂</span>
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Current Source</h3>
          <div className="flex items-center">
            {data.relays[3].state ? (
              <>
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <p className="text-2xl font-bold text-green-600">Solar Power</p>
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                <p className="text-2xl font-bold text-yellow-600">Grid Power</p>
              </>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Emission Reduction</h3>
          <p className="text-3xl font-bold text-green-600">
            {emissionReduction}<span className="text-xl">%</span>
          </p>
          <p className="text-sm text-gray-500">When using solar power</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Projected Daily</h3>
          <p className="text-2xl font-bold text-green-600">
            {dailyEmissions.toFixed(4)} <span className="text-lg">kg CO₂/day</span>
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Projected Weekly</h3>
          <p className="text-2xl font-bold text-green-600">
            {weeklyEmissions.toFixed(4)} <span className="text-lg">kg CO₂/week</span>
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Potential Monthly Savings</h3>
          <p className="text-2xl font-bold text-green-600">
            {monthlySavings.toFixed(4)} <span className="text-lg">kg CO₂/month</span>
          </p>
          <p className="text-sm text-gray-500">If using solar power exclusively</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-teal-800 mb-4">Carbon Emission Timeline</h2>
          <CarbonFootprintGraph data={history.carbonFootprint} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-teal-800 mb-4">Device-specific Carbon Footprint</h2>
          <DeviceCarbonFootprint data={history.carbonFootprint} devices={devices} />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-teal-800 mb-4">Device Emissions Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Power Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hourly Emissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Emissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {devices.filter(device => device.id !== 4).map(device => {
                const deviceEmission = history.deviceEmissions?.find(e => e.id === device.id);
                const hourlyEmission = deviceEmission ? deviceEmission.emissions : 0;
                const dailyEmission = hourlyEmission * 24;
                const power = deviceEmission ? deviceEmission.power : 0;
                
                return (
                  <tr key={device.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{device.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${device.relay.state ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {device.relay.state ? 'ON' : 'OFF'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.relay.state ? `${power.toFixed(2)} W` : '0.00 W'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.relay.state ? `${hourlyEmission.toFixed(6)} kg/hr` : '0.000000 kg/hr'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.relay.state ? `${dailyEmission.toFixed(6)} kg/day` : '0.000000 kg/day'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-teal-800 mb-4">Environmental Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">CO₂ Equivalent</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">Your total emissions of {totalEmissions.toFixed(4)} kg CO₂ are equivalent to:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>{(totalEmissions / 0.0024).toFixed(2)} smartphone charges</li>
                <li>{(totalEmissions / 2.5).toFixed(4)} days of laptop use</li>
                <li>{(totalEmissions / 8.887).toFixed(6)} gallons of gasoline consumed</li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Sustainability Tips</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Switch to solar power when possible</li>
                <li>Turn off lights and appliances when not in use</li>
                <li>Use energy-efficient appliances</li>
                <li>Adjust your thermostat by just 1-2 degrees to save energy</li>
                <li>Unplug devices that aren't in use to avoid phantom power drain</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarbonFootprintPage;