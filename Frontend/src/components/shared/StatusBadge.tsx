import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";

interface StatusBadgeProps {
  urgency: "urgent" | "moderate" | "low" | string;
}

const StatusBadge = ({ urgency }: StatusBadgeProps) => {
  const config = {
    urgent: { className: "badge-urgent", icon: AlertCircle, label: "URGENT PICKUP" },
    moderate: { className: "badge-moderate", icon: AlertTriangle, label: "MODERATE URGENCY" },
    low: { className: "badge-low", icon: CheckCircle, label: "LOW URGENCY" },
  };

  const { className, icon: Icon, label } = config[urgency as keyof typeof config] || config.low;

  return (
    <span className={className}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

export default StatusBadge;
