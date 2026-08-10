import { supabase } from "./supabaseClient";
import { logActivity } from "./activity";

const CHAMA_ID = "default"; // change if you ever host multiple chamas from one project

async function currentEmail() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.email || "unknown";
}

/**
 * Loads all members and their transactions, and shapes them into:
 * { chamaName, members: [{id,name,phone}], transactions: { [memberId]: { savings: [...], loans: [...] } } }
 */
export async function loadLedger() {
  const { data: members, error: mErr } = await supabase
    .from("members")
    .select("*")
    .eq("chama_id", CHAMA_ID)
    .order("created_at", { ascending: true });
  if (mErr) throw mErr;
  const transactions = {};
  members.forEach((m) => {
    transactions[m.id] = { savings: [], loans: [] };
  });
  if (members.length) {
    const { data: txns, error: tErr } = await supabase
      .from("transactions")
      .select("*")
      .in(
        "member_id",
        members.map((m) => m.id)
      )
      .order("date", { ascending: true });
    if (tErr) throw tErr;
    txns.forEach((t) => {
      transactions[t.member_id][t.account].push({
        id: t.id,
        date: t.date,
        type: t.type,
        amount: Number(t.amount),
        note: t.note || "",
      });
    });
  }
  return {
    chamaName: "The Njoroges",
    members: members.map((m) => ({ id: m.id, name: m.name, phone: m.phone || "" })),
    transactions,
  };
}

/** Adds a member. Returns the new member row: {id, name, phone}. */
export async function addMember(name, phone) {
  const { data, error } = await supabase
    .from("members")
    .insert({ name, phone, chama_id: CHAMA_ID })
    .select()
    .single();
  if (error) throw error;
  logActivity(await currentEmail(), "add_member", `Added member "${name}"`);
  return { id: data.id, name: data.name, phone: data.phone || "" };
}

/** Deletes a member and (via ON DELETE CASCADE) all their transactions. */
export async function deleteMember(memberId) {
  const { error } = await supabase.from("members").delete().eq("id", memberId);
  if (error) throw error;
  logActivity(await currentEmail(), "delete_member", `Deleted member id ${memberId}`);
}

/**
 * Adds a transaction entry.
 * account: 'savings' | 'loans'
 * entry: { date, type, amount, note }
 * Returns the new entry with its generated id.
 */
export async function addEntry(memberId, account, entry) {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      member_id: memberId,
      account,
      type: entry.type,
      amount: entry.amount,
      note: entry.note || null,
      date: entry.date,
    })
    .select()
    .single();
  if (error) throw error;
  logActivity(
    await currentEmail(),
    "add_entry",
    `${entry.type} of ${entry.amount} on ${account} for member ${memberId}`
  );
  return { id: data.id, date: data.date, type: data.type, amount: Number(data.amount), note: data.note || "" };
}

/** Deletes a single transaction entry. */
export async function deleteEntry(entryId) {
  const { error } = await supabase.from("transactions").delete().eq("id", entryId);
  if (error) throw error;
  logActivity(await currentEmail(), "delete_entry", `Deleted entry id ${entryId}`);
}
