import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function VoltageGraph({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-teal-800 mb-4">Voltage Over Time</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Loading voltage data...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-teal-800 mb-4">Voltage Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
            domain={[0, 'dataMax + 5']} 
          />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="voltage1" 
            name="Voltage 1"
            stroke="#0d9488" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line 
            type="monotone" 
            dataKey="voltage2" 
            name="Voltage 2"
            stroke="#0284c7" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}