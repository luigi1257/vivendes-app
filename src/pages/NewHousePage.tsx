// src/pages/NewHousePage.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { ImageUploadField } from "../components/ImageUploadField";

export function NewHousePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;

    if (!name.trim()) {
      setError("Cal indicar un nom per la vivenda.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const docRef = await addDoc(collection(db, "houses"), {
        name: name.trim(),
        address: address.trim(),
        mapsUrl: mapsUrl.trim(),
        coverImageUrl: coverImageUrl.trim(),
        notes: notes.trim(),
      });

      navigate(`/vivendes/${docRef.id}`);
    } catch (err) {
      console.error(err);
      setError("Error desant la vivenda. Torna-ho a provar.");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Enrere
        </button>
        <h1 className="text-base font-semibold text-slate-900">
          Nova vivenda
        </h1>
        <div className="w-12" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Nom de la vivenda
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Bernat Boades 2"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
          />
        </div>

        {/* Adreça */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Adreça
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Carrer, número, ciutat…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
          />
        </div>

        {/* Enllaç Google Maps */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Enllaç Google Maps
          </label>
          <input
            type="url"
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="Enganxa aquí l’enllaç de Google Maps"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
          />
        </div>

        {/* Foto de la vivenda (drag & drop) */}
        <ImageUploadField
          label="Foto de la vivenda"
          value={coverImageUrl}
          onChange={(url) => setCoverImageUrl(url)}
        />

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Notes internes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Comentaris, detalls, coses a recordar..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-slate-900 text-white text-sm font-semibold py-2.5 hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Desant…" : "Desar vivenda"}
        </button>
      </form>
    </div>
  );
}
