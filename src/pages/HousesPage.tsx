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
  const [seeding, setSeeding] = useState(false);

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

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* TEXT GEGANT DE DEBUG */}
      <h1 className="text-3xl font-extrabold text-red-600">
        PÀGINA DE DEBUG VIVENDES
      </h1>

      {/* Botó de SEED ben visible */}
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
        className="w-full py-3 rounded-full bg-yellow-300 text-yellow-900 font-bold text-sm border border-yellow-500"
        disabled={seeding}
      >
        {seeding ? "CARREGANT DADES..." : "DEBUG: SEED FIRESTORE"}
      </button>

      {/* Llista de vivendes llegides */}
      <div className="space-y-2">
        {houses.map((h) => (
          <div
            key={h.id}
            className="bg-white rounded-xl shadow-sm p-3 border border-gray-200"
          >
            <div className="text-sm font-bold">{h.name}</div>
            <div className="text-xs text-gray-600">{h.address}</div>
          </div>
        ))}
        {houses.length === 0 && (
          <div className="text-sm text-gray-500">
            Encara no hi ha vivendes a Firestore.
          </div>
        )}
      </div>
    </div>
  );
}
