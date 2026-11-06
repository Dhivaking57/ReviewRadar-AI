
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
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) throw error;

        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setMessage(
            "Account created! Check your email and click the verification link."
          );
        }
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
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

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPassword("");
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">

        {/* LEFT BRAND PANEL */}
        <aside className="brand-panel">
          <div className="brand-top">
            <div className="brand-logo">R</div>
            <span className="brand-name">RevZeno</span>
          </div>

          <div className="brand-content">
            <div className="eyebrow">
              <span className="live-dot" />
              CUSTOMER INTELLIGENCE PLATFORM
            </div>

            <h1>
              Every review
              <br />
              tells a <span>story.</span>
            </h1>

            <p className="brand-description">
              Turn customer feedback into clarity.
              Discover what people love, what needs
              fixing, and what to build next.
            </p>

            <div className="insight-card">
              <div className="insight-header">
                <div>
                  <span className="small-label">
                    CUSTOMER INSIGHTS
                  </span>
                  <h3>Feedback overview</h3>
                </div>
                <span className="insight-icon">↗</span>
              </div>

              <div className="insight-stats">
                <div>
                  <strong>Positive</strong>
                  <span className="stat-value">↗</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill positive" />
                </div>

                <div>
                  <strong>Needs attention</strong>
                  <span className="stat-value">↗</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill attention" />
                </div>

                <div>
                  <strong>Feature requests</strong>
                  <span className="stat-value">✦</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill features" />
                </div>
              </div>

              <div className="insight-bottom">
                <span className="mini-dot" />
                Your feedback, made actionable.
              </div>
            </div>
          </div>

          <div className="brand-bottom">
            <span>Built for people who listen.</span>
            <span>© 2026 RevZeno</span>
          </div>
        </aside>

        {/* RIGHT AUTH PANEL */}
        <section className="form-panel">
          <div className="mobile-brand">
            <div className="brand-logo">R</div>
            <span className="brand-name">RevZeno</span>
          </div>

          <div className="form-container">

            <div className="form-heading">
              <span className="form-eyebrow">
                YOUR WORKSPACE
              </span>

              <h2>
                {mode === "login"
                  ? "Welcome back."
                  : "Create your account."}
              </h2>

              <p>
                {mode === "login"
                  ? "Sign in to continue your customer intelligence journey."
                  : "Start understanding your customers better."}
              </p>
            </div>

            <div className="mode-switch">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => switchMode("login")}
              >
                Sign in
              </button>

              <button
                type="button"
                className={mode === "signup" ? "active" : ""}
                onClick={() => switchMode("signup")}
              >
                Create account
              </button>
            </div>

            {message && (
              <div className="notice success-notice">
                <span>✓</span>
                <p>{message}</p>
              </div>
            )}

            {error && (
              <div className="notice error-notice">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Email address</label>

              <div className="input-wrap">
                <span className="input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <label htmlFor="password">Password</label>

              <div className="input-wrap">
                <span className="input-icon">⌑</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {mode === "signup" && (
                <p className="password-hint">
                  Use at least 8 characters.
                </p>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Sign in to RevZeno"
                    : "Create your account"}

                {!loading && <span>→</span>}
              </button>
            </form>

            <div className="secure-note">
              <span>▣</span>
              Your account is protected with secure authentication.
            </div>
          </div>

          <div className="form-footer">
            <span>RevZeno</span>
            <span>Customer intelligence, simplified.</span>
          </div>
        </section>
      </section>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f5f6fb;
          font-family: Arial, Helvetica, sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        .auth-page {
          min-height: 100vh;
          min-height: 100dvh;
          padding: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 10% 10%, #e9e8ff, transparent 35%),
            #f5f6fb;
        }

        .auth-shell {
          width: 100%;
          max-width: 1120px;
          min-height: 690px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #fff;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 25px 80px rgba(25, 30, 65, 0.12);
          border: 1px solid #e9eaf2;
        }

        .brand-panel {
          padding: 42px;
          color: white;
          background:
            radial-gradient(circle at 85% 15%, rgba(125, 105, 255, .35), transparent 35%),
            linear-gradient(145deg, #11152d, #1c2050 65%, #28205d);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .brand-panel::after {
          content: "";
          position: absolute;
          width: 330px;
          height: 330px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 50%;
          right: -180px;
          bottom: -120px;
          box-shadow: 0 0 0 35px rgba(255,255,255,.025),
                      0 0 0 70px rgba(255,255,255,.02);
          pointer-events: none;
        }

        .brand-top,
        .mobile-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          color: white;
          font-size: 23px;
          font-weight: 800;
          background: linear-gradient(135deg, #8875ff, #5b4be0);
          box-shadow: 0 7px 22px rgba(104, 85, 240, .3);
        }

        .brand-name {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -.7px;
        }

        .brand-content {
          max-width: 440px;
          margin: 65px auto;
          width: 100%;
        }

        .eyebrow,
        .form-eyebrow,
        .small-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .eyebrow {
          color: #b7afff;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .live-dot,
        .mini-dot {
          width: 7px;
          height: 7px;
          display: inline-block;
          border-radius: 50%;
          background: #8bdeba;
        }

        .brand-content h1 {
          font-size: clamp(38px, 4vw, 54px);
          line-height: 1.1;
          letter-spacing: -2.4px;
          margin: 25px 0 18px;
        }

        .brand-content h1 span {
          color: #a99bff;
        }

        .brand-description {
          color: #c3c5da;
          font-size: 14px;
          line-height: 1.8;
          max-width: 390px;
        }

        .insight-card {
          margin-top: 38px;
          padding: 23px;
          border-radius: 17px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.075);
          backdrop-filter: blur(12px);
        }

        .insight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .small-label {
          color: #aaa5d5;
          font-size: 9px;
        }

        .insight-header h3 {
          font-size: 16px;
          margin: 8px 0 0;
        }

        .insight-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.12);
          color: #b9adff;
        }

        .insight-stats {
          margin-top: 22px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 9px 12px;
          align-items: center;
          font-size: 11px;
          color: #d6d5e8;
        }

        .stat-value {
          color: #a9a0ff;
        }

        .progress-track {
          grid-column: 1 / -1;
          height: 5px;
          border-radius: 10px;
          background: rgba(255,255,255,.12);
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          border-radius: 10px;
        }

        .positive {
          width: 82%;
          background: #8bd9b7;
        }

        .attention {
          width: 48%;
          background: #f4c47a;
        }

        .features {
          width: 65%;
          background: #a99bff;
        }

        .insight-bottom {
          border-top: 1px solid rgba(255,255,255,.12);
          padding-top: 15px;
          margin-top: 9px;
          color: #bfc0d5;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .brand-bottom {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #999bb9;
          font-size: 10px;
        }

        .form-panel {
          padding: 45px 55px 25px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #fff;
        }

        .mobile-brand {
          display: none;
        }

        .form-container {
          width: 100%;
          max-width: 390px;
          margin: auto;
        }

        .form-eyebrow {
          color: #7766e9;
          font-size: 10px;
        }

        .form-heading h2 {
          margin: 14px 0 10px;
          color: #191d32;
          font-size: 34px;
          letter-spacing: -1.3px;
        }

        .form-heading p {
          margin: 0;
          color: #85899b;
          font-size: 13px;
          line-height: 1.7;
        }

        .mode-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 5px;
          margin: 32px 0 25px;
          background: #f3f3f9;
          border-radius: 11px;
        }

        .mode-switch button {
          border: 0;
          padding: 12px 5px;
          border-radius: 8px;
          color: #81869a;
          background: transparent;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          transition: .2s ease;
        }

        .mode-switch button.active {
          background: white;
          color: #5e50d5;
          box-shadow: 0 2px 8px rgba(20,20,50,.08);
        }

        .form-container form label {
          display: block;
          margin: 19px 0 9px;
          color: #30344a;
          font-size: 12px;
          font-weight: 700;
        }

        .input-wrap {
          display: flex;
          align-items: center;
          gap: 11px;
          height: 51px;
          padding: 0 14px;
          border: 1px solid #e1e3ec;
          border-radius: 10px;
          background: #fff;
          transition: .2s ease;
        }

        .input-wrap:focus-within {
          border-color: #7969ec;
          box-shadow: 0 0 0 3px rgba(121,105,236,.11);
        }

        .input-icon {
          color: #9995b6;
          font-size: 16px;
        }

        .input-wrap input {
          flex: 1;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: none;
          background: transparent;
          color: #252940;
          font-size: 13px;
        }

        .input-wrap input::placeholder {
          color: #b0b3c0;
        }

        .password-toggle {
          border: 0;
          background: transparent;
          color: #7163dc;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          padding: 8px 0 8px 8px;
        }

        .password-hint {
          margin: 8px 0 0;
          color: #999bad;
          font-size: 10px;
        }

        .submit-button {
          width: 100%;
          min-height: 52px;
          margin-top: 29px;
          padding: 0 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 0;
          border-radius: 10px;
          color: white;
          background: linear-gradient(100deg, #6555df, #8069ed);
          box-shadow: 0 8px 20px rgba(105,87,222,.2);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s ease;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(105,87,222,.28);
        }

        .submit-button:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .notice {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 12px;
          border-radius: 9px;
          margin-bottom: 15px;
          font-size: 12px;
          line-height: 1.5;
        }

        .notice p {
          margin: 0;
        }

        .success-notice {
          background: #ecf9f2;
          color: #19734d;
        }

        .error-notice {
          background: #fff0f0;
          color: #b93643;
        }

        .secure-note {
          margin-top: 27px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          color: #999bad;
          font-size: 10px;
          text-align: center;
        }

        .secure-note span {
          color: #6b5ce0;
        }

        .form-footer {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          color: #a1a4b2;
          font-size: 10px;
        }

        .form-footer span:first-child {
          color: #77708e;
          font-weight: 800;
        }

        @media (max-width: 800px) {
          .auth-page {
            padding: 16px;
            align-items: flex-start;
          }

          .auth-shell {
            max-width: 520px;
            min-height: calc(100vh - 32px);
            min-height: calc(100dvh - 32px);
            grid-template-columns: 1fr;
            border-radius: 19px;
          }

          .brand-panel {
            display: none;
          }

          .form-panel {
            padding: 25px 25px 20px;
          }

          .mobile-brand {
            display: flex;
            margin-bottom: 45px;
          }

          .form-container {
            max-width: 420px;
            margin: auto;
          }

          .form-heading h2 {
            font-size: 30px;
          }

          .form-footer {
            margin-top: 45px;
          }
        }

        @media (max-width: 380px) {
          .form-panel {
            padding-left: 18px;
            padding-right: 18px;
          }

          .form-heading h2 {
            font-size: 27px;
          }

          .mode-switch button {
            font-size: 11px;
          }
        }
      `}</style>
    </main>
  );
}
