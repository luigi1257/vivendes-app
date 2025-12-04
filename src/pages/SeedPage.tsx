// src/pages/SeedPage.tsx
import { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  seedHouses,
  seedSystems,
  seedContacts,
  seedIncidents,
} from "../data/seedData";

export function SeedPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function handleSeed() {
    if (running) return;
    setRunning(true);
    setStatus("Omplint Firestore amb dades de prova...");

    try {
      // Houses
      for (const house of seedHouses) {
        await setDoc(doc(db, "houses", house.id), {
          name: house.name,
          address: house.address,
          coverImageUrl: house.coverImageUrl ?? "",
          notes: house.notes ?? "",
        });
      }

      // Systems
      for (const system of seedSystems) {
        await setDoc(doc(db, "systems", system.id), {
          code: system.code,
          houseId: system.houseId,
          houseName: system.houseName,
          type: system.type,
          name: system.name,
          description: system.description ?? "",
          location: system.location ?? "",
          instructions: system.instructions ?? "",
          contactName: system.contactName ?? "",
          contactPhone: system.contactPhone ?? "",
        });
      }

      // Contacts
      for (const contact of seedContacts) {
        await setDoc(doc(db, "contacts", contact.id), {
          name: contact.name,
          role: contact.role,
          phone: contact.phone,
          emergencyPhone: contact.emergencyPhone ?? "",
          email: contact.email ?? "",
          notes: contact.notes ?? "",
          houseIds: contact.houseIds,
        });
      }

      // Incidents
      for (const incident of seedIncidents) {
        await setDoc(doc(db, "incidents", incident.id), {
          houseId: incident.houseId,
          houseName: incident.houseName,
          systemId: incident.systemId,
          systemCode: incident.systemCode,
          title: incident.title,
          description: incident.description,
          actionTaken: incident.actionTaken,
          contactName: incident.contactName,
          date: incident.date,
        });
      }

      setStatus(
        "Dades carregades correctament! 👍\nAra ja pots tancar aquesta pàgina o eliminar la ruta /seed."
      );
    } catch (error: any) {
      console.error("Error fent seed:", error);
      setStatus("Error fent seed: " + (error?.message ?? String(error)));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="p-4 pt-6 space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Seed Firestore</h1>

      <p className="text-sm text-gray-600">
        Aquesta pàgina omple la base de dades de Firestore amb dades d&apos;exemple
        per a vivendes, sistemes, contactes i incidències.
      </p>

      <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-3 text-xs text-yellow-900">
        <p className="font-semibold">⚠️ Ús recomanat:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Només per a desenvolupament.</li>
          <li>
            Assegura&apos;t que les regles de Firestore permeten{" "}
            <code className="mx-1">write</code>.
          </li>
          <li>
            Un cop carregades les dades, pots eliminar aquesta ruta si vols.
          </li>
        </ul>
      </div>

      <button
        onClick={handleSeed}
        disabled={running}
        className="w-full py-2 rounded-full bg-gray-900 text-white text-sm font-semibold disabled:opacity-50"
      >
        {running
          ? "Carregant dades..."
          : "Omplir Firestore amb dades de prova"}
      </button>

      {status && (
        <div className="text-sm text-gray-700 whitespace-pre-line mt-2">
          {status}
        </div>
      )}
    </div>
  );
}

