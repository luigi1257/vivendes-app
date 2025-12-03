import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

type System = {
  id: string;
  code: string;
  houseId: string;
  houseName: string;
  type: string;
  name: string;
};

export function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSystems() {
      try {
        const q = query(collection(db, "systems"), orderBy("code"));
        const snap = await getDocs(q);
        const data: System[] = snap.docs.map((doc) => {
          const d = doc.data() as Omit<System, "id">;
          return { id: doc.id, ...d };
        });
        setSystems(data);
      } finally {
        setLoading(false);
      }
    }
    fetchSystems();
  }, []);

  const filtered = systems.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.code.toLowerCase().includes(term) ||
      s.houseName.toLowerCase().includes(term) ||
      s.type.toLowerCase().includes(term) ||
      s.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 pt-6 space-y-4">
      {/* Capçalera */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sistemes</h1>
        <button className="px-3 py-1.5 rounded-full bg-gray-800 text-white text-sm font-medium">
          + Add
        </button>
      </div>

      {/* Cercador */}
      <div>
        <input
          type="text"
          placeholder="Buscar sistema o vivenda"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-200 rounded-xl px-4 py-2 text-sm outline-none"
        />
      </div>

      {/* Llista de sistemes */}
      {loading ? (
        <div className="text-sm text-gray-500">Carregant sistemes…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-500">
          No s&apos;ha trobat cap sistema.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/sistemes/${s.id}`)}
              className="w-full bg-white rounded-2xl shadow-sm px-3 py-2 flex items-center justify-between text-left"
            >
              <div>
                <div className="text-xs font-bold tracking-wide text-gray-700">
                  {s.code}
                </div>
                <div className="text-xs text-gray-500">{s.houseName}</div>
                <div className="mt-1 inline-flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                    {s.type}
                  </span>
                  <span className="text-gray-600 truncate max-w-[140px]">
                    {s.name}
                  </span>
                </div>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
