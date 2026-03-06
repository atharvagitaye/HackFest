import { Package, Handshake, Clock, Leaf, Utensils, CloudOff, Recycle, TrendingUp, TrendingDown } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Package, Handshake, Clock, Leaf, Utensils, CloudOff, Recycle,
};

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  change: string;
  positive: boolean;
}

const StatCard = ({ label, value, icon, change, positive }: StatCardProps) => {
  const Icon = iconMap[icon] || Package;
  return (
    <div className="card-elevated p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </span>
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
};

export default StatCard;
