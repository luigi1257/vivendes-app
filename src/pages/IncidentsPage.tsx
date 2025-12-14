// src/pages/IncidentsPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

type IncidentStatus = "oberta" | "pendent" | "resolta";

type Incident = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status?: IncidentStatus;
  houseId?: string;
  houseName?: string;
  systemId?: string;
  systemCode?: string;
};

type StatusFilter = "totes" | IncidentStatus;

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatBadgeDate(dateStr?: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr ?? "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatSubtitleDate(dateStr?: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr ?? "Sense data";
  return d.toLocaleDateString("ca-ES", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function StatusPillInline({ status }: { status?: IncidentStatus }) {
  if (!status) return null;

  const map: Record<IncidentStatus, string> = {
    oberta: "bg-rose-50 text-rose-800 border-rose-100",
    pendent: "bg-amber-50 text-amber-800 border-amber-100",
    resolta: "bg-emerald-50 text-emerald-800 border-emerald-100",
  };

  const label: Record<IncidentStatus, string> = {
    oberta: "Oberta",
    pendent: "Pendent",
    resolta: "Resoluta",
  };

  return (
    <span
      className={
        "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide " +
        map[status]
      }
    >
      {label[status]}
    </span>
  );
}

export function IncidentsPage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("totes");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const snap = await getDocs(collection(db, "incidents"));
        const items: Incident[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          items.push({
            id: docSnap.id,
            title: data.title ?? "",
            description: data.description,
            date: data.date,
            status: data.status as IncidentStatus | undefined,
            houseId: data.houseId,
            houseName: data.houseName,
            systemId: data.systemId,
            systemCode: data.systemCode,
          });
        });

        // Ordenar per data desc (més recents primer)
        items.sort((a, b) => {
          const dA = parseDate(a.date);
          const dB = parseDate(b.date);
          if (!dA && !dB) return 0;
          if (!dA) return 1;
          if (!dB) return -1;
          return dB.getTime() - dA.getTime();
        });

        setIncidents(items);
      } catch (err) {
        console.error(err);
        setError("Error carregant les incidències.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = incidents.filter((inc) => {
    // Filtres d'estat
    if (statusFilter !== "totes") {
      if (inc.status !== statusFilter) return false;
    }

    // Filtres de text
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      inc.title.toLowerCase().includes(q) ||
      (inc.houseName ?? "").toLowerCase().includes(q) ||
      (inc.systemCode ?? "").toLowerCase().includes(q)
    );
  });

  const total = incidents.length;
  const obertes = incidents.filter((i) => i.status === "oberta").length;
  const pendents = incidents.filter((i) => i.status === "pendent").length;
  const resoltes = incidents.filter((i) => i.status === "resolta").length;

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 text-sm text-slate-500">
        Carregant incidències…
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

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Incidències
          </h1>
          <p className="text-xs text-slate-500">
            Seguiment de totes les incidències a les vivendes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/incidencies/nova")}
          className="shrink-0 rounded-full bg-slate-900 text-white text-sm font-semibold px-3 py-2 flex items-center gap-1 hover:bg-slate-800"
        >
          <span className="text-base leading-none">＋</span>
          <span className="text-[11px]">Nova</span>
        </button>
      </div>

      {/* Resum números */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 px-3 py-2 flex items-center justify-between text-[11px] text-slate-600">
        <span>Total: {total}</span>
        <span>Obertes: {obertes}</span>
        <span>Pendents: {pendents}</span>
        <span>Resoltes: {resoltes}</span>
      </section>

      {/* Filtres estat */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 px-3 py-3 space-y-2">
        <p className="text-[11px] uppercase tracking-wide text-slate-400">
          Estat
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "totes", label: "Totes" },
              { key: "oberta", label: "Obertes" },
              { key: "pendent", label: "Pendents" },
              { key: "resolta", label: "Resoltes" },
            ] as { key: StatusFilter; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={
                "px-3 py-1 rounded-full text-[11px] font-medium border transition " +
                (statusFilter === f.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Cercador */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cerca per títol, vivenda o codi de sistema…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 pl-8 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
        />
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
          🔍
        </span>
      </div>

      {/* Llista d'incidències */}
      {filtered.length === 0 ? (
        <div className="text-sm text-slate-500 bg-white border border-dashed border-slate-200 rounded-2xl p-4 text-center">
          No hi ha incidències amb aquest filtre.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inc) => (
            <Link
              key={inc.id}
              to={`/incidencies/${inc.id}`}
              className="flex gap-3 items-stretch bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-3 hover:bg-slate-50 active:scale-[0.99] transition"
            >
              {/* Globus amb data COMPLETA */}
              <div className="flex flex-col items-center justify-center">
                <div className="h-8 w-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-semibold text-center leading-tight px-2">
                  {formatBadgeDate(inc.date)}
                </div>
              </div>

              {/* Cos de la targeta */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {inc.title}
                  </p>
                  <StatusPillInline status={inc.status} />
                </div>

                <p className="text-[11px] text-slate-500">
                  {inc.houseName ? inc.houseName : "Sense vivenda"}{" "}
                  {inc.systemCode && (
                    <span className="text-slate-400">
                      · {inc.systemCode}
                    </span>
                  )}
                </p>

                <p className="text-[11px] text-slate-400">
                  {formatSubtitleDate(inc.date)}
                </p>

                {inc.description && (
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {inc.description}
                  </p>
                )}
              </div>

              <span className="self-center text-xs text-slate-300">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
