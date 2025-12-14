// src/pages/ContactsPage.tsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getHousePillClasses } from "../utils/houseColors";

type Contact = {
  id: string;
  name: string;
  role: string;
  phone: string;
  emergencyPhone?: string;
  email?: string;
  notes?: string;
  houseIds?: string[];
};

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchContacts() {
      try {
        const snap = await getDocs(collection(db, "contacts"));
        const data: Contact[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Contact, "id">),
        }));

        // Ordenem per nom per tenir-ho polit
        data.sort((a, b) => a.name.localeCompare(b.name));

        setContacts(data);
      } catch (err) {
        console.error(err);
        setError("Error carregant contactes.");
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      (c.phone ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.notes ?? "").toLowerCase().includes(q) ||
      (c.houseIds ?? []).some((id) => id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-4">
      {/* Header minimalista */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-slate-900">
            Contactes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Electricistes, fontaners i altres contactes de confiança.
          </p>
        </div>
        <button
          onClick={() => navigate("/contactes/nou")}
          className="shrink-0 rounded-full bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 hover:bg-slate-800"
        >
          Nou
        </button>
      </div>

      {/* Cercador */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cerca per nom, rol, telèfon…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 pl-8 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
        />
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
          🔍
        </span>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">
          Carregant contactes…
        </div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl px-4 py-6 text-center text-sm text-slate-500">
          Encara no hi ha contactes (o cap coincideix amb el filtre).
        </div>
      ) : (
        <div className="space-y-2 pb-4">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/contactes/${c.id}`)}
              className="w-full text-left active:scale-[0.99] transition"
            >
              <div className="bg-white rounded-2xl shadow-sm px-3 py-3 flex flex-col gap-2 border border-slate-100 hover:bg-slate-50">
                {/* Capçalera del contacte */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {c.role}
                    </div>
                  </div>
                  <span className="text-xs text-slate-300">›</span>
                </div>

                {/* Accions ràpides: telèfon i email */}
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center text-[11px] px-2 py-1 rounded-full bg-slate-900 text-white border border-slate-900"
                    >
                      📞 {c.phone}
                    </a>
                  )}
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center text-[11px] px-2 py-1 rounded-full bg-white text-slate-700 border border-slate-200"
                    >
                      ✉️ Email
                    </a>
                  )}
                  {c.emergencyPhone && (
                    <a
                      href={`tel:${c.emergencyPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center text-[11px] px-2 py-1 rounded-full bg-white text-rose-700 border border-rose-200"
                    >
                      🚨 {c.emergencyPhone}
                    </a>
                  )}
                </div>

                {/* Notes */}
                {c.notes && (
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {c.notes}
                  </div>
                )}

                {/* Vivendes vinculades */}
                {c.houseIds && c.houseIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {c.houseIds.map((hid) => (
                      <span
                        key={hid}
                        className={
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] " +
                          getHousePillClasses(hid)
                        }
                      >
                        {hid}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
