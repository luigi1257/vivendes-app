// src/pages/NewVehiclePage.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { ImageUploadField } from "../components/ImageUploadField";

type VehicleType = "cotxe" | "moto";

type SimpleHouse = {
  id: string;
  name: string;
};

export function NewVehiclePage() {
  const navigate = useNavigate();

  // Vivendes per associar el vehicle
  const [houses, setHouses] = useState<SimpleHouse[]>([]);
  const [loadingHouses, setLoadingHouses] = useState(true);

  // Camps principals
  const [houseId, setHouseId] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("cotxe");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [year, setYear] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseYear, setPurchaseYear] = useState("");
  const [itvDate, setItvDate] = useState("");
  const [itvNotes, setItvNotes] = useState("");
  const [notes, setNotes] = useState("");

  const [photoUrl, setPhotoUrl] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHouses() {
      try {
        const snap = await getDocs(collection(db, "houses"));
        const list: SimpleHouse[] = snap.docs.map((d) => {
          const h = d.data() as any;
          return {
            id: d.id,
            name: h.name ?? d.id,
          };
        });
        list.sort((a, b) => a.name.localeCompare(b.name));
        setHouses(list);
      } catch (err) {
        console.error(err);
        setError("Error carregant les vivendes.");
      } finally {
        setLoadingHouses(false);
      }
    }

    loadHouses();
  }, []);

  function getHouseNameById(id: string): string {
    const h = houses.find((x) => x.id === id);
    return h?.name ?? id ?? "";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!houseId) {
      setError("Has de seleccionar una vivenda.");
      return;
    }
    if (!name.trim()) {
      setError("El nom del vehicle és obligatori.");
      return;
    }

    try {
      setSaving(true);

      const houseName = getHouseNameById(houseId);

      await addDoc(collection(db, "vehicles"), {
        houseId,
        houseName,
        type: vehicleType,
        name: name.trim(),
        brand: brand.trim(),
        model: model.trim(),
        plate: plate.trim(),
        year: year.trim(),
        purchasePrice: purchasePrice.trim(),
        purchaseYear: purchaseYear.trim(),
        itvDate: itvDate.trim(),
        itvNotes: itvNotes.trim(),
        notes: notes.trim(),
        photoUrl: photoUrl.trim(),
      });

      navigate("/vehicles");
    } catch (err) {
      console.error(err);
      setError("No s'ha pogut desar el vehicle.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingHouses) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 text-sm text-slate-500">
        Carregant vivendes…
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
      {/* Barra superior */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Enrere
        </button>
        <h1 className="text-sm font-semibold text-slate-900">
          Nou vehicle
        </h1>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        {/* Vivenda */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Vivenda
          </p>
          <select
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          >
            <option value="">Selecciona una vivenda</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.id})
              </option>
            ))}
          </select>
        </section>

        {/* Foto */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Foto del vehicle
          </p>
          <ImageUploadField
            label="Puja una foto del vehicle"
            value={photoUrl}
            onChange={setPhotoUrl}
          />
        </section>

        {/* Dades bàsiques */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Dades bàsiques
          </p>

          {/* Cotxe / moto */}
          <div className="flex gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setVehicleType("cotxe")}
              className={[
                "flex-1 px-3 py-2 rounded-xl border font-medium",
                vehicleType === "cotxe"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200",
              ].join(" ")}
            >
              Cotxe
            </button>
            <button
              type="button"
              onClick={() => setVehicleType("moto")}
              className={[
                "flex-1 px-3 py-2 rounded-xl border font-medium",
                vehicleType === "moto"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200",
              ].join(" ")}
            >
              Moto
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nom intern del vehicle
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="P. ex. Cotxe Aiguaviva"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Marca
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="P. ex. Toyota"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Model
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Corolla, CBR…"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Matrícula
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-mono"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="0000 ABC"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Any
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="P. ex. 2018"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Compra i ITV */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Compra i ITV
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Any de compra
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={purchaseYear}
                onChange={(e) => setPurchaseYear(e.target.value)}
                placeholder="P. ex. 2021"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Preu de compra (€)
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Data ITV
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={itvDate}
                onChange={(e) => setItvDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Notes ITV
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 resize-none min-h-[70px]"
              value={itvNotes}
              onChange={(e) => setItvNotes(e.target.value)}
              placeholder="Quan toca la propera, observacions de la darrera revisió…"
            />
          </div>
        </section>

        {/* Altres notes */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Altres notes
          </p>
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 resize-none min-h-[80px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Assegurança, pneumàtics, coses a recordar…"
          />
        </section>

        {/* Botons */}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-slate-900 text-white text-sm font-semibold py-2.5 disabled:opacity-60"
        >
          {saving ? "Guardant…" : "Desar vehicle"}
        </button>
      </form>
    </div>
  );
}
