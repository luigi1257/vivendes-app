// src/pages/NewContactPage.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";

type House = {
  id: string;
  name: string;
};

export function NewContactPage() {
  const navigate = useNavigate();

  const [houses, setHouses] = useState<House[]>([]);
  const [loadingHouses, setLoadingHouses] = useState(true);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [houseIds, setHouseIds] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar vivendes per poder assignar-les al contacte
  useEffect(() => {
    async function loadHouses() {
      try {
        const snap = await getDocs(collection(db, "houses"));
        const data: House[] = snap.docs.map((d) => {
          const h = d.data() as any;
          return {
            id: d.id,
            name: h.name ?? d.id,
          };
        });
        setHouses(data);
      } catch (err) {
        console.error("Error carregant vivendes:", err);
        setError("No s'han pogut carregar les vivendes.");
      } finally {
        setLoadingHouses(false);
      }
    }

    loadHouses();
  }, []);

  function toggleHouse(houseId: string) {
    setHouseIds((prev) =>
      prev.includes(houseId)
        ? prev.filter((id) => id !== houseId)
        : [...prev, houseId]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Has d'indicar un nom per al contacte.");
      return;
    }
    if (!phone.trim()) {
      setError("Has d'indicar un telèfon principal.");
      return;
    }

    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "contacts"), {
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim(),
        emergencyPhone: emergencyPhone.trim(),
        email: email.trim(),
        notes: notes.trim(),
        houseIds,
      });

      // Anem al detall del contacte que acabem de crear
      navigate(`/contactes/${docRef.id}`, { replace: true });
    } catch (err) {
      console.error("Error guardant contacte:", err);
      setError("Hi ha hagut un error guardant el contacte.");
      setSaving(false);
    }
  }

  return (
    <div className="p-4 pt-6 space-y-4 pb-20">
      {/* Barra superior */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-slate-200"
          type="button"
        >
          <span className="text-lg">←</span>
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-sm font-semibold text-slate-700">
            Nou contacte
          </h1>
        </div>
        <div className="w-8" />
      </div>

      {/* Targeta intro */}
      <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-100">
              Xarxa de suport
            </div>
            <div className="text-lg font-semibold mt-1">
              Crear nou contacte
            </div>
          </div>
          <span className="text-2xl">📇</span>
        </div>
        <p className="text-[11px] text-emerald-100 mt-2">
          Afegeix un tècnic o persona de contacte, amb les vivendes on hi
          treballa habitualment.
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {/* Nom */}
        <div className="bg-white rounded-2xl shadow-sm p-3 border border-slate-100">
          <label className="text-[11px] text-slate-500 block mb-1">
            Nom complet *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="P. ex. Joan Electricista"
            className="w-full text-sm bg-slate-50 rounded-xl px-3 py-2 outline-none border border-slate-200"
          />
        </div>

        {/* Rol */}
        <div className="bg-white rounded-2xl shadow-sm p-3 border border-slate-100">
          <label className="text-[11px] text-slate-500 block mb-1">
            Rol / especialitat
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Electricista, lampista, calefacció..."
            className="w-full text-sm bg-slate-50 rounded-xl px-3 py-2 outline-none border border-slate-200"
          />
        </div>

        {/* Telèfon principal */}
        <div className="bg-white rounded-2xl shadow-sm p-3 border border-slate-100">
          <label className="text-[11px] text-slate-500 block mb-1">
            Telèfon principal *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telèfon principal"
            className="w-full text-sm bg-slate-50 rounded-xl px-3 py-2 outline-none border border-slate-200"
          />
        </div>

        {/* Telèfon emergència */}
        <div className="bg-white rounded-2xl shadow-sm p-3 border border-slate-100">
          <label className="text-[11px] text-slate-500 block mb-1">
            Telèfon d&apos;emergència
          </label>
          <input
            type="tel"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            placeholder="Telèfon alternatiu o urgències"
            className="w-full text-sm bg-slate-50 rounded-xl px-3 py-2 outline-none border border-slate-200"
          />
        </div>

        {/* Email */}
        <div className="bg-white rounded-2xl shadow-sm p-3 border border-slate-100">
          <label className="text-[11px] text-slate-500 block mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correu@exemple.com"
            className="w-full text-sm bg-slate-50 rounded-xl px-3 py-2 outline-none border border-slate-200"
          />
        </div>

        {/* Vivendes associades */}
        <div className="bg-white rounded-2xl shadow-sm p-3 border border-slate-100">
          <label className="text-[11px] text-slate-500 block mb-1">
            Vivendes associades
          </label>
          {loadingHouses ? (
            <div className="text-[11px] text-slate-500">
              Carregant vivendes…
            </div>
          ) : houses.length === 0 ? (
            <div className="text-[11px] text-slate-500">
              Encara no hi ha vivendes.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mt-1">
              {houses.map((h) => {
                const selected = houseIds.includes(h.id);
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => toggleHouse(h.id)}
                    className={
                      "px-2 py-1 rounded-full text-[11px] border " +
                      (selected
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : "bg-slate-50 text-slate-600 border-slate-200")
                    }
                  >
                    {h.name} ({h.id})
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-1 text-[10px] text-slate-400">
            Pots marcar una o diverses vivendes on aquest contacte hi treballa
            habitualment.
          </p>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl shadow-sm p-3 border border-slate-100">
          <label className="text-[11px] text-slate-500 block mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Preferències, horaris, tarifes, observacions..."
            className="w-full text-sm bg-slate-50 rounded-xl px-3 py-2 outline-none border border-slate-200 resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {/* Botons */}
        <div className="flex gap-2 pt-1 pb-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 border border-slate-300 rounded-2xl py-2 text-sm font-semibold text-slate-700 bg-white"
          >
            Cancel·lar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-2xl py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60"
          >
            {saving ? "Guardant..." : "Guardar contacte"}
          </button>
        </div>
      </form>
    </div>
  );
}
