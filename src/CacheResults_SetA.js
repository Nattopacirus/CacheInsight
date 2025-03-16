import React, { useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Function to simulate Direct Mapped Cache
const calculateDirectMappedCache = (cacheSize, blockSize, fileData, addressSize) => {
  const cacheSizeBytes = cacheSize * 1024;
  if (blockSize <= 0 || !Number.isInteger(blockSize)) throw new Error("Block size must be a positive integer.");
  if (cacheSizeBytes <= 0 || !Number.isInteger(cacheSizeBytes)) throw new Error("Cache size must be a positive integer.");
  if (cacheSizeBytes % blockSize !== 0) throw new Error("Cache size must be a multiple of block size.");

  const numberOfBlocks = cacheSizeBytes / blockSize;
  const offsetBits = Math.log2(blockSize);
  const indexBits = Math.log2(numberOfBlocks);
  const tagBits = addressSize - offsetBits - indexBits;

  if (tagBits <= 0) throw new Error("Invalid address size or cache configuration.");

  const cache = new Array(numberOfBlocks).fill(null);
  let hits = 0,
    misses = 0;
  let invalidRows = 0;

  fileData.forEach((row, rowIndex) => {
    const addressHex = row["Address(Hex)"];
    if (!addressHex) {
      invalidRows++;
      console.warn(`Row ${rowIndex}: Missing Address(Hex)`);
      return;
    }
    const addressDec = parseInt(addressHex, 16);
    if (isNaN(addressDec)) {
      invalidRows++;
      console.warn(`Row ${rowIndex}: Invalid Address(Hex) - ${addressHex}`);
      return;
    }

    const index = (addressDec >> offsetBits) & ((1 << indexBits) - 1);
    const tag = addressDec >> (offsetBits + indexBits);

    if (cache[index] === tag) {
      hits++;
    } else {
      misses++;
      cache[index] = tag;
    }
  });

  if (invalidRows > 0) {
    console.warn(`Found ${invalidRows} invalid rows in fileData`);
  }

  return { hits, misses };
};

// Function to simulate Set-Associative Cache
const calculateSetAssociativeCache = (cacheSize, blockSize, fileData, associativity, replacementPolicy, addressSize) => {
  const cacheSizeBytes = cacheSize * 1024;
  const blockSizeBytes = blockSize;

  if (blockSizeBytes <= 0 || !Number.isInteger(blockSizeBytes)) throw new Error("Block size must be a positive integer.");
  if ((blockSizeBytes & (blockSizeBytes - 1)) !== 0) throw new Error("Block size must be a power of 2.");
  if (cacheSizeBytes <= 0 || !Number.isInteger(cacheSizeBytes)) throw new Error("Cache size must be a positive integer.");
  if (cacheSizeBytes % blockSizeBytes !== 0) throw new Error("Cache size must be a multiple of block size.");

  const numberOfSets = cacheSizeBytes / blockSizeBytes / associativity;
  const offsetBits = Math.log2(blockSizeBytes);
  const indexBits = Math.log2(numberOfSets);
  const tagBits = addressSize - offsetBits - indexBits;

  if (tagBits <= 0) throw new Error("Invalid address size or cache configuration.");

  const cache = Array.from({ length: numberOfSets }, () => []);
  const accessOrder = Array.from({ length: numberOfSets }, () => []);
  let hits = 0,
    misses = 0;
  let invalidRows = 0;

  fileData.forEach((row, rowIndex) => {
    const addressHex = row["Address(Hex)"];
    if (!addressHex) {
      invalidRows++;
      console.warn(`Row ${rowIndex}: Missing Address(Hex)`);
      return;
    }
    const addressDec = parseInt(addressHex, 16);
    if (isNaN(addressDec)) {
      invalidRows++;
      console.warn(`Row ${rowIndex}: Invalid Address(Hex) - ${addressHex}`);
      return;
    }

    const tag = addressDec >> (offsetBits + indexBits);
    const setIndex = (addressDec >> offsetBits) & ((1 << indexBits) - 1);

    if (cache[setIndex].includes(tag)) {
      hits++;
      if (replacementPolicy === "LRU") {
        const tagIndex = accessOrder[setIndex].indexOf(tag);
        accessOrder[setIndex].splice(tagIndex, 1);
        accessOrder[setIndex].push(tag);
      }
    } else {
      misses++;
      if (cache[setIndex].length < associativity) {
        cache[setIndex].push(tag);
        accessOrder[setIndex].push(tag);
      } else {
        let evictTag;
        if (replacementPolicy === "LRU") {
          evictTag = accessOrder[setIndex].shift();
        } else if (replacementPolicy === "FIFO") {
          evictTag = accessOrder[setIndex].shift();
        } else if (replacementPolicy === "Random") {
          evictTag = accessOrder[setIndex][Math.floor(Math.random() * accessOrder[setIndex].length)];
          if (accessOrder[setIndex].includes(evictTag)) {
            accessOrder[setIndex].splice(accessOrder[setIndex].indexOf(evictTag), 1);
          }
        }
        cache[setIndex].splice(cache[setIndex].indexOf(evictTag), 1);
        cache[setIndex].push(tag);
        accessOrder[setIndex].push(tag);
      }
    }
  });

  if (invalidRows > 0) {
    console.warn(`Found ${invalidRows} invalid rows in fileData`);
  }

  return { hits, misses };
};

// Function to simulate Fully Associative Cache
const calculateFullyAssociativeCache = (cacheSize, blockSize, fileData, replacementPolicy, addressSize) => {
  const cacheSizeBytes = cacheSize * 1024;
  const blockSizeBytes = blockSize;

  if (blockSizeBytes <= 0 || !Number.isInteger(blockSizeBytes)) throw new Error("Block size must be a positive integer.");
  if ((blockSizeBytes & (blockSizeBytes - 1)) !== 0) throw new Error("Block size must be a power of 2.");
  if (cacheSizeBytes <= 0 || !Number.isInteger(cacheSizeBytes)) throw new Error("Cache size must be a positive integer.");
  if (cacheSizeBytes % blockSizeBytes !== 0) throw new Error("Cache size must be a multiple of block size.");

  const numberOfBlocks = cacheSizeBytes / blockSizeBytes;
  const cache = new Set();
  const accessOrder = [];
  let hits = 0,
    misses = 0;
  let invalidRows = 0;

  fileData.forEach((row, rowIndex) => {
    const addressHex = row["Address(Hex)"];
    if (!addressHex) {
      invalidRows++;
      console.warn(`Row ${rowIndex}: Missing Address(Hex)`);
      return;
    }
    const addressDec = parseInt(addressHex, 16);
    if (isNaN(addressDec)) {
      invalidRows++;
      console.warn(`Row ${rowIndex}: Invalid Address(Hex) - ${addressHex}`);
      return;
    }

    const tag = addressDec >> Math.log2(blockSizeBytes);

    if (cache.has(tag)) {
      hits++;
      if (replacementPolicy === "LRU") {
        accessOrder.splice(accessOrder.indexOf(tag), 1);
        accessOrder.push(tag);
      }
    } else {
      misses++;
      if (cache.size < numberOfBlocks) {
        cache.add(tag);
        accessOrder.push(tag);
      } else {
        let evictTag;
        if (replacementPolicy === "LRU") {
          evictTag = accessOrder.shift();
        } else if (replacementPolicy === "FIFO") {
          evictTag = accessOrder.shift();
        } else if (replacementPolicy === "Random") {
          evictTag = accessOrder[Math.floor(Math.random() * accessOrder.length)];
          if (accessOrder.includes(evictTag)) {
            accessOrder.splice(accessOrder.indexOf(evictTag), 1);
          }
        }
        cache.delete(evictTag);
        cache.add(tag);
        accessOrder.push(tag);
      }
    }
  });

  if (invalidRows > 0) {
    console.warn(`Found ${invalidRows} invalid rows in fileData`);
  }

  return { hits, misses };
};

const CacheResults_SetA = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cacheSize,
    blockSize,
    fileData,
    fileName,
    replacementPolicy,
    memorySize,
    mappingTechnique,
    associativity,
    addressSize,
  } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    navigate("/", {
      state: {
        memorySize,
        cacheSize,
        blockSize,
        replacementPolicy,
        fileData,
        fileName,
        mappingTechnique,
        associativity,
        addressSize,
      },
    });
  };

  if (
    !location.state ||
    isNaN(cacheSize) ||
    isNaN(blockSize) ||
    blockSize <= 0 ||
    cacheSize <= 0 ||
    !fileData?.length
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
          <h1 className="text-3xl font-semibold text-blue-700 mb-2">Error</h1>
          <p className="text-md text-gray-500">
            Invalid simulation data. Please ensure cache size and block size are valid.
          </p>
        </div>
      </div>
    );
  }

  if (!["LRU", "FIFO", "Random"].includes(replacementPolicy)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
          <h1 className="text-3xl font-semibold text-blue-700 mb-2">Error</h1>
          <p className="text-md text-gray-500">
            Invalid replacement policy. Please choose LRU, FIFO, or Random.
          </p>
        </div>
      </div>
    );
  }

  const validAssociativities = [1, 2, 4, 8, 16];
  if (!validAssociativities.includes(associativity) && mappingTechnique !== "fullyAssociative") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
          <h1 className="text-3xl font-semibold text-blue-700 mb-2">Error</h1>
          <p className="text-md text-gray-500">
            Invalid associativity. Please choose 1-way, 2-way, 4-way, 8-way, or 16-way.
          </p>
        </div>
      </div>
    );
  }

  // Calculate simulation results based on mapping technique
  const simulationResults = useMemo(() => {
    if (mappingTechnique === "direct") {
      return calculateDirectMappedCache(cacheSize, blockSize, fileData, addressSize);
    } else if (mappingTechnique === "fullyAssociative") {
      return calculateFullyAssociativeCache(cacheSize, blockSize, fileData, replacementPolicy, addressSize);
    } else {
      return calculateSetAssociativeCache(cacheSize, blockSize, fileData, associativity, replacementPolicy, addressSize);
    }
  }, [cacheSize, blockSize, fileData, replacementPolicy, addressSize, mappingTechnique, associativity]);

  const { hits, misses } = simulationResults;
  const hitRate = ((hits / (hits + misses)) * 100).toFixed(2);

  // Format associativity display
  const associativityDisplay = mappingTechnique === "fullyAssociative" ? "Fully Associative" : `${associativity}-way`;

  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#C9CBCF",
    "#77DD77",
    "#FF4500",
  ];

  const associativities = [1, 2, 4, 8, 16, "Fully"];
  const cacheSizes = [1, 2, 4, 8, 16, 32, 64, 128, 256];

  // Existing Miss Rate vs Associativity chart
  const lineChartData = {
    labels: associativities.map((a) =>
      a === "Fully" ? "Fully Associative" : a === 1 ? "1-way (Direct Mapped)" : `${a}-way`
    ),
    datasets: cacheSizes.map((size, index) => ({
      label: `${size} KiB`,
      data: associativities.map((a) => {
        if (a === "Fully") {
          const { misses, hits } = calculateFullyAssociativeCache(size, blockSize, fileData, replacementPolicy, addressSize);
          return (misses / (hits + misses)) * 100;
        } else if (a === 1) {
          const { misses, hits } = calculateDirectMappedCache(size, blockSize, fileData, addressSize);
          return (misses / (hits + misses)) * 100;
        } else {
          const { misses, hits } = calculateSetAssociativeCache(size, blockSize, fileData, a, replacementPolicy, addressSize);
          return (misses / (hits + misses)) * 100;
        }
      }),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length],
      fill: false,
      tension: 0.2,
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Miss Rate vs Associativity for Different Cache Sizes" },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toFixed(2)}%`,
        },
      },
    },
    scales: {
      y: { title: { display: true, text: "Miss Rate (%)" }, min: 0, max: 100 },
      x: { title: { display: true, text: "Associativity" } },
    },
  };

  // New Hit Rate vs Cache Size chart
  const hitRateChartData = {
    labels: cacheSizes.map((size) => `${size} KiB`),
    datasets: [{
      label: `Hit Rate (${associativityDisplay})`,
      data: cacheSizes.map((size) => {
        if (mappingTechnique === "direct") {
          const { misses, hits } = calculateDirectMappedCache(size, blockSize, fileData, addressSize);
          return (hits / (hits + misses)) * 100;
        } else if (mappingTechnique === "fullyAssociative") {
          const { misses, hits } = calculateFullyAssociativeCache(size, blockSize, fileData, replacementPolicy, addressSize);
          return (hits / (hits + misses)) * 100;
        } else {
          const { misses, hits } = calculateSetAssociativeCache(size, blockSize, fileData, associativity, replacementPolicy, addressSize);
          return (hits / (hits + misses)) * 100;
        }
      }),
      borderColor: "#36A2EB",
      backgroundColor: "#36A2EB",
      fill: false,
      tension: 0.2,
    }],
  };

  const hitRateChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Hit Rate vs Cache Size (${associativityDisplay})` },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toFixed(2)}%`,
        },
      },
    },
    scales: {
      y: { title: { display: true, text: "Hit Rate (%)" }, min: 0, max: 100 },
      x: { title: { display: true, text: "Cache Size (KiB)" } },
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-6xl border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-blue-700 mb-2">Set-Associative Cache Results</h1>
          <p className="text-md text-gray-500">Results of the Set-Associative Cache simulation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Simulation Results:</h2>
            <p className="text-lg">Hits: {hits}</p>
            <p className="text-lg">Misses: {misses}</p>
            <p className="text-lg">Hit Rate: {hitRate}%</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Cache Parameters:</h2>
            <p className="text-lg">Cache Size: {cacheSize} KB</p>
            <p className="text-lg">Block Size: {blockSize} B</p>
            <p className="text-lg">Replacement Policy: {replacementPolicy}</p>
            <p className="text-lg">Memory Size: {memorySize} MB</p>
            <p className="text-lg">Mapping Technique: {mappingTechnique}</p>
            <p className="text-lg">Associativity: {associativityDisplay}</p>
            <p className="text-lg">Address Size: {addressSize} bits</p>
          </div>

          <div className="col-span-2">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Miss Rate vs Associativity:</h2>
            <Line data={lineChartData} options={chartOptions} />
            <p className="text-sm text-gray-500 mt-2">
              Shows the Miss Rate (%) for different Associativities (1-way (Direct Mapped), 2-way, 4-way, 8-way, 16-way, and Fully Associative) and Cache Sizes (1 KiB to 256 KiB).
            </p>
          </div>

          <div className="col-span-2">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Hit Rate vs Cache Size:</h2>
            <Line data={hitRateChartData} options={hitRateChartOptions} />
            <p className="text-sm text-gray-500 mt-2">
              Shows the Hit Rate (%) for different Cache Sizes with {associativityDisplay}.
            </p>
          </div>

          {fileData && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm col-span-2">
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
              <p className="text-sm text-gray-500 mt-2">
                {fileName ? `File: ${fileName}` : "No data loaded"} | Total Rows: {fileData.length}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            onClick={handleBack}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CacheResults_SetA;