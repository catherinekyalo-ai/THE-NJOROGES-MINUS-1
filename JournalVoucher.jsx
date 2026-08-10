import { X, FileText } from "lucide-react";

export default function JournalVoucher({ entry, C, onClose }) {
  if (!entry) return null;
  const fmt = (n) => "KES " + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0 });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(18,50,31,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.paper, border: `1px solid ${C.rule}`, borderRadius: 12,
          maxWidth: 420, width: "100%", padding: "24px 26px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={18} color={C.gold2} />
            <div>
              <div style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700, fontSize: 16, color: C.text }}>
                Journal Voucher
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.textSoft }}>
                {entry.date} &middot; {entry.memberName}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSoft }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.paper2 }}>
                <th style={{ textAlign: "left", padding: "8px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, textTransform: "uppercase", color: C.textSoft }}>Account</th>
                <th style={{ textAlign: "right", padding: "8px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, textTransform: "uppercase", color: C.textSoft }}>Debit</th>
                <th style={{ textAlign: "right", padding: "8px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, textTransform: "uppercase", color: C.textSoft }}>Credit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "8px 12px", borderTop: `1px solid ${C.paper2}` }}>{entry.debit}</td>
                <td style={{ padding: "8px 12px", borderTop: `1px solid ${C.paper2}`, textAlign: "right", color: C.sage, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {fmt(entry.amount)}
                </td>
                <td style={{ padding: "8px 12px", borderTop: `1px solid ${C.paper2}`, textAlign: "right" }}>—</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 12px", borderTop: `1px solid ${C.paper2}` }}>{entry.credit}</td>
                <td style={{ padding: "8px 12px", borderTop: `1px solid ${C.paper2}`, textAlign: "right" }}>—</td>
                <td style={{ padding: "8px 12px", borderTop: `1px solid ${C.paper2}`, textAlign: "right", color: C.rust, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {fmt(entry.amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ fontSize: 12.5, color: C.textSoft, marginBottom: 18, fontStyle: "italic" }}>
          {entry.explanation}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: 11, border: "none", borderRadius: 8,
            background: C.ink, color: C.paper, fontWeight: 600, fontSize: 13.5, cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
