// src/seed.ts
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  seedHouses,
  seedSystems,
  seedContacts,
  seedIncidents,
} from "./data/seedData";

export async function runSeed() {
  // Això es pot cridar des d'una pàgina per omplir Firestore
  // Utilitza les dades definides a src/data/seedData.ts

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
}
