// src/pages/HousesPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

type House = {
  id: string;
  name: string;
  address?: string;
  coverImageUrl?: string;
  notes?: string;
};

export function HousesPage() {
  const navigate = useNavigate();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadHouses() {
      try {
        const snap = await getDocs(collection(db, "houses"));
        const list: House[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.name ?? d.id,
            address: data.address ?? "",
            coverImageUrl: data.coverImageUrl ?? "",
            notes: data.notes ?? "",
          };
        });

        list.sort((a, b) => a.name.localeCompare(b.name));
        setHouses(list);
      } catch (err) {
        console.error("Error carregant vivendes:", err);
        setError("No s'han pogut carregar les vivendes.");
      } finally {
        setLoading(false);
      }
    }

    loadHouses();
  }, []);

  const filteredHouses = houses.filter((h) => {
    const text = (h.name + " " + (h.address ?? "")).toLowerCase();
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return text.includes(term);
  });

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      {/* Capçalera tipus maqueta */}
      <div className="flex items-center justify-between mb-4">
        {/* Hamburguesa només visual */}
        <button
          type="button"
          className="h-8 w-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
        >
          <span className="sr-only">Menú</span>
          <div className="space-y-0.5">
            <span className="block h-[2px] w-3 bg-slate-500 rounded-full" />
            <span className="block h-[2px] w-4 bg-slate-500 rounded-full" />
            <span className="block h-[2px] w-3 bg-slate-500 rounded-full" />
          </div>
        </button>

        <h1 className="text-xl font-semibold text-slate-900">Vivendes</h1>

        <button
          type="button"
          onClick={() => navigate("/vivendes/nou")}
          className="px-4 py-1.5 rounded-full bg-slate-800 text-white text-xs font-semibold shadow-sm hover:bg-slate-900"
        >
          + Add
        </button>
      </div>

      {/* Barra de cerca */}
      <div className="mb-4">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="m15.5 15.5 3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-slate-100 px-8 py-2 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white"
          />
        </div>
      </div>

      {/* Estat de càrrega / error */}
      {loading && (
        <p className="text-sm text-slate-500">Carregant vivendes…</p>
      )}

      {error && !loading && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">
          {error}
        </p>
      )}

      {!loading && !error && filteredHouses.length === 0 && (
        <p className="text-sm text-slate-500">
          No hi ha vivendes que coincideixin amb la cerca.
        </p>
      )}

      {/* Quadrícula 2 columnes com a la captura */}
      <div className="grid grid-cols-2 gap-3">
        {filteredHouses.map((house) => {
          const initials =
            house.name
              ?.split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 3)
              .toUpperCase() || "?";

          return (
            <Link
              key={house.id}
              to={`/vivendes/${house.id}`}
              className="block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Foto a dalt */}
              <div className="w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                {house.coverImageUrl ? (
                  <img
                    src={house.coverImageUrl}
                    alt={house.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-semibold tracking-wide text-slate-500">
                    {initials}
                  </div>
                )}
              </div>

              {/* Text a sota */}
              <div className="px-3 pt-2 pb-3">
                <p className="text-[11px] font-semibold tracking-wide text-slate-900 uppercase">
                  {house.name}
                </p>
                {house.address && (
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {house.address}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
