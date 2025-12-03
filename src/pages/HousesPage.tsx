// src/pages/HousesPage.tsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

type House = {
  id: string;
  name: string;
  address: string;
  coverImageUrl?: string;
};

export function HousesPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchHouses() {
      const snap = await getDocs(collection(db, "houses"));
      const data: House[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<House, "id">),
      }));
      setHouses(data);
    }
    fetchHouses();
  }, []);

  const filtered = houses.filter((h) => {
    const term = search.toLowerCase();
    return (
      h.name.toLowerCase().includes(term) ||
      h.address.toLowerCase().includes(term)
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

      {/* Cercador */}
      <div>
        <input
          type="text"
          placeholder="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-200 rounded-xl px-4 py-2 text-sm outline-none"
        />
      </div>

      {/* Grid de vivendes */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((house) => (
          <div
            key={house.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            {house.coverImageUrl && (
              <div className="relative">
                <img
                  src={house.coverImageUrl}
                  alt={house.name}
                  className="w-full h-28 object-cover"
                />
                <div className="absolute top-1.5 right-1.5 bg-black/40 rounded-full px-2 py-0.5 text-white text-xs">
                  ⋯
                </div>
              </div>
            )}
            <div className="p-2">
              <div className="text-xs font-bold tracking-wide">
                {house.name.toUpperCase()}
              </div>
              <div className="text-xs text-gray-600 leading-snug">
                {house.address}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center text-gray-500 text-sm">
            No s&apos;ha trobat cap vivenda.
          </div>
        )}
      </div>
    </div>
  );
}
