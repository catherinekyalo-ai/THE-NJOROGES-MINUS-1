/**
 * Standard double-entry mapping for a chama's savings & loans transactions.
 * Cash/Bank represents the group's pooled fund.
 */
export function getDoubleEntry(account, type, memberName) {
  const map = {
    savings: {
      payment: {
        debit: "Cash/Bank",
        credit: `${memberName}'s Savings`,
        note: "Member deposits cash into savings",
      },
      interest: {
        debit: "Cash/Bank",
        credit: `${memberName}'s Savings`,
        note: "Interest earned, added to member's savings",
      },
      deduction: {
        debit: `${memberName}'s Savings`,
        credit: "Cash/Bank",
        note: "Withdrawal from member's savings",
      },
    },
    loans: {
      disbursed: {
        debit: `${memberName}'s Loan Account`,
        credit: "Cash/Bank",
        note: "Loan paid out to member",
      },
      interest: {
        debit: `${memberName}'s Loan Account`,
        credit: "Interest Income",
        note: "Interest charged on outstanding loan",
      },
      repayment: {
        debit: "Cash/Bank",
        credit: `${memberName}'s Loan Account`,
        note: "Member repays part of their loan",
      },
    },
  };

  return map[account]?.[type] || { debit: "—", credit: "—", note: "" };
}
