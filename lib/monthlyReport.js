import * as XLSX from "xlsx";

const SAVINGS_LABELS = { payment: "Savings Payment", interest: "Savings Interest", deduction: "Savings Deduction" };
const LOAN_LABELS = { disbursed: "Loan Disbursed", interest: "Loan Interest", repayment: "Loan Repayment" };

/**
 * Builds a { "2026-08": { "Savings Payment": 1200, "Loan Disbursed": 5000, ... } } style map
 * across ALL members, for both savings and loans.
 */
export function buildMonthlySummary(state) {
  const summary = {}; // month -> { label -> total }

  state.members.forEach((m) => {
    const txns = state.transactions[m.id];
    if (!txns) return;

    txns.savings?.forEach((t) => {
      const month = t.date.slice(0, 7); // "YYYY-MM"
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

  return summary; // caller can sort keys, render, etc.
}

export function getAllLabels() {
  return [...Object.values(SAVINGS_LABELS), ...Object.values(LOAN_LABELS)];
}

/** Exports the monthly summary (plus a raw per-member transaction sheet) as an .xlsx file. */
export function exportMonthlyReportToExcel(state, chamaName = "Chama") {
  const summary = buildMonthlySummary(state);
  const months = Object.keys(summary).sort();
  const labels = getAllLabels();

  // Sheet 1: Monthly summary (months as rows, transaction types as columns)
  const summaryRows = months.map((month) => {
    const row = { Month: month };
    labels.forEach((label) => {
      row[label] = summary[month][label] || 0;
    });
    return row;
  });

  // Sheet 2: Raw transaction detail, one row per transaction, across all members
  const detailRows = [];
  state.members.forEach((m) => {
    const txns = state.transactions[m.id];
    if (!txns) return;
    txns.savings?.forEach((t) => {
      detailRows.push({
        Month: t.date.slice(0, 7),
        Date: t.date,
        Member: m.name,
        Account: "Savings",
        Type: SAVINGS_LABELS[t.type] || t.type,
        Amount: Number(t.amount),
        Note: t.note || "",
      });
    });
    txns.loans?.forEach((t) => {
      detailRows.push({
        Month: t.date.slice(0, 7),
        Date: t.date,
        Member: m.name,
        Account: "Loans",
        Type: LOAN_LABELS[t.type] || t.type,
        Amount: Number(t.amount),
        Note: t.note || "",
      });
    });
  });
  detailRows.sort((a, b) => a.Date.localeCompare(b.Date));

  const wb = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  const detailSheet = XLSX.utils.json_to_sheet(detailRows);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Monthly Summary");
  XLSX.utils.book_append_sheet(wb, detailSheet, "All Transactions");

  const filename = `${chamaName.replace(/\s+/g, "_")}_Monthly_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
