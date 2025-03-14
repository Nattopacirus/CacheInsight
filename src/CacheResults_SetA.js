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

const calculateSetAssociativeCache = (cacheSize, blockSize, associativity, fileData, replacementPolicy) => {
  const cacheSizeBytes = cacheSize * 1024;
  const numberOfBlocks = cacheSizeBytes / blockSize;
  const numberOfSets = numberOfBlocks / associativity;

  if (!Number.isInteger(numberOfSets) || numberOfSets <= 0) {
    throw new Error("Invalid number of sets");
  }

  const offsetBits = Math.log2(blockSize);
  const indexBits = Math.log2(numberOfSets);
  const tagBits = 16 - offsetBits - indexBits;

  // Initialize cache as a 2D array (sets x associativity)
  const cache = Array.from({ length: numberOfSets }, () =>
    Array.from({ length: associativity }, () => ({ tag: null, lruCounter: 0, fifoCounter: 0 }))
  );

  let hits = 0,
    misses = 0;

  fileData.forEach((row) => {
    const addressHex = row["Address(Hex)"];
    if (!addressHex) return;
    const addressDec = parseInt(addressHex, 16);
    if (isNaN(addressDec)) return;

    const index = (addressDec >> offsetBits) & ((1 << indexBits) - 1);
    const tag = addressDec >> (offsetBits + indexBits);

    const set = cache[index];
    let hit = false;

    // Check for a hit
    for (let i = 0; i < set.length; i++) {
      if (set[i].tag === tag) {
        hits++;
        hit = true;
        if (replacementPolicy === "LRU") {
          set[i].lruCounter = 0; // Reset LRU counter on hit
        }
        break;
      }
    }

    // If miss, replace a block based on the replacement policy
    if (!hit) {
      misses++;
      let replaceIndex = 0;

      switch (replacementPolicy) {
        case "LRU": {
          let maxLRU = set[0].lruCounter;
          for (let i = 1; i < set.length; i++) {
            if (set[i].lruCounter > maxLRU) {
              maxLRU = set[i].lruCounter;
              replaceIndex = i;
            }
          }
          break;
        }
        case "FIFO": {
          let maxFIFO = set[0].fifoCounter;
          for (let i = 1; i < set.length; i++) {
            if (set[i].fifoCounter > maxFIFO) {
              maxFIFO = set[i].fifoCounter;
              replaceIndex = i;
            }
          }
          break;
        }
        case "RANDOM": {
          replaceIndex = Math.floor(Math.random() * set.length);
          break;
        }
        default:
          throw new Error("Invalid replacement policy");
      }

      set[replaceIndex].tag = tag;
      set[replaceIndex].lruCounter = 0; // Reset LRU counter for the new block
      set[replaceIndex].fifoCounter = 0; // Reset FIFO counter for the new block
    }

    // Update counters for all blocks in the set
    for (let i = 0; i < set.length; i++) {
      if (set[i].tag !== null) {
        if (replacementPolicy === "LRU") {
          set[i].lruCounter++;
        } else if (replacementPolicy === "FIFO") {
          set[i].fifoCounter++;
        }
      }
    }
  });

  return { hits, misses };
};

const CacheResults_SetA = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { memorySize, cacheSize, blockSize, associativity, replacementPolicy, fileData, fileName } = location.state || {};

  if (
    !location.state ||
    isNaN(memorySize) ||
    isNaN(cacheSize) ||
    isNaN(blockSize) ||
    isNaN(associativity) ||
    blockSize <= 0 ||
    cacheSize <= 0 ||
    associativity <= 0 ||
    !fileData?.length ||
    !["LRU", "FIFO", "RANDOM"].includes(replacementPolicy)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
          <h1 className="text-3xl font-semibold text-blue-700 mb-2">Error</h1>
          <p className="text-md text-gray-500">Invalid simulation data.</p>
        </div>
      </div>
    );
  }

  const { hits, misses } = useMemo(
    () => calculateSetAssociativeCache(cacheSize, blockSize, associativity, fileData, replacementPolicy),
    [cacheSize, blockSize, associativity, fileData, replacementPolicy]
  );

  const blockSizes = [16, 32, 64, 128, 256];
  const missRates = blockSizes.map((size) => {
    const { misses, hits } = calculateSetAssociativeCache(cacheSize, size, associativity, fileData, replacementPolicy);
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
          <h1 className="text-3xl font-semibold text-blue-700 mb-2">Set-Associative Cache Results</h1>
          <p className="text-md text-gray-500">
            Results of the Set-Associative Cache simulation with {replacementPolicy} replacement.
          </p>
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
            <p className="text-lg">Memory Size: {memorySize} MB</p>
            <p className="text-lg">Cache Size: {cacheSize} KB</p>
            <p className="text-lg">Block Size: {blockSize} B</p>
            <p className="text-lg">Associativity: {associativity}-way</p>
            <p className="text-lg">Replacement Policy: {replacementPolicy}</p>
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

        {/* Back Button */}
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

export default CacheResults_SetA;