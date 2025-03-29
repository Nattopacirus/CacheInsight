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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6 items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl p-8 transform transition-all hover:shadow-3xl flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-indigo-700 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            Cache Insight
          </h1>
          <h2 className="text-xl font-medium text-gray-600 mt-2">Simulation & Analysis of Memory Access</h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            Dive into cache performance with custom simulations. Upload your data and optimize with ease.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg animate-fade-in">
            {error}
          </div>
        )}

        {/* Form - Horizontal Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Memory Size (MB)</label>
              <input
                type="number"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                value={memorySize}
                onChange={(e) => setMemorySize(Math.max(0, Math.min(1024, e.target.value)))}
                min="0"
                max="1024"
              />
              <p className="text-xs text-gray-400 mt-1">0-1024 MB</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cache Size (KB)</label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none"
                value={cacheSize}
                onChange={(e) => setCacheSize(parseInt(e.target.value))}
              >
                {[1, 2, 4, 8, 16, 32, 64, 128, 256].map((size) => (
                  <option key={size} value={size}>{size} KB</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">1-256 KB</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Block Size (B)</label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none"
                value={blockSize}
                onChange={(e) => setBlockSize(parseInt(e.target.value))}
              >
                {[2, 4, 8, 16, 32, 64, 128, 256].map((size) => (
                  <option key={size} value={size}>{size} B</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Power of 2, up to 256 B</p>
            </div>
          </div>

          {/* Middle Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cache Mapping Technique</label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none"
                value={mappingTechnique}
                onChange={(e) => setMappingTechnique(e.target.value)}
              >
                <option value="directMapped">Direct Mapped</option>
                <option value="setAssociative">Set-Associative</option>
                <option value="fullyAssociative">Fully Associative</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address Size (bits)</label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none"
                value={addressSize}
                onChange={(e) => setAddressSize(parseInt(e.target.value))}
              >
                {[16, 32, 64].map((size) => (
                  <option key={size} value={size}>{size} bits</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Select address size</p>
            </div>

            {mappingTechnique === "setAssociative" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Associativity</label>
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none"
                  value={associativity}
                  onChange={(e) => setAssociativity(parseInt(e.target.value))}
                >
                  {[2, 4, 8, 16].map((level) => (
                    <option key={level} value={level}>{level}-way</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">For Set-Associative only</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Replacement Policy</label>
              <select
                className={`w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none ${mappingTechnique === "directMapped" ? "bg-gray-200 cursor-not-allowed" : "bg-gray-50"
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
                <p className="text-xs text-gray-400 mt-1">Not applicable for Direct Mapped</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload CSV File</label>
              <label className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-md">
                <span>Choose File</span>
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
              <p className="text-xs text-gray-400 mt-1">Upload memory access data (CSV)</p>
            </div>

            {fileData && (
              <div className="p-4 bg-gray-50 rounded-lg shadow-inner border border-gray-200 col-span-3 mt-4">
                <h2 className="text-lg font-semibold text-indigo-700 mb-2">Data Preview</h2>
                <div className="overflow-y-auto max-h-56 w-full"> {/* ปรับจาก max-h-40 เป็น max-h-56 */}
                  <table className="min-w-full table-auto border-collapse">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-600">Address (Hex)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fileData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-100 transition-colors">
                          <td className="px-4 py-2 text-gray-700">{row["Address(Hex)"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {fileName ? `File: ${fileName}` : "No data loaded"} | Rows: {fileData.length}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Start Simulation Button */}
        <div className="mt-8">
          <button
            onClick={startSimulation}
            className="w-full p-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            Start Simulation
          </button>
        </div>
      </div>

      {/* Footer - Centered Below */}
      <div className="mt-12 w-full text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Cache Insight. All rights reserved.</p>
        <p className="mt-1">
          Built with for memory performance analysis.
          <a href="https://github.com/Nattopacirus/CacheInsight.git" className="text-indigo-600 hover:underline ml-1" target="blank">Learn more</a>
        </p>
      </div>

    </div>
  );
};

export default CacheSimulation;