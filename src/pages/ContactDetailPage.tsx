// src/pages/ContactDetailPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

type Contact = {
  id: string;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  company?: string;
  address?: string;
  notes?: string;
  houseId?: string;
  houseName?: string;
};

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  );
}

export function ContactDetailPage() {
  const { contactId } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load(id: string) {
      try {
        const ref = doc(db, "contacts", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("No s’ha trobat aquest contacte.");
          return;
        }
        const data = snap.data() as any;
        setContact({
          id: snap.id,
          name: data.name ?? "",
          role: data.role ?? data.type ?? "",
          phone: data.phone ?? data.phoneNumber ?? "",
          email: data.email ?? "",
          company: data.company ?? "",
          address: data.address ?? "",
          notes: data.notes ?? "",
          houseId: data.houseId,
          houseName: data.houseName,
        });
      } catch (err) {
        console.error(err);
        setError("Error carregant el contacte.");
      } finally {
        setLoading(false);
      }
    }

    if (!contactId) {
      setError("Falta l’identificador del contacte.");
      setLoading(false);
      return;
    }

    load(contactId);
  }, [contactId]);

  async function handleDelete() {
    if (!contactId || !contact) return;
    const ok = window.confirm("Segur que vols eliminar aquest contacte?");
    if (!ok) return;

    setDeleting(true);
    setError(null);

    try {
      const ref = doc(db, "contacts", contactId);
      await deleteDoc(ref);
      navigate("/contactes");
    } catch (err) {
      console.error(err);
      setError("Error eliminant el contacte.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto px-4 pt-6 pb-24 text-sm text-slate-500">
          Carregant contacte…
        </div>
      </div>
    );
  }

  if (error || !contact) {
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
            {error ?? "No s’ha pogut carregar el contacte."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* HEADER sticky */}
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
              Contacte
            </p>
            <h1 className="text-sm font-semibold text-slate-900 truncate">
              {contact.name}
            </h1>
            {contact.role && (
              <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                {contact.role}
              </p>
            )}
          </div>

          <div className="w-8" />
        </div>
      </header>

      {/* CONTINGUT */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Targeta principal */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
              {getInitials(contact.name)}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                {contact.name}
              </p>
              {contact.role && (
                <p className="text-xs text-slate-500">{contact.role}</p>
              )}

              {(contact.company || contact.houseName) && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {contact.company && (
                    <span className="inline-flex items-center text-[10px] text-slate-600 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">
                      🏢 {contact.company}
                    </span>
                  )}
                  {contact.houseName && (
                    <Link
                      to={`/vivendes/${contact.houseId}`}
                      className="inline-flex items-center text-[10px] text-slate-600 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100"
                    >
                      🏠 {contact.houseName}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Dades de contacte */}
        {(contact.phone || contact.email || contact.address) && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dades de contacte
            </p>
            <div className="space-y-1.5 text-sm text-slate-800">
              {contact.phone && (
                <p>
                  📞{" "}
                  <a
                    href={`tel:${contact.phone}`}
                    className="underline decoration-slate-300"
                  >
                    {contact.phone}
                  </a>
                </p>
              )}
              {contact.email && (
                <p>
                  ✉️{" "}
                  <a
                    href={`mailto:${contact.email}`}
                    className="underline decoration-slate-300"
                  >
                    {contact.email}
                  </a>
                </p>
              )}
              {contact.address && (
                <p>
                  📍 <span>{contact.address}</span>
                </p>
              )}
            </div>
          </section>
        )}

        {/* Notes */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </p>
          <p className="text-sm text-slate-800 whitespace-pre-line">
            {contact.notes || "Sense notes addicionals."}
          </p>
        </section>

        {/* Accions */}
        <section className="space-y-2">
          <button
            type="button"
            onClick={() => navigate(`/contactes/${contact.id}/editar`)}
            className="w-full rounded-full bg-slate-900 text-white text-sm font-semibold py-2.5 hover:bg-slate-800"
          >
            Editar contacte
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full rounded-full border border-red-200 bg-red-50 text-sm font-semibold py-2.5 text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            {deleting ? "Eliminant…" : "Eliminar contacte"}
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
