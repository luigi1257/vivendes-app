// src/pages/SystemsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

type System = {
  id: string;
  name: string;
  houseId?: string;
  houseName?: string;
  code?: string;
  type?: string;
  location?: string;
};

type CategoryKey =
  | "electric"
  | "water"
  | "heating"
  | "drainage"
  | "comm"
  | "alarm"
  | "other";

type CategoryDef = {
  key: CategoryKey;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
};

const CATEGORIES: CategoryDef[] = [
  {
    key: "electric",
    title: "Sistema elèctric",
    subtitle: "Quadres, circuits, companyia…",
    icon: "⚡",
    // Tons grisos suaus
    gradient: "from-slate-50 to-slate-100",
  },
  {
    key: "water",
    title: "Aigua i bomba",
    subtitle: "Pou, dipòsit, bomba, filtres…",
    icon: "💧",
    gradient: "from-slate-50 to-slate-100",
  },
  {
    key: "heating",
    title: "Calefacció / climatització",
    subtitle: "Caldera, radiadors, estufes…",
    icon: "🔥",
    gradient: "from-slate-50 to-slate-100",
  },
  {
    key: "drainage",
    title: "Clavegueram i drenatges",
    subtitle: "Fosses, arquetes, embussos…",
    icon: "🕳️",
    gradient: "from-slate-50 to-slate-100",
  },
  {
    key: "comm",
    title: "Comunicacions",
    subtitle: "Internet, telèfon, TV…",
    icon: "📡",
    gradient: "from-slate-50 to-slate-100",
  },
  {
    key: "alarm",
    title: "Alarma",
    subtitle: "Central, sensors, codis…",
    icon: "🚨",
    gradient: "from-slate-50 to-slate-100",
  },
];

function getCategoryFromType(type?: string): CategoryKey {
  const t = (type ?? "").toLowerCase();

  if (t.includes("electr")) return "electric";
  if (t.includes("aigua") || t.includes("water") || t.includes("bomba"))
    return "water";
  if (t.includes("calef") || t.includes("heat") || t.includes("clima"))
    return "heating";
  if (t.includes("claveg") || t.includes("dren") || t.includes("sewer"))
    return "drainage";
  if (
    t.includes("com") ||
    t.includes("internet") ||
    t.includes("wifi") ||
    t.includes("telefon")
  )
    return "comm";
  if (t.includes("alarm")) return "alarm";

  return "other";
}

function getCategoryLabel(key: CategoryKey): string {
  const found = CATEGORIES.find((c) => c.key === key);
  if (found) return found.title;
  return "Altres sistemes";
}

export function SystemsPage() {
  const navigate = useNavigate();
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(
    null
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const snap = await getDocs(collection(db, "systems"));
        const items: System[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          items.push({
            id: docSnap.id,
            name: data.name ?? "",
            houseId: data.houseId,
            houseName: data.houseName,
            code: data.code,
            type: data.type,
            location: data.location,
          });
        });

        // Ordenem per vivenda + codi per tenir-ho polit
        items.sort((a, b) => {
          const hA = (a.houseName ?? "").localeCompare(b.houseName ?? "");
          if (hA !== 0) return hA;
          return (a.code ?? "").localeCompare(b.code ?? "");
        });

        setSystems(items);
      } catch (err) {
        console.error(err);
        setError("Error carregant els sistemes.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredByCategory =
    selectedCategory == null
      ? systems
      : systems.filter(
          (s) => getCategoryFromType(s.type) === selectedCategory
        );

  const filtered = filteredByCategory.filter((s) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.code ?? "").toLowerCase().includes(q) ||
      (s.houseName ?? "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 text-sm text-slate-500">
        Carregant sistemes…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // MODE 1: cap categoria seleccionada → MENÚ TIPUS
  // ─────────────────────────────────────────────
  if (selectedCategory === null) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
        <div className="mb-2">
          <h1 className="text-lg font-semibold text-slate-900">
            Sistemes
          </h1>
          <p className="text-xs text-slate-500">
            Tria el tipus de sistema per veure&apos;ls a totes les vivendes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.key);
                setSearch("");
              }}
              className={`rounded-2xl bg-gradient-to-br ${cat.gradient} border border-slate-100 shadow-sm px-3 py-3 flex flex-col items-start gap-2 hover:shadow-md active:scale-[0.98] transition`}
            >
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-lg border border-slate-200">
                  {cat.icon}
                </div>
                <p className="text-[13px] font-semibold text-slate-900 text-left">
                  {cat.title}
                </p>
              </div>
              <p className="text-[11px] text-slate-600 text-left">
                {cat.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // MODE 2: categoria seleccionada → LLISTA FILTRADA
  // ─────────────────────────────────────────────
  const currentCategoryLabel = getCategoryLabel(selectedCategory);
  const currentCategoryDef = CATEGORIES.find(
    (c) => c.key === selectedCategory
  );

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
      {/* Header amb back a tipus */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory(null);
            setSearch("");
          }}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Tipus de sistemes
        </button>

        <div className="flex-1 text-center">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Sistemes
          </p>
          <p className="text-sm font-semibold text-slate-900 truncate">
            {currentCategoryLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/sistemes/nou")}
          className="shrink-0 rounded-full bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 hover:bg-slate-800"
        >
          Nou
        </button>
      </div>

      {/* Targeta resum del tipus */}
      {currentCategoryDef && (
        <div
          className={`rounded-2xl bg-gradient-to-br ${currentCategoryDef.gradient} border border-slate-100 shadow-sm px-3 py-3 flex items-center gap-3`}
        >
          <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-lg border border-slate-200">
            {currentCategoryDef.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-900 truncate">
              {currentCategoryDef.title}
            </p>
            <p className="text-[11px] text-slate-600 truncate">
              {currentCategoryDef.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Cercador */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cerca per nom, codi o vivenda…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 pl-8 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
        />
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
          🔍
        </span>
      </div>

      {/* Llista filtrada */}
      {filtered.length === 0 ? (
        <div className="text-sm text-slate-500 bg-white border border-dashed border-slate-200 rounded-2xl p-4 text-center">
          No hi ha sistemes d&apos;aquest tipus amb aquest filtre.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((system) => (
            <button
              key={system.id}
              type="button"
              onClick={() => navigate(`/sistemes/${system.id}`)}
              className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-3 flex gap-3 items-center hover:bg-slate-50 active:scale-[0.99] transition"
            >
              <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                {(system.code ?? "")
                  .split("-")
                  .pop()
                  ?.trim() || "SYS"}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {system.name}
                  </p>
                  {system.code && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                      {system.code}
                    </span>
                  )}
                </div>

                {system.houseName && (
                  <p className="text-[11px] text-slate-500 truncate">
                    {system.houseName}
                  </p>
                )}

                {system.location && (
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {system.location}
                  </p>
                )}
              </div>

              <span className="text-xs text-slate-300">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
