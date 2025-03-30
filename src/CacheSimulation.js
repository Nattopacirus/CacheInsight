import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Papa from "papaparse";

const CacheSimulation = () => {
  const [memorySize, setMemorySize] = useState(64);
  const [cacheSize, setCacheSize] = useState(1);
  const [blockSize, setBlockSize] = useState(16);
  const [replacementPolicy, setReplacementPolicy] = useState("LRU");
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [mappingTechnique, setMappingTechnique] = useState("directMapped");
  const [associativity, setAssociativity] = useState(2);
  const [addressSize, setAddressSize] = useState(32);
  const [error, setError] = useState("");
  // เพิ่ม state สำหรับควบคุมการแสดงผล
  const [showAllData, setShowAllData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // เพิ่ม state สำหรับควบคุมการแสดงคำอธิบาย
  const [showFileFormatHelp, setShowFileFormatHelp] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      const { memorySize, cacheSize, blockSize, replacementPolicy, fileData, fileName, mappingTechnique, associativity, addressSize } = location.state;
      setMemorySize(memorySize);
      setCacheSize(cacheSize);
      setBlockSize(blockSize);
      setReplacementPolicy(replacementPolicy);
      setFileData(fileData);
      setFileName(fileName);
      setMappingTechnique(mappingTechnique);
      setAssociativity(associativity);
      setAddressSize(addressSize);
    }
  }, [location.state]);

  const handleShowAll = () => {
    if (!showAllData && fileData.length > 1000) {
      setIsLoading(true);
      setTimeout(() => {
        setShowAllData(true);
        setIsLoading(false);
      }, 100);
    } else {
      setShowAllData(!showAllData);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError("No file selected.");
      return;
    }
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (parsedResult) => {
          if (parsedResult.errors.length > 0) {
            setError("Error parsing CSV file.");
            console.error("Parsing Errors:", parsedResult.errors);
            return;
          }
          if (!parsedResult.data || parsedResult.data.length === 0) {
            setError("CSV file is empty or has incorrect format.");
            return;
          }
          setFileData(parsedResult.data);
          setFileName(file.name);
          setError("");
        },
        delimiter: ",",
      });
    };
    reader.readAsText(file, "UTF-8");
  };

  const startSimulation = () => {
    if (!fileData || fileData.length === 0) {
      setError("Please use sample data or upload a valid CSV file before starting the simulation.");
      return;
    }
    if (isNaN(memorySize) || memorySize <= 0 || memorySize > 1024) {
      setError("Memory Size must be greater than 0 and less than or equal to 1024 MB.");
      return;
    }
    if (isNaN(cacheSize) || cacheSize <= 0 || cacheSize > 256) {
      setError("Cache Size must be greater than 0 and less than or equal to 256 KB.");
      return;
    }
    if (isNaN(blockSize) || blockSize <= 0 || blockSize > 64 * 1024 || (blockSize & (blockSize - 1)) !== 0) {
      setError("Block Size must be a positive power of 2 and less than or equal to 64 KB.");
      return;
    }
    if (mappingTechnique === "setAssociative" && (isNaN(associativity) || associativity <= 0)) {
      setError("Associativity must be greater than 0 for Set-Associative Cache.");
      return;
    }
    const blockSizeKB = blockSize / 1024;
    if (cacheSize < blockSizeKB) {
      setError("Cache Size must be greater than or equal to Block Size.");
      return;
    }

    // เพิ่มการตรวจสอบสำหรับ Set-Associative Cache
    if (mappingTechnique === "setAssociative") {
      const cacheSizeBytes = cacheSize * 1024;
      const numberOfSets = cacheSizeBytes / blockSize / associativity;
      if (numberOfSets < 1 || !Number.isInteger(numberOfSets)) {
        setError(
          `Invalid cache configuration: Number of sets (${numberOfSets}) must be a positive integer. Please adjust Cache Size (${cacheSize} KB), Block Size (${blockSize} B), or Associativity (${associativity}).`
        );
        return;
      }
    }

    setError("");

    const state = {
      memorySize: Math.floor(memorySize),
      cacheSize: Math.floor(cacheSize),
      blockSize: Math.floor(blockSize),
      replacementPolicy,
      fileData,
      mappingTechnique,
      fileName,
      associativity: Math.floor(associativity),
      addressSize: Math.floor(addressSize),
    };

    switch (mappingTechnique) {
      case "directMapped":
        navigate("/results_direct", { state });
        break;
      case "setAssociative":
        navigate("/results_setA", { state });
        break;
      case "fullyAssociative":
        navigate("/results_fully", { state });
        break;
      default:
        setError("Invalid mapping technique selected.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-4 md:p-6 items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl p-6 md:p-8 transform transition-all hover:shadow-3xl flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            Cache Insight
          </h1>
          <h2 className="text-lg md:text-xl font-medium text-gray-600 mt-2">Simulation & Analysis of Memory Access</h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg animate-fade-in">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Form - Adjusted Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cache Parameters */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">Memory Parameters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Memory Size (MB)</label>
                  <input
                    type="number"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={memorySize}
                    onChange={(e) => setMemorySize(Math.max(0, Math.min(1024, e.target.value)))}
                    min="0"
                    max="1024"
                  />
                  <p className="text-xs text-gray-500 mt-1">Range: 0-1024 MB</p>
                  <p className="text-xs text-gray-500 mt-1">This value is used only to calculate the address range, it does not directly affect the Hit/Miss rate.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Address Size (bits)</label>
                  <select
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={addressSize}
                    onChange={(e) => setAddressSize(parseInt(e.target.value))}
                  >
                    {[16, 32, 64].map((size) => (
                      <option key={size} value={size}>{size} bits</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">Cache Parameters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cache Size (KB)</label>
                  <select
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={cacheSize}
                    onChange={(e) => setCacheSize(parseInt(e.target.value))}
                  >
                    {[1, 2, 4, 8, 16, 32, 64, 128, 256].map((size) => (
                      <option key={size} value={size}>{size} KB</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Range: 1-256 KB</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Block Size (B)</label>
                  <select
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={blockSize}
                    onChange={(e) => setBlockSize(parseInt(e.target.value))}
                  >
                    {[2, 4, 8, 16, 32, 64, 128, 256].map((size) => (
                      <option key={size} value={size}>{size} B</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Power of 2, up to 256 B</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Mapping & Policy */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">Mapping Technique</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mapping Type</label>
                  <select
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={mappingTechnique}
                    onChange={(e) => setMappingTechnique(e.target.value)}
                  >
                    <option value="directMapped">Direct Mapped</option>
                    <option value="setAssociative">Set-Associative</option>
                    <option value="fullyAssociative">Fully Associative</option>
                  </select>
                </div>

                {mappingTechnique === "setAssociative" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Associativity</label>
                    <select
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={associativity}
                      onChange={(e) => setAssociativity(parseInt(e.target.value))}
                    >
                      {[2, 4, 8, 16].map((level) => (
                        <option key={level} value={level}>{level}-way</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Replacement Policy</label>
                  <select
                    className={`w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${mappingTechnique === "directMapped" ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                      }`}
                    value={replacementPolicy}
                    onChange={(e) => setReplacementPolicy(e.target.value)}
                    disabled={mappingTechnique === "directMapped"}
                  >
                    <option value="LRU">Least Recently Used (LRU)</option>
                    <option value="FIFO">First In First Out (FIFO)</option>
                    <option value="Random">Random</option>
                  </select>
                  {mappingTechnique === "directMapped" && (
                    <p className="text-xs text-gray-500 mt-1">Not applicable for Direct Mapped</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Data Input */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">Data Input</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Memory Access Data</label>
                  <label className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-md">
                    <span>Choose CSV File</span>
                    <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Supports CSV files with Address(Hex) column</p>

                  <button
                    onClick={() => setShowFileFormatHelp(!showFileFormatHelp)}
                    className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 underline"
                  >
                    {showFileFormatHelp ? 'Hide Format Details' : 'Show File Format Requirements'}
                  </button>

                  {showFileFormatHelp && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 text-sm">CSV File Requirements:</h4>
                      <ul className="list-disc pl-5 text-xs text-gray-700 space-y-1 mt-1">
                        <li>Must contain <span className="font-mono">Address(Hex)</span> column</li>
                        <li>Hexadecimal format (e.g. <span className="font-mono">0x00000000</span>)</li>
                        <li>One memory access per row</li>
                      </ul>
                      <div className="mt-2 bg-gray-100 p-2 rounded font-mono text-xs">
                        <div>Address(Hex)</div>
                        <div>0x00000000</div>
                        <div>0x00000004</div>
                        <div>0x00000008</div>
                      </div>
                    </div>
                  )}
                </div>

                {fileData && (
                  <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                      <h4 className="font-medium text-gray-800">
                        Data Preview {showAllData ? '' : '(First 5 Rows)'}
                      </h4>
                      {fileData.length > 5 && (
                        <button
                          onClick={handleShowAll}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Loading...' : showAllData ? 'Show Less' : 'Show All'}
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-60">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Address (Hex)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {(showAllData ? fileData : fileData.slice(0, 5)).map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-sm text-gray-700">{index + 1}</td>
                              <td className="px-3 py-2 text-sm font-mono text-gray-900">{row["Address(Hex)"]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
                      {fileName} | Showing {showAllData ? fileData.length : Math.min(5, fileData.length)} of {fileData.length} rows
                      {fileData.length > 1000 && (
                        <span className="ml-2 text-yellow-600">Large file - may affect performance</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Start Simulation Button */}
        <div className="mt-8">
          <button
            onClick={startSimulation}
            className="w-full p-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            disabled={!fileData}
          >
            Start Simulation
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Cache Insight. All rights reserved.</p>
          <p className="mt-1">
            BBuilt for memory performance analysis.
            <a href="https://github.com/Nattopacirus/CacheInsight.git" className="text-indigo-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CacheSimulation;