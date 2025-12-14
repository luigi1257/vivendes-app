// src/components/BottomNav.tsx
import { NavLink } from "react-router-dom";

function HomeIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M4 11.5 12 4l8 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 10.5V19a1 1 0 0 0 1 1H11v-5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v5h3.5a1 1 0 0 0 1-1v-8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SystemsIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path
        d="M4.5 12h2M17.5 12h2M12 4.5v2M12 17.5v2M6.8 6.8l1.4 1.4M15.8 15.8l1.4 1.4M17.2 6.8l-1.4 1.4M8.2 15.8l-1.4 1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IncidentsIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 3 3 21h18L12 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

// Contactes: mantenim el que t'agradava
function ContactsIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M6 19a6 6 0 0 1 12 0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const tabs = [
  { to: "/", label: "Inici", icon: <HomeIcon /> },
  { to: "/sistemes", label: "Sistemes", icon: <SystemsIcon /> },
  { to: "/incidencies", label: "Incidències", icon: <IncidentsIcon /> },
  { to: "/contactes", label: "Contactes", icon: <ContactsIcon /> },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20">
      <div className="max-w-md mx-auto px-3 pb-3">
        <div className="bg-white/95 backdrop-blur-lg shadow-lg rounded-full px-3 py-1 flex justify-between">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                [
                  "flex-1 flex flex-col items-center justify-center px-2 py-1 rounded-full transition-all",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100",
                ].join(" ")
              }
            >
              <span className="leading-none">{tab.icon}</span>
              <span className="text-[10px] font-medium mt-0.5">
                {tab.label}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

