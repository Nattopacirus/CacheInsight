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

    // Ensure block size is a power of 2
    if ((blockSizeBytes & (blockSizeBytes - 1)) !== 0) {
        throw new Error("Block size must be a power of 2.");
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
                    if (accessOrder.includes(evictTag)) {
                        accessOrder.splice(accessOrder.indexOf(evictTag), 1); // Remove the random element
                    }
                }
                cache.delete(evictTag); // Remove from cache
                cache.add(tag); // Add new tag
                accessOrder.push(tag); // Add to the end
            }
        }
    });

    return { hits, misses, cache }; // ส่งคืน cache กลับมาด้วย
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

    // Validate replacement policy
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

    // Calculate cache results
    const { hits, misses, cache } = useMemo(
        () =>
            calculateFullyAssociativeCache(cacheSize, blockSize, fileData, replacementPolicy),
        [cacheSize, blockSize, fileData, replacementPolicy]
    );

    // Generate miss rates for different block sizes
    const blockSizes = [16, 32, 64, 128, 256];
    const missRates = useMemo(() => {
        return blockSizes.map((size) => {
            const { misses, hits } = calculateFullyAssociativeCache(
                cacheSize,
                size,
                fileData,
                replacementPolicy
            );
            return (misses / (hits + misses)) * 100;
        });
    }, [cacheSize, fileData, replacementPolicy]);

    // Generate hit rates for different cache sizes
    const cacheSizes = [16, 32, 64, 128, 256]; // In KB
    const hitRates = useMemo(() => {
        return cacheSizes.map((size) => {
            const { hits, misses } = calculateFullyAssociativeCache(
                size,
                blockSize,
                fileData,
                replacementPolicy
            );
            return (hits / (hits + misses)) * 100;
        });
    }, [blockSize, fileData, replacementPolicy]);

    // Generate miss rates for different replacement policies
    const policies = ["LRU", "FIFO", "Random"];
    const missRatesByPolicy = useMemo(() => {
        return policies.map((policy) => {
            const { misses, hits } = calculateFullyAssociativeCache(
                cacheSize,
                blockSize,
                fileData,
                policy
            );
            return (misses / (hits + misses)) * 100;
        });
    }, [cacheSize, blockSize, fileData]);

    // Generate access pattern data
    const accessPatternData = useMemo(() => {
        return fileData.map((row, index) => {
            const addressHex = row["Address(Hex)"];
            const addressDec = parseInt(addressHex, 16);
            const tag = addressDec >> Math.log2(blockSize);
            return { index, address: addressHex, tag, hit: cache.has(tag) }; // ใช้ cache ที่ส่งคืนมาจากฟังก์ชัน
        });
    }, [fileData, blockSize, cache]); // เพิ่ม cache ใน dependency array

    // Generate tag frequency data
    const tagFrequency = useMemo(() => {
        const frequency = {};
        fileData.forEach((row) => {
            const addressHex = row["Address(Hex)"];
            const addressDec = parseInt(addressHex, 16);
            const tag = addressDec >> Math.log2(blockSize);
            frequency[tag] = (frequency[tag] || 0) + 1;
        });
        return frequency;
    }, [fileData, blockSize]);

    const sortedTags = Object.keys(tagFrequency).sort((a, b) => tagFrequency[b] - tagFrequency[a]);
    const topTags = sortedTags.slice(0, 10); // Top 10 tags

    // Chart data and options
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

    const hitRateChartData = {
        labels: cacheSizes.map((size) => `${size} KB`),
        datasets: [
            {
                label: "Hit Rate (%)",
                data: hitRates,
                fill: false,
                borderColor: "#36A2EB",
                backgroundColor: "#36A2EB",
                tension: 0.2,
            },
        ],
    };

    const missRateByPolicyChartData = {
        labels: policies,
        datasets: [
            {
                label: "Miss Rate (%)",
                data: missRatesByPolicy,
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                borderColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                borderWidth: 1,
            },
        ],
    };

    const accessPatternChartData = {
        labels: accessPatternData.map((_, i) => i + 1),
        datasets: [
            {
                label: "Access Pattern",
                data: accessPatternData.map((entry) => (entry.hit ? 1 : 0)),
                borderColor: "#FF6384",
                backgroundColor: "#FF6384",
                fill: false,
                tension: 0.2,
            },
        ],
    };

    const tagDistributionChartData = {
        labels: topTags.map((tag) => `Tag ${tag}`),
        datasets: [
            {
                label: "Frequency",
                data: topTags.map((tag) => tagFrequency[tag]),
                backgroundColor: "#36A2EB",
                borderColor: "#36A2EB",
                borderWidth: 1,
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
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-6xl border border-gray-200">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-semibold text-blue-700 mb-2">
                        Fully Associative Cache Results
                    </h1>
                    <p className="text-md text-gray-500">
                        Results of the Fully Associative Cache simulation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Simulation Results */}
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

                    {/* Cache Parameters */}
                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">
                            Cache Parameters:
                        </h2>
                        <p className="text-lg">Cache Size: {cacheSize} KB</p>
                        <p className="text-lg">Block Size: {blockSize} B</p>
                        <p className="text-lg">Replacement Policy: {replacementPolicy}</p>
                    </div>

                    {/* Cache Access Results */}
                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">
                            Cache Access Results:
                        </h2>
                        <Bar data={barChartData} options={chartOptions} />
                    </div>

                    {/* Miss Rate vs Block Size */}
                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">
                            Miss Rate vs Block Size:
                        </h2>
                        <Line data={lineChartData} options={chartOptions} />
                    </div>

                    {/* Hit Rate vs Cache Size */}
                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">
                            Hit Rate vs Cache Size:
                        </h2>
                        <Line data={hitRateChartData} options={chartOptions} />
                    </div>

                    {/* Miss Rate vs Replacement Policy */}
                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">
                            Miss Rate vs Replacement Policy:
                        </h2>
                        <Bar data={missRateByPolicyChartData} options={chartOptions} />
                    </div>

                    {/* Access Pattern */}
                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">
                            Access Pattern:
                        </h2>
                        <Line data={accessPatternChartData} options={chartOptions} />
                    </div>

                    {/* Tag Distribution */}
                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">
                            Top 10 Tags by Frequency:
                        </h2>
                        <Bar data={tagDistributionChartData} options={chartOptions} />
                    </div>

                    {/* CSV Data Preview */}
                    {fileData && (
                        <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm col-span-2">
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
                        onClick={handleBack}
                    >
                        ← Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CacheResults_Fully;