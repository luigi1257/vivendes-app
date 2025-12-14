// src/pages/IncidentDetailPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

type IncidentStatus = "oberta" | "pendent" | "resolta";

type Incident = {
  id: string;
  title: string;
  description?: string;
  actionTaken?: string;
  contactName?: string;
  date?: string;
  status?: IncidentStatus;
  houseId?: string;
  houseName?: string;
  systemId?: string;
  systemCode?: string;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "Sense data";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("ca-ES", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function StatusPill({ status }: { status?: IncidentStatus }) {
  if (!status) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
        Sense estat
      </span>
    );
  }

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

export function IncidentDetailPage() {
  const { incidentId } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load(id: string) {
      try {
        const ref = doc(db, "incidents", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("No s’ha trobat aquesta incidència.");
          return;
        }
        const data = snap.data() as any;
        setIncident({
          id: snap.id,
          title: data.title ?? "",
          description: data.description,
          actionTaken: data.actionTaken,
          contactName: data.contactName,
          date: data.date,
          status: data.status as IncidentStatus | undefined,
          houseId: data.houseId,
          houseName: data.houseName,
          systemId: data.systemId,
          systemCode: data.systemCode,
        });
      } catch (err) {
        console.error(err);
        setError("Error carregant la incidència.");
      } finally {
        setLoading(false);
      }
    }

    if (!incidentId) {
      setError("Falta l’identificador de la incidència.");
      setLoading(false);
      return;
    }

    load(incidentId);
  }, [incidentId]);

  async function handleStatusChange(newStatus: IncidentStatus) {
    if (!incidentId || !incident) return;
    setUpdatingStatus(true);
    setError(null);

    try {
      const ref = doc(db, "incidents", incidentId);
      await updateDoc(ref, { status: newStatus });
      setIncident({ ...incident, status: newStatus });
    } catch (err) {
      console.error(err);
      setError("Error actualitzant l’estat de la incidència.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleDelete() {
    if (!incidentId || !incident) return;
    const ok = window.confirm("Segur que vols eliminar aquesta incidència?");
    if (!ok) return;

    setDeleting(true);
    setError(null);

    try {
      const ref = doc(db, "incidents", incidentId);
      await deleteDoc(ref);
      navigate("/incidencies");
    } catch (err) {
      console.error(err);
      setError("Error eliminant la incidència.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto px-4 pt-6 pb-24 text-sm text-slate-500">
          Carregant incidència…
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            ← Enrere
          </button>
          <p className="text-sm text-red-600">
            {error ?? "No s’ha pogut carregar la incidència."}
          </p>
        </div>
      </div>
    );
  }

  const { houseId, houseName, systemId, systemCode } = incident;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* HEADER NOU (sticky) */}
      <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur border-b border-slate-200/70">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3 gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-100"
          >
            ←
          </button>

          <div className="flex-1 min-w-0 text-center">
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
              Incidència
            </p>
            <h1 className="text-sm font-semibold text-slate-900 truncate">
              {incident.title}
            </h1>
            <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                📅 {formatDate(incident.date)}
              </span>
              <StatusPill status={incident.status} />
            </div>
          </div>

          <div className="w-8" />
        </div>
      </header>

      {/* CONTINGUT ORIGINAL (targetes, estat, accions…) */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Capçalera incidència */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-rose-100 flex items-center justify-center text-base">
              ⚡
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <h2 className="text-sm font-semibold text-slate-900">
                {incident.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={incident.status} />
                {incident.status === "oberta" && (
                  <span className="text-[11px] text-rose-500">
                    Requereix atenció
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Enllaços ràpids a vivenda i sistema */}
          <div className="flex flex-wrap gap-2 pt-1">
            {houseId && houseName && (
              <Link
                to={`/vivendes/${houseId}`}
                className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
              >
                <span>🏠</span>
                <span className="truncate max-w-[140px]">{houseName}</span>
              </Link>
            )}
            {systemId && (
              <Link
                to={`/sistemes/${systemId}`}
                className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
              >
                <span>⚙️</span>
                <span className="truncate max-w-[120px]">
                  {systemCode || "Sistema associat"}
                </span>
              </Link>
            )}
          </div>
        </section>

        {/* Descripció */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Descripció
          </p>
          <p className="text-sm text-slate-800 whitespace-pre-line">
            {incident.description || "Sense descripció detallada."}
          </p>
        </section>

        {/* Accions realitzades */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Accions fetes
          </p>
          <p className="text-sm text-slate-800 whitespace-pre-line">
            {incident.actionTaken || "Encara no s’han registrat accions."}
          </p>
        </section>

        {/* Contacte / responsable */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Contacte / responsable
          </p>
          <p className="text-sm text-slate-800">
            {incident.contactName || "Sense contacte associat."}
          </p>
        </section>

        {/* Accions ràpides d'estat */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Canviar estat
          </p>
          <div className="flex flex-wrap gap-2">
            {(["oberta", "pendent", "resolta"] as IncidentStatus[]).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  disabled={updatingStatus || incident.status === st}
                  onClick={() => handleStatusChange(st)}
                  className={
                    "px-3 py-1 rounded-full text-[11px] font-medium border transition " +
                    (incident.status === st
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 disabled:opacity-50")
                  }
                >
                  {st === "oberta" && "Marcar com oberta"}
                  {st === "pendent" && "Marcar com pendent"}
                  {st === "resolta" && "Marcar com resolta"}
                </button>
              )
            )}
          </div>
          {updatingStatus && (
            <p className="text-[11px] text-slate-400">Actualitzant estat…</p>
          )}
        </section>

        {/* Accions d'edició / esborrar */}
        <section className="space-y-2">
          <button
            type="button"
            onClick={() => navigate(`/incidencies/${incident.id}/editar`)}
            className="w-full rounded-full bg-slate-900 text-white text-sm font-semibold py-2.5 hover:bg-slate-800"
          >
            Editar incidència
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full rounded-full border border-red-200 bg-red-50 text-sm font-semibold py-2.5 text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            {deleting ? "Eliminant…" : "Eliminar incidència"}
          </button>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mt-1">
              {error}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
