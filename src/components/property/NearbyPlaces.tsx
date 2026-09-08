import { School, Hospital, ShoppingBag, TrainFront, Plane, Building } from "lucide-react";

// Illustrative distances only — replace with real geocoded distances once
// property-level lat/lng + a places API are wired up (see Location model).
const PLACES = [
  { icon: School, label: "Reputed School", distance: "1.2 km" },
  { icon: Hospital, label: "Multi-speciality Hospital", distance: "2.4 km" },
  { icon: ShoppingBag, label: "Shopping / Market", distance: "0.8 km" },
  { icon: TrainFront, label: "Railway Station", distance: "4.1 km" },
  { icon: Building, label: "Business District", distance: "3.0 km" },
  { icon: Plane, label: "Airport", distance: "38 km" },
];

export function NearbyPlaces() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {PLACES.map((place) => (
        <div key={place.label} className="flex items-start gap-2 rounded-xl border border-navy-950/8 p-3">
          <place.icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
          <div>
            <p className="text-xs font-medium text-navy-950">{place.label}</p>
            <p className="text-xs text-slate-500">{place.distance}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
