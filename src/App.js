import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CacheSimulation from "./CacheSimulation";
import CacheResults_Direct from "./CacheResults_direct";
import CacheResults_SetA from "./CacheResults_SetA";
import CacheResults_Fully from "./CacheResults_Fully";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
        <h1 className="text-3xl font-semibold text-blue-700 mb-2">404 - Not Found</h1>
        <p className="text-md text-gray-500">The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CacheSimulation />} />
        <Route path="/results_direct" element={<CacheResults_Direct />} />
        <Route path="/results_setA" element={<CacheResults_SetA />} />
        <Route path="/results_fully" element={<CacheResults_Fully />} />
        <Route path="*" element={<NotFound />} /> {/* เพิ่มหน้า NotFound */}
      </Routes>
    </Router>
  );
}

export default App;