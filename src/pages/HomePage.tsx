// src/pages/HomePage.tsx
import { Link } from "react-router-dom";

/** Icones minimalistes en línia, sense color propi (hereten text-current) */

function HomeIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5a.5.5 0 0 1-.5-.5v-4a1.5 1.5 0 0 0-1.5-1.5h-1a1.5 1.5 0 0 0-1.5 1.5v4a.5.5 0 0 1-.5.5H5a1 1 0 0 1-1-1v-9.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4v-4.5A1.5 1.5 0 0 0 13.5 15h-3A1.5 1.5 0 0 0 9 16.5V21H5a1 1 0 0 1-1-1v-8.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ParkingIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path
        d="M9 16V8h3.25A2.75 2.75 0 0 1 15 10.75v0A2.75 2.75 0 0 1 12.25 13H9"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M4 14.5 5.5 8A2 2 0 0 1 7.44 6.5h9.12A2 2 0 0 1 18.5 8L20 14.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <rect
        x="4"
        y="11.5"
        width="16"
        height="6.5"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <circle cx="8" cy="17.5" r="1" fill="currentColor" />
      <circle cx="16" cy="17.5" r="1" fill="currentColor" />
    </svg>
  );
}

function SystemsIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path
        d="M12 4V2M12 22v-2M4 12H2M22 12h-2M6.2 6.2 4.9 4.9M19.1 19.1l-1.3-1.3M17.8 6.2l1.3-1.3M4.9 19.1l1.3-1.3"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IncidentIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 3 3 9l9 12 9-12-9-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="M12 9v4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <circle cx="12" cy="15.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

function ContactsIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M15.5 5A3.5 3.5 0 1 1 12 1.5 3.5 3.5 0 0 1 15.5 5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path
        d="M5 19.5A7 7 0 0 1 12 13a7 7 0 0 1 7 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Targeta principal minimalista */
function HomeCard(props: {
  to: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={props.to}
      className="app-card flex items-center gap-3 px-3 py-3 hover:shadow-md hover:border-slate-200 transition-shadow transition-colors"
    >
      <div className="app-icon-button">
        {props.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-900">
          {props.title}
        </p>
        <p className="text-[11px] text-slate-500 truncate">
          {props.subtitle}
        </p>
      </div>
      <div className="text-slate-300 text-xs ml-1">›</div>
    </Link>
  );
}

export function HomePage() {
  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-6">
      {/* Capçalera molt neta */}
      <header className="flex items-center gap-3">
        <div className="app-icon-button">
          <HomeIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
            Inici
          </p>
          <h1 className="text-base font-semibold text-slate-900">
            Gestió de vivendes
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Accés ràpid a vivendes, pàrquings, sistemes i incidències.
          </p>
        </div>
      </header>

      {/* Bloc: Espais */}
      <section className="app-section space-y-3">
        <p className="app-section-title">
          Espais
        </p>
        <div className="space-y-2">
          <HomeCard
            to="/vivendes"
            title="Vivendes"
            subtitle="Veure i gestionar totes les vivendes."
            icon={<HouseIcon />}
          />
          <HomeCard
            to="/parkings"
            title="Pàrquings i locals"
            subtitle="Places, lloguers i informació d'accés."
            icon={<ParkingIcon />}
          />
          <HomeCard
            to="/vehicles"
            title="Vehicles"
            subtitle="Vehicles associats a cada vivenda o pàrquing."
            icon={<CarIcon />}
          />
        </div>
      </section>

      {/* Bloc: Manteniment */}
      <section className="app-section space-y-3">
        <p className="app-section-title">
          Manteniment i sistema
        </p>
        <div className="space-y-2">
          <HomeCard
            to="/sistemes"
            title="Sistemes"
            subtitle="Sistemes elèctrics, aigua, calefacció, comunicacions i alarma."
            icon={<SystemsIcon />}
          />
          <HomeCard
            to="/incidencies"
            title="Incidències"
            subtitle="Històric d'avaries i tasques pendents."
            icon={<IncidentIcon />}
          />
        </div>
      </section>

      {/* Bloc: Contactes */}
      <section className="app-section space-y-3">
        <p className="app-section-title">
          Contactes
        </p>
        <div className="space-y-2">
          <HomeCard
            to="/contactes"
            title="Contactes"
            subtitle="Tècnics, empreses i persones de referència."
            icon={<ContactsIcon />}
          />
        </div>
      </section>
    </div>
  );
}
