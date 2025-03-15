import React, { useMemo, useEffect } from "react";
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

// Function to simulate Fully Associative Cache
const calculateFullyAssociativeCache = (cacheSize, blockSize, fileData, replacementPolicy) => {
    const cacheSizeBytes = cacheSize * 1024;
    const blockSizeBytes = blockSize;

    // Validate block size
    if (blockSizeBytes <= 0 || !Number.isInteger(blockSizeBytes)) {
        throw new Error("Block size must be a positive integer.");
    }

    // Validate cache size
    if (cacheSizeBytes <= 0 || !Number.isInteger(cacheSizeBytes)) {
        throw new Error("Cache size must be a positive integer.");
    }

    // Ensure cache size is a multiple of block size
    if (cacheSizeBytes % blockSizeBytes !== 0) {
        throw new Error("Cache size must be a multiple of block size.");
    }

    const numberOfBlocks = cacheSizeBytes / blockSizeBytes;
    const cache = new Set(); // Use Set for faster lookups
    const accessOrder = []; // For tracking access order in LRU/FIFO
    let hits = 0,
        misses = 0;

    fileData.forEach((row) => {
        const addressHex = row["Address(Hex)"];
        if (!addressHex) return;
        const addressDec = parseInt(addressHex, 16);
        if (isNaN(addressDec)) return;

        const tag = addressDec >> Math.log2(blockSizeBytes); // Tag is the address divided by block size

        // Check if the tag is in the cache
        if (cache.has(tag)) {
            hits++;
            // Update access order for LRU
            if (replacementPolicy === "LRU") {
                accessOrder.splice(accessOrder.indexOf(tag), 1); // Remove from current position
                accessOrder.push(tag); // Add to the end
            }
        } else {
            misses++;
            if (cache.size < numberOfBlocks) {
                cache.add(tag);
                accessOrder.push(tag);
            } else {
                // Replacement policy logic
                let evictTag;
                if (replacementPolicy === "LRU") {
                    evictTag = accessOrder.shift(); // Remove the least recently used
                } else if (replacementPolicy === "FIFO") {
                    evictTag = accessOrder.shift(); // Remove the first in
                } else if (replacementPolicy === "Random") {
                    evictTag = accessOrder[Math.floor(Math.random() * accessOrder.length)];
                    accessOrder.splice(accessOrder.indexOf(evictTag), 1); // Remove the random element
                }
                cache.delete(evictTag); // Remove from cache
                cache.add(tag); // Add new tag
                accessOrder.push(tag); // Add to the end
            }
        }
    });

    return { hits, misses };
};

const CacheResults_Fully = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cacheSize, blockSize, fileData, fileName, replacementPolicy, memorySize, mappingTechnique, associativity, addressSize } =
        location.state || {};

    // Scroll to top when the component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Handle back button click
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

    // Validate input data
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

    // Calculate cache results
    const { hits, misses } = useMemo(
        () =>
            calculateFullyAssociativeCache(cacheSize, blockSize, fileData, replacementPolicy),
        [cacheSize, blockSize, fileData, replacementPolicy]
    );

    // Generate miss rates for different block sizes
    const blockSizes = [16, 32, 64, 128, 256];
    const missRates = blockSizes.map((size) => {
        const { misses, hits } = calculateFullyAssociativeCache(
            cacheSize,
            size,
            fileData,
            replacementPolicy
        );
        return (misses / (hits + misses)) * 100;
    });

    // Bar chart data for hits and misses
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

    // Line chart data for miss rate vs block size
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

    // Chart options
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
                    <h1 className="text-3xl font-semibold text-blue-700 mb-2">
                        Fully Associative Cache Results
                    </h1>
                    <p className="text-md text-gray-500">
                        Results of the Fully Associative Cache simulation.
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">
                            Simulation Results:
                        </h2>
                        <p className="text-lg">Hits: {hits}</p>
                        <p className="text-lg">Misses: {misses}</p>
                        <p className="text-lg">
                            Hit Rate: {((hits / (hits + misses)) * 100).toFixed(2)}%
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">
                            Cache Parameters:
                        </h2>
                        <p className="text-lg">Cache Size: {cacheSize} KB</p>
                        <p className="text-lg">Block Size: {blockSize} B</p>
                        <p className="text-lg">Replacement Policy: {replacementPolicy}</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">
                            Cache Access Results:
                        </h2>
                        <Bar data={barChartData} options={chartOptions} />
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">
                            Miss Rate vs Block Size:
                        </h2>
                        <Line data={lineChartData} options={chartOptions} />
                    </div>

                    {/* CSV Data Preview */}
                    {fileData && (
                        <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm">
                            <h2 className="text-lg font-semibold text-blue-700 mb-2">
                                Data Preview:
                            </h2>
                            <div className="overflow-y-scroll max-h-72">
                                <table className="w-full table-auto border-collapse">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="px-4 py-2 text-left border-b">
                                                Address(Hex)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fileData.map((row, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 border-b">
                                                    {row["Address(Hex)"]}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {fileName ? `File: ${fileName}` : "No data loaded"} | Total Rows:{" "}
                                {fileData.length}
                            </p>
                        </div>
                    )}
                </div>

                {/* Back Button */}
                <div className="mt-6 text-center">
                    <button
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                        onClick={handleBack} // ใช้ handleBack แทน navigate(-1)
                    >
                        ← Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CacheResults_Fully;