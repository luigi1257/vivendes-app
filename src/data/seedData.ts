// src/data/seedData.ts

export type HouseSeed = {
  id: string;
  name: string;
  address: string;
  coverImageUrl?: string;
  notes?: string;
};

export type SystemSeed = {
  id: string; // id del document a Firestore (normalment igual que code)
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

export type ContactSeed = {
  id: string;
  name: string;
  role: string;
  phone: string;
  emergencyPhone?: string;
  email?: string;
  notes?: string;
  houseIds: string[];
};

export type IncidentSeed = {
  id: string;
  houseId: string;
  houseName: string;
  systemId: string;
  systemCode: string;
  title: string;
  description: string;
  actionTaken: string;
  contactName: string;
  date: string; // la guardarem com string tipus "2025-01-10"
};

export const seedHouses: HouseSeed[] = [
  {
    id: "AIGUAVIVA",
    name: "Aiguaviva",
    address: "Carrer Puigtorrat, 12, 17181 Aiguaviva, Girona",
    coverImageUrl: "",
    notes: "Casa principal de cap de setmana."
  },
  {
    id: "SANTANTONI",
    name: "Sant Antoni",
    address: "Carrer de Sant Antoni, 150, 17252 Calonge, Girona",
    coverImageUrl: "",
    notes: "Apartament a la platja."
  },
  {
    id: "RUTLLA38",
    name: "RUTLLA38",
    address: "Carrer de la Rutlla, 38, 17002 Girona",
    coverImageUrl: "",
    notes: "Pis a Girona ciutat."
  }
];

export const seedSystems: SystemSeed[] = [
  {
    id: "AIGUAVIVA-EL-1",
    code: "AIGUAVIVA-EL-1",
    houseId: "AIGUAVIVA",
    houseName: "Aiguaviva",
    type: "Electricitat",
    name: "Quadre elèctric principal",
    description: "Quadre general amb circuits per plantes i exteriors.",
    location: "Rebedor, darrere la porta principal.",
    instructions:
      "1) Si salta el diferencial, baixa tots els magnetos.\n2) Torna a pujar el diferencial.\n3) Puja els magnetos un a un per veure quin circuit fa saltar.",
    contactName: "Joan Serra (electricista)",
    contactPhone: "+34 600 000 001"
  },
  {
    id: "AIGUAVIVA-AG-1",
    code: "AIGUAVIVA-AG-1",
    houseId: "AIGUAVIVA",
    houseName: "Aiguaviva",
    type: "Aigua i bomba",
    name: "Bomba principal pou",
    description: "Bomba submergida que alimenta el dipòsit d'aigua.",
    location: "Sala de màquines exterior, costat del garatge.",
    instructions:
      "1) Comprova que hi ha llum.\n2) Revisa l'interruptor automàtic de la bomba.\n3) Si continua sense funcionar, truca al fontaner.",
    contactName: "Pere Font (fontaner)",
    contactPhone: "+34 600 000 002"
  },
  {
    id: "SANTANTONI-EL-1",
    code: "SANTANTONI-EL-1",
    houseId: "SANTANTONI",
    houseName: "Sant Antoni",
    type: "Electricitat",
    name: "Quadre apartament",
    description: "Quadre elèctric del pis a Sant Antoni.",
    location: "Entrada, armari petit a la dreta.",
    instructions:
      "Instruccions similars a Aiguaviva, circuits més senzills.",
    contactName: "Joan Serra (electricista)",
    contactPhone: "+34 600 000 001"
  },
  {
    id: "RUTLLA38-CLIM-1",
    code: "RUTLLA38-CLIM-1",
    houseId: "RUTLLA38",
    houseName: "RUTLLA38",
    type: "Climatització",
    name: "Bomba de calor menjador",
    description: "Split de bomba de calor al menjador.",
    location: "Pareta sobre el sofà.",
    instructions:
      "1) Utilitza el comandament a distància.\n2) Mode HEAT per calefacció, COOL per fred.\n3) Si parpelleja llum taronja, cal netejar filtres.",
    contactName: "Clima Girona",
    contactPhone: "+34 600 000 003"
  }
];

export const seedContacts: ContactSeed[] = [
  {
    id: "ELEC1",
    name: "Joan Serra",
    role: "Electricista",
    phone: "+34 600 000 001",
    email: "joan.electricista@example.com",
    notes: "Treballa principalment a zona Girona.",
    houseIds: ["AIGUAVIVA", "SANTANTONI", "RUTLLA38"]
  },
  {
    id: "FONT1",
    name: "Pere Font",
    role: "Fontaner",
    phone: "+34 600 000 002",
    notes: "Especialista en bombes i pous.",
    houseIds: ["AIGUAVIVA"]
  },
  {
    id: "CLIMA1",
    name: "Clima Girona",
    role: "Climatització",
    phone: "+34 600 000 003",
    notes: "Servei tècnic d'aires condicionats.",
    houseIds: ["RUTLLA38"]
  }
];

export const seedIncidents: IncidentSeed[] = [
  {
    id: "INC-0001",
    houseId: "AIGUAVIVA",
    houseName: "Aiguaviva",
    systemId: "AIGUAVIVA-AG-1",
    systemCode: "AIGUAVIVA-AG-1",
    title: "La bomba no arrenca",
    description:
      "Quan s'omple el dipòsit, la bomba no torna a posar-se en marxa automàticament.",
    actionTaken: "S'ha canviat el condensador de la bomba.",
    contactName: "Pere Font",
    date: "2025-01-10"
  },
  {
    id: "INC-0002",
    houseId: "SANTANTONI",
    houseName: "Sant Antoni",
    systemId: "SANTANTONI-EL-1",
    systemCode: "SANTANTONI-EL-1",
    title: "Magneto de cuina salta sovint",
    description:
      "En posar diversos electrodomèstics alhora, salta el magneto de cuina.",
    actionTaken:
      "Revisada instal·lació. Es recomana no usar forn i rentaplats alhora.",
    contactName: "Joan Serra",
    date: "2025-02-05"
  },
  {
    id: "INC-0003",
    houseId: "RUTLLA38",
    houseName: "RUTLLA38",
    systemId: "RUTLLA38-CLIM-1",
    systemCode: "RUTLLA38-CLIM-1",
    title: "Bomba de calor no escalfa prou",
    description:
      "La bomba de calor triga molt a escalfar el menjador en dies molt freds.",
    actionTaken:
      "Netejats filtres i comprovat gas. Funcionament correcte, es recomana encendre abans.",
    contactName: "Clima Girona",
    date: "2025-01-20"
  }
];

