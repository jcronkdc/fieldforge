import { useState } from "react";
import { supabaseClient } from "../../lib/supabaseClient";
import { Button } from "../ui/Button";
import clsx from "clsx";

type AuthMode = "sign-in" | "sign-up";

interface FieldErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface AuthFormProps {
  variant?: "panel" | "card";
  className?: string;
  titleSignIn?: string;
  titleSignUp?: string;
  subtitle?: string;
}

export function AuthForm({
  variant = "panel",
  className,
  titleSignIn = "Sign in to your account",
  titleSignUp = "Create your account",
  subtitle,
}: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  const resetFeedback = () => {
    setStatusMessage(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {};
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email.";
    }
    if (!password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    if (!validate()) {
      return;
    }

    setBusy(true);
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    // Demo mode - bypass Supabase when not configured
    const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (isDemoMode) {
      // Demo authentication - instant success
      if (mode === "sign-in") {
        // Accept any email/password combo for demo
        localStorage.setItem('mythatron_demo_auth', 'true');
        localStorage.setItem('mythatron_user_email', normalizedEmail);
        localStorage.setItem('mythatron_user_id', normalizedEmail.split('@')[0]);
        
        // Set initial sparks for demo users
        if (normalizedEmail === 'justincronk@pm.me') {
          // Supreme admin - unlimited everything
          localStorage.setItem('mythatron_sparks', 'Infinity');
          localStorage.setItem('mythatron_user_id', 'MythaTron');
        } else if (normalizedEmail === 'jwcronk82@gmail.com' || 
                   normalizedEmail === 'admin@mythatron.com' || 
                   normalizedEmail === 'mythatron') {
          // Regular admins - unlimited sparks
          localStorage.setItem('mythatron_sparks', 'Infinity');
        } else {
          localStorage.setItem('mythatron_sparks', '500'); // Start with 500 sparks
        }
        
        // Show success message briefly then reload
        setStatusMessage("Welcome back! Redirecting...");
        setTimeout(() => window.location.reload(), 500);
      } else {
        // Demo sign up
        localStorage.setItem('mythatron_demo_auth', 'true');
        localStorage.setItem('mythatron_user_email', normalizedEmail);
        localStorage.setItem('mythatron_user_id', normalizedEmail.split('@')[0]);
        localStorage.setItem('mythatron_sparks', '500');
        setStatusMessage("Demo account created! Redirecting...");
        setTimeout(() => window.location.reload(), 500);
      }
      return;
    }

    try {
      if (mode === "sign-in") {
        const { error } = await supabaseClient.auth.signInWithPassword({
          email: normalizedEmail,
          password: normalizedPassword,
        });
        if (error) {
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            setErrors({ general: "Email or password is incorrect." });
          } else {
            setErrors({ general: error.message });
          }
        }
      } else {
        const { error, data } = await supabaseClient.auth.signUp({
          email: normalizedEmail,
          password: normalizedPassword,
        });
        if (error) {
          setErrors({ general: error.message });
        } else if (data.session) {
          setStatusMessage("Account created! You are now signed in.");
        } else {
          setStatusMessage("Check your inbox to confirm the email we just sent.");
        }
      }
    } catch (error) {
      console.error("[auth] submit error", error);
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const toggleMode = () => {
    resetFeedback();
    setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
  };

  const containerClasses =
    variant === "panel"
      ? "flex flex-col gap-6 p-8"
      : "flex flex-col gap-6 rounded-3xl border border-slate-800 bg-black/40 p-8 shadow-xl shadow-aurora/20 backdrop-blur";

  const heading = mode === "sign-in" ? titleSignIn : titleSignUp;

  return (
    <form className={clsx(containerClasses, className)} onSubmit={handleSubmit}>
      <div className="flex justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-white">{heading}</h2>
          {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={toggleMode}>
          {mode === "sign-in" ? "Need an account?" : "Already have an account?"}
        </Button>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-200">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            aria-describedby={errors.email ? "email-error" : undefined}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-sm text-white shadow-inner focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
          />
        </label>
        {errors.email ? <p id="email-error" role="alert" className="text-xs text-rose-400">{errors.email}</p> : null}

        <label className="block text-sm font-medium text-slate-200">
          Password
          <input
            type="password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            aria-label="Password"
            aria-describedby={errors.password ? "password-error" : undefined}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-black/60 px-4 py-3 text-sm text-white shadow-inner focus:border-aurora focus:outline-none focus:ring-2 focus:ring-aurora/40"
          />
        </label>
        {errors.password ? <p id="password-error" role="alert" className="text-xs text-rose-400">{errors.password}</p> : null}
      </div>

      <div className="flex flex-col gap-3">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "One sec..." : mode === "sign-in" ? "Sign In" : "Create Account"}
        </Button>
        {errors.general ? <p role="alert" className="text-xs text-rose-400">{errors.general}</p> : null}
        {statusMessage ? <p role="status" className="text-xs text-aurora-200">{statusMessage}</p> : null}
      </div>
    </form>
  );
}


