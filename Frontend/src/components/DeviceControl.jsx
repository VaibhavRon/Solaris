export default function DeviceControl({ device, onToggle }) {
  const getIcon = (name) => {
    switch(name) {
      case 'Fan':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.071 4.929a9.936 9.936 0 00-7.07-2.938 9.936 9.936 0 00-7.072 2.938 9.936 9.936 0 00-2.929 7.071 9.936 9.936 0 002.929 7.071 9.936 9.936 0 007.072 2.938 9.936 9.936 0 007.07-2.938 9.936 9.936 0 002.93-7.071 9.936 9.936 0 00-2.93-7.071zM12 15a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        );
      case 'AC':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2h16z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17H8m4-8v8" />
          </svg>
        );
      case 'Room Lights':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${device.relay.state ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${device.relay.state ? 'bg-teal-100' : 'bg-gray-100'}`}>
            {getIcon(device.name)}
          </div>
          <div className="ml-3">
            <h3 className="font-medium">{device.name}</h3>
            <p className={device.relay.state ? "text-teal-600" : "text-gray-500"}>
              {device.relay.state ? "ON" : "OFF"}
            </p>
          </div>
        </div>
        <label className="inline-flex relative items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={device.relay.state} 
            onChange={onToggle}
          />
          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-600"></div>
        </label>
      </div>
    </div>
  );
}