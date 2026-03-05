import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Leaf, Building2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import communityKitchen from "@/assets/community-kitchen.jpg";

const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [form, setForm] = useState({
    orgName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.orgName.trim()) errs.orgName = "Organization name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Minimum 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (!form.role) errs.role = "Please select a role";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const roleMap: Record<string, 'DONOR' | 'RECIPIENT' | 'ADMIN'> = {
        donor: 'DONOR',
        recipient: 'RECIPIENT',
        admin: 'ADMIN',
      };
      const { token, user } = await authApi.register({
        name: form.orgName,
        email: form.email,
        password: form.password,
        role: roleMap[form.role] ?? 'DONOR',
        phone: form.phone || undefined,
      });
      setAuth(token, user);
      toast.success('Account created! Welcome to SurplusSync.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (key: string) =>
    errors[key] ? <p className="text-sm text-destructive">{errors[key]}</p> : null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-7">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SurplusSync</span>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Your Organization Account</h1>
            <p className="text-muted-foreground mt-1">
              Join SurplusSync to donate or receive surplus food.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Org Name */}
            <div className="space-y-1.5">
              <Label htmlFor="orgName">Organization Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="orgName" placeholder="Green Harvest NGO" value={form.orgName} onChange={set("orgName")} className="pl-10" />
              </div>
              {fieldError("orgName")}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="contact@organization.com" value={form.email} onChange={set("email")} className="pl-10" />
              </div>
              {fieldError("email")}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set("phone")} className="pl-10" />
              </div>
              {fieldError("phone")}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="donor">Donor (Restaurant / Event / Institution)</SelectItem>
                  <SelectItem value="recipient">Recipient (NGO / Shelter)</SelectItem>
                </SelectContent>
              </Select>
              {fieldError("role")}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={set("password")} className="pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldError("password")}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="••••••••" value={form.confirmPassword} onChange={set("confirmPassword")} className="pl-10 pr-10" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldError("confirmPassword")}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Photo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={communityKitchen}
          alt="Community kitchen preparing meals"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-primary-foreground">
          <h2 className="text-3xl font-bold leading-tight mb-3">
            Feed Communities,&nbsp;Not Landfills
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Join hundreds of organizations making a difference through smart food redistribution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
