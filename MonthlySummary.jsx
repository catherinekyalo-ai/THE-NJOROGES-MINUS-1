import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { buildMonthlySummary, getAllLabels, exportMonthlyReportToExcel } from "./lib/monthlyReport";

const fmt = (n) =>
  "KES " + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0 });

export default function MonthlySummary({ state, C }) {
  const [scope, setScope] = useState("all"); // "all" or a member id

  const summary = useMemo(
    () => buildMonthlySummary(state, scope === "all" ? null : scope),
    [state, scope]
  );
  const months = Object.keys(summary).sort().reverse();
  const labels = getAllLabels();

  return (
    <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 10, padding: "18px 20px", marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".08em", color: C.textSoft, textTransform: "uppercase" }}>
          Monthly breakdown
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            style={{
              padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.rule}`,
              fontFamily: "'Inter', sans-serif", fontSize: 12.5, background: C.white, color: C.text,
            }}
          >
            <option value="all">Whole chama</option>
            {state.members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <button
            onClick={() => exportMonthlyReportToExcel(state, state.chamaName)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: C.sage, color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 14px", fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Download size={14} /> Export to Excel
          </button>
        </div>
      </div>

      {months.length === 0 ? (
        <div style={{ fontSize: 13, color: C.textSoft, fontFamily: "'Inter', sans-serif" }}>
          No transactions recorded yet{scope !== "all" ? " for this member" : ""}.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, fontFamily: "'Inter', sans-serif" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 10px", borderBottom: `2px solid ${C.ink2}`, whiteSpace: "nowrap" }}>Month</th>
                {labels.map((l) => (
                  <th key={l} style={{ textAlign: "right", padding: "6px 10px", borderBottom: `2px solid ${C.ink2}`, whiteSpace: "nowrap", fontSize: 11, color: C.textSoft }}>
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((month) => (
                <tr key={month}>
                  <td style={{ padding: "6px 10px", borderBottom: `1px solid ${C.paper2}`, fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" }}>
                    {month}
                  </td>
                  {labels.map((l) => (
                    <td key={l} style={{ padding: "6px 10px", borderBottom: `1px solid ${C.paper2}`, textAlign: "right", whiteSpace: "nowrap" }}>
                      {summary[month][l] ? fmt(summary[month][l]) : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
