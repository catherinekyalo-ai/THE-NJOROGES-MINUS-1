import { supabase } from "./supabaseClient";
import { logActivity } from "./activity";

async function currentEmail() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.email || "unknown";
}

export async function loadExpenses() {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return data.map((e) => ({
    id: e.id,
    date: e.date,
    category: e.category,
    amount: Number(e.amount),
    note: e.note || "",
  }));
}

export async function addExpense(entry) {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      date: entry.date,
      category: entry.category,
      amount: entry.amount,
      note: entry.note || null,
    })
    .select()
    .single();
  if (error) throw error;
  logActivity(await currentEmail(), "add_expense", `${entry.category}: KES ${entry.amount}`);
  return { id: data.id, date: data.date, category: data.category, amount: Number(data.amount), note: data.note || "" };
}

export async function deleteExpense(id) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
  logActivity(await currentEmail(), "delete_expense", `Deleted expense id ${id}`);
}
