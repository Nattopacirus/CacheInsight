import React, { useState } from 'react';

function InputForm({ onSubmit }) {
  const [memorySize, setMemorySize] = useState('');
  const [cacheSize, setCacheSize] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ memorySize, cacheSize });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Memory Size (MB): </label>
        <input 
          type="number" 
          value={memorySize} 
          onChange={(e) => setMemorySize(e.target.value)} 
        />
      </div>
      <div>
        <label>Cache Size (KB): </label>
        <input 
          type="number" 
          value={cacheSize} 
          onChange={(e) => setCacheSize(e.target.value)} 
        />
      </div>
      <button type="submit">Run Simulation</button>
    </form>
  );
}

export default InputForm;
