"use client";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Aurora from "@/components/ui/aurora";
import { TextGenerateLoop } from "@/components/ui/text-generate-loop";
import { useLogin } from "./hooks/useLogin";
import { useRedirectIfAuth } from "./hooks/useAuthGuard";
export default function Home() {
  // All logic comes from the hook — page is pure UI
  const { isChecking } = useRedirectIfAuth();
  const {
    identifier, setIdentifier,
    password, setPassword,
    loading, error,
    handleSubmit,
  } = useLogin();
  if (isChecking) return null;
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Aurora Background - sits behind everything */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          amplitude={1.2}
          blend={0.6}
          speed={0.5}
        />
      </div>

      {/* Glass Card - sits on top of the aurora */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 glass-card">
        {/* Text Generate Loop */}
        <TextGenerateLoop words="Welcome Back" pauseMs={1000} className="text-3xl font-bold text-white mb-2 text-center" />
        <p className="text-sm text-neutral-400 mb-8 text-center">Sign in to your account</p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            {/* Username or Email */}
            <Label htmlFor="identifier">Username or Email</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="johndoe or john@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {/* Sign In Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={loading ? {} : {
              scale: 1.04,
              boxShadow: "0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)",
            }}
            whileTap={loading ? {} : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`w-full h-11 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-lg
                       transition-colors duration-300
                       shadow-lg shadow-purple-500/25
                       ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </motion.button>

        </form>
      </div>
    </main>
  );
}