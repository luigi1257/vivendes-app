// src/pages/EditSystemPage.tsx
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
import { ImageUploadField } from "../components/ImageUploadField";

type SystemType =
  | "Sistema elèctric"
  | "Aigua i bomba"
  | "Calefacció / climatització"
  | "Clavegueram i drenatges"
  | "Comunicacions (Internet, telèfon, TV)"
  | "Alarma"
  | string;

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

export function EditSystemPage() {
  const { systemId } = useParams<{ systemId: string }>();
  const navigate = useNavigate();

  const [houses, setHouses] = useState<SimpleHouse[]>([]);
  const [systems, setSystems] = useState<SimpleSystem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingSystem, setLoadingSystem] = useState(true);

  const [code, setCode] = useState("");
  const [houseId, setHouseId] = useState("");
  const [systemType, setSystemType] = useState<SystemType>("");
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

  useEffect(() => {
    async function loadSystem() {
      if (!systemId) {
        setError("Falta l'ID del sistema.");
        setLoadingSystem(false);
        return;
      }

      try {
        const ref = doc(db, "systems", systemId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("No s'ha trobat aquest sistema.");
          setLoadingSystem(false);
          return;
        }

        const s = snap.data() as any;

        setCode(s.code ?? systemId);
        setHouseId(s.houseId ?? "");
        setSystemType(s.type ?? "");
        setName(s.name ?? "");
        setLocation(s.location ?? "");
        setDescription(s.description ?? "");
        setGeneralInstructions(s.instructions ?? "");
        setContactName(s.contactName ?? "");
        setContactPhone(s.contactPhone ?? "");

        setElectricalPanelLocation(s.electricalPanelLocation ?? "");
        setElectricalPanelPhotoUrl(s.electricalPanelPhotoUrl ?? "");
        setElectricalCircuitsDiagram(s.electricalCircuitsDiagram ?? "");
        setElectricalContractedPower(s.electricalContractedPower ?? "");
        setElectricalCompany(s.electricalCompany ?? "");
        setElectricalBasicInstructions(
          s.electricalBasicInstructions ?? ""
        );
        setElectricalContact(s.electricalContact ?? "");

        setWaterPumpLocation(s.waterPumpLocation ?? "");
        setWaterDiagram(s.waterDiagram ?? "");
        setWaterRestartInstructions(
          s.waterRestartInstructions ?? ""
        );
        setWaterMaintenance(s.waterMaintenance ?? "");
        setWaterContact(s.waterContact ?? "");

        setHeatingType(s.heatingType ?? "");
        setHeatingLocation(s.heatingLocation ?? "");
        setHeatingInstructions(s.heatingInstructions ?? "");
        setHeatingMaintenance(s.heatingMaintenance ?? "");
        setHeatingContact(s.heatingContact ?? "");

        setDrainageLocations(s.drainageLocations ?? "");
        setDrainageRules(s.drainageRules ?? "");
        setDrainageEmergency(s.drainageEmergency ?? "");
        setDrainageContact(s.drainageContact ?? "");

        setCommOperator(s.commOperator ?? "");
        setCommPlan(s.commPlan ?? "");
        setCommRouterLocation(s.commRouterLocation ?? "");
        setCommWifiSsid(s.commWifiSsid ?? "");
        setCommWifiPassword(s.commWifiPassword ?? "");
        setCommRestartInstructions(
          s.commRestartInstructions ?? ""
        );
        setCommContact(s.commContact ?? "");

        setAlarmType(s.alarmType ?? "");
        setAlarmPanelLocation(s.alarmPanelLocation ?? "");
        setAlarmZones(s.alarmZones ?? "");
        setAlarmInstructions(s.alarmInstructions ?? "");
        setAlarmContact(s.alarmContact ?? "");
      } catch (err) {
        console.error("Error carregant sistema:", err);
        setError("No s'han pogut carregar les dades del sistema.");
      } finally {
        setLoadingSystem(false);
      }
    }

    loadSystem();
  }, [systemId]);

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

    if (!systemId) {
      setError("Falta l'ID del sistema.");
      return;
    }

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

      await updateDoc(doc(db, "systems", systemId), payload);

      navigate(`/sistemes/${systemId}`);
    } catch (err) {
      console.error("Error desant sistema:", err);
      setError("No s'ha pogut desar el sistema.");
    } finally {
      setSaving(false);
    }
  }

  const isLoading = loadingOptions || loadingSystem;

  if (isLoading) {
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
          Editar sistema
        </h1>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {/* Codi (només lectura) */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Codi sistema
          </label>
          <input
            type="text"
            value={code}
            readOnly
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 font-mono text-slate-700"
          />
          <p className="text-[10px] text-slate-500">
            El codi es genera en crear el sistema per mantenir l&apos;ordre
            lògic.
          </p>
        </div>

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
              Aquesta vivenda té {systemsInHouse.length} sistemes
              registrats.
            </p>
          )}
        </div>

        {/* Tipus */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Tipus de sistema
          </label>
          <select
            value={systemType}
            onChange={(e) =>
              setSystemType(e.target.value as SystemType)
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
        </div>

        {/* Nom */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Nom del sistema
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
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
          />
        </div>

        {/* Instruccions generals */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.16em]">
            Instruccions generals
          </label>
          <textarea
            value={generalInstructions}
            onChange={(e) =>
              setGeneralInstructions(e.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
          />
        </div>

        {/* Contacte general */}
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
            />
          </div>
        </div>

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
                onChange={(e) =>
                  setElectricalPanelLocation(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
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
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600">
                  Companyia
                </label>
                <input
                  type="text"
                  value={electricalCompany}
                  onChange={(e) =>
                    setElectricalCompany(e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
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
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Contacte electricista
              </label>
              <textarea
                value={electricalContact}
                onChange={(e) =>
                  setElectricalContact(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
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
                Ubicació bomba / dipòsit
              </label>
              <input
                type="text"
                value={waterPumpLocation}
                onChange={(e) =>
                  setWaterPumpLocation(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
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
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Reiniciar bomba
              </label>
              <textarea
                value={waterRestartInstructions}
                onChange={(e) =>
                  setWaterRestartInstructions(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Manteniments
              </label>
              <textarea
                value={waterMaintenance}
                onChange={(e) =>
                  setWaterMaintenance(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Contacte fontaner / tècnic
              </label>
              <textarea
                value={waterContact}
                onChange={(e) => setWaterContact(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
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
                Tipus sistema
              </label>
              <input
                type="text"
                value={heatingType}
                onChange={(e) =>
                  setHeatingType(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Ubicació caldera / estufa
              </label>
              <input
                type="text"
                value={heatingLocation}
                onChange={(e) =>
                  setHeatingLocation(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
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
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Contacte servei tècnic
              </label>
              <textarea
                value={heatingContact}
                onChange={(e) =>
                  setHeatingContact(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
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
                Ubicació pous / arquetes / fosses
              </label>
              <textarea
                value={drainageLocations}
                onChange={(e) =>
                  setDrainageLocations(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Què NO llençar
              </label>
              <textarea
                value={drainageRules}
                onChange={(e) =>
                  setDrainageRules(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
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
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Empresa manteniment / desatascos
              </label>
              <textarea
                value={drainageContact}
                onChange={(e) =>
                  setDrainageContact(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
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
                onChange={(e) =>
                  setCommOperator(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Detalls tarifa
              </label>
              <textarea
                value={commPlan}
                onChange={(e) => setCommPlan(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Ubicació router / ONT
              </label>
              <input
                type="text"
                value={commRouterLocation}
                onChange={(e) =>
                  setCommRouterLocation(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600">
                  Nom WiFi (SSID)
                </label>
                <input
                  type="text"
                  value={commWifiSsid}
                  onChange={(e) =>
                    setCommWifiSsid(e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
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
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Com reiniciar connexió
              </label>
              <textarea
                value={commRestartInstructions}
                onChange={(e) =>
                  setCommRestartInstructions(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
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
              />
            </div>
          </div>
        )}

        {/* Alarma */}
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
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Ubicació teclat / centraleta
              </label>
              <input
                type="text"
                value={alarmPanelLocation}
                onChange={(e) =>
                  setAlarmPanelLocation(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
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
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Instruccions bàsiques
              </label>
              <textarea
                value={alarmInstructions}
                onChange={(e) =>
                  setAlarmInstructions(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[70px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600">
                Contacte central / tècnic
              </label>
              <textarea
                value={alarmContact}
                onChange={(e) => setAlarmContact(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[60px]"
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
            {saving ? "Guardant…" : "Desar canvis"}
          </button>
        </div>
      </form>
    </div>
  );
}
