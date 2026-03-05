import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

// Fix broken default marker icons in Vite/webpack builds
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
});

const MARKER_COLORS: Record<string, string> = {
  donation: "#f59e0b",
  ngo:      "#22c55e",
  truck:    "#3b82f6",
};

function makeIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:28px;height:28px;border-radius:50% 50% 50% 0;
        background:${color};border:2px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
        transform:rotate(-45deg);
      "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

export interface Marker {
  id: number;
  type: string;
  name: string;
  lat: number;
  lng: number;
  status?: string;
}

interface MapWidgetProps {
  markers?: Marker[];
  className?: string;
  onMarkerClick?: (marker: Marker) => void;
  fullScreen?: boolean;
}

// Recenter map when markers change
function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

// Default center: New York City (matches seed data)
const NYC: [number, number] = [40.73, -73.93];

const MapWidget = ({ markers = [], className = "", onMarkerClick, fullScreen }: MapWidgetProps) => {
  const validMarkers = markers.filter((m) => m.lat !== 0 || m.lng !== 0);

  // Auto-center on the first valid marker, otherwise NYC
  const center: [number, number] =
    validMarkers.length > 0
      ? [validMarkers[0].lat, validMarkers[0].lng]
      : NYC;

  return (
    <div className={`overflow-hidden rounded-xl ${fullScreen ? "h-full" : "h-80"} ${className}`}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} />
        {validMarkers.map((marker) => {
          const color = MARKER_COLORS[marker.type] ?? MARKER_COLORS.donation;
          return (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={makeIcon(color)}
              eventHandlers={{ click: () => onMarkerClick?.(marker) }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{marker.name}</p>
                  {marker.status && (
                    <p className="text-xs text-gray-500 uppercase">{marker.status}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapWidget;
