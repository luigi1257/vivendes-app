// src/pages/EditIncidentPage.tsx
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

type IncidentStatus = "oberta" | "pendent" | "resolta";

type SimpleHouse = {
  id: string;
  name: string;
};

type SimpleSystem = {
  id: string;
  houseId: string;
  code: string;
  name: string;
};

export function EditIncidentPage() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();

  const [houses, setHouses] = useState<SimpleHouse[]>([]);
  const [systems, setSystems] = useState<SimpleSystem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingIncident, setLoadingIncident] = useState(true);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [contactName, setContactName] = useState("");
  const [status, setStatus] = useState<IncidentStatus>("oberta");
  const [houseId, setHouseId] = useState("");
  const [systemId, setSystemId] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar vivendes i sistemes
  useEffect(() => {
    async function loadOptions() {
      try {
        const snapH = await getDocs(collection(db, "houses"));
        const houseList: SimpleHouse[] = snapH.docs.map((d) => {
          const h = d.data() as any;
          return {
            id: d.id,
            name: h.name ?? d.id,
          };
        });

        const snapS = await getDocs(collection(db, "systems"));
        const systemList: SimpleSystem[] = snapS.docs.map((d) => {
          const s = d.data() as any;
          return {
            id: d.id,
            houseId: s.houseId ?? "",
            code: s.code ?? d.id,
            name: s.name ?? "",
          };
        });

        houseList.sort((a, b) => a.name.localeCompare(b.name));
        systemList.sort((a, b) => a.code.localeCompare(b.code));

        setHouses(houseList);
        setSystems(systemList);
      } catch (err) {
        console.error("Error carregant opcions:", err);
        setError("No s'han pogut carregar les vivendes i sistemes.");
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  // Carregar incidència
  useEffect(() => {
    async function loadIncident() {
      if (!incidentId) {
        setError("Falta l'ID de la incidència.");
        setLoadingIncident(false);
        return;
      }

      try {
        const ref = doc(db, "incidents", incidentId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("No s'ha trobat aquesta incidència.");
          setLoadingIncident(false);
          return;
        }

        const inc = snap.data() as any;

        let dateStr = "";
        const rawDate = inc.date;
        if (rawDate) {
          if (typeof rawDate === "string") {
            dateStr = rawDate;
          } else if (rawDate.toDate) {
            dateStr = rawDate.toDate().toISOString().slice(0, 10);
          }
        }

        const statusRaw = (inc.status as string | undefined)?.toLowerCase();
        let statusValue: IncidentStatus = "oberta";
        if (statusRaw === "resolta") statusValue = "resolta";
        else if (statusRaw === "pendent") statusValue = "pendent";

        setTitle(inc.title ?? "");
        setDescription(inc.description ?? "");
        setActionTaken(inc.actionTaken ?? "");
        setDate(dateStr);
        setContactName(inc.contactName ?? "");
        setStatus(statusValue);
        setHouseId(inc.houseId ?? "");
        setSystemId(inc.systemId ?? "");
      } catch (err) {
        console.error("Error carregant incidència:", err);
        setError("No s'han pogut carregar les dades de la incidència.");
      } finally {
        setLoadingIncident(false);
      }
    }

    loadIncident();
  }, [incidentId]);

  const filteredSystems = useMemo(
    () => systems.filter((s) => !houseId || s.houseId === houseId),
    [systems, houseId]
  );

  function getHouseNameById(id: string): string {
    const h = houses.find((x) => x.id === id);
    return h?.name ?? id ?? "";
  }

  function getSystemCodeById(id: string): string {
    const s = systems.find((x) => x.id === id);
    return s?.code ?? id ?? "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!incidentId) {
      setError("Falta l'ID de la incidència.");
      return;
    }

    if (!title.trim()) {
      setError("El títol és obligatori.");
      return;
    }
    if (!houseId) {
      setError("Has de seleccionar una vivenda.");
      return;
    }

    try {
      setSaving(true);

      const houseName = getHouseNameById(houseId);
      const systemCode = systemId ? getSystemCodeById(systemId) : "";

      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        actionTaken: actionTaken.trim(),
        contactName: contactName.trim(),
        date: date || "",
        houseId,
        houseName,
        systemId: systemId || "",
        systemCode,
        status, // 👈 estat actualitzat
      };

      await updateDoc(doc(db, "incidents", incidentId), payload);

      navigate("/incidencies");
    } catch (err) {
      console.error("Error actualitzant incidència:", err);
      setError("No s'ha pogut desar la incidència.");
    } finally {
      setSaving(false);
    }
  }

  const isLoading = loadingOptions || loadingIncident;

  if (isLoading) {
    return (
      <div className="p-4 pt-6">
        <p className="text-sm text-slate-500">Carregant dades…</p>
      </div>
    );
  }

  return (
    <div className="p-4 pt-6 pb-24">
      {/* Barra superior */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-slate-200"
        >
          <span className="text-lg">←</span>
        </button>
        <h1 className="text-sm font-semibold text-slate-800">
          Editar incidència
        </h1>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {/* Vivenda */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Vivenda
          </label>
          <select
            value={houseId}
            onChange={(e) => {
              setHouseId(e.target.value);
              setSystemId("");
            }}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white"
          >
            <option value="">Selecciona una vivenda</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.id})
              </option>
            ))}
          </select>
        </div>

        {/* Sistema */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Sistema (opcional)
          </label>
          <select
            value={systemId}
            onChange={(e) => setSystemId(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white"
            disabled={!houseId}
          >
            <option value="">
              {houseId
                ? "Selecciona un sistema"
                : "Primer selecciona la vivenda"}
            </option>
            {filteredSystems.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Estat */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Estat
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as IncidentStatus)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white"
          >
            <option value="oberta">Oberta</option>
            <option value="pendent">Pendent</option>
            <option value="resolta">Resolta</option>
          </select>
        </div>

        {/* Títol */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Títol
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="P. ex. Fuita d'aigua lavabo planta baixa"
          />
        </div>

        {/* Data */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        {/* Contacte */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Contacte implicat (opcional)
          </label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Nom de la persona o empresa"
          />
        </div>

        {/* Descripció */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Descripció
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[80px]"
            placeholder="Explica què ha passat..."
          />
        </div>

        {/* Accions realitzades */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Accions realitzades (opcional)
          </label>
          <textarea
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[80px]"
            placeholder="Què s'ha fet per solucionar-ho..."
          />
        </div>

        {/* Botons */}
        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 rounded-full border border-slate-300 text-sm font-semibold py-2 text-slate-700"
          >
            Cancel·lar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-full bg-slate-900 text-white text-sm font-semibold py-2 disabled:opacity-50"
          >
            {saving ? "Guardant…" : "Desar canvis"}
          </button>
        </div>
      </form>
    </div>
  );
}
