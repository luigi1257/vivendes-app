import { Routes, Route } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { HousesPage } from "./pages/HousesPage";
import { SystemsPage } from "./pages/SystemsPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { ContactsPage } from "./pages/ContactsPage";
import { SystemDetailPage } from "./pages/SystemDetailPage";
import { SeedPage } from "./pages/SeedPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pb-16 max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<HousesPage />} />
          <Route path="/sistemes" element={<SystemsPage />} />
          <Route path="/sistemes/:systemId" element={<SystemDetailPage />} />
          <Route path="/incidencies" element={<IncidentsPage />} />
          <Route path="/contactes" element={<ContactsPage />} />
          {/* Ruta de seed */}
          <Route path="/seed" element={<SeedPage />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export default App;
