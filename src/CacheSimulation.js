// CacheSimulation.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // เพิ่ม useLocation ตรงนี้
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
  const [error, setError] = useState("");
  const [addressSize, setAddressSize] = useState(32);

  const navigate = useNavigate();
  const location = useLocation(); // ใช้ useLocation ที่นี่

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

  // ข้อมูลตัวอย่างจาก sample_Random Access.csv
  const sampleRandomAccessData = [
    "0xd7f4", "0xaa82", "0x2bb9", "0x99ed", "0xffe8", "0x732b", "0xb18b", "0xae06",
    "0x95e3", "0x3101", "0x7a2d", "0xb50d", "0x4257", "0x9859", "0x318", "0xbcbc",
    "0x1734", "0x8eb2", "0x1a7b", "0xdd59", "0x8f4d", "0x6884", "0xd9d7", "0xb912",
    "0x3ed8", "0xe093", "0xed0", "0x1345", "0x1bce", "0x9824", "0x2f07", "0xba75",
    "0xdb07", "0xc9", "0x2040", "0xa920", "0x2316", "0x66f8", "0x8005", "0x4c88",
    "0xe7b6", "0x4b2", "0xf056", "0x8c28", "0xed5b", "0x4f82", "0x6ac7", "0xd247",
    "0x65b3", "0xf2", "0xeb3a", "0x9982", "0x73f4", "0x14c9", "0x64b1", "0xa4",
    "0xf5d3", "0x8dc2", "0x7782", "0x3a26", "0xc00e", "0xd7ac", "0x9210", "0x800c",
    "0x7feb", "0xdbec", "0xfbf6", "0xca14", "0x1ff2", "0xd89e", "0xad", "0x59cb",
    "0xfaf", "0xa995", "0xa02e", "0x9ace", "0x5eea", "0x37e4", "0x42e4", "0x6c83",
    "0xdcd6", "0x5ad5", "0xd244", "0x3f22", "0xbc23", "0x8d8", "0x4750", "0x4a92",
    "0x74f5", "0x67bc", "0x9620", "0x2dcb", "0x1b93", "0x5b32", "0xc223", "0xd7ba",
    "0x1816", "0xaadc", "0x3b2d", "0x61c2"
  ];

  // ข้อมูลตัวอย่างจาก sample_Repeated Access.csv
  const sampleRepeatedAccessData = [
    "0x995d", "0x7da", "0x9902", "0x1d8e", "0x28e7", "0x775f", "0xbb70", "0x2bbb",
    "0x2aec", "0xa5c5", "0x77c2", "0xffc8", "0x7c08", "0x9fb9", "0x14fa", "0xd2d",
    "0xe092", "0x8836", "0x8999", "0xbd5f", "0x995d", "0x7da", "0x9902", "0x1d8e",
    "0x28e7", "0x775f", "0xbb70", "0x2bbb", "0x2aec", "0xa5c5", "0x77c2", "0xffc8",
    "0x7c08", "0x9fb9", "0x14fa", "0xd2d", "0xe092", "0x8836", "0x8999", "0xbd5f",
    "0x995d", "0x7da", "0x9902", "0x1d8e", "0x28e7", "0x775f", "0xbb70", "0x2bbb",
    "0x2aec", "0xa5c5", "0x77c2", "0xffc8", "0x7c08", "0x9fb9", "0x14fa", "0xd2d",
    "0xe092", "0x8836", "0x8999", "0xbd5f", "0x995d", "0x7da", "0x9902", "0x1d8e",
    "0x28e7", "0x775f", "0xbb70", "0x2bbb", "0x2aec", "0xa5c5", "0x77c2", "0xffc8",
    "0x7c08", "0x9fb9", "0x14fa", "0xd2d", "0xe092", "0x8836", "0x8999", "0xbd5f",
    "0x995d", "0x7da", "0x9902", "0x1d8e", "0x28e7", "0x775f", "0xbb70", "0x2bbb",
    "0x2aec", "0xa5c5", "0x77c2", "0xffc8", "0x7c08", "0x9fb9", "0x14fa", "0xd2d",
    "0xe092", "0x8836", "0x8999", "0xbd5f"
  ];

  // ข้อมูลตัวอย่างจาก sample_Sequential Access.csv
  const sampleSequentialAccessData = [
    "0x1000", "0x1001", "0x1002", "0x1003", "0x1004", "0x1005", "0x1006", "0x1007",
    "0x1008", "0x1009", "0x100a", "0x100b", "0x100c", "0x100d", "0x100e", "0x100f",
    "0x1010", "0x1011", "0x1012", "0x1013", "0x1014", "0x1015", "0x1016", "0x1017",
    "0x1018", "0x1019", "0x101a", "0x101b", "0x101c", "0x101d", "0x101e", "0x101f",
    "0x1020", "0x1021", "0x1022", "0x1023", "0x1024", "0x1025", "0x1026", "0x1027",
    "0x1028", "0x1029", "0x102a", "0x102b", "0x102c", "0x102d", "0x102e", "0x102f",
    "0x1030", "0x1031", "0x1032", "0x1033", "0x1034", "0x1035", "0x1036", "0x1037",
    "0x1038", "0x1039", "0x103a", "0x103b", "0x103c", "0x103d", "0x103e", "0x103f",
    "0x1040", "0x1041", "0x1042", "0x1043", "0x1044", "0x1045", "0x1046", "0x1047",
    "0x1048", "0x1049", "0x104a", "0x104b", "0x104c", "0x104d", "0x104e", "0x104f",
    "0x1050", "0x1051", "0x1052", "0x1053", "0x1054", "0x1055", "0x1056", "0x1057",
    "0x1058", "0x1059", "0x105a", "0x105b", "0x105c", "0x105d", "0x105e", "0x105f",
    "0x1060", "0x1061", "0x1062", "0x1063"
  ];

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
          // Check if there were parsing errors
          if (parsedResult.errors.length > 0) {
            setError("Error parsing CSV file.");
            console.error("Parsing Errors:", parsedResult.errors);
            return;
          }

          if (!parsedResult.data || parsedResult.data.length === 0) {
            setError("CSV file is empty or has incorrect format.");
            return;
          }

          console.log(parsedResult.data);  // Check parsed data
          setFileData(parsedResult.data);
          setFileName(file.name);
          setError("");
        },
        // Try other options for better compatibility with certain CSV formats
        delimiter: ",", // Can be changed to ';' or another delimiter if necessary
      });
    };

    reader.readAsText(file, "UTF-8");
  };


  const handleUseSampleData = (sampleData, sampleName) => {
    // แปลงข้อมูลตัวอย่างให้เป็นรูปแบบที่โปรแกรมคาดหวัง
    const formattedData = sampleData.map((address) => ({
      "Address(Hex)": address,
    }));

    // อัปเดต state ด้วยข้อมูลตัวอย่าง
    setFileData(formattedData);
    setFileName(sampleName);
    setError(""); // ล้างข้อผิดพลาดเมื่อสำเร็จ
  };

  const startSimulation = () => {
    // ตรวจสอบค่าที่ไม่ถูกต้อง
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

    // ตรวจสอบ Associativity สำหรับ Set-Associative Cache
    if (mappingTechnique === "setAssociative" && (isNaN(associativity) || associativity <= 0)) {
      setError("Associativity must be greater than 0 for Set-Associative Cache.");
      return;
    }

    // แปลง Block Size จาก B เป็น KB
    const blockSizeKB = blockSize / 1024;

    // ตรวจสอบว่า Cache Size ต้องมากกว่าหรือเท่ากับ Block Size (ในหน่วยเดียวกัน)
    if (cacheSize < blockSizeKB) {
      setError("Cache Size must be greater than or equal to Block Size.");
      return;
    }

    // ล้างข้อผิดพลาดหากทุกอย่างถูกต้อง
    setError("");

    // นำทางไปยังหน้าผลลัพธ์ที่ถูกต้อง
    const state = {
      memorySize,
      cacheSize,
      blockSize,
      replacementPolicy,
      fileData,
      mappingTechnique,
      fileName,
      associativity,
      addressSize, // เพิ่ม addressSize ใน state
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

        {/* แสดงข้อผิดพลาด */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Memory Size Input (เหมือนเดิม) */}
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

          {/* Cache Size Input (เหมือนเดิม) */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Cache Size (KB):</label>
            <select
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={cacheSize}
              onChange={(e) => setCacheSize(parseInt(e.target.value))}
            >
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

          {/* Cache Mapping Technique Dropdown (เหมือนเดิม) */}
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


          {/* Replacement Policy Dropdown (เหมือนเดิม) */}
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

          {/* ปุ่มอัปโหลดไฟล์ */}
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

          {/* ปุ่มใช้ข้อมูลตัวอย่าง (เหมือนเดิม) */}
          <div className="space-y-4">
            <button
              onClick={() => handleUseSampleData(sampleRandomAccessData, "Random Access Sample Data")}
              className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Use Random Access Sample Data
            </button>
            <button
              onClick={() => handleUseSampleData(sampleRepeatedAccessData, "Repeated Access Sample Data")}
              className="w-full p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Use Repeated Access Sample Data
            </button>
            <button
              onClick={() => handleUseSampleData(sampleSequentialAccessData, "Sequential Access Sample Data")}
              className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Use Sequential Access Sample Data
            </button>
          </div>

          {/* CSV Data Preview (เหมือนเดิม) */}
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
              <p className="text-sm text-gray-500 mt-2">{fileName ? fileName : "No data loaded"}</p>
            </div>
          )}

          {/* Start Simulation Button (เหมือนเดิม) */}
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