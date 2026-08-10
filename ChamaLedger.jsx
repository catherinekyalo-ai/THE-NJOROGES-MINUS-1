import { useState, useEffect } from "react";
import { PiggyBank, Landmark, Plus, X, Users } from "lucide-react";
import { loadLedger, addMember as apiAddMember, deleteMember as apiDeleteMember, addEntry as apiAddEntry, deleteEntry as apiDeleteEntry } from "./lib/ledgerStore";

const fmt = (n) => {
  const sign = n < 0 ? "-" : "";
  return sign + "KES " + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 0 });
};

const SAVINGS_TYPES = [
  { value: "payment", label: "Payment" },
  { value: "interest", label: "Interest received" },
  { value: "deduction", label: "Deduction" },
];
const LOAN_TYPES = [
  { value: "disbursed", label: "Loan disbursed" },
  { value: "interest", label: "Interest charged" },
  { value: "repayment", label: "Repayment" },
];

function computeBalances(txns, acct) {
  let bal = 0;
  const decreasers = acct === "savings" ? ["deduction"] : ["repayment"];
  return txns
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => {
      if (decreasers.includes(t.type)) bal -= Number(t.amount);
      else bal += Number(t.amount);
      return { ...t, balance: bal };
    });
}

const C = {
  ink: "#12321f",
  ink2: "#1c4a2c",
  paper: "#f1e7d2",
  paper2: "#e9dbb9",
  rule: "#cdb887",
  gold: "#b5842a",
  gold2: "#8f6a1f",
  rust: "#a23a2c",
  sage: "#3f7350",
  steel: "#3a5a78",
  steel2: "#2c4a63",
  text: "#20281f",
  textSoft: "#5c5648",
  white: "#fffdf7",
};


function StatCard({ icon, label, value, color, C }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", color }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.textSoft, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>
        <div style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700, fontSize: 18, color: C.text }}>{value}</div>
      </div>
    </div>
  );
}

function DashboardSummary({ members, savingsBalance, loanOwed, totalSavings, totalLoans, C, fmt }) {
  const maxVal = Math.max(1, ...members.map((m) => Math.max(savingsBalance(m.id), loanOwed(m.id))));
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard icon={<PiggyBank size={18} />} label="Total Savings" value={fmt(totalSavings)} color={C.sage} C={C} />
        <StatCard icon={<Landmark size={18} />} label="Loans Outstanding" value={fmt(totalLoans)} color={C.rust} C={C} />
        <StatCard icon={<Users size={18} />} label="Members" value={members.length} color={C.steel} C={C} />
      </div>
      {members.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".08em", color: C.textSoft, textTransform: "uppercase", marginBottom: 12 }}>
              Savings by member
            </div>
            {members.map((m) => {
              const bal = savingsBalance(m.id);
              const pct = Math.max(2, (bal / maxVal) * 100);
              return (
                <div key={m.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "'Inter', sans-serif", marginBottom: 3 }}>
                    <span style={{ color: C.text }}>{m.name}</span>
                    <span style={{ color: C.sage, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(bal)}</span>
                  </div>
                  <div style={{ height: 7, background: C.paper2, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: C.sage, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".08em", color: C.textSoft, textTransform: "uppercase", marginBottom: 12 }}>
              Loans owed by member
            </div>
            {members.filter((m) => loanOwed(m.id) > 0).length === 0 ? (
              <div style={{ fontSize: 12, color: C.textSoft, fontFamily: "'Inter', sans-serif" }}>No outstanding loans.</div>
            ) : (
              members.map((m) => {
                const owed = loanOwed(m.id);
                if (owed <= 0) return null;
                const pct = Math.max(2, (owed / maxVal) * 100);
                return (
                  <div key={m.id} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "'Inter', sans-serif", marginBottom: 3 }}>
                      <span style={{ color: C.text }}>{m.name}</span>
                      <span style={{ color: C.rust, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(owed)}</span>
                    </div>
                    <div style={{ height: 7, background: C.paper2, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: pct + "%", background: C.rust, borderRadius: 4 }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChamaLedger() {
  const [state, setState] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [accountView, setAccountView] = useState("savings");
  const [form, setForm] = useState({ date: "", type: "payment", amount: "", note: "" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@500;700;900&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const refresh = async () => {
    try {
      const data = await loadLedger();
      setState(data);
      setSelectedMember((prev) => prev && data.members.some((m) => m.id === prev) ? prev : data.members[0]?.id || null);
    } catch (e) {
      console.error(e);
      setErr("Couldn't load the ledger. Check your Supabase URL/key and that the schema has been run.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    setForm({ date: "", type: accountView === "savings" ? "payment" : "disbursed", amount: "", note: "" });
  }, [accountView, selectedMember]);

  if (loading) {
    return (
      <div style={{ background: C.ink, minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.paper, fontSize: 13 }}>Loading ledger…</span>
      </div>
    );
  }
  if (err) {
    return (
      <div style={{ background: C.ink, minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#e2a89a", fontSize: 13, textAlign: "center" }}>{err}</span>
      </div>
    );
  }

  const sortedTxns = (memberId, acct) => state.transactions[memberId]?.[acct] || [];
  const savingsBalance = (id) => computeBalances(sortedTxns(id, "savings"), "savings").slice(-1)[0]?.balance || 0;
  const loanOwed = (id) => computeBalances(sortedTxns(id, "loans"), "loans").slice(-1)[0]?.balance || 0;
  const groupSavings = () => state.members.reduce((s, m) => s + savingsBalance(m.id), 0);
  const groupLoans = () => state.members.reduce((s, m) => s + loanOwed(m.id), 0);

  const handleAddMember = async () => {
    const name = window.prompt("Member name:");
    if (!name) return;
    const phone = window.prompt("Phone number (optional):") || "";
    try {
      const m = await apiAddMember(name.trim(), phone.trim());
      setSelectedMember(m.id);
      await refresh();
    } catch (e) {
      console.error(e);
      window.alert("Couldn't add member. Check the console for details.");
    }
  };

  const handleDeleteMember = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Remove this member and their records?")) return;
    try {
      await apiDeleteMember(id);
      if (selectedMember === id) setSelectedMember(null);
      await refresh();
    } catch (e2) {
      console.error(e2);
      window.alert("Couldn't remove member.");
    }
  };

  const handleAddEntry = async () => {
    if (!form.date || !form.amount || Number(form.amount) <= 0) {
      window.alert("Please enter a valid date and amount.");
      return;
    }
    try {
      await apiAddEntry(selectedMember, accountView, {
        date: form.date,
        type: form.type,
        amount: Number(form.amount),
        note: form.note.trim(),
      });
      setForm({ date: "", type: accountView === "savings" ? "payment" : "disbursed", amount: "", note: "" });
      await refresh();
    } catch (e) {
      console.error(e);
      window.alert("Couldn't add entry.");
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await apiDeleteEntry(entryId);
      await refresh();
    } catch (e) {
      console.error(e);
      window.alert("Couldn't delete entry.");
    }
  };

  const member = state.members.find((m) => m.id === selectedMember);
  const txns = member ? computeBalances(sortedTxns(member.id, accountView), accountView) : [];
  const typeOptions = accountView === "savings" ? SAVINGS_TYPES : LOAN_TYPES;
  const isDecrease = (type) => (accountView === "savings" ? type === "deduction" : type === "repayment");
  const amtColor = (type) => {
    if (type === "payment" || type === "repayment") return C.sage;
    if (type === "interest") return C.gold2;
    return C.rust;
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: C.text, minHeight: 640 }}>
      <style>{`
        .member-row:hover .del-btn{ opacity:.7; }
        .member-row:hover{ transform: translateX(-3px); }
        .lentry-row:hover{ background: rgba(255,255,255,.45); }
        .del-btn:hover{ opacity:1 !important; }
      `}</style>

      <div className="flex flex-col md:flex-row" style={{ minHeight: 640 }}>
        <div
          className="flex md:flex-col flex-row overflow-x-auto md:overflow-visible"
          style={{ background: C.ink, width: "100%", maxWidth: 240, flexShrink: 0, padding: "28px 0 28px 18px", borderRight: `6px solid ${C.gold}` }}
        >
          <div className="hidden md:block" style={{ color: C.paper, padding: "0 18px 22px 6px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: C.gold, textTransform: "uppercase" }}>
              Savings &amp; Loans Ledger
            </div>
            <h1 style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 900, fontSize: 22, margin: "4px 0 0", lineHeight: 1.15 }}>
              {state.chamaName}
            </h1>
          </div>

          {state.members.map((m) => {
            const owed = loanOwed(m.id);
            const active = m.id === selectedMember;
            return (
              <div
                key={m.id}
                className="member-row"
                onClick={() => setSelectedMember(m.id)}
                style={{
                  position: "relative",
                  background: active ? C.white : C.paper,
                  color: C.text,
                  padding: "11px 16px 11px 18px",
                  margin: "6px 8px 6px 0",
                  borderRadius: "8px 0 0 8px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                  minWidth: 170,
                  transition: "transform .15s ease, background .15s ease",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,.04)",
                }}
              >
                {active && <div style={{ position: "absolute", right: -6, top: 0, bottom: 0, width: 6, background: C.gold, borderRadius: 2 }} />}
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap" }}>{m.name}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.sage, marginTop: 2 }}>
                    Savings {fmt(savingsBalance(m.id))}
                  </div>
                  {owed > 0 && (
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.rust, marginTop: 1 }}>Owes {fmt(owed)}</div>
                  )}
                </div>
                <button
                  className="del-btn"
                  onClick={(e) => handleDeleteMember(m.id, e)}
                  style={{ background: "none", border: "none", color: C.rust, opacity: 0, cursor: "pointer", flexShrink: 0 }}
                  title="Remove member"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}

          <button
            onClick={handleAddMember}
            style={{
              marginTop: 8,
              marginRight: 8,
              padding: "10px 14px",
              background: "transparent",
              border: `1.5px dashed ${C.paper2}`,
              color: C.paper,
              borderRadius: 8,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
              height: "fit-content",
            }}
          >
            <Plus size={14} /> Add member
          </button>
        </div>

        <div
          style={{
            flex: 1,
            background: C.paper,
            backgroundImage: `repeating-linear-gradient(${C.paper} 0px, ${C.paper} 37px, ${C.rule} 38px)`,
            padding: "36px 28px 60px",
            position: "relative",
          }}
        >
          <div className="hidden md:block" style={{ position: "absolute", left: 110, top: 0, bottom: 0, width: 1, background: C.rust, opacity: 0.35 }} />

          <DashboardSummary
                members={state.members}
                savingsBalance={savingsBalance}
                loanOwed={loanOwed}
                totalSavings={groupSavings()}
                totalLoans={groupLoans()}
                C={C}
                fmt={fmt}
              />

              {member ? (
            <>
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700, fontSize: 26, margin: 0 }}>{member.name}</h2>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C.textSoft, marginTop: 4 }}>
                  {member.phone || "no phone on file"} &middot; Group savings: {fmt(groupSavings())} &middot; Group loans out: {fmt(groupLoans())}
                </div>
              </div>

              <div style={{ display: "flex", borderBottom: `2px solid ${C.ink2}`, width: "fit-content", marginBottom: 20 }}>
                <button
                  onClick={() => setAccountView("savings")}
                  style={{
                    fontFamily: "'Roboto Slab', serif",
                    fontWeight: 700,
                    fontSize: 14,
                    background: "none",
                    border: "none",
                    padding: "9px 20px 10px",
                    cursor: "pointer",
                    color: accountView === "savings" ? C.ink2 : C.textSoft,
                    position: "relative",
                    top: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    borderBottom: accountView === "savings" ? `3px solid ${C.gold}` : "3px solid transparent",
                  }}
                >
                  <PiggyBank size={15} /> Savings
                </button>
                <button
                  onClick={() => setAccountView("loans")}
                  style={{
                    fontFamily: "'Roboto Slab', serif",
                    fontWeight: 700,
                    fontSize: 14,
                    background: "none",
                    border: "none",
                    padding: "9px 20px 10px",
                    cursor: "pointer",
                    color: accountView === "loans" ? C.steel2 : C.textSoft,
                    position: "relative",
                    top: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    borderBottom: accountView === "loans" ? `3px solid ${C.steel}` : "3px solid transparent",
                  }}
                >
                  <Landmark size={15} /> Loans
                </button>
              </div>

              <SummaryChips accountView={accountView} txns={txns} />

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-end",
                  background: C.white,
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: 22,
                  flexWrap: "wrap",
                  boxShadow: `0 1px 0 ${C.rule}`,
                }}
              >
                <Field label="Date">
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle()} />
                </Field>
                <Field label="Type">
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle()}>
                    {typeOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Amount (KES)">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    style={{ ...inputStyle(), width: 110 }}
                  />
                </Field>
                <Field label="Note">
                  <input
                    type="text"
                    placeholder={accountView === "savings" ? "e.g. March contribution" : "e.g. Business loan"}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    style={{ ...inputStyle(), width: 180 }}
                  />
                </Field>
                <button
                  onClick={handleAddEntry}
                  style={{
                    background: accountView === "loans" ? C.steel2 : C.ink2,
                    color: C.white,
                    border: "none",
                    borderRadius: 6,
                    padding: "9px 18px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Plus size={14} /> Add entry
                </button>
              </div>

              {txns.length ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
                    <thead>
                      <tr>
                        {["Date", "Type", "Note", "Amount", accountView === "savings" ? "Balance" : "Owed", ""].map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              fontSize: 10,
                              letterSpacing: ".08em",
                              textTransform: "uppercase",
                              color: C.textSoft,
                              padding: "6px 10px",
                              borderBottom: `2px solid ${C.ink2}`,
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 700,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {txns.map((t) => (
                        <tr key={t.id} className="lentry-row" style={{ borderBottom: `1px solid ${C.rule}` }}>
                          <td style={tdStyle}>{t.date}</td>
                          <td style={tdStyle}>
                            <span
                              style={{
                                display: "inline-block",
                                fontSize: 9.5,
                                textTransform: "uppercase",
                                letterSpacing: ".06em",
                                padding: "2px 7px",
                                borderRadius: 20,
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 700,
                                background:
                                  t.type === "interest"
                                    ? "rgba(181,132,42,.18)"
                                    : t.type === "deduction" || t.type === "disbursed"
                                    ? "rgba(162,58,44,.15)"
                                    : "rgba(63,115,80,.15)",
                                color: amtColor(t.type),
                              }}
                            >
                              {t.type}
                            </span>
                            {(t.type === "payment" || t.type === "repayment") && (
                              <span
                                style={{
                                  display: "inline-block",
                                  border: `1.5px solid ${C.sage}`,
                                  color: C.sage,
                                  fontFamily: "'Roboto Slab', serif",
                                  fontWeight: 700,
                                  fontSize: 9,
                                  textTransform: "uppercase",
                                  padding: "1px 6px",
                                  borderRadius: 3,
                                  transform: "rotate(-4deg)",
                                  marginLeft: 6,
                                  opacity: 0.8,
                                  letterSpacing: ".04em",
                                }}
                              >
                                Paid
                              </span>
                            )}
                          </td>
                          <td style={tdStyle}>{t.note || "—"}</td>
                          <td style={{ ...tdStyle, color: amtColor(t.type) }}>
                            {isDecrease(t.type) ? "-" : "+"}
                            {fmt(Number(t.amount))}
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt(t.balance)}</td>
                          <td style={tdStyle}>
                            <button
                              onClick={() => handleDeleteEntry(t.id)}
                              style={{ background: "none", border: "none", color: C.textSoft, cursor: "pointer", opacity: 0.5 }}
                              title="Delete"
                            >
                              <X size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: "40px 10px", textAlign: "center", color: C.textSoft, fontSize: 14 }}>
                  No {accountView} entries yet for {member.name}. Add the first one above.
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: "40px 10px", textAlign: "center", color: C.textSoft, fontSize: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Users size={22} />
              Add a member on the left to start their ledger.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryChips({ accountView, txns }) {
  const chip = (label, value, color, big) => (
    <div style={{ background: C.white, borderRadius: 8, padding: "8px 14px", minWidth: 108, boxShadow: `0 1px 0 ${C.rule}` }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: C.textSoft }}>
        {label}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: big ? 18 : 16, fontWeight: 600, marginTop: 2, color }}>{value}</div>
    </div>
  );

  if (accountView === "savings") {
    const paid = txns.filter((t) => t.type === "payment").reduce((s, t) => s + Number(t.amount), 0);
    const interest = txns.filter((t) => t.type === "interest").reduce((s, t) => s + Number(t.amount), 0);
    const deduct = txns.filter((t) => t.type === "deduction").reduce((s, t) => s + Number(t.amount), 0);
    const balance = txns.slice(-1)[0]?.balance || 0;
    return (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        {chip("Payments", fmt(paid), C.sage)}
        {chip("Interest", fmt(interest), C.gold2)}
        {chip("Deductions", fmt(deduct), C.rust)}
        {chip("Savings balance", fmt(balance), C.ink2, true)}
      </div>
    );
  }
  const disbursed = txns.filter((t) => t.type === "disbursed").reduce((s, t) => s + Number(t.amount), 0);
  const interest = txns.filter((t) => t.type === "interest").reduce((s, t) => s + Number(t.amount), 0);
  const repaid = txns.filter((t) => t.type === "repayment").reduce((s, t) => s + Number(t.amount), 0);
  const owed = txns.slice(-1)[0]?.balance || 0;
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
      {chip("Disbursed", fmt(disbursed), C.steel2)}
      {chip("Interest charged", fmt(interest), C.gold2)}
      {chip("Repaid", fmt(repaid), C.sage)}
      {chip("Owed", fmt(owed), C.rust, true)}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", color: C.textSoft }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function inputStyle() {
  return {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    padding: "7px 9px",
    border: `1px solid ${C.rule}`,
    borderRadius: 6,
    background: C.paper,
    color: C.text,
  };
}

const tdStyle = { padding: "9px 10px", verticalAlign: "top" };