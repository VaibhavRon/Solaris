import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function CarbonFootprintGraph({ data }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-green-800 mb-4">Carbon Footprint</h2>
      <div className="text-sm text-gray-500 mb-4">
        Real-time carbon emissions from your electricity usage
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis 
            label={{ value: 'CO₂ (kg)', angle: -90, position: 'insideLeft' }} 
            allowDecimals={true}
            domain={['dataMin', 'dataMax']}
          />
          <Tooltip 
            formatter={(value) => [`${value.toFixed(4)} kg`, 'CO₂ Emissions']}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="emissions" 
            stroke="#10B981" 
            name="CO₂ Emissions"
            strokeWidth={2}
            dot={{ r: 2 }} 
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">Current Emission Rate</h3>
          <p className="text-2xl font-bold text-green-600">
            {data.length > 0 ? `${data[data.length - 1].emissions.toFixed(4)} kg CO₂/hr` : '0.0000 kg CO₂/hr'}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">Total Emissions</h3>
          <p className="text-2xl font-bold text-green-600">
            {data.length > 0 
              ? `${data.reduce((sum, point) => sum + point.emissions, 0).toFixed(4)} kg CO₂` 
              : '0.0000 kg CO₂'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CarbonFootprintGraph;