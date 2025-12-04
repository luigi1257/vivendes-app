import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

type System = {
  id: string;
  code: string;
  houseId: string;
  houseName: string;
  type: string;
  name: string;
  description?: string;
  location?: string;
  instructions?: string;
  contactName?: string;
  contactPhone?: string;
};

export function SystemDetailPage() {
  const { systemId } = useParams<{ systemId: string }>();
  const navigate = useNavigate();
  const [system, setSystem] = useState<System | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSystem() {
      if (!systemId) return;
      const ref = doc(db, "systems", systemId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSystem({ id: snap.id, ...(snap.data() as Omit<System, "id">) });
      }
      setLoading(false);
    }
    fetchSystem();
  }, [systemId]);

  if (loading) {
    return (
      <div className="p-4 pt-6">
        <p className="text-sm text-gray-500">Carregant sistema…</p>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="p-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 mb-3"
        >
          ← Tornar
        </button>
        <p className="text-sm text-red-500">No s&apos;ha trobat aquest sistema.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pt-6 space-y-4">
      {/* Barra superior */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-200"
        >
          <span className="text-lg">←</span>
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-sm font-semibold text-gray-700">Sistema</h1>
        </div>
        <button className="p-2 -mr-2 rounded-full hover:bg-gray-200">
          <span className="text-xl">⋯</span>
        </button>
      </div>

      {/* Targeta principal amb codi i vivenda */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-1">
        <div className="text-xs font-semibold tracking-wide text-gray-500">
          {system.houseName.toUpperCase()}
        </div>
        <div className="text-lg font-bold text-gray-900">
          {system.code}
        </div>
        <div className="text-xs text-gray-600">{system.name}</div>
        <div className="mt-2 inline-flex flex-wrap gap-2 text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">
            {system.type}
          </span>
        </div>
      </div>

      {/* Camps de detall, estil “fila” com a la maqueta */}
      <div className="space-y-2">
        <Field label="Vivenda" value={system.houseName} />
        <Field label="Tipus sistema" value={system.type} />
        <Field label="Nom sistema" value={system.name} />
        <Field label="Descripció" value={system.description} />
        <Field label="Ubicació" value={system.location} />
        <Field label="Instruccions" value={system.instructions} />
        <Field label="Contacte" value={system.contactName} />
        <Field label="Telèfon contacte" value={system.contactPhone} isPhone />
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value?: string;
  isPhone?: boolean;
};

function Field({ label, value, isPhone }: FieldProps) {
  if (!value) return null;
  return (
    <div className="bg-white rounded-2xl shadow-sm px-3 py-2">
      <div className="text-[11px] text-gray-400">{label}</div>
      {isPhone ? (
        <a
          href={`tel:${value}`}
          className="text-sm text-blue-600 font-medium"
        >
          {value}
        </a>
      ) : (
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {value}
        </div>
      )}
    </div>
  );
}
