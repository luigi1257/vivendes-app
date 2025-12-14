// src/pages/HouseDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

type House = {
  id: string;
  name: string;
  address?: string;
  coverImageUrl?: string;
  mapsUrl?: string;
  notes?: string;
};

type FirestoreHouse = {
  name: string;
  address?: string;
  coverImageUrl?: string;
  mapsUrl?: string;
  googleMapsUrl?: string;
  notes?: string;
};

type SystemListItem = {
  id: string;
  code: string;
  type?: string;
  name: string;
};

type IncidentStatus = "oberta" | "pendent" | "resolta";

type IncidentListItem = {
  id: string;
  title: string;
  date?: string;
  status?: IncidentStatus;
  systemCode?: string;
};

type ParkingStatus = "lliure" | "llogat" | "reservat";

type ParkingListItem = {
  id: string;
  name: string;
  location?: string;
  status?: ParkingStatus;
  tenantName?: string;
};

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2 print:border print:shadow-none print:rounded-xl">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h2>
        {action && <div className="text-xs">{action}</div>}
      </div>
      <div>{children}</div>
    </section>
  );
}

function IncidentStatusPill({ status }: { status?: IncidentStatus }) {
  if (!status) return null;
  const map: Record<IncidentStatus, string> = {
    oberta: "bg-rose-50 text-rose-700 border-rose-100",
    pendent: "bg-amber-50 text-amber-800 border-amber-100",
    resolta: "bg-emerald-50 text-emerald-800 border-emerald-100",
  };
  const label: Record<IncidentStatus, string> = {
    oberta: "Oberta",
    pendent: "Pendent",
    resolta: "Resolta",
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

function ParkingStatusPill({ status }: { status?: ParkingStatus }) {
  if (!status) return null;
  const map: Record<ParkingStatus, string> = {
    lliure: "bg-emerald-50 text-emerald-800 border-emerald-100",
    llogat: "bg-sky-50 text-sky-800 border-sky-100",
    reservat: "bg-amber-50 text-amber-800 border-amber-100",
  };
  const label: Record<ParkingStatus, string> = {
    lliure: "Lliure",
    llogat: "Llogat",
    reservat: "Reservat",
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

export function HouseDetailPage() {
  const { houseId } = useParams();
  const navigate = useNavigate();

  const [house, setHouse] = useState<House | null>(null);
  const [systems, setSystems] = useState<SystemListItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentListItem[]>([]);
  const [parkings, setParkings] = useState<ParkingListItem[]>([]);

  const [loadingHouse, setLoadingHouse] = useState(true);
  const [loadingSystems, setLoadingSystems] = useState(true);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingParkings, setLoadingParkings] = useState(true);

  const [error, setError] = useState<string | null>(null);

  function handleExportPdf() {
    window.print();
  }

  useEffect(() => {
    if (!houseId) return;

    async function loadHouse(id: string) {
      try {
        const ref = doc(db, "houses", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("No s’ha trobat aquesta vivenda.");
          setLoadingHouse(false);
          return;
        }
        const data = snap.data() as FirestoreHouse;
        setHouse({
          id: snap.id,
          name: data.name,
          address: data.address,
          coverImageUrl: data.coverImageUrl,
          mapsUrl: data.mapsUrl ?? data.googleMapsUrl,
          notes: data.notes,
        });
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Error carregant la vivenda.");
      } finally {
        setLoadingHouse(false);
      }
    }

    async function loadSystems(id: string) {
      try {
        const q = query(collection(db, "systems"), where("houseId", "==", id));
        const snap = await getDocs(q);
        const items: SystemListItem[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as any;
          items.push({
            id: docSnap.id,
            code: d.code ?? "",
            type: d.type,
            name: d.name ?? "",
          });
        });
        setSystems(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSystems(false);
      }
    }

    async function loadIncidents(id: string) {
      try {
        const q = query(
          collection(db, "incidents"),
          where("houseId", "==", id)
        );
        const snap = await getDocs(q);
        const items: IncidentListItem[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as any;
          items.push({
            id: docSnap.id,
            title: d.title ?? "",
            date: d.date,
            status: d.status as IncidentStatus | undefined,
            systemCode: d.systemCode,
          });
        });
        setIncidents(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingIncidents(false);
      }
    }

    async function loadParkings(id: string) {
      try {
        const q = query(
          collection(db, "parkings"),
          where("houseId", "==", id)
        );
        const snap = await getDocs(q);
        const items: ParkingListItem[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as any;
          items.push({
            id: docSnap.id,
            name: d.name ?? "",
            location: d.location,
            status: d.status as ParkingStatus | undefined,
            tenantName: d.tenantName,
          });
        });
        setParkings(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingParkings(false);
      }
    }

    loadHouse(houseId);
    loadSystems(houseId);
    loadIncidents(houseId);
    loadParkings(houseId);
  }, [houseId]);

  if (loadingHouse) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 text-sm text-slate-500">
        Carregant vivenda…
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Enrere
        </button>
        <p className="text-sm text-red-600">{error ?? "Error desconegut."}</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* capçalera */}
      <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur border-b border-slate-200/70 print:relative print:border-none print:bg-white">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3 gap-2 print:px-0 print:py-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-slate-800 print:hidden"
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Vivenda
            </p>
            <h1 className="text-base font-semibold text-slate-900 truncate">
              {house.name}
            </h1>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={handleExportPdf}
              className="text-xs font-semibold px-3 py-1 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              PDF
            </button>
            <Link
              to={`/vivendes/${house.id}/editar`}
              className="text-xs font-semibold px-3 py-1 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              Editar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4 print:px-0 print:py-4">
        {/* targeta principal vivenda */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3 print:border print:shadow-none print:rounded-xl">
          {house.coverImageUrl && (
            <div className="mb-2">
              <img
                src={house.coverImageUrl}
                alt={house.name}
                className="w-full rounded-xl border border-slate-100 object-cover max-h-56"
              />
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {house.name}
            </h2>
            {house.address && (
              <p className="mt-1 text-xs text-slate-500">
                📍 {house.address}
              </p>
            )}
            {house.mapsUrl && (
              <a
                href={house.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-slate-700 underline"
              >
                Obrir a Google Maps
              </a>
            )}
          </div>

          {house.notes && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-slate-500 mb-0.5">
                Notes
              </p>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {house.notes}
              </p>
            </div>
          )}
        </section>

        {/* Sistemes d’aquesta vivenda */}
        <Section title="Sistemes d’aquesta vivenda">
          {loadingSystems ? (
            <p className="text-xs text-slate-500">Carregant sistemes…</p>
          ) : systems.length === 0 ? (
            <p className="text-xs text-slate-500">
              No hi ha sistemes registrats per aquesta vivenda.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {systems.map((s) => (
                <li key={s.id} className="py-2">
                  <Link
                    to={`/sistemes/${s.id}`}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        {s.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono">{s.code}</span>
                        {s.type && (
                          <span className="ml-2 uppercase tracking-wide">
                            · {s.type}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Incidències d’aquesta vivenda */}
        <Section title="Incidències d’aquesta vivenda">
          {loadingIncidents ? (
            <p className="text-xs text-slate-500">Carregant incidències…</p>
          ) : incidents.length === 0 ? (
            <p className="text-xs text-slate-500">
              No hi ha incidències registrades per aquesta vivenda.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {incidents.map((inc) => (
                <li key={inc.id} className="py-2">
                  <Link
                    to={`/incidencies/${inc.id}`}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        {inc.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {inc.date && <>📅 {inc.date}</>}
                        {inc.systemCode && (
                          <>
                            {" "}
                            ·{" "}
                            <span className="font-mono">
                              {inc.systemCode}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <IncidentStatusPill status={inc.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Pàrquings d’aquesta vivenda */}
        <Section
          title="Pàrquings d’aquesta vivenda"
          action={
            <Link
              to={`/parkings/nou/${house.id}`}
              className="inline-flex items-center px-2 py-1 rounded-full border border-slate-200 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50"
            >
              + Afegir
            </Link>
          }
        >
          {loadingParkings ? (
            <p className="text-xs text-slate-500">Carregant pàrquings…</p>
          ) : parkings.length === 0 ? (
            <p className="text-xs text-slate-500">
              No hi ha pàrquings registrats per aquesta vivenda.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {parkings.map((p) => (
                <li key={p.id} className="py-2">
                  <Link
                    to={`/parkings/${p.id}`}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.location && <span>{p.location}</span>}
                        {p.tenantName && (
                          <>
                            {" "}
                            ·{" "}
                            <span className="font-medium">
                              Llogater: {p.tenantName}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <ParkingStatusPill status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </main>
    </div>
  );
}
