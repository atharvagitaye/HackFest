import { Truck, UtensilsCrossed, Home, Plus, Minus } from "lucide-react";
import mapPreview from "@/assets/map-preview.jpg";

interface Marker {
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

const markerIcons: Record<string, { icon: React.ElementType; bg: string }> = {
  donation: { icon: UtensilsCrossed, bg: "bg-warning" },
  ngo: { icon: Home, bg: "bg-primary" },
  truck: { icon: Truck, bg: "bg-primary" },
};

const MapWidget = ({ markers = [], className = "", onMarkerClick, fullScreen }: MapWidgetProps) => {
  return (
    <div className={`relative overflow-hidden rounded-xl ${fullScreen ? "h-full" : "h-80"} ${className}`}>
      <img src={mapPreview} alt="Map" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-foreground/5" />
      
      {markers.map((marker) => {
        const config = markerIcons[marker.type] || markerIcons.donation;
        const Icon = config.icon;
        return (
          <button
            key={marker.id}
            onClick={() => onMarkerClick?.(marker)}
            className={`absolute ${config.bg} p-2 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer`}
            style={{ left: `${marker.lng}%`, top: `${marker.lat}%`, transform: "translate(-50%, -50%)" }}
          >
            <Icon className="w-4 h-4 text-primary-foreground" />
          </button>
        );
      })}

      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button className="w-8 h-8 bg-card rounded-lg shadow-md flex items-center justify-center hover:bg-muted transition-colors">
          <Plus className="w-4 h-4 text-foreground" />
        </button>
        <button className="w-8 h-8 bg-card rounded-lg shadow-md flex items-center justify-center hover:bg-muted transition-colors">
          <Minus className="w-4 h-4 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default MapWidget;
