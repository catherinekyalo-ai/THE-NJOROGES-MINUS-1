import { useState } from "react";
import { Lock } from "lucide-react";
import { updatePassword } from "./lib/auth";

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

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
          background: "#fff",
          borderRadius: 16,
          padding: "36px 32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 20, color: "#0f172a" }}>Set a new password</h2>
        {success ? (
          <>
            <div style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 13, padding: "10px 12px", borderRadius: 8, marginBottom: 16 }}>
              Password updated. You can log in now.
            </div>
            <button
              onClick={onDone}
              style={{ width: "100%", padding: 12, border: "none", borderRadius: 10, background: "#0d9488", color: "#fff", fontWeight: 700, cursor: "pointer" }}
            >
              Go to login
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                New password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: 12 }} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px 10px 36px", boxSizing: "border-box", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14 }}
                />
              </div>
            </div>
            {error && (
              <div style={{ background: "#fef2f2", color: "#dc2626", fontSize: 13, padding: "8px 12px", borderRadius: 8, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: 12, border: "none", borderRadius: 10, background: loading ? "#94a3b8" : "#0d9488", color: "#fff", fontWeight: 700, cursor: loading ? "default" : "pointer" }}
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
