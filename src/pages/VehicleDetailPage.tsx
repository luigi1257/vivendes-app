// src/pages/VehicleDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

type Vehicle = {
  id: string;
  houseId?: string;
  houseName?: string;
  type?: "cotxe" | "moto";
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

export function VehicleDetailPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVehicle(id: string) {
      try {
        const ref = doc(db, "vehicles", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("No s'ha trobat aquest vehicle.");
          return;
        }
        const v = snap.data() as any;
        setVehicle({
          id: snap.id,
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
        });
      } catch (err) {
        console.error(err);
        setError("Error carregant el vehicle.");
      } finally {
        setLoading(false);
      }
    }

    if (!vehicleId) {
      setError("Falta l'ID del vehicle.");
      setLoading(false);
      return;
    }

    loadVehicle(vehicleId);
  }, [vehicleId]);

  async function handleDelete() {
    if (!vehicle) return;
    const confirmed = window.confirm(
      "Segur que vols eliminar aquest vehicle? Aquesta acció no es pot desfer."
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "vehicles", vehicle.id));
      navigate("/vehicles");
    } catch (err) {
      console.error(err);
      alert("Error eliminant el vehicle.");
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 text-sm text-slate-500">
        Carregant vehicle…
      </div>
    );
  }

  if (error || !vehicle) {
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

  const title =
    vehicle.name ||
    `${vehicle.brand ?? ""} ${vehicle.model ?? ""}`.trim() ||
    "Vehicle";

  return (
    <div className="pb-24">
      {/* Header */}
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
              Vehicle
            </p>
            <h1 className="text-base font-semibold text-slate-900 truncate">
              {title}
            </h1>
            {vehicle.plate && (
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                {vehicle.plate}
              </p>
            )}
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
              to={`/vehicles/${vehicle.id}/editar`}
              className="text-xs font-semibold px-3 py-1 rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              Editar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Vivenda */}
        {vehicle.houseId && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Vivenda
            </p>
            <Link
              to={`/vivendes/${vehicle.houseId}`}
              className="text-sm font-semibold text-slate-900 underline"
            >
              {vehicle.houseName ?? "Veure vivenda"}
            </Link>
          </section>
        )}

        {/* Foto */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Foto
          </p>
          {vehicle.photoUrl ? (
            <img
              src={vehicle.photoUrl}
              alt={title}
              className="w-full rounded-xl border border-slate-100 object-cover max-h-56"
            />
          ) : (
            <div className="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center">
              <span className="text-4xl text-slate-300">
                {vehicle.type === "moto" ? "🏍️" : "🚗"}
              </span>
            </div>
          )}
        </section>

        {/* Dades bàsiques */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Dades bàsiques
          </p>
          <div className="space-y-1 text-sm text-slate-700">
            {vehicle.type && (
              <p>
                <span className="font-semibold">Tipus:</span>{" "}
                {vehicle.type === "moto" ? "Moto" : "Cotxe"}
              </p>
            )}
            {vehicle.brand && (
              <p>
                <span className="font-semibold">Marca:</span> {vehicle.brand}
              </p>
            )}
            {vehicle.model && (
              <p>
                <span className="font-semibold">Model:</span> {vehicle.model}
              </p>
            )}
            {vehicle.year && (
              <p>
                <span className="font-semibold">Any:</span> {vehicle.year}
              </p>
            )}
          </div>
        </section>

        {/* Compra i ITV */}
        {(vehicle.purchaseYear ||
          vehicle.purchasePrice ||
          vehicle.itvDate ||
          vehicle.itvNotes) && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Compra i ITV
            </p>
            <div className="space-y-1 text-sm text-slate-700">
              {vehicle.purchaseYear && (
                <p>
                  <span className="font-semibold">Any de compra:</span>{" "}
                  {vehicle.purchaseYear}
                </p>
              )}
              {vehicle.purchasePrice && (
                <p>
                  <span className="font-semibold">Preu de compra:</span>{" "}
                  {vehicle.purchasePrice} €
                </p>
              )}
              {vehicle.itvDate && (
                <p>
                  <span className="font-semibold">Data ITV:</span>{" "}
                  {vehicle.itvDate}
                </p>
              )}
              {vehicle.itvNotes && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-0.5">
                    Notes ITV
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">
                    {vehicle.itvNotes}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Altres notes */}
        {vehicle.notes && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Altres notes
            </p>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {vehicle.notes}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
