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

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const calculateDirectMappedCache = (cacheSize, blockSize, fileData, addressSize) => {
    const cacheSizeBytes = cacheSize * 1024;

    if (blockSize <= 0 || !Number.isInteger(blockSize)) {
        throw new Error("Block size must be a positive integer.");
    }
    if ((blockSize & (blockSize - 1)) !== 0) {
        throw new Error("Block size must be a power of 2.");
    }
    if (cacheSizeBytes <= 0 || !Number.isInteger(cacheSizeBytes)) {
        throw new Error("Cache size must be a positive integer.");
    }
    if (cacheSizeBytes % blockSize !== 0) {
        throw new Error("Cache size must be a multiple of block size.");
    }

    const numberOfBlocks = cacheSizeBytes / blockSize;
    const offsetBits = Math.log2(blockSize);
    const indexBits = Math.log2(numberOfBlocks);
    const tagBits = addressSize - offsetBits - indexBits;

    if (tagBits < 0) {
        throw new Error("Invalid cache configuration: tagBits cannot be negative.");
    }

    const cache = new Array(numberOfBlocks).fill(null);
    const conflictCounts = new Array(numberOfBlocks).fill(0);
    const accessPattern = [];
    let hits = 0, misses = 0, invalidRows = 0;

    fileData.forEach((row, rowIndex) => {
        const addressHex = row["Address(Hex)"];
        if (!addressHex) {
            invalidRows++;
            console.warn(`Row ${rowIndex}: Missing Address(Hex)`);
            accessPattern.push({ address: "N/A", hit: false });
            return;
        }
        const addressDec = parseInt(addressHex, 16);
        if (isNaN(addressDec)) {
            invalidRows++;
            console.warn(`Row ${rowIndex}: Invalid Address(Hex) - ${addressHex}`);
            accessPattern.push({ address: addressHex, hit: false });
            return;
        }

        const index = (addressDec >> offsetBits) & ((1 << indexBits) - 1);
        const tag = addressDec >> (offsetBits + indexBits);

        if (cache[index] === tag) {
            hits++;
            accessPattern.push({ address: addressHex, hit: true });
        } else {
            misses++;
            if (cache[index] !== null) {
                conflictCounts[index]++;
            }
            cache[index] = tag;
            accessPattern.push({ address: addressHex, hit: false });
        }
    });

    return { hits, misses, invalidRows, conflictCounts, accessPattern };
};

const CacheResults_Direct = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cacheSize, blockSize, fileData, fileName, replacementPolicy, memorySize, mappingTechnique, associativity, addressSize } =
        location.state || {};

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

    if (!location.state || isNaN(cacheSize) || isNaN(blockSize) || blockSize <= 0 || cacheSize <= 0 || !fileData?.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
                    <h1 className="text-3xl font-semibold text-blue-700 mb-2">Error</h1>
                    <p className="text-md text-gray-500">Invalid simulation data. Please ensure cache size and block size are valid.</p>
                    <button
                        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                        onClick={handleBack}
                    >
                        ← Back
                    </button>
                </div>
            </div>
        );
    }

    const { hits, misses, invalidRows, conflictCounts, accessPattern } = useMemo(() =>
        calculateDirectMappedCache(cacheSize, blockSize, fileData, addressSize),
        [cacheSize, blockSize, fileData, addressSize]
    );

    // Bar Chart: Cache Access Results with Correct Percentage
    const totalAccesses = hits + misses;
    const barChartData = {
        labels: ["Hits", "Misses"],
        datasets: [
            {
                label: "Cache Access Results",
                data: [hits, misses],
                backgroundColor: ["#4CAF50", "#F44336"],
                borderColor: ["#4CAF50", "#F44336"],
                borderWidth: 1,
            },
        ],
    };

    // Line Chart: Miss Rate vs Block Size
    const blockSizes = [16, 32, 64, 128, 256];
    const missRates = useMemo(() =>
        blockSizes.map((size) => {
            const { misses, hits } = calculateDirectMappedCache(cacheSize, size, fileData, addressSize);
            return (misses / (hits + misses)) * 100;
        }),
        [cacheSize, fileData, addressSize]
    );

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

    // Line Chart: Hit Rate vs Cache Size
    const cacheSizes = [1, 2, 4, 8, 16, 32, 64, 128, 256];
    const hitRates = useMemo(() => {
        return cacheSizes.map((size) => {
            const { hits, misses } = calculateDirectMappedCache(size, blockSize, fileData, addressSize);
            return (hits / (hits + misses)) * 100;
        });
    }, [blockSize, fileData, addressSize]);

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

    // Bar Chart: Top 10 Cache Lines by Conflict Count with Percentage
    const totalConflicts = conflictCounts.reduce((sum, count) => sum + count, 0);
    const sortedIndices = useMemo(() =>
        conflictCounts
            .map((count, index) => ({ index, count, percentage: totalConflicts > 0 ? (count / totalConflicts) * 100 : 0 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
        [conflictCounts]
    );

    const conflictChartData = {
        labels: sortedIndices.map((item) => `Line ${item.index}`),
        datasets: [
            {
                label: "Conflict Count",
                data: sortedIndices.map((item) => item.count),
                backgroundColor: "#36A2EB",
                borderColor: "#36A2EB",
                borderWidth: 1,
            },
        ],
    };

    // Line Chart: Access Pattern (Hit Rate และ Miss Rate)
    const interval = Math.max(1, Math.floor(fileData.length / 10)); // แบ่งเป็น 10 ช่วง
    const aggregatedData = useMemo(() => {
        const aggregated = [];
        for (let i = 0; i < accessPattern.length; i += interval) {
            const chunk = accessPattern.slice(i, i + interval);
            const hitCount = chunk.filter((entry) => entry.hit).length;
            const missCount = chunk.filter((entry) => !entry.hit).length;
            const total = hitCount + missCount;
            aggregated.push({
                start: i + 1,
                end: Math.min(i + interval, accessPattern.length),
                hitRate: total > 0 ? (hitCount / total) * 100 : 0,
                missRate: total > 0 ? (missCount / total) * 100 : 0,
            });
        }
        return aggregated;
    }, [accessPattern]);

    const accessPatternChartData = {
        labels: aggregatedData.map((entry) => `Access ${entry.start}-${entry.end}`),
        datasets: [
            {
                label: "Hit Rate (%)",
                data: aggregatedData.map((entry) => entry.hitRate),
                borderColor: "#36A2EB",
                backgroundColor: "#36A2EB",
                fill: false,
                tension: 0.2,
            },
            {
                label: "Miss Rate (%)",
                data: aggregatedData.map((entry) => entry.missRate),
                borderColor: "#FF6384",
                backgroundColor: "#FF6384",
                fill: false,
                tension: 0.2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
            title: { display: true },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || "";
                        const value = context.parsed.y;
                        const total = hits + misses;
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : "0.00";
                        if (context.chart.canvas.id === "cacheAccessChart") {
                            return `${label}: ${value} (${percentage}%)`;
                        }
                        if (context.chart.canvas.id === "conflictChart") {
                            const conflictPercentage = sortedIndices[context.dataIndex].percentage.toFixed(2);
                            return `${label}: ${value} (${conflictPercentage}%)`;
                        }
                        return `${label}: ${value.toFixed(2)}%`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Count",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Category",
                },
            },
        },
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
            title: { display: true },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || "";
                        const value = context.parsed.y;
                        return `${label}: ${value.toFixed(2)}%`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Rate (%)",
                },
                min: 0,
                max: 100,
                ticks: { stepSize: 10 },
            },
            x: {
                title: {
                    display: true,
                    text: "Parameter",
                },
            },
        },
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-6xl border border-gray-200">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-semibold text-blue-700 mb-2">Direct Mapped Cache Results</h1>
                    <p className="text-md text-gray-500">Results of the Direct Mapped Cache simulation</p>
                </div>

                {/* Simulation Results and Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold text-blue-700">Simulation Results:</h2>
                        <p className="text-lg text-gray-700">Hits: <span className="font-medium">{hits}</span></p>
                        <p className="text-lg text-gray-700">Misses: <span className="font-medium">{misses}</span></p>
                        <p className="text-lg text-gray-700">
                            Hit Rate: <span className="font-medium">{((hits / (hits + misses)) * 100).toFixed(2)}%</span>
                        </p>
                        {invalidRows > 0 && (
                            <p className="text-sm text-red-500">Warning: {invalidRows} invalid rows detected in CSV</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-blue-700">Cache Parameters:</h2>
                        <p className="text-lg text-gray-700">Cache Size: <span className="font-medium">{cacheSize} KB</span></p>
                        <p className="text-lg text-gray-700">Block Size: <span className="font-medium">{blockSize} B</span></p>
                        <p className="text-lg text-gray-700">Address Size: <span className="font-medium">{addressSize} bits</span></p>
                        <p className="text-lg text-gray-700">Mapping Technique: <span className="font-medium">Direct Mapped</span></p>
                    </div>
                </div>

                {/* Charts Section - 2 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Cache Access Results */}
                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">Cache Access Results:</h2>
                        <div className="h-80">
                            <Bar
                                id="cacheAccessChart"
                                data={barChartData}
                                options={{ ...chartOptions, scales: { y: { title: { text: "Count" } }, x: { title: { text: "Result" } } } }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Shows hits and misses with percentages</p>
                    </div>

                    {/* Miss Rate vs Block Size */}
                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">Miss Rate vs Block Size:</h2>
                        <div className="h-80">
                            <Line
                                data={lineChartData}
                                options={{ ...lineChartOptions, scales: { y: { title: { text: "Miss Rate (%)" } }, x: { title: { text: "Block Size (B)" } } } }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Shows how miss rate varies with different block sizes</p>
                    </div>

                    {/* Hit Rate vs Cache Size */}
                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">Hit Rate vs Cache Size:</h2>
                        <div className="h-80">
                            <Line
                                data={hitRateChartData}
                                options={{ ...lineChartOptions, scales: { y: { title: { text: "Hit Rate (%)" } }, x: { title: { text: "Cache Size (KB)" } } } }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Shows how hit rate changes with varying cache sizes</p>
                    </div>

                    {/* Conflict Rate per Cache Line */}
                    <div>
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">Top 10 Cache Lines by Conflict Count:</h2>
                        <div className="h-80">
                            <Bar
                                id="conflictChart"
                                data={conflictChartData}
                                options={{ ...chartOptions, scales: { y: { title: { text: "Conflict Count" } }, x: { title: { text: "Cache Line Index" } } } }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Displays the top 10 cache lines with the highest conflict counts and percentages</p>
                    </div>
                </div>

                {/* Access Pattern - 1 Grid */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-blue-700 mb-2">Access Pattern:</h2>
                    <div className="h-80">
                        <Line
                            data={accessPatternChartData}
                            options={{
                                ...lineChartOptions,
                                scales: {
                                    y: { title: { text: "Rate (%)" }, min: 0, max: 100 },
                                    x: { title: { text: "Access Interval" } },
                                },
                            }}
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">แสดงอัตราการ Hit และ Miss (%) ในแต่ละช่วงการเข้าถึง</p>
                </div>

                {/* Data Preview - 1 Grid */}
                {fileData && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold text-blue-700 mb-2">Data Preview:</h2>
                        <div className="overflow-y-scroll max-h-72">
                            <table className="w-full table-auto border-collapse">
                                <thead className="bg-gray-200 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left border-b text-gray-700">Address (Hex)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fileData.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <td className="px-4 py-2 border-b text-gray-600">{row["Address(Hex)"]}</td>
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

                {/* Back Button */}
                <div className="mt-6 text-center">
                    <button
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg shadow hover:from-indigo-700 hover:to-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={handleBack}
                    >
                        ← Back to Simulation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CacheResults_Direct;