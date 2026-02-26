import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/lib/storage";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Use admin / admin123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src={logoImg}
            alt="Thana City Country Club"
            className="h-28 sm:h-36 w-auto mx-auto mb-5 object-contain"
            style={{ imageRendering: "auto" }}
          />
          <p className="text-sm text-muted-foreground mt-1">Vehicle Flow & Parking Analytics</p>
        </div>

        <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="h-10"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full h-10 gradient-gold text-card font-semibold shadow-gold hover:opacity-90 transition-opacity"
            >
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
