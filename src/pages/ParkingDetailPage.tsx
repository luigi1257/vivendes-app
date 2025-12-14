// src/pages/ParkingDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

type ParkingStatus = "lliure" | "llogat" | "reservat";

type ParkingDoc = {
  houseId: string;
  houseName?: string;
  name: string;
  location?: string;
  status?: ParkingStatus;
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  rentPrice?: string;
  contractStart?: string;
  contractEnd?: string;
  accessInfo?: string;
  notes?: string;
};

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

export function ParkingDetailPage() {
  const { parkingId } = useParams();
  const navigate = useNavigate();

  const [parking, setParking] = useState<(ParkingDoc & { id: string }) | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parkingId) {
      setError("Falta l’identificador del pàrquing.");
      setLoading(false);
      return;
    }

    async function load(id: string) {
      try {
        const ref = doc(db, "parkings", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("No s’ha trobat aquest pàrquing.");
          return;
        }
        const data = snap.data() as ParkingDoc;
        setParking({ id: snap.id, ...data });
      } catch (err) {
        console.error(err);
        setError("Error carregant el pàrquing.");
      } finally {
        setLoading(false);
      }
    }

    load(parkingId);
  }, [parkingId]);

  async function handleDelete() {
    if (!parking) return;

    const confirmed = window.confirm(
      "Segur que vols eliminar aquest pàrquing? Aquesta acció no es pot desfer."
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "parkings", parking.id));
      navigate(`/vivendes/${parking.houseId}`);
    } catch (err) {
      console.error("Error eliminant pàrquing:", err);
      alert("Hi ha hagut un error eliminant el pàrquing.");
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 text-sm text-slate-500">
        Carregant pàrquing…
      </div>
    );
  }

  if (error || !parking) {
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
      <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur border-b border-slate-200/70">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3 gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Pàrquing
            </p>
            <h1 className="text-base font-semibold text-slate-900 truncate">
              {parking.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="text-[11px] font-semibold px-3 py-1 rounded-full border border-red-200 text-red-700 bg-white hover:bg-red-50"
            >
              Eliminar
            </button>
            <Link
              to={`/parkings/${parking.id}/editar`}
              className="text-xs font-semibold px-3 py-1 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              Editar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Vivenda
              </p>
              {parking.houseId ? (
                <Link
                  to={`/vivendes/${parking.houseId}`}
                  className="text-sm font-semibold text-slate-900 underline"
                >
                  {parking.houseName ?? "Anar a la vivenda"}
                </Link>
              ) : (
                <p className="text-sm text-slate-700">
                  {parking.houseName ?? "-"}
                </p>
              )}
            </div>
            <ParkingStatusPill status={parking.status} />
          </div>

          {parking.location && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-0.5">
                Ubicació
              </p>
              <p className="text-sm text-slate-700">{parking.location}</p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Lloguer / ocupació
          </p>

          <div className="space-y-2 text-sm text-slate-700">
            {parking.tenantName ? (
              <p>
                <span className="font-semibold">Llogater:</span>{" "}
                {parking.tenantName}
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Cap llogater indicat. El pàrquing pot estar lliure o
                reservat.
              </p>
            )}

            {parking.tenantPhone && (
              <p>
                📞{" "}
                <a
                  href={`tel:${parking.tenantPhone}`}
                  className="underline"
                >
                  {parking.tenantPhone}
                </a>
              </p>
            )}

            {parking.tenantEmail && (
              <p>
                ✉️{" "}
                <a
                  href={`mailto:${parking.tenantEmail}`}
                  className="underline"
                >
                  {parking.tenantEmail}
                </a>
              </p>
            )}

            {parking.rentPrice && (
              <p>
                💶 <span className="font-semibold">{parking.rentPrice}</span>{" "}
                €/mes
              </p>
            )}

            {(parking.contractStart || parking.contractEnd) && (
              <p>
                📄{" "}
                {parking.contractStart && (
                  <>
                    Inici: {parking.contractStart}
                    {parking.contractEnd && " · "}
                  </>
                )}
                {parking.contractEnd && <>Fi: {parking.contractEnd}</>}
              </p>
            )}
          </div>
        </section>

        {(parking.accessInfo || parking.notes) && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Accessos i notes
            </p>

            {parking.accessInfo && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">
                  Informació d&apos;accés
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-line">
                  {parking.accessInfo}
                </p>
              </div>
            )}

            {parking.notes && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">
                  Notes
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-line">
                  {parking.notes}
                </p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
