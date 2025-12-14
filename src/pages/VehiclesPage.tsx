// src/pages/VehiclesPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

type VehicleType = "cotxe" | "moto";

type Vehicle = {
  id: string;
  houseId?: string;
  houseName?: string;
  type?: VehicleType;
  name?: string;
  brand?: string;
  model?: string;
  plate?: string;
  year?: string;
  purchasePrice?: string;
  purchaseYear?: string;
  itvDate?: string;
  itvNotes?: string;
  notes?: string;
  photoUrl?: string;
};

export function VehiclesPage() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<"tots" | "cotxe" | "moto">(
    "tots"
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadVehicles() {
      try {
        const snap = await getDocs(collection(db, "vehicles"));
        const list: Vehicle[] = snap.docs.map((d) => {
          const v = d.data() as any;
          return {
            id: d.id,
            houseId: v.houseId,
            houseName: v.houseName,
            type: v.type,
            name: v.name,
            brand: v.brand,
            model: v.model,
            plate: v.plate,
            year: v.year,
            purchasePrice: v.purchasePrice,
            purchaseYear: v.purchaseYear,
            itvDate: v.itvDate,
            itvNotes: v.itvNotes,
            notes: v.notes,
            photoUrl: v.photoUrl,
          };
        });

        // Ordre senzill: per casa + nom vehicle
        list.sort((a, b) => {
          const ah = (a.houseName ?? "").localeCompare(b.houseName ?? "");
          if (ah !== 0) return ah;
          return (a.name ?? "").localeCompare(b.name ?? "");
        });

        setVehicles(list);
      } catch (err) {
        console.error(err);
        setError("Error carregant els vehicles.");
      } finally {
        setLoading(false);
      }
    }

    loadVehicles();
  }, []);

  const filtered = vehicles.filter((v) => {
    if (filterType !== "tots" && v.type !== filterType) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();

    const text =
      [
        v.name,
        v.brand,
        v.model,
        v.plate,
        v.houseName,
        v.year,
        v.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase() || "";

    return text.includes(q);
  });

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 text-sm text-slate-500">
        Carregant vehicles…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Enrere
        </button>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Enrere
        </button>
        <h1 className="flex-1 text-center text-sm font-semibold text-slate-900">
          Vehicles
        </h1>
        <button
          type="button"
          onClick={() => navigate("/vehicles/nou")}
          className="text-[11px] font-semibold px-3 py-1 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
        >
          Afegir
        </button>
      </div>

      {/* Filtre tipus + cerca */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
        <div className="flex gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setFilterType("tots")}
            className={[
              "flex-1 px-3 py-2 rounded-xl border font-medium",
              filterType === "tots"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200",
            ].join(" ")}
          >
            Tots
          </button>
          <button
            type="button"
            onClick={() => setFilterType("cotxe")}
            className={[
              "flex-1 px-3 py-2 rounded-xl border font-medium",
              filterType === "cotxe"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200",
            ].join(" ")}
          >
            Cotxes
          </button>
          <button
            type="button"
            onClick={() => setFilterType("moto")}
            className={[
              "flex-1 px-3 py-2 rounded-xl border font-medium",
              filterType === "moto"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200",
            ].join(" ")}
          >
            Motos
          </button>
        </div>

        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nom, matrícula, casa…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
        </div>
      </section>

      {/* Llista de vehicles */}
      {filtered.length === 0 ? (
        <div className="text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-100 py-10 px-4">
          <p>No hi ha vehicles amb aquests criteris.</p>
          <button
            type="button"
            onClick={() => navigate("/vehicles/nou")}
            className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold"
          >
            Afegir primer vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {filtered.map((v) => (
            <Link
              key={v.id}
              to={`/vehicles/${v.id}`}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="relative">
                {v.photoUrl ? (
                  <img
                    src={v.photoUrl}
                    alt={v.name ?? v.model ?? "Vehicle"}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="w-full h-24 bg-slate-100 flex items-center justify-center">
                    <span className="text-3xl text-slate-300">
                      {v.type === "moto" ? "🏍️" : "🚗"}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 space-y-1">
                {v.houseName && (
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 line-clamp-1">
                    {v.houseName}
                  </p>
                )}

                <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {v.name ||
                    `${v.brand ?? ""} ${v.model ?? ""}`.trim() ||
                    "Vehicle"}
                </p>

                {v.plate && (
                  <p className="text-[11px] text-slate-700 font-mono">
                    {v.plate}
                  </p>
                )}

                {v.brand && v.model && (
                  <p className="text-[11px] text-slate-500">
                    {v.brand} · {v.model}
                  </p>
                )}

                {v.year && (
                  <p className="text-[11px] text-slate-500">
                    Any {v.year}
                  </p>
                )}

                {v.notes && (
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {v.notes}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
