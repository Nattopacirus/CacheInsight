import React, { useState } from 'react';

function InputForm({ onSubmit }) {
  const [memorySize, setMemorySize] = useState('');
  const [cacheSize, setCacheSize] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ memorySize, cacheSize });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
        <h1 className="text-3xl font-semibold text-blue-700 mb-6 text-center">Cache Simulation</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Memory Size (MB):</label>
            <input
              type="number"
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={memorySize}
              onChange={(e) => setMemorySize(e.target.value)}
              placeholder="Enter memory size in MB"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Cache Size (KB):</label>
            <input
              type="number"
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={cacheSize}
              onChange={(e) => setCacheSize(e.target.value)}
              placeholder="Enter cache size in KB"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Run Simulation
          </button>
        </form>
      </div>
    </div>
  );
}

export default InputForm;