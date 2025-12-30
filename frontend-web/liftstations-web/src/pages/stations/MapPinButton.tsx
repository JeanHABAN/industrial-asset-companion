import { useMemo, type MouseEvent } from "react";
import { MapPin } from "lucide-react";
import { toast } from "react-hot-toast";

export type LiftStation = {
  id: string;
  code: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
};

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function buildDestination(station: LiftStation): string | null {
  const { latitude, longitude, address, name } = station;

  if (
    typeof latitude === "number" &&
    !Number.isNaN(latitude) &&
    typeof longitude === "number" &&
    !Number.isNaN(longitude)
  ) {
    return `${latitude},${longitude}`;
  }
  if (address && address.trim().length > 3) {
    return encodeURIComponent(address.trim());
  }
  if (name && name.trim().length > 1) {
    return encodeURIComponent(name.trim());
  }
  return null;
}

function openDirections(station: LiftStation) {
  const dest = buildDestination(station);
  if (!dest) return;

  if (isIOS()) {
    window.open(`maps://?daddr=${dest}`, "_blank");
  } else {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
      "_blank",
      "noopener"
    );
  }
}

export default function MapPinButton({ station }: { station: LiftStation }) {
  const canNavigate = useMemo(() => !!buildDestination(station), [station]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (canNavigate) openDirections(station);
    else toast.error("Location unavailable: no coordinates or address set.");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={canNavigate ? "Open directions" : "Location unavailable"}
      aria-label="Open directions"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg
                  text-sky-300 hover:text-white
                  hover:bg-sky-600/20
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
                  focus-visible:ring-offset-2 ring-offset-slate-950
                  ${!canNavigate ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <MapPin className="h-5 w-5" />
    </button>
  );
}
