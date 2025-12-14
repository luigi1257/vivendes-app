// src/pages/EditContactPage.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

type House = {
  id: string;
  name: string;
};

type ContactDoc = {
  name: string;
  role: string;
  phone: string;
  emergencyPhone?: string;
  email?: string;
  notes?: string;
  houseIds?: string[];
};

export function EditContactPage() {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();

  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [houseIds, setHouseIds] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!contactId) return;

      try {
        const [housesSnap, contactSnap] = await Promise.all([
          getDocs(collection(db, "houses")),
          getDoc(doc(db, "contacts", contactId)),
        ]);

        if (!contactSnap.exists()) {
          setError("No s'ha trobat aquest contacte.");
          setLoading(false);
          return;
        }

        const housesData: House[] = housesSnap.docs.map((d) => {
          const h = d.data() as any;
          return { id: d.id, name: h.name ?? d.id };
        });

        setHouses(housesData);

        const data = contactSnap.data() as any as ContactDoc;

        setName(data.name ?? "");
        setRole(data.role ?? "");
        setPhone(data.phone ?? "");
        setEmergencyPhone(data.emergencyPhone ?? "");
        setEmail(data.email ?? "");
        setNotes(data.notes ?? "");
        setHouseIds(data.houseIds ?? []);

        setLoading(false);
      } catch (err) {
        console.error("Error carregant contacte:", err);
        setError("No s'han pogut carregar les dades del contacte.");
        setLoading(false);
      }
    }

    loadData();
  }, [contactId]);

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

    if (!contactId) return;

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
      await updateDoc(doc(db, "contacts", contactId), {
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim(),
        emergencyPhone: emergencyPhone.trim(),
        email: email.trim(),
        notes: notes.trim(),
        houseIds,
      });

      navigate(`/contactes/${contactId}`, { replace: true });
    } catch (err) {
      console.error("Error actualitzant contacte:", err);
      setError("Hi ha hagut un error guardant els canvis.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 pt-6">
        <p className="text-sm text-slate-500">Carregant dades…</p>
      </div>
    );
  }

  if (error && !contactId) {
    return (
      <div className="p-4 pt-6">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
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
            Editar contacte
          </h1>
        </div>
        <div className="w-8" />
      </div>

      {/* Targeta intro */}
      <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-100">
              Edició
            </div>
            <div className="text-lg font-semibold mt-1">
              Actualitzar contacte
            </div>
          </div>
          <span className="text-2xl">📇</span>
        </div>
        <p className="text-[11px] text-emerald-100 mt-2">
          Modifica les dades del contacte i les vivendes associades.
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
            className="w-full text-sm bg-slate-50 rounded-xl px-3 py-2 outline-none border border-slate-200"
          />
        </div>

        {/* Vivendes associades */}
        <div className="bg-white rounded-2xl shadow-sm p-3 border border-slate-100">
          <label className="text-[11px] text-slate-500 block mb-1">
            Vivendes associades
          </label>
          {houses.length === 0 ? (
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
            {saving ? "Guardant..." : "Desar canvis"}
          </button>
        </div>
      </form>
    </div>
  );
}
