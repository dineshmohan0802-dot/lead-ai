import { useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles, ArrowRight, Mail, Lock, Github } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up - Supabase requires email confirmation by default
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: email.split("@")[0],
            },
          },
        });
        
        if (error) {
          console.error("Sign up error:", error);
          throw error;
        }

        // Show appropriate message based on response
        if (data?.user?.identities?.length === 0) {
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(""); // Clear any previous errors
          // Show success message
          alert(
            "Sign up successful! You may receive a confirmation email (check spam folder). You can now try signing in."
          );
          setEmail("");
          setPassword("");
          setIsSignUp(false);
        }
      } else {
        // Sign in
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Sign in error:", error);
          throw error;
        }

        if (data?.session) {
          // Redirect to dashboard
          navigate("/");
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      
      // Provide user-friendly error messages
      let userMessage = err.message || "An error occurred";
      
      if (err.status === 400) {
        userMessage =
          "Invalid email or password. Make sure email is valid and password is at least 6 characters.";
      } else if (err.status === 429) {
        userMessage =
          "Too many login attempts. Please wait a few minutes before trying again.";
      } else if (err.message?.includes("already registered")) {
        userMessage = "This email is already registered. Please sign in instead.";
      } else if (err.message?.includes("Invalid login credentials")) {
        userMessage = "Invalid email or password. Please try again.";
      }
      
      setError(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    }
  };

  const handleGithubSignIn = async () => {
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "GitHub sign-in failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0A0E1A]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 via-transparent to-[#7B61FF]/5" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#00D4FF]" />
            </div>
            <span className="font-['Space_Grotesk'] font-medium text-[15px] text-[#F0F4F8]">
              LeadNexus
            </span>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] font-medium text-[32px] text-[#F0F4F8] leading-[1.2]">
              Turn social signals into
              <br />
              <span className="text-[#00D4FF]">revenue pipeline</span>
            </h2>
            <p className="text-[14px] text-[#8B95A5] mt-4 max-w-[400px] leading-relaxed">
              Join 2,000+ sales teams using AI to discover high-intent prospects
              across Reddit, LinkedIn, Twitter, and GitHub.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {["/avatar-1.jpg", "/avatar-2.jpg", "/avatar-3.jpg"].map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="w-8 h-8 rounded-full border-2 border-[#0A0E1A] object-cover"
                />
              ))}
            </div>
            <p className="text-[12px] text-[#8B95A5]">
              Trusted by revenue teams worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center bg-[#0A0E1A] p-6">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#00D4FF]" />
            </div>
            <span className="font-['Space_Grotesk'] font-medium text-[15px] text-[#F0F4F8]">
              LeadNexus
            </span>
          </div>

          <h1 className="font-['Space_Grotesk'] font-medium text-[24px] text-[#F0F4F8] text-center">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-[13px] text-[#8B95A5] text-center mt-2">
            {isSignUp
              ? "Start your 14-day free trial"
              : "Sign in to your account"}
          </p>

          {/* OAuth Buttons */}
          <div className="space-y-2 mt-8">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#F0F4F8] font-medium text-[14px] hover:bg-white/[0.08] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            <button
              onClick={handleGithubSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[#F0F4F8] font-medium text-[14px] hover:bg-white/[0.08] transition-colors"
            >
              <Github className="w-4 h-4" />
              Continue with GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[1px] bg-white/[0.06]" />
            <span className="text-[11px] text-[#4A5568] uppercase tracking-wide">
              or continue with email
            </span>
            <div className="flex-1 h-[1px] bg-white/[0.06]" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
                {error}
              </div>
            )}
            <div>
              <label className="text-[12px] text-[#8B95A5] mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#00D4FF]/30"
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] text-[#8B95A5] mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] text-[#F0F4F8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#00D4FF]/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#00D4FF] text-[#0A0E1A] font-medium text-[14px] hover:bg-[#33DDFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0A0E1A]/20 border-t-[#0A0E1A] rounded-full animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>
                  {isSignUp ? "Create account" : "Sign in"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[13px] text-[#8B95A5] text-center">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-[#00D4FF] hover:underline ml-1"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
