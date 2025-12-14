// src/utils/houseColors.ts

// AIGUAVIVA → verd
// SANTANTONI → blau
// RUTLLA38  → taronja

export function getHousePillClasses(houseId: string | undefined) {
  switch (houseId) {
    case "AIGUAVIVA":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    case "SANTANTONI":
      return "bg-sky-100 text-sky-800 border border-sky-200";
    case "RUTLLA38":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
}

export function getHouseTextClasses(houseId: string | undefined) {
  switch (houseId) {
    case "AIGUAVIVA":
      return "text-emerald-700";
    case "SANTANTONI":
      return "text-sky-700";
    case "RUTLLA38":
      return "text-amber-700";
    default:
      return "text-slate-700";
  }
}
