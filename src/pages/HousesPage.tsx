// src/pages/HousesPage.tsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { runSeed } from "../seed";

type House = {
  id: string;
  name: string;
  address: string;
  coverImageUrl?: string;
  notes?: string;
};

export function HousesPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    async function fetchHouses() {
      try {
        const snap = await getDocs(collection(db, "houses"));
        const data: House[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<House, "id">),
        }));
        setHouses(data);
      } catch (err: any) {
        console.error("Error carregant vivendes:", err);
        setError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchHouses();
  }, []);

  const filtered = houses.filter((h) => {
    const term = search.toLowerCase();
    return (
      h.name?.toLowerCase().includes(term) ||
      h.address?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 pt-6 space-y-4">
      {/* Capçalera */}
      <div className="flex items-center justify-between">
        <button className="p-2">
          <span className="block w-5 h-0.5 bg-gray-700 mb-1 rounded"></span>
          <span className="block w-5 h-0.5 bg-gray-700 mb-1 rounded"></span>
          <span className="block w-5 h-0.5 bg-gray-700 rounded"></span>
        </button>
        <h1 className="text-2xl font-bold">Vivendes</h1>
        <button className="px-3 py-1.5 rounded-full bg-gray-800 text-white text-sm font-medium">
          + Add
        </button>
      </div>

      {/* Botó de SEED (només per desenvolupament) */}
      <div className="mt-1">
        <button
          onClick={async () => {
            if (seeding) return;
            setSeeding(true);
            try {
              await runSeed();
              alert("Dades de prova carregades a Firestore! ✅");
            } catch (err) {
              console.error("Error fent seed:", err);
              alert("Error fent seed, mira la consola.");
            } finally {
              setSeeding(false);
            }
          }}
          className="text-[11px] px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300"
          disabled={seeding}
        >
          {seeding ? "Carregant dades..." : "DEBUG: Seed Firestore"}
        </button>
      </div>

      {/* Cercador */}
      <div className="mt-2">
        <input
          type="text"
          placeholder="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-200 rounded-xl px-4 py-2 text-sm outline-none"
        />
      </div>

      {/* Info d'error si n'hi ha */}
      {error && (
        <div className="text-xs text-red-600">
          Error carregant vivendes: {error}
        </div>
      )}

      {/* Llista de vivendes */}
      {loading ? (
        <div className="text-sm text-gray-500">Carregant vivendes…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-500">
          No s&apos;ha trobat cap vivenda.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((house) => (
            <div
              key={house.id}
              className="bg-white rounded-2xl shadow-sm p-3 text-left"
            >
              <div className="text-xs font-bold tracking-wide text-gray-700">
                {house.name?.toUpperCase()}
              </div>
              <div className="text-xs text-gray-500 leading-snug">
                {house.address}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
