// src/App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "./firebase";

// PÀGINES
import { HomePage } from "./pages/HomePage";

import { HousesPage } from "./pages/HousesPage";
import { HouseDetailPage } from "./pages/HouseDetailPage";
import { NewHousePage } from "./pages/NewHousePage";
import { EditHousePage } from "./pages/EditHousePage";

import { SystemsPage } from "./pages/SystemsPage";
import { SystemDetailPage } from "./pages/SystemDetailPage";
import { NewSystemPage } from "./pages/NewSystemPage";
import { EditSystemPage } from "./pages/EditSystemPage";

import { IncidentsPage } from "./pages/IncidentsPage";
import { IncidentDetailPage } from "./pages/IncidentDetailPage";
import { NewIncidentPage } from "./pages/NewIncidentPage";
import { EditIncidentPage } from "./pages/EditIncidentPage";

import { ContactsPage } from "./pages/ContactsPage";
import { ContactDetailPage } from "./pages/ContactDetailPage";
import { NewContactPage } from "./pages/NewContactPage";
import { EditContactPage } from "./pages/EditContactPage";

import { ParkingsPage } from "./pages/ParkingsPage";
import { ParkingDetailPage } from "./pages/ParkingDetailPage";
import { NewParkingPage } from "./pages/NewParkingPage";
import { EditParkingPage } from "./pages/EditParkingPage";

import { VehiclesPage } from "./pages/VehiclesPage";
import { NewVehiclePage } from "./pages/NewVehiclePage";
import { VehicleDetailPage } from "./pages/VehicleDetailPage";
import { EditVehiclePage } from "./pages/EditVehiclePage";

import { SeedPage } from "./pages/SeedPage";
import { LoginPage } from "./pages/LoginPage";

import { BottomNav } from "./components/BottomNav";

// ----------------------
// Auth context
// ----------------------

type AuthContextValue = {
  user: User | null;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });
    return () => unsub();
  }, []);

  async function logout() {
    await signOut(auth);
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
        Carregant…
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ----------------------
// Components auxiliars
// ----------------------

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function LogoutButton() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Només mostrar el botó a la pantalla d'inici "/"
  if (!user || location.pathname !== "/") return null;

  async function handleLogout() {
    const confirmed = window.confirm("Vols tancar sessió?");
    if (!confirmed) return;
    try {
      await logout();
    } catch (err) {
      console.error("Error tancant sessió:", err);
      alert("Hi ha hagut un error tancant la sessió.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="fixed top-3 right-3 z-30 rounded-full bg-white/90 border border-slate-200 shadow-sm px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
    >
      Tancar sessió
    </button>
  );
}

function AppInner() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 pb-16">
        <LogoutButton />

        <Routes>
          {/* LOGIN */}
          <Route path="/login" element={<LoginPage />} />

          {/* INICI */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            }
          />

          {/* VIVENDES */}
          <Route
            path="/vivendes"
            element={
              <RequireAuth>
                <HousesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/vivendes/nova"
            element={
              <RequireAuth>
                <NewHousePage />
              </RequireAuth>
            }
          />
          {/* ruta alternativa que ja tenies */}
          <Route
            path="/vivendes/nou"
            element={
              <RequireAuth>
                <NewHousePage />
              </RequireAuth>
            }
          />
          <Route
            path="/vivendes/:houseId"
            element={
              <RequireAuth>
                <HouseDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/vivendes/:houseId/editar"
            element={
              <RequireAuth>
                <EditHousePage />
              </RequireAuth>
            }
          />

          {/* PÀRQUINGS (des de vivenda i global) */}
          <Route
            path="/vivendes/:houseId/parkings/nou"
            element={
              <RequireAuth>
                <NewParkingPage />
              </RequireAuth>
            }
          />
          <Route
            path="/parkings"
            element={
              <RequireAuth>
                <ParkingsPage />
              </RequireAuth>
            }
          />
          {/* Nova ruta global per crear pàrquing */}
          <Route
            path="/parkings/nou"
            element={
              <RequireAuth>
                <NewParkingPage />
              </RequireAuth>
            }
          />
          <Route
            path="/parkings/:parkingId"
            element={
              <RequireAuth>
                <ParkingDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/parkings/:parkingId/editar"
            element={
              <RequireAuth>
                <EditParkingPage />
              </RequireAuth>
            }
          />

          {/* SISTEMES */}
          <Route
            path="/sistemes"
            element={
              <RequireAuth>
                <SystemsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/sistemes/nou"
            element={
              <RequireAuth>
                <NewSystemPage />
              </RequireAuth>
            }
          />
          {/* afegir sistema des d'una vivenda concreta */}
          <Route
            path="/sistemes/nou/:houseId"
            element={
              <RequireAuth>
                <NewSystemPage />
              </RequireAuth>
            }
          />
          <Route
            path="/vivendes/:houseId/sistemes/nou"
            element={
              <RequireAuth>
                <NewSystemPage />
              </RequireAuth>
            }
          />
          <Route
            path="/sistemes/:systemId"
            element={
              <RequireAuth>
                <SystemDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/sistemes/:systemId/editar"
            element={
              <RequireAuth>
                <EditSystemPage />
              </RequireAuth>
            }
          />

          {/* INCIDÈNCIES */}
          <Route
            path="/incidencies"
            element={
              <RequireAuth>
                <IncidentsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/incidencies/nova"
            element={
              <RequireAuth>
                <NewIncidentPage />
              </RequireAuth>
            }
          />
          <Route
            path="/incidencies/:incidentId"
            element={
              <RequireAuth>
                <IncidentDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/incidencies/:incidentId/editar"
            element={
              <RequireAuth>
                <EditIncidentPage />
              </RequireAuth>
            }
          />

          {/* CONTACTES */}
          <Route
            path="/contactes"
            element={
              <RequireAuth>
                <ContactsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/contactes/nou"
            element={
              <RequireAuth>
                <NewContactPage />
              </RequireAuth>
            }
          />
          <Route
            path="/contactes/:contactId"
            element={
              <RequireAuth>
                <ContactDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/contactes/:contactId/editar"
            element={
              <RequireAuth>
                <EditContactPage />
              </RequireAuth>
            }
          />

          {/* VEHICLES */}
          <Route
            path="/vehicles"
            element={
              <RequireAuth>
                <VehiclesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/vehicles/nou"
            element={
              <RequireAuth>
                <NewVehiclePage />
              </RequireAuth>
            }
          />
          <Route
            path="/vehicles/:vehicleId"
            element={
              <RequireAuth>
                <VehicleDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/vehicles/:vehicleId/editar"
            element={
              <RequireAuth>
                <EditVehiclePage />
              </RequireAuth>
            }
          />

          {/* DEBUG / SEED */}
          <Route
            path="/debug/seed"
            element={
              <RequireAuth>
                <SeedPage />
              </RequireAuth>
            }
          />

          {/* Fallback: qualsevol altra ruta → inici */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {!isLogin && <BottomNav />}
      </div>
    </AuthProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

