import { supabase } from "./supabaseClient";

export async function logActivity(actorEmail, action, details = "") {
  try {
    await supabase.from("activity_logs").insert({
      actor_email: actorEmail || "unknown",
      action,
      details,
    });
  } catch (e) {
    console.error("Failed to log activity", e);
  }
}

export async function loadActivity(limit = 50) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
