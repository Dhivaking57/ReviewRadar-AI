
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [supabase] = useState(() => createClient());
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifyEmail() {
      const code = new URLSearchParams(
        window.location.search
      ).get("code");

      if (!code) return;

      setLoading(true);

      const { error } =
        await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setError(error.message);
      } else {
        setMode("login");
        setMessage(
          "Email verified successfully! You can now sign in."
        );
        window.history.replaceState({}, "", "/login");
      }

      setLoading(false);
    }

    verifyEmail();
  }, [supabase]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo:
                `${window.location.origin}/login`
            }
          });

        if (error) throw error;

        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setMessage(
            "Account created! Please check your email and click the verification link."
          );
        }
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });

        if (error) throw error;

        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>

        <div style={styles.logo}>
          <div style={styles.logoIcon}>Z</div>
          <span>RevZeno</span>
        </div>

        <div style={styles.heading}>
          <h1>
            {mode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h1>

          <p>
            {mode === "login"
              ? "Sign in to your customer intelligence workspace."
              : "Start turning customer voices into intelligence."}
          </p>
        </div>

        {message && (
          <div style={styles.success}>
            {message}
          </div>
        )}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label style={styles.label}>
            Email address
          </label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={styles.input}
          />

          <label style={styles.label}>
            Password
          </label>

          <div style={styles.passwordBox}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              style={styles.passwordInput}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.showButton}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submit,
              opacity: loading ? 0.65 : 1
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign in →"
                : "Create account →"}
          </button>

        </form>

        <div style={styles.switch}>
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setMessage("");
            }}
            style={styles.switchButton}
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </div>

        <p style={styles.footer}>
          Secure authentication powered by Supabase.
        </p>

      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F5F7FC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Arial, sans-serif"
  },

  card: {
    width: "100%",
    maxWidth: 430,
    background: "#FFFFFF",
    border: "1px solid #E8EAF2",
    borderRadius: 20,
    padding: "36px 28px",
    boxShadow: "0 12px 40px rgba(20,30,70,0.06)"
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 23,
    fontWeight: 800,
    color: "#182033",
    marginBottom: 38
  },

  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    background: "#6658E8",
    color: "#FFFFFF",
    display: "grid",
    placeItems: "center",
    fontSize: 22
  },

  heading: {
    marginBottom: 28
  },

  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#30384B",
    marginBottom: 9,
    marginTop: 20
  },

  headingH1: {
    fontSize: 27
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 14,
    border: "1px solid #DDE1EB",
    borderRadius: 10,
    fontSize: 15,
    outlineColor: "#6658E8"
  },

  passwordBox: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #DDE1EB",
    borderRadius: 10,
    overflow: "hidden"
  },

  passwordInput: {
    flex: 1,
    minWidth: 0,
    padding: 14,
    border: "none",
    outline: "none",
    fontSize: 15
  },

  showButton: {
    border: "none",
    background: "#FFFFFF",
    color: "#6658E8",
    padding: 12,
    cursor: "pointer"
  },

  submit: {
    width: "100%",
    padding: 15,
    marginTop: 28,
    border: "none",
    borderRadius: 10,
    background: "#6658E8",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer"
  },

  switch: {
    textAlign: "center",
    marginTop: 25,
    fontSize: 14,
    color: "#7B8498"
  },

  switchButton: {
    border: "none",
    background: "none",
    color: "#6658E8",
    fontWeight: 700,
    cursor: "pointer",
    marginLeft: 5
  },

  success: {
    background: "#E9F8F0",
    color: "#137A50",
    padding: 12,
    borderRadius: 9,
    fontSize: 14,
    marginBottom: 15
  },

  error: {
    background: "#FFF0F0",
    color: "#C43C46",
    padding: 12,
    borderRadius: 9,
    fontSize: 14,
    marginBottom: 15
  },

  footer: {
    textAlign: "center",
    color: "#9AA1B1",
    fontSize: 12,
    marginTop: 35
  }
};
