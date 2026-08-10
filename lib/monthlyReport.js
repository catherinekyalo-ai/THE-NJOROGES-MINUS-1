import * as XLSX from "xlsx";

const SAVINGS_LABELS = { payment: "Savings Payment", interest: "Savings Interest", deduction: "Savings Deduction" };
const LOAN_LABELS = { disbursed: "Loan Disbursed", interest: "Loan Interest", repayment: "Loan Repayment" };

/**
 * Builds { "2026-08": { "Savings Payment": 1200, ... } } for either the whole chama
 * (memberId = null) or a single member (memberId = that member's id).
 */
export function buildMonthlySummary(state, memberId = null) {
  const summary = {};
  const members = memberId ? state.members.filter((m) => m.id === memberId) : state.members;

  members.forEach((m) => {
    const txns = state.transactions[m.id];
    if (!txns) return;

    txns.savings?.forEach((t) => {
      const month = t.date.slice(0, 7);
      const label = SAVINGS_LABELS[t.type] || t.type;
      summary[month] = summary[month] || {};
      summary[month][label] = (summary[month][label] || 0) + Number(t.amount);
    });

    txns.loans?.forEach((t) => {
      const month = t.date.slice(0, 7);
      const label = LOAN_LABELS[t.type] || t.type;
      summary[month] = summary[month] || {};
      summary[month][label] = (summary[month][label] || 0) + Number(t.amount);
    });
  });

  return summary;
}

export function getAllLabels() {
  return [...Object.values(SAVINGS_LABELS), ...Object.values(LOAN_LABELS)];
}

function summaryToRows(summary, labels) {
  return Object.keys(summary)
    .sort()
    .map((month) => {
      const row = { Month: month };
      labels.forEach((label) => {
        row[label] = summary[month][label] || 0;
      });
      return row;
    });
}

export function detailRowsFor(state, memberId = null) {
  const rows = [];
  const members = memberId ? state.members.filter((m) => m.id === memberId) : state.members;

  members.forEach((m) => {
    const txns = state.transactions[m.id];
    if (!txns) return;
    txns.savings?.forEach((t) => {
      rows.push({
        Month: t.date.slice(0, 7), Date: t.date, Member: m.name,
        Account: "Savings", Type: SAVINGS_LABELS[t.type] || t.type,
        Amount: Number(t.amount), Note: t.note || "",
      });
    });
    txns.loans?.forEach((t) => {
      rows.push({
        Month: t.date.slice(0, 7), Date: t.date, Member: m.name,
        Account: "Loans", Type: LOAN_LABELS[t.type] || t.type,
        Amount: Number(t.amount), Note: t.note || "",
      });
    });
  });
  rows.sort((a, b) => a.Date.localeCompare(b.Date));
  return rows;
}

function safeSheetName(name) {
  // Excel sheet names: max 31 chars, no : \ / ? * [ ]
  return name.replace(/[:\\/?*\[\]]/g, "").slice(0, 31) || "Sheet";
}

/**
 * Exports a full workbook:
 * - "Chama Summary" sheet (whole-group monthly totals)
 * - "All Transactions" sheet (every transaction, every member)
 * - One sheet per member with just their own monthly summary
 */
export function exportMonthlyReportToExcel(state, chamaName = "Chama") {
  const labels = getAllLabels();
  const wb = XLSX.utils.book_new();

  const chamaSummary = buildMonthlySummary(state, null);
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(summaryToRows(chamaSummary, labels)),
    "Chama Summary"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(detailRowsFor(state, null)),
    "All Transactions"
  );

  state.members.forEach((m) => {
    // Detailed, date-by-date transaction list for this member: exactly what they paid and when.
    const rows = detailRowsFor(state, m.id).map((r) => ({
      Date: r.Date,
      Account: r.Account,
      Type: r.Type,
      Amount: r.Amount,
      Note: r.Note,
    }));
    if (rows.length === 0) return; // skip members with no transactions
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(rows),
      safeSheetName(m.name)
    );
  });

  const filename = `${chamaName.replace(/\s+/g, "_")}_Monthly_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
