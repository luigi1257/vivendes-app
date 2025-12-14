// src/pages/NewSystemPage.tsx
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { ImageUploadField } from "../components/ImageUploadField";

type SystemType =
  | "Sistema elèctric"
  | "Aigua i bomba"
  | "Calefacció / climatització"
  | "Clavegueram i drenatges"
  | "Comunicacions (Internet, telèfon, TV)"
  | "Alarma";

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

function getTypeCode(t: SystemType): string {
  switch (t) {
    case "Sistema elèctric":
      return "EL";
    case "Aigua i bomba":
      return "AG";
    case "Calefacció / climatització":
      return "CA";
    case "Clavegueram i drenatges":
      return "CLV";
    case "Comunicacions (Internet, telèfon, TV)":
      return "COM";
    case "Alarma":
      return "ALM";
    default:
      return "SYS";
  }
}

function generateSystemCode(
  houseId: string,
  type: SystemType,
  index: number
): string {
  const short = getTypeCode(type);
  const num = String(index).padStart(2, "0");
  return `${houseId}-${short}-${num}`;
}

export function NewSystemPage() {
  const navigate = useNavigate();

  const [houses, setHouses] = useState<SimpleHouse[]>([]);
  const [systems, setSystems] = useState<SimpleSystem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [houseId, setHouseId] = useState("");
  const [systemType, setSystemType] = useState<SystemType | "">("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [generalInstructions, setGeneralInstructions] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Sistema elèctric
  const [electricalPanelLocation, setElectricalPanelLocation] = useState("");
  const [electricalPanelPhotoUrl, setElectricalPanelPhotoUrl] = useState("");
  const [electricalCircuitsDiagram, setElectricalCircuitsDiagram] =
    useState("");
  const [electricalContractedPower, setElectricalContractedPower] =
    useState("");
  const [electricalCompany, setElectricalCompany] = useState("");
  const [electricalBasicInstructions, setElectricalBasicInstructions] =
    useState("");
  const [electricalContact, setElectricalContact] = useState("");

  // Aigua i bomba
  const [waterPumpLocation, setWaterPumpLocation] = useState("");
  const [waterDiagram, setWaterDiagram] = useState("");
  const [waterRestartInstructions, setWaterRestartInstructions] =
    useState("");
  const [waterMaintenance, setWaterMaintenance] = useState("");
  const [waterContact, setWaterContact] = useState("");

  // Calefacció / climatització
  const [heatingType, setHeatingType] = useState("");
  const [heatingLocation, setHeatingLocation] = useState("");
  const [heatingInstructions, setHeatingInstructions] = useState("");
  const [heatingMaintenance, setHeatingMaintenance] = useState("");
  const [heatingContact, setHeatingContact] = useState("");

  // Clavegueram i drenatges
  const [drainageLocations, setDrainageLocations] = useState("");
  const [drainageRules, setDrainageRules] = useState("");
  const [drainageEmergency, setDrainageEmergency] = useState("");
  const [drainageContact, setDrainageContact] = useState("");

  // Comunicacions
  const [commOperator, setCommOperator] = useState("");
  const [commPlan, setCommPlan] = useState("");
  const [commRouterLocation, setCommRouterLocation] = useState("");
  const [commWifiSsid, setCommWifiSsid] = useState("");
  const [commWifiPassword, setCommWifiPassword] = useState("");
  const [commRestartInstructions, setCommRestartInstructions] =
    useState("");
  const [commContact, setCommContact] = useState("");

  // Alarma
  const [alarmType, setAlarmType] = useState("");
  const [alarmPanelLocation, setAlarmPanelLocation] = useState("");
  const [alarmZones, setAlarmZones] = useState("");
  const [alarmInstructions, setAlarmInstructions] = useState("");
  const [alarmContact, setAlarmContact] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar vivendes i sistemes existents (per comptar i generar codi)
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

  const systemsInHouse = useMemo(
    () => systems.filter((s) => s.houseId === houseId),
    [systems, houseId]
  );

  function getHouseNameById(id: string): string {
    const h = houses.find((x) => x.id === id);
    return h?.name ?? id ?? "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!houseId) {
      setError("Has de seleccionar una vivenda.");
      return;
    }

    if (!systemType) {
      setError("Has de seleccionar el tipus de sistema.");
      return;
    }

    if (!name.trim()) {
      setError("El nom del sistema és obligatori.");
      return;
    }

    try {
      setSaving(true);

      const houseName = getHouseNameById(houseId);

      // Comptem quants sistemes hi ha ja a la vivenda per generar codi
      const q = query(
        collection(db, "systems"),
        where("houseId", "==", houseId)
      );
      const snap = await getDocs(q);
      const index = snap.size + 1;

      const code = generateSystemCode(houseId, systemType, index);

      const payload: any = {
        code,
        houseId,
        houseName,
        type: systemType,
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        instructions: generalInstructions.trim(),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),

        electricalPanelLocation: electricalPanelLocation.trim(),
        electricalPanelPhotoUrl: electricalPanelPhotoUrl.trim(),
        electricalCircuitsDiagram: electricalCircuitsDiagram.trim(),
        electricalContractedPower: electricalContractedPower.trim(),
        electricalCompany: electricalCompany.trim(),
        electricalBasicInstructions: electricalBasicInstructions.trim(),
        electricalContact: electricalContact.trim(),

        waterPumpLocation: waterPumpLocation.trim(),
        waterDiagram: waterDiagram.trim(),
        waterRestartInstructions: waterRestartInstructions.trim(),
        waterMaintenance: waterMaintenance.trim(),
        waterContact: waterContact.trim(),

        heatingType: heatingType.trim(),
        heatingLocation: heatingLocation.trim(),
        heatingInstructions: heatingInstructions.trim(),
        heatingMaintenance: heatingMaintenance.trim(),
        heatingContact: heatingContact.trim(),

        drainageLocations: drainageLocations.trim(),
        drainageRules: drainageRules.trim(),
        drainageEmergency: drainageEmergency.trim(),
        drainageContact: drainageContact.trim(),

        commOperator: commOperator.trim(),
        commPlan: commPlan.trim(),
        commRouterLocation: commRouterLocation.trim(),
        commWifiSsid: commWifiSsid.trim(),
        commWifiPassword: commWifiPassword.trim(),
        commRestartInstructions: commRestartInstructions.trim(),
        commContact: commContact.trim(),

        alarmType: alarmType.trim(),
        alarmPanelLocation: alarmPanelLocation.trim(),
        alarmZones: alarmZones.trim(),
        alarmInstructions: alarmInstructions.trim(),
        alarmContact: alarmContact.trim(),
      };

      await addDoc(collection(db, "systems"), payload);

      navigate("/sistemes");
    } catch (err) {
      console.error("Error creant sistema:", err);
      setError("No s'ha pogut desar el sistema.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingOptions) {
    return (
      <div className="p-4 pt-6">
        <p className="text-sm text-slate-500">Carregant dades…</p>
      </div>
    );
  }

  return (
    <div className="p-4 pt-6 pb-24 space-y-4">
      {/* Barra superior */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-slate-200"
        >
          <span className="text-lg">←</span>
        </button>
        <h1 className="text-sm font-semibold text-slate-800">
          Nou sistema
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
            onChange={(e) => setHouseId(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white"
          >
            <option value="">Selecciona una vivenda</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.id})
              </option>
            ))}
          </select>
          {houseId && (
            <p className="text-[10px] text-slate-500">
              Aquesta vivenda ja té {systemsInHouse.length} sistema(es).
              El codi nou es generarà automàticament.
            </p>
          )}
        </div>

        {/* Tipus de sistema */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Tipus de sistema
          </label>
          <select
            value={systemType}
            onChange={(e) =>
              setSystemType(e.target.value as SystemType | "")
            }
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white"
          >
            <option value="">Selecciona un tipus</option>
            <option value="Sistema elèctric">Sistema elèctric</option>
            <option value="Aigua i bomba">Aigua i bomba</option>
            <option value="Calefacció / climatització">
              Calefacció / climatització
            </option>
            <option value="Clavegueram i drenatges">
              Clavegueram i drenatges
            </option>
            <option value="Comunicacions (Internet, telèfon, TV)">
              Comunicacions (Internet, telèfon, TV)
            </option>
            <option value="Alarma">Alarma</option>
          </select>
          {systemType && houseId && (
            <p className="text-[10px] text-slate-500">
              El codi es generarà automàticament, per exemple:{" "}
              <span className="font-mono">
                {generateSystemCode(
                  houseId,
                  systemType as SystemType,
                  systemsInHouse.length + 1
                )}
              </span>
            </p>
          )}
        </div>

        {/* Nom del sistema */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Nom del sistema
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="P. ex. Quadre elèctric principal, Bomba pou, Alarma principal..."
          />
        </div>

        {/* Ubicació general */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Ubicació general
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="On està el sistema en general"
          />
        </div>

        {/* Descripció general */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Descripció general
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
            placeholder="Explicació bàsica del sistema..."
          />
        </div>

        {/* Instruccions generals */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Instruccions generals
          </label>
          <textarea
            value={generalInstructions}
            onChange={(e) => setGeneralInstructions(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
            placeholder="Qualsevol instrucció general que vulguis tenir a mà..."
          />
        </div>

        {/* Contacte general del sistema */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
              Contacte (nom)
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Nom del tècnic/empresa principal"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
              Telèfon contacte
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="+34 ..."
            />
          </div>
        </div>

        {/* BLOCS ESPECÍFICS PER TIPUS */}

        {/* Sistema elèctric */}
        {systemType === "Sistema elèctric" && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-[11px] font-semibold text-slate-700 uppercase tracking-[0.16em]">
              Sistema elèctric
            </h2>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Ubicació del quadre elèctric
              </label>
              <input
                type="text"
                value={electricalPanelLocation}
                onChange={(e) => setElectricalPanelLocation(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="P. ex. Rebedor planta baixa, habitació tècnica..."
              />
            </div>

            {/* Foto del quadre amb drag & drop */}
            <ImageUploadField
              label="Foto del quadre elèctric"
              value={electricalPanelPhotoUrl}
              onChange={(url) => setElectricalPanelPhotoUrl(url)}
            />

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Esquema de circuits
              </label>
              <textarea
                value={electricalCircuitsDiagram}
                onChange={(e) =>
                  setElectricalCircuitsDiagram(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
                placeholder="Llum plantes, endolls, cuina, exteriors..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600">
                  Potència contractada
                </label>
                <input
                  type="text"
                  value={electricalContractedPower}
                  onChange={(e) =>
                    setElectricalContractedPower(e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="P. ex. 5,75 kW"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600">
                  Companyia elèctrica
                </label>
                <input
                  type="text"
                  value={electricalCompany}
                  onChange={(e) => setElectricalCompany(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Nom de la companyia i tarifa"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Instruccions bàsiques
              </label>
              <textarea
                value={electricalBasicInstructions}
                onChange={(e) =>
                  setElectricalBasicInstructions(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
                placeholder="Com reconnectar diferencial, què fer si salta un magneto..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Contacte electricista (horaris, urgències)
              </label>
              <textarea
                value={electricalContact}
                onChange={(e) => setElectricalContact(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
                placeholder="Nom, telèfon, horaris, urgències..."
              />
            </div>
          </div>
        )}

        {/* Aigua i bomba */}
        {systemType === "Aigua i bomba" && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-[11px] font-semibold text-slate-700 uppercase tracking-[0.16em]">
              Aigua i bomba
            </h2>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Ubicació de la bomba / dipòsit
              </label>
              <input
                type="text"
                value={waterPumpLocation}
                onChange={(e) => setWaterPumpLocation(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="P. ex. exterior darrere casa, cambra de màquines..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Esquema bàsic
              </label>
              <textarea
                value={waterDiagram}
                onChange={(e) => setWaterDiagram(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
                placeholder="Pou → bomba → dipòsit → casa..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Com reiniciar la bomba
              </label>
              <textarea
                value={waterRestartInstructions}
                onChange={(e) =>
                  setWaterRestartInstructions(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
                placeholder="Passos per reiniciar si s'atura..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Manteniments (filtres, revisions…)
              </label>
              <textarea
                value={waterMaintenance}
                onChange={(e) => setWaterMaintenance(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
                placeholder="Freqüències de revisió, canvi filtres…"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Contacte fontaner / tècnic bomba
              </label>
              <textarea
                value={waterContact}
                onChange={(e) => setWaterContact(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
                placeholder="Nom, telèfon, horaris..."
              />
            </div>
          </div>
        )}

        {/* Calefacció / climatització */}
        {systemType === "Calefacció / climatització" && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-[11px] font-semibold text-slate-700 uppercase tracking-[0.16em]">
              Calefacció / climatització
            </h2>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Tipus de sistema
              </label>
              <input
                type="text"
                value={heatingType}
                onChange={(e) => setHeatingType(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Gas, gasoil, aerotèrmia, estufa pellets..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Ubicació caldera / estufa
              </label>
              <input
                type="text"
                value={heatingLocation}
                onChange={(e) => setHeatingLocation(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="On es troba exactament"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Instruccions bàsiques
              </label>
              <textarea
                value={heatingInstructions}
                onChange={(e) =>
                  setHeatingInstructions(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
                placeholder="Arrencar, apagar, pressió òptima, purgar radiadors..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Calendaris de manteniment
              </label>
              <textarea
                value={heatingMaintenance}
                onChange={(e) =>
                  setHeatingMaintenance(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
                placeholder="Revisions anuals, canvis filtres, neteges..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Contacte servei tècnic
              </label>
              <textarea
                value={heatingContact}
                onChange={(e) => setHeatingContact(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
                placeholder="Empresa, telèfon, emergències..."
              />
            </div>
          </div>
        )}

        {/* Clavegueram i drenatges */}
        {systemType === "Clavegueram i drenatges" && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-[11px] font-semibold text-slate-700 uppercase tracking-[0.16em]">
              Clavegueram i drenatges
            </h2>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Ubicació de pous, arquetes, fosses
              </label>
              <textarea
                value={drainageLocations}
                onChange={(e) =>
                  setDrainageLocations(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
                placeholder="On són els punts importants (arquetes, pous, fossa sèptica...)"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Què NO llençar (normes bàsiques)
              </label>
              <textarea
                value={drainageRules}
                onChange={(e) => setDrainageRules(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
                placeholder="Tovalloletes, olis, etc..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Què fer en cas d&apos;embús o mala olor
              </label>
              <textarea
                value={drainageEmergency}
                onChange={(e) =>
                  setDrainageEmergency(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
                placeholder="Passos d'emergència, coses a revisar..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Empresa de desatascos / manteniment
              </label>
              <textarea
                value={drainageContact}
                onChange={(e) =>
                  setDrainageContact(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
                placeholder="Nom, telèfon, horaris..."
              />
            </div>
          </div>
        )}

        {/* Comunicacions */}
        {systemType === "Comunicacions (Internet, telèfon, TV)" && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-[11px] font-semibold text-slate-700 uppercase tracking-[0.16em]">
              Comunicacions (Internet, telèfon, TV)
            </h2>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Operador i tarifa
              </label>
              <input
                type="text"
                value={commOperator}
                onChange={(e) => setCommOperator(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Nom operador i tipus tarifa"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Detalls de la tarifa (opcional)
              </label>
              <textarea
                value={commPlan}
                onChange={(e) => setCommPlan(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
                placeholder="Gigas, minuts, TV inclosa..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Ubicació del router / ONT
              </label>
              <input
                type="text"
                value={commRouterLocation}
                onChange={(e) =>
                  setCommRouterLocation(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="On està exactament el router/ONT"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600">
                  Nom de la WiFi (SSID)
                </label>
                <input
                  type="text"
                  value={commWifiSsid}
                  onChange={(e) =>
                    setCommWifiSsid(e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Nom de la xarxa"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600">
                  Contrasenya WiFi
                </label>
                <input
                  type="text"
                  value={commWifiPassword}
                  onChange={(e) =>
                    setCommWifiPassword(e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Contrasenya exacta"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Com reiniciar la connexió
              </label>
              <textarea
                value={commRestartInstructions}
                onChange={(e) =>
                  setCommRestartInstructions(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
                placeholder="Passos per reiniciar router/ONT, ordre, temps d'espera..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Contacte operador / tècnic
              </label>
              <textarea
                value={commContact}
                onChange={(e) => setCommContact(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
                placeholder="Telèfon suport, codi client..."
              />
            </div>
          </div>
        )}

        {/* ALARMA */}
        {systemType === "Alarma" && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-[11px] font-semibold text-slate-700 uppercase tracking-[0.16em]">
              Alarma
            </h2>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Tipus d&apos;alarma
              </label>
              <input
                type="text"
                value={alarmType}
                onChange={(e) => setAlarmType(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="P. ex. central connectada, local, sensors volumètrics..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Ubicació del teclat / centraleta
              </label>
              <input
                type="text"
                value={alarmPanelLocation}
                onChange={(e) =>
                  setAlarmPanelLocation(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Entrada principal, passadís, habitació tècnica..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Zones i sensors
              </label>
              <textarea
                value={alarmZones}
                onChange={(e) => setAlarmZones(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
                placeholder="Detall de les zones: planta baixa, exteriors, garatge..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Instruccions bàsiques (armar / desarmar)
              </label>
              <textarea
                value={alarmInstructions}
                onChange={(e) =>
                  setAlarmInstructions(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
                placeholder="Passos per activar/desactivar, què fer si salta l'alarma..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Contacte central / tècnic d&apos;alarma
              </label>
              <textarea
                value={alarmContact}
                onChange={(e) => setAlarmContact(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
                placeholder="Empresa, telèfon, codi client..."
              />
            </div>
          </div>
        )}

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
            {saving ? "Guardant…" : "Crear sistema"}
          </button>
        </div>
      </form>
    </div>
  );
}
