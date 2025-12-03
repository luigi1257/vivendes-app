import { Routes, Route } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { HousesPage } from "./pages/HousesPage";
import { SystemsPage } from "./pages/SystemsPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { ContactsPage } from "./pages/ContactsPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pb-16 max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<HousesPage />} />
          <Route path="/sistemes" element={<SystemsPage />} />
          <Route path="/incidencies" element={<IncidentsPage />} />
          <Route path="/contactes" element={<ContactsPage />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export default App;
