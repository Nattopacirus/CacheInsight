import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CacheSimulation from "./CacheSimulation";
import CacheResults_Direct from "./CacheResults_direct";
import CacheResults_SetA from "./CacheResults_SetA";
import CacheResults_Fully from "./CacheResults_Fully";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CacheSimulation />} />
        <Route path="/results_direct" element={<CacheResults_Direct />} />
        <Route path="/results_setA" element={<CacheResults_SetA />} />
        <Route path="/results_fully" element={<CacheResults_Fully />} />
      </Routes>
    </Router>
  );
}

export default App;