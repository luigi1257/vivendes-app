// src/pages/SystemDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

type IncidentStatus = "oberta" | "pendent" | "resolta";

type System = {
  id: string;
  code: string;
  name: string;
  type?: string;
  houseId: string;
  houseName?: string;
  description?: string;
  location?: string;
  instructions?: string;
  contactName?: string;
  contactPhone?: string;

  // Elèctric
  electricalPanelLocation?: string;
  electricalPanelPhotoUrl?: string;
  electricalCircuitsDiagram?: string;
  electricalContractedPower?: string;
  electricalCompany?: string;
  electricalBasicInstructions?: string;
  electricalContact?: string;

  // Aigua
  waterPumpLocation?: string;
  waterDiagram?: string;
  waterRestartInstructions?: string;
  waterMaintenance?: string;
  waterContact?: string;

  // Calefacció
  heatingType?: string;
  heatingLocation?: string;
  heatingInstructions?: string;
  heatingMaintenance?: string;
  heatingContact?: string;

  // Clavegueram
  drainageLocations?: string;
  drainageRules?: string;
  drainageEmergency?: string;
  drainageContact?: string;

  // Comunicacions
  commOperator?: string;
  commPlan?: string;
  commRouterLocation?: string;
  commWifiSsid?: string;
  commWifiPassword?: string;
  commRestartInstructions?: string;
  commContact?: string;

  // Alarma
  alarmType?: string;
  alarmLocation?: string;
  alarmInstructions?: string;
  alarmMaintenance?: string;
  alarmContact?: string;
};

type IncidentSummary = {
  id: string;
  title: string;
  date?: string;
  status?: IncidentStatus;
};

function IncidentStatusPill({ status }: { status?: IncidentStatus }) {
  if (!status) return null;
  const map: Record<IncidentStatus, string> = {
    oberta: "bg-rose-50 text-rose-700 border-rose-100",
    pendent: "bg-amber-50 text-amber-800 border-amber-100",
    resolta: "bg-emerald-50 text-emerald-800 border-emerald-100",
  };
  const label: Record<IncidentStatus, string> = {
    oberta: "Oberta",
    pendent: "Pendent",
    resolta: "Resolta",
  };
  return (
    <span
      className={
        "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide " +
        map[status]
      }
    >
      {label[status]}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <div className="text-sm text-slate-700">{children}</div>
    </section>
  );
}

export function SystemDetailPage() {
  const { systemId } = useParams();
  const navigate = useNavigate();

  const [system, setSystem] = useState<System | null>(null);
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!systemId) {
      setError("Falta el sistema.");
      setLoading(false);
      setLoadingIncidents(false);
      return;
    }

    async function loadSystem(id: string) {
      try {
        const ref = doc(db, "systems", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("No s’ha trobat aquest sistema.");
          return;
        }
        const data = snap.data() as any;
        setSystem({
          id: snap.id,
          code: data.code ?? "",
          name: data.name ?? "",
          type: data.type,
          houseId: data.houseId,
          houseName: data.houseName,
          description: data.description,
          location: data.location,
          instructions: data.instructions,
          contactName: data.contactName,
          contactPhone: data.contactPhone,
          electricalPanelLocation: data.electricalPanelLocation,
          electricalPanelPhotoUrl: data.electricalPanelPhotoUrl,
          electricalCircuitsDiagram: data.electricalCircuitsDiagram,
          electricalContractedPower: data.electricalContractedPower,
          electricalCompany: data.electricalCompany,
          electricalBasicInstructions: data.electricalBasicInstructions,
          electricalContact: data.electricalContact,
          waterPumpLocation: data.waterPumpLocation,
          waterDiagram: data.waterDiagram,
          waterRestartInstructions: data.waterRestartInstructions,
          waterMaintenance: data.waterMaintenance,
          waterContact: data.waterContact,
          heatingType: data.heatingType,
          heatingLocation: data.heatingLocation,
          heatingInstructions: data.heatingInstructions,
          heatingMaintenance: data.heatingMaintenance,
          heatingContact: data.heatingContact,
          drainageLocations: data.drainageLocations,
          drainageRules: data.drainageRules,
          drainageEmergency: data.drainageEmergency,
          drainageContact: data.drainageContact,
          commOperator: data.commOperator,
          commPlan: data.commPlan,
          commRouterLocation: data.commRouterLocation,
          commWifiSsid: data.commWifiSsid,
          commWifiPassword: data.commWifiPassword,
          commRestartInstructions: data.commRestartInstructions,
          commContact: data.commContact,
          alarmType: data.alarmType,
          alarmLocation: data.alarmLocation,
          alarmInstructions: data.alarmInstructions,
          alarmMaintenance: data.alarmMaintenance,
          alarmContact: data.alarmContact,
        });
      } catch (err) {
        console.error(err);
        setError("Error carregant el sistema.");
      } finally {
        setLoading(false);
      }
    }

    async function loadIncidents(id: string) {
      try {
        const q = query(
          collection(db, "incidents"),
          where("systemId", "==", id)
        );
        const snap = await getDocs(q);
        const items: IncidentSummary[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as any;
          items.push({
            id: docSnap.id,
            title: d.title ?? "",
            date: d.date,
            status: d.status as IncidentStatus | undefined,
          });
        });
        setIncidents(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingIncidents(false);
      }
    }

    loadSystem(systemId);
    loadIncidents(systemId);
  }, [systemId]);

  async function handleDelete() {
    if (!system) return;

    const confirmed = window.confirm(
      "Segur que vols eliminar aquest sistema? Aquesta acció no es pot desfer."
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "systems", system.id));
      navigate(`/vivendes/${system.houseId}`);
    } catch (err) {
      console.error("Error eliminant sistema:", err);
      alert("Hi ha hagut un error eliminant el sistema.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto px-4 pt-6 pb-24 text-sm text-slate-500">
          Carregant sistema…
        </div>
      </div>
    );
  }

  if (error || !system) {
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
            {error ?? "Error desconegut."}
          </p>
        </div>
      </div>
    );
  }

  const hasElectrical =
    system.electricalPanelLocation ||
    system.electricalPanelPhotoUrl ||
    system.electricalCircuitsDiagram ||
    system.electricalContractedPower ||
    system.electricalCompany ||
    system.electricalBasicInstructions ||
    system.electricalContact;

  const hasWater =
    system.waterPumpLocation ||
    system.waterDiagram ||
    system.waterRestartInstructions ||
    system.waterMaintenance ||
    system.waterContact;

  const hasHeating =
    system.heatingType ||
    system.heatingLocation ||
    system.heatingInstructions ||
    system.heatingMaintenance ||
    system.heatingContact;

  const hasDrainage =
    system.drainageLocations ||
    system.drainageRules ||
    system.drainageEmergency ||
    system.drainageContact;

  const hasComm =
    system.commOperator ||
    system.commPlan ||
    system.commRouterLocation ||
    system.commWifiSsid ||
    system.commWifiPassword ||
    system.commRestartInstructions ||
    system.commContact;

  const hasAlarm =
    system.alarmType ||
    system.alarmLocation ||
    system.alarmInstructions ||
    system.alarmMaintenance ||
    system.alarmContact;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur border-b border-slate-200/70">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3 gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-100"
          >
            ←
          </button>

          <div className="flex-1 text-center min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
              Sistema
            </p>
            <h1 className="text-sm font-semibold text-slate-900 truncate">
              {system.name}
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-center gap-1">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {system.code}
              </span>
              {system.type && (
                <span className="uppercase tracking-wide text-[10px] text-slate-500">
                  · {system.type}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDelete}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-red-200 text-red-700 bg-white hover:bg-red-50"
            >
              Eliminar
            </button>
            <Link
              to={`/sistemes/${system.id}/editar`}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            >
              Editar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Vivenda */}
        <Section title="Vivenda">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] text-slate-500 mb-0.5">
                Assignat a
              </p>
              <Link
                to={`/vivendes/${system.houseId}`}
                className="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2"
              >
                {system.houseName ?? "Veure vivenda"}
              </Link>
            </div>
          </div>
        </Section>

        {/* Info general */}
        <Section title="Informació general">
          <div className="space-y-3">
            {system.location && (
              <p>
                <span className="font-semibold text-slate-800">
                  Ubicació:
                </span>{" "}
                {system.location}
              </p>
            )}
            {system.description && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                  Descripció
                </p>
                <p className="whitespace-pre-line">{system.description}</p>
              </div>
            )}
            {system.instructions && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                  Instruccions generals
                </p>
                <p className="whitespace-pre-line">
                  {system.instructions}
                </p>
              </div>
            )}
            {(system.contactName || system.contactPhone) && (
              <div className="space-y-0.5 border-t border-slate-100 pt-2">
                <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                  Contacte principal
                </p>
                {system.contactName && <p>{system.contactName}</p>}
                {system.contactPhone && (
                  <p>
                    📞{" "}
                    <a
                      href={`tel:${system.contactPhone}`}
                      className="underline decoration-slate-300 underline-offset-2"
                    >
                      {system.contactPhone}
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* Elèctric */}
        {hasElectrical && (
          <Section title="Sistema elèctric">
            <div className="space-y-3">
              {system.electricalPanelLocation && (
                <p>
                  <span className="font-semibold text-slate-800">
                    Ubicació del quadre elèctric:
                  </span>{" "}
                  {system.electricalPanelLocation}
                </p>
              )}
              {system.electricalPanelPhotoUrl && (
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-slate-500">
                    Foto del quadre
                  </p>
                  <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    <img
                      src={system.electricalPanelPhotoUrl}
                      alt="Quadre elèctric"
                      className="w-full max-h-56 object-cover"
                    />
                  </div>
                </div>
              )}
              {system.electricalCircuitsDiagram && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Esquema de circuits
                  </p>
                  <p className="whitespace-pre-line">
                    {system.electricalCircuitsDiagram}
                  </p>
                </div>
              )}
              {(system.electricalContractedPower ||
                system.electricalCompany) && (
                <p className="text-sm">
                  {system.electricalContractedPower && (
                    <>
                      <span className="font-semibold text-slate-800">
                        Potència:
                      </span>{" "}
                      {system.electricalContractedPower}
                    </>
                  )}
                  {system.electricalCompany && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-semibold text-slate-800">
                        Companyia:
                      </span>{" "}
                      {system.electricalCompany}
                    </>
                  )}
                </p>
              )}
              {system.electricalBasicInstructions && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Instruccions bàsiques
                  </p>
                  <p className="whitespace-pre-line">
                    {system.electricalBasicInstructions}
                  </p>
                </div>
              )}
              {system.electricalContact && (
                <p>
                  <span className="font-semibold text-slate-800">
                    Contacte electricista:
                  </span>{" "}
                  {system.electricalContact}
                </p>
              )}
            </div>
          </Section>
        )}

        {/* Aigua i bomba */}
        {hasWater && (
          <Section title="Aigua i bomba">
            <div className="space-y-3">
              {system.waterPumpLocation && (
                <p>
                  <span className="font-semibold text-slate-800">
                    Ubicació de la bomba / dipòsit:
                  </span>{" "}
                  {system.waterPumpLocation}
                </p>
              )}
              {system.waterDiagram && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Esquema bàsic
                  </p>
                  <p className="whitespace-pre-line">
                    {system.waterDiagram}
                  </p>
                </div>
              )}
              {system.waterRestartInstructions && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Com reiniciar la bomba
                  </p>
                  <p className="whitespace-pre-line">
                    {system.waterRestartInstructions}
                  </p>
                </div>
              )}
              {system.waterMaintenance && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Manteniments
                  </p>
                  <p className="whitespace-pre-line">
                    {system.waterMaintenance}
                  </p>
                </div>
              )}
              {system.waterContact && (
                <p>
                  <span className="font-semibold text-slate-800">
                    Contacte fontaner:
                  </span>{" "}
                  {system.waterContact}
                </p>
              )}
            </div>
          </Section>
        )}

        {/* Calefacció / climatització */}
        {hasHeating && (
          <Section title="Calefacció / climatització">
            <div className="space-y-3">
              {system.heatingType && (
                <p>
                  <span className="font-semibold text-slate-800">
                    Tipus:
                  </span>{" "}
                  {system.heatingType}
                </p>
              )}
              {system.heatingLocation && (
                <p>
                  <span className="font-semibold text-slate-800">
                    Ubicació caldera / estufa:
                  </span>{" "}
                  {system.heatingLocation}
                </p>
              )}
              {system.heatingInstructions && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Instruccions bàsiques
                  </p>
                  <p className="whitespace-pre-line">
                    {system.heatingInstructions}
                  </p>
                </div>
              )}
              {system.heatingMaintenance && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Calendaris de manteniment
                  </p>
                  <p className="whitespace-pre-line">
                    {system.heatingMaintenance}
                  </p>
                </div>
              )}
              {system.heatingContact && (
                <p>
                  <span className="font-semibold text-slate-800">
                    Servei tècnic:
                  </span>{" "}
                  {system.heatingContact}
                </p>
              )}
            </div>
          </Section>
        )}

        {/* Clavegueram */}
        {hasDrainage && (
          <Section title="Clavegueram i drenatges">
            <div className="space-y-3">
              {system.drainageLocations && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Ubicació de pous, arquetes, fosses
                  </p>
                  <p className="whitespace-pre-line">
                    {system.drainageLocations}
                  </p>
                </div>
              )}
              {system.drainageRules && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Què NO llençar
                  </p>
                  <p className="whitespace-pre-line">
                    {system.drainageRules}
                  </p>
                </div>
              )}
              {system.drainageEmergency && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Què fer en cas de problema
                  </p>
                  <p className="whitespace-pre-line">
                    {system.drainageEmergency}
                  </p>
                </div>
              )}
              {system.drainageContact && (
                <p>
                  <span className="font-semibold text-slate-800">
                    Empresa desatascos:
                  </span>{" "}
                  {system.drainageContact}
                </p>
              )}
            </div>
          </Section>
        )}

        {/* Comunicacions */}
        {hasComm && (
          <Section title="Comunicacions (Internet, telèfon, TV)">
            <div className="space-y-3">
              {(system.commOperator || system.commPlan) && (
                <p>
                  {system.commOperator && (
                    <>
                      <span className="font-semibold text-slate-800">
                        Operador:
                      </span>{" "}
                      {system.commOperator}
                    </>
                  )}
                  {system.commPlan && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-semibold text-slate-800">
                        Tarifa:
                      </span>{" "}
                      {system.commPlan}
                    </>
                  )}
                </p>
              )}
              {system.commRouterLocation && (
                <p>
                  <span className="font-semibold text-slate-800">
                    Ubicació del router / ONT:
                  </span>{" "}
                  {system.commRouterLocation}
                </p>
              )}
              {(system.commWifiSsid || system.commWifiPassword) && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Dades WiFi
                  </p>
                  {system.commWifiSsid && (
                    <p>
                      <span className="font-semibold text-slate-800">
                        Nom xarxa:
                      </span>{" "}
                      {system.commWifiSsid}
                    </p>
                  )}
                  {system.commWifiPassword && (
                    <p>
                      <span className="font-semibold text-slate-800">
                        Contrasenya:
                      </span>{" "}
                      {system.commWifiPassword}
                    </p>
                  )}
                </div>
              )}
              {system.commRestartInstructions && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Com reiniciar la connexió
                  </p>
                  <p className="whitespace-pre-line">
                    {system.commRestartInstructions}
                  </p>
                </div>
              )}
              {system.commContact && (
                <p>
                  <span className="font-semibold text-slate-800">
                    Contacte operador:
                  </span>{" "}
                  {system.commContact}
                </p>
              )}
            </div>
          </Section>
        )}

        {/* Alarma */}
        {hasAlarm && (
          <Section title="Alarma">
            <div className="space-y-3">
              {system.alarmType && (
                <p>
                  <span className="font-semibold text-slate-800">
                    Tipus d’alarma:
                  </span>{" "}
                  {system.alarmType}
                </p>
              )}
              {system.alarmLocation && (
                <p>
                  <span className="font-semibold text-slate-800">
                    Ubicació centraleta:
                  </span>{" "}
                  {system.alarmLocation}
                </p>
              )}
              {system.alarmInstructions && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Instruccions bàsiques
                  </p>
                  <p className="whitespace-pre-line">
                    {system.alarmInstructions}
                  </p>
                </div>
              )}
              {system.alarmMaintenance && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
                    Manteniment
                  </p>
                  <p className="whitespace-pre-line">
                    {system.alarmMaintenance}
                  </p>
                </div>
              )}
              {system.alarmContact && (
                <p>
                  <span className="font-semibold text-slate-800">
                    Servei tècnic alarma:
                  </span>{" "}
                  {system.alarmContact}
                </p>
              )}
            </div>
          </Section>
        )}

        {/* Incidències d’aquest sistema */}
        <Section title="Incidències d’aquest sistema">
          {loadingIncidents ? (
            <p className="text-xs text-slate-500">
              Carregant incidències…
            </p>
          ) : incidents.length === 0 ? (
            <p className="text-xs text-slate-500">
              No hi ha incidències registrades per aquest sistema.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {incidents.map((inc) => (
                <li key={inc.id} className="py-2">
                  <Link
                    to={`/incidencies/${inc.id}`}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {inc.title}
                      </p>
                      {inc.date && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          📅 {inc.date}
                        </p>
                      )}
                    </div>
                    <IncidentStatusPill status={inc.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </main>
    </div>
  );
}
