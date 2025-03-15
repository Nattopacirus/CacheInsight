import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Papa from "papaparse";

const CacheSimulation = () => {
  const [memorySize, setMemorySize] = useState(64); // ในหน่วย MB
  const [cacheSize, setCacheSize] = useState(1); // ในหน่วย KB
  const [blockSize, setBlockSize] = useState(16); // ในหน่วย B
  const [replacementPolicy, setReplacementPolicy] = useState("LRU");
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [mappingTechnique, setMappingTechnique] = useState("directMapped");
  const [associativity, setAssociativity] = useState(2); // สำหรับ Set-Associative Cache
  const [addressSize, setAddressSize] = useState(32); // ในหน่วย bits
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // รับค่าสถานะที่ส่งกลับมาและอัปเดต state
  useEffect(() => {
    if (location.state) {
      const {
        memorySize,
        cacheSize,
        blockSize,
        replacementPolicy,
        fileData,
        fileName,
        mappingTechnique,
        associativity,
        addressSize,
      } = location.state;

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

      const result = Papa.parse(text, {
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

    if (isNaN(blockSize) || blockSize <= 0 || blockSize > 64 * 1024) {
      setError("Block Size must be greater than 0 and less than or equal to 64 KB.");
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

    setError("");

    const state = {
      memorySize,
      cacheSize,
      blockSize,
      replacementPolicy,
      fileData,
      mappingTechnique,
      fileName,
      associativity,
      addressSize,
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-blue-700 mb-2">Cache Mapping Simulation</h1>
          <p className="text-md text-gray-500">
            Select a cache mapping technique and upload memory access data to analyze cache performance.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Memory Size (MB):</label>
            <input
              type="number"
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={memorySize}
              onChange={(e) => setMemorySize(Math.max(0, Math.min(1024, e.target.value)))}
              min="0"
              max="1024"
            />
            <p className="text-sm text-gray-500 mt-1">Memory Size must be between 0 and 1024 MB.</p>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">Cache Size (KB):</label>
            <select
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={cacheSize}
              onChange={(e) => setCacheSize(parseInt(e.target.value))}
            >
              <option value={1}>1 KB</option>
              <option value={2}>2 KB</option>
              <option value={4}>4 KB</option>
              <option value={8}>8 KB</option>
              <option value={16}>16 KB</option>
              <option value={32}>32 KB</option>
              <option value={64}>64 KB</option>
              <option value={128}>128 KB</option>
              <option value={256}>256 KB</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">Cache Size must be between 2 and 256 KB.</p>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">Block Size (B):</label>
            <select
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={blockSize}
              onChange={(e) => setBlockSize(parseInt(e.target.value))}
            >
              <option value={2}>2 B</option>
              <option value={4}>4 B</option>
              <option value={8}>8 B</option>
              <option value={16}>16 B</option>
              <option value={32}>32 B</option>
              <option value={64}>64 B</option>
              <option value={128}>128 B</option>
              <option value={256}>256 B</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">Block Size must be between 2 and 256 B.</p>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">Cache Mapping Technique:</label>
            <select
              className="w-full p-4 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              value={mappingTechnique}
              onChange={(e) => setMappingTechnique(e.target.value)}
            >
              <option value="directMapped">Direct Mapped</option>
              <option value="setAssociative">Set-Associative Cache</option>
              <option value="fullyAssociative">Fully Associative</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">Address Size (bits):</label>
            <select
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={addressSize}
              onChange={(e) => setAddressSize(parseInt(e.target.value))}
            >
              <option value={16}>16 bits</option>
              <option value={32}>32 bits</option>
              <option value={64}>64 bits</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">Select the address size in bits.</p>
          </div>

          {mappingTechnique === "setAssociative" && (
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Associativity:</label>
              <select
                className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={associativity}
                onChange={(e) => setAssociativity(parseInt(e.target.value))}
              >
                <option value={2}>2-way</option>
                <option value={4}>4-way</option>
                <option value={8}>8-way</option>
                <option value={16}>16-way</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Associativity is only applicable for Set-Associative Cache.
              </p>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-2">Replacement Policy:</label>
            <select
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 ${mappingTechnique === "directMapped" ? "bg-gray-200 cursor-not-allowed" : "bg-white"
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
              <p className="text-sm text-gray-500 mt-1">
                Replacement Policy is not applicable for Direct Mapped Cache.
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">Upload CSV File:</label>
            <label className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-center">
              <span>Choose File</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-sm text-gray-500 mt-1">Upload a CSV file containing memory access data.</p>
          </div>

          {fileData && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-blue-700 mb-2">Data Preview:</h2>
              <div className="overflow-y-scroll max-h-72">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-4 py-2 text-left border-b">Address(Hex)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.map((row, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border-b">{row["Address(Hex)"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* เพิ่มบรรทัดนี้เพื่อแสดงจำนวนแถว */}
              <p className="text-sm text-gray-500 mt-2">
                {fileName ? `File: ${fileName}` : "No data loaded"} | Total Rows: {fileData.length}
              </p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={startSimulation}
              className="text-2xl w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Start Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheSimulation;