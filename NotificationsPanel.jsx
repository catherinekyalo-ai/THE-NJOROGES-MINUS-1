import { useEffect, useState } from "react";
import { loadActivity } from "./lib/activity";

export default function NotificationsPanel() {
  const [activity, setActivity] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setActivity(await loadActivity());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  return (
    <div style={{ padding: "8px 16px" }}>
      <button onClick={() => setOpen(!open)} style={{ marginBottom: 8 }}>
        {open ? "Hide" : "Show"} activity log {loading ? "..." : ""}
      </button>
      {open && (
        <div style={{ maxHeight: 240, overflowY: "auto", border: "1px solid #ddd", borderRadius: 6, padding: 8, fontSize: 13 }}>
          {activity.length === 0 && <div style={{ color: "#888" }}>No activity yet.</div>}
          {activity.map((a) => (
            <div key={a.id} style={{ padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}>
              <strong>{a.actor_email}</strong> — {a.action} {a.details ? `(${a.details})` : ""}
              <div style={{ color: "#999", fontSize: 11 }}>{new Date(a.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
