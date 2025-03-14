import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const calculateDirectMappedCache = (cacheSize, blockSize, fileData) => {
  const cacheSizeBytes = cacheSize * 1024;

  // Validate block size
  if (blockSize <= 0 || !Number.isInteger(blockSize)) {
    throw new Error("Block size must be a positive integer.");
  }

  // Validate cache size
  if (cacheSizeBytes <= 0 || !Number.isInteger(cacheSizeBytes)) {
    throw new Error("Cache size must be a positive integer.");
  }

  // Ensure cache size is a multiple of block size
  if (cacheSizeBytes % blockSize !== 0) {
    throw new Error("Cache size must be a multiple of block size.");
  }

  const numberOfBlocks = cacheSizeBytes / blockSize;

  const offsetBits = Math.log2(blockSize);
  const indexBits = Math.log2(numberOfBlocks);
  const tagBits = 16 - offsetBits - indexBits;

  const cache = new Array(numberOfBlocks).fill(null);
  let hits = 0, misses = 0;

  fileData.forEach((row) => {
    const addressHex = row["Address(Hex)"];
    if (!addressHex) return;
    const addressDec = parseInt(addressHex, 16);
    if (isNaN(addressDec)) return;

    const index = (addressDec >> offsetBits) & ((1 << indexBits) - 1);
    const tag = addressDec >> (offsetBits + indexBits);

    if (cache[index] === tag) {
      hits++;
    } else {
      misses++;
      cache[index] = tag;
    }
  });

  return { hits, misses };
};

const CacheResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cacheSize, blockSize, fileData } = location.state || {};

  if (!location.state || isNaN(cacheSize) || isNaN(blockSize) || blockSize <= 0 || cacheSize <= 0 || !fileData?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
          <h1 className="text-3xl font-semibold text-blue-700 mb-2">Error</h1>
          <p className="text-md text-gray-500">Invalid simulation data. Please ensure cache size and block size are valid.</p>
        </div>
      </div>
    );
  }

  const { hits, misses } = useMemo(() => calculateDirectMappedCache(cacheSize, blockSize, fileData), [cacheSize, blockSize, fileData]);

  const blockSizes = [16, 32, 64, 128, 256];
  const missRates = blockSizes.map((size) => {
    const { misses, hits } = calculateDirectMappedCache(cacheSize, size, fileData);
    return (misses / (hits + misses)) * 100;
  });

  const barChartData = {
    labels: ["Hits", "Misses"],
    datasets: [
      {
        label: "Cache Access Results",
        data: [hits, misses],
        backgroundColor: ["#36A2EB", "#FF6384"],
        borderColor: ["#36A2EB", "#FF6384"],
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: blockSizes.map((size) => `${size} B`),
    datasets: [
      {
        label: "Miss Rate (%)",
        data: missRates,
        fill: false,
        borderColor: "#FF6384",
        backgroundColor: "#FF6384",
        tension: 0.2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true },
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-blue-700 mb-2">Direct Mapped Cache Results</h1>
          <p className="text-md text-gray-500">Results of the Direct Mapped Cache simulation.</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Simulation Results:</h2>
            <p className="text-lg">Hits: {hits}</p>
            <p className="text-lg">Misses: {misses}</p>
            <p className="text-lg">Hit Rate: {((hits / (hits + misses)) * 100).toFixed(2)}%</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Cache Parameters:</h2>
            <p className="text-lg">Cache Size: {cacheSize} KB</p>
            <p className="text-lg">Block Size: {blockSize} B</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Cache Access Results:</h2>
            <Bar data={barChartData} options={chartOptions} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Miss Rate vs Block Size:</h2>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* ปุ่มย้อนกลับ */}
        <div className="mt-6 text-center">
          <button 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CacheResults;
