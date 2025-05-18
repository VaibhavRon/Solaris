import { useNavigate } from 'react-router-dom';
export default function Header() {
   const navigate = useNavigate();
  return (
    <header className="bg-teal-700 text-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Home Energy Monitor</h1>
          <p className="text-teal-100">Renewable Energy Management System</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <div className="bg-teal-600 px-4 py-2 rounded-md flex items-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
           <span>
      <button onClick={() => navigate('/predict')} className="text-teal-100 hover:text-teal-200">Predict</button>
    
    </span>
          </div>
          <div className="bg-teal-600 px-4 py-2 rounded-md flex items-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
           <span>
     
      <button onClick={() => navigate('/carbon')} className="text-teal-100 hover:text-teal-200">Carbon</button>
    </span>
          </div>
          <div className="bg-teal-600 px-4 py-2 rounded-md animate-pulse">
            Live
          </div> 
        </div>
      </div>
    </header>
  );
}