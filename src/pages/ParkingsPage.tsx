// src/pages/ParkingsPage.tsx
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

type ParkingStatus = "lliure" | "llogat" | "reservat";

type Parking = {
  id: string;
  houseId: string;
  houseName?: string;
  name: string;
  location?: string;
  status: ParkingStatus;
  tenantName?: string;
  rentPrice?: string;
  photoUrl?: string; // camp que ja guardem a New/EditParkingPage
};

export function ParkingsPage() {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ParkingStatus | "tots">("tots");

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, "parkings"));
        const items: Parking[] = snap.docs.map((d) => {
          const p = d.data() as any;
          return {
            id: d.id,
            houseId: p.houseId,
            houseName: p.houseName,
            name: p.name ?? "",
            location: p.location,
            status: (p.status as ParkingStatus) ?? "lliure",
            tenantName: p.tenantName,
            rentPrice: p.rentPrice,
            photoUrl: p.photoUrl,
          };
        });
        // ordenem una mica: per casa + nom
        items.sort((a, b) => {
          const hA = a.houseName ?? "";
          const hB = b.houseName ?? "";
          const byHouse = hA.localeCompare(hB);
          if (byHouse !== 0) return byHouse;
          return a.name.localeCompare(b.name);
        });
        setParkings(items);
      } catch (err) {
        console.error(err);
        setError("Error carregant pàrquings.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return parkings.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.houseName ?? "").toLowerCase().includes(q) ||
        (p.location ?? "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "tots" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [parkings, search, statusFilter]);

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function statusLabel(s: ParkingStatus): string {
    switch (s) {
      case "lliure":
        return "Lliure";
      case "llogat":
        return "Llogat";
      case "reservat":
        return "Reservat";
      default:
        return s;
    }
  }

  function statusPillClasses(s: ParkingStatus): string {
    if (s === "lliure") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (s === "llogat") return "bg-slate-100 text-slate-700 border-slate-200";
    return "bg-amber-50 text-amber-800 border-amber-100";
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
      {/* Header simple */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-lg font-semibold text-slate-900">
          Pàrquings i locals
        </h1>
        {/* Botó afegir pàrquing (global) */}
        <Link
          to="/parkings/nou"
          className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 shadow-sm hover:bg-slate-800"
        >
          <span className="text-xs leading-none">＋</span>
          <span>Afegir</span>
        </Link>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-2 flex items-center gap-2">
        <span className="text-slate-400 text-lg leading-none">🔍</span>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Buscar per vivenda, plaça…"
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Filtres d’estat */}
      <div className="flex gap-2 text-[11px]">
        {([
          { key: "tots", label: "Tots" },
          { key: "lliure", label: "Lliures" },
          { key: "llogat", label: "Llogats" },
          { key: "reservat", label: "Reservats" },
        ] as const).map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            className={[
              "px-3 py-1 rounded-full border text-[11px] font-medium transition-colors",
              statusFilter === f.key
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Contingut */}
      {loading ? (
        <p className="text-sm text-slate-500 mt-4">Carregant pàrquings…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500 mt-4">
          No hi ha pàrquings que coincideixin amb la cerca o el filtre.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/parkings/${p.id}`}
              className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-left"
            >
              {/* Foto / placeholder */}
              <div className="relative">
                {p.photoUrl ? (
                  <img
                    src={p.photoUrl}
                    alt={p.name}
                    className="w-full h-28 object-cover"
                  />
                ) : (
                  <div className="w-full h-28 bg-slate-100 flex items-center justify-center">
                    <span className="text-3xl text-slate-300">🅿️</span>
                  </div>
                )}

                {/* Estat a sobre de la foto */}
                <span
                  className={[
                    "absolute left-2 top-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-white/90 backdrop-blur",
                    statusPillClasses(p.status),
                  ].join(" ")}
                >
                  {statusLabel(p.status)}
                </span>
              </div>

              {/* Text */}
              <div className="p-3 space-y-1">
                {p.houseName && (
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 line-clamp-1">
                    {p.houseName}
                  </p>
                )}
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {p.name}
                </p>
                {p.location && (
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {p.location}
                  </p>
                )}
                {p.tenantName && (
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Llogater:{" "}
                    <span className="font-medium text-slate-700">
                      {p.tenantName}
                    </span>
                  </p>
                )}
                {p.rentPrice && (
                  <p className="text-[11px] text-slate-500">
                    {p.rentPrice} €/mes
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
