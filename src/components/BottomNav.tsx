import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", label: "Vivendes", icon: "🏠" },
  { to: "/sistemes", label: "Sistemes", icon: "🗂️" },
  { to: "/incidencies", label: "Incidències", icon: "🛠️" },
  { to: "/contactes", label: "Contactes", icon: "👥" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <div className="max-w-md mx-auto flex justify-around py-2 text-xs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) =>
              [
                "flex flex-col items-center gap-0.5 px-2",
                isActive ? "text-gray-900" : "text-gray-400",
              ].join(" ")
            }
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
