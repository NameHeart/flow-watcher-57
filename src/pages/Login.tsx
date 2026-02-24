import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/lib/storage";
import { motion } from "framer-motion";
import { BarChart3, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Use admin / admin123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold mx-auto mb-4 shadow-gold">
            <BarChart3 className="h-7 w-7 text-card" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">VehicleFlow<span className="text-gold">PRO</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Vehicle Flow & Parking Analytics</p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Username</label>
              <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" className="h-10" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-10" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full h-10 gradient-gold text-card font-semibold shadow-gold hover:opacity-90 transition-opacity">
              <Lock className="h-4 w-4 mr-2" /> Sign In
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground text-center mt-4">Demo: admin / admin123</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
