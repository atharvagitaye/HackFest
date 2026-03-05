import { useNavigate } from "react-router-dom";
import { Leaf, Building2, Heart, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const roles = [
  {
    key: "donor",
    label: "Donor",
    description: "Restaurant, event, or institution donating surplus food",
    icon: Building2,
    path: "/dashboard",
  },
  {
    key: "recipient",
    label: "Recipient",
    description: "NGO or shelter receiving food donations",
    icon: Heart,
    path: "/dashboard",
  },
  {
    key: "admin",
    label: "Admin",
    description: "Platform administrator managing operations",
    icon: ShieldCheck,
    path: "/dashboard",
  },
];

const RoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">SurplusSync</span>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">Select Your Role</h1>
      <p className="text-muted-foreground mb-8">Choose how you'd like to use SurplusSync today.</p>

      <div className="grid gap-4 sm:grid-cols-3 w-full max-w-3xl">
        {roles.map((role) => (
          <Card
            key={role.key}
            onClick={() => navigate(role.path)}
            className="cursor-pointer border-2 border-transparent hover:border-primary transition-all duration-200 hover:shadow-md group"
          >
            <CardContent className="flex flex-col items-center text-center gap-3 p-8">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <role.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">{role.label}</h3>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoleSelect;
