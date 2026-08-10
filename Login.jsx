import { useState } from "react";
import { PiggyBank, Mail, Lock } from "lucide-react";
import { signIn, signUp, sendPasswordReset } from "./lib/auth";

export default function Login() {
  const [mode, setMode] = useState("signin"); // signin | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else if (mode === "signup") {
        await signUp(email, password);
        setInfo("Check your email to confirm your account, then log in.");
        setMode("signin");
      } else if (mode === "forgot") {
        await sendPasswordReset(email);
        setInfo("Check your email for a password reset link.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "forgot" ? "Reset your password" : "The Njoroges";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0d9488 100%)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#ffffff",
          borderRadius: 16,
          padding: "36px 32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0d9488, #0f766e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
              boxShadow: "0 8px 20px rgba(13,148,136,0.35)",
            }}
          >
            <PiggyBank size={28} color="#fff" />
          </div>
          <h2 style={{ margin: 0, fontSize: 22, color: "#0f172a", fontWeight: 700 }}>{title}</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
            {mode === "forgot" ? "We'll email you a reset link" : "Savings & Loans Ledger"}
          </p>
        </div>

        {mode !== "forgot" && (
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4, marginBottom: 22 }}>
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(""); setInfo(""); }}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 13,
                background: mode === "signin" ? "#fff" : "transparent",
                color: mode === "signin" ? "#0f172a" : "#64748b",
                boxShadow: mode === "signin" ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 13,
                background: mode === "signup" ? "#fff" : "transparent",
                color: mode === "signup" ? "#0f172a" : "#64748b",
                boxShadow: mode === "signup" ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              Sign up
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              Gmail
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: 12 }} />
              <input
                type="email"
                required
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px 10px 36px", boxSizing: "border-box",
                  border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none",
                }}
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: 12 }} />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 12px 10px 36px", boxSizing: "border-box",
                    border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none",
                  }}
                />
              </div>
            </div>
          )}

          {mode === "signin" && (
            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => { setMode("forgot"); setError(""); setInfo(""); }}
                style={{ background: "none", border: "none", color: "#0d9488", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <div style={{ background: "#fef2f2", color: "#dc2626", fontSize: 13, padding: "8px 12px", borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
          )}
          {info && (
            <div style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 13, padding: "8px 12px", borderRadius: 8, marginBottom: 16 }}>
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: 12, border: "none", borderRadius: 10,
              background: loading ? "#94a3b8" : "linear-gradient(135deg, #0d9488, #0f766e)",
              color: "#fff", fontWeight: 700, fontSize: 14,
              cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : "0 8px 20px rgba(13,148,136,0.3)",
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "signin"
              ? "Log in"
              : mode === "signup"
              ? "Create account"
              : "Send reset link"}
          </button>

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(""); setInfo(""); }}
              style={{ width: "100%", marginTop: 12, background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer" }}
            >
              Back to login
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
