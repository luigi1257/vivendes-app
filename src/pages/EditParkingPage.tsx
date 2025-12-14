// src/pages/EditParkingPage.tsx
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ImageUploadField } from "../components/ImageUploadField";

type ParkingStatus = "lliure" | "llogat" | "reservat";

type ParkingDoc = {
  houseId: string;
  houseName?: string;
  name: string;
  location?: string;
  status: ParkingStatus;
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  rentPrice?: string;
  contractStart?: string;
  contractEnd?: string;
  accessInfo?: string;
  notes?: string;
  photoUrl?: string;
};

export function EditParkingPage() {
  const { parkingId } = useParams<{ parkingId: string }>();
  const navigate = useNavigate();

  const [houseId, setHouseId] = useState<string>("");
  const [houseName, setHouseName] = useState<string>("");

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<ParkingStatus>("lliure");
  const [tenantName, setTenantName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [rentPrice, setRentPrice] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [accessInfo, setAccessInfo] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState(""); // FOTO DEL PÀRQUING

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadParking(id: string) {
      try {
        const ref = doc(db, "parkings", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("No s’ha trobat el pàrquing.");
          return;
        }

        const data = snap.data() as ParkingDoc;

        setHouseId(data.houseId);
        setHouseName(data.houseName ?? "");
        setName(data.name ?? "");
        setLocation(data.location ?? "");
        setStatus(data.status ?? "lliure");
        setTenantName(data.tenantName ?? "");
        setTenantPhone(data.tenantPhone ?? "");
        setTenantEmail(data.tenantEmail ?? "");
        setRentPrice(data.rentPrice ?? "");
        setContractStart(data.contractStart ?? "");
        setContractEnd(data.contractEnd ?? "");
        setAccessInfo(data.accessInfo ?? "");
        setNotes(data.notes ?? "");
        setPhotoUrl(data.photoUrl ?? "");
      } catch (err) {
        console.error(err);
        setError("Error carregant el pàrquing.");
      } finally {
        setLoading(false);
      }
    }

    if (!parkingId) {
      setError("Falta l’ID del pàrquing.");
      setLoading(false);
      return;
    }

    loadParking(parkingId);
  }, [parkingId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!parkingId) {
      setError("Falta l’ID del pàrquing.");
      return;
    }
    if (!houseId) {
      setError("Falta la vivenda associada.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const ref = doc(db, "parkings", parkingId);
      await updateDoc(ref, {
        houseId,
        houseName,
        name,
        location,
        status,
        tenantName,
        tenantPhone,
        tenantEmail,
        rentPrice,
        contractStart,
        contractEnd,
        accessInfo,
        notes,
        photoUrl, // desar la foto
      });

      // Després de desar, tornem al detall del pàrquing
      navigate(`/parkings/${parkingId}`);
    } catch (err) {
      console.error(err);
      setError("Error desant el pàrquing.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 text-sm text-slate-500">
        Carregant pàrquing…
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
        <Link
          to="/parkings"
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Tornar a pàrquings
        </Link>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Enrere
        </button>
        <div className="flex-1 text-center">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Editar pàrquing
          </p>
          <p className="text-sm font-semibold text-slate-900 truncate">
            {houseName || "Vivenda"}
          </p>
        </div>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info bàsica */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dades del pàrquing
            </p>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nom / identificador
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Ubicació
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Estat
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={status}
                onChange={(e) => setStatus(e.target.value as ParkingStatus)}
              >
                <option value="lliure">Lliure</option>
                <option value="llogat">Llogat</option>
                <option value="reservat">Reservat</option>
              </select>
            </div>

            {/* FOTO DEL PÀRQUING */}
            <ImageUploadField
              label="Foto del pàrquing"
              value={photoUrl}
              onChange={setPhotoUrl}
            />
          </div>
        </section>

        {/* Lloguer */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Lloguer / ocupació
            </p>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nom del llogater
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Telèfon
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Preu lloguer (€/mes)
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  value={rentPrice}
                  onChange={(e) => setRentPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Inici contracte
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  value={contractStart}
                  onChange={(e) => setContractStart(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Fi contracte
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  value={contractEnd}
                  onChange={(e) => setContractEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Accessos i notes */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Accessos i notes
            </p>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Informació d&apos;accés
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 resize-none min-h-[72px]"
                value={accessInfo}
                onChange={(e) => setAccessInfo(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 resize-none min-h-[72px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </section>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-slate-900 text-white text-sm font-semibold py-2.5 disabled:opacity-60"
        >
          {saving ? "Guardant…" : "Desar canvis"}
        </button>
      </form>
    </div>
  );
}
