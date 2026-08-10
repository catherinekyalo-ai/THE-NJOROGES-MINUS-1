import { useEffect, useState } from "react";
import ChamaLedger from "./ChamaLedger";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import NotificationsPanel from "./NotificationsPanel";
import { getSession, onAuthChange, signOut, ADMIN_EMAIL } from "./lib/auth";

export default function App() {
  const [session, setSession] = useState(undefined);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    getSession().then(setSession);
    const unsubscribe = onAuthChange((s, event) => {
      setSession(s);
    });

    // Supabase appends #access_token=...&type=recovery to the URL for reset links
    if (window.location.hash.includes("type=recovery")) {
      setRecovering(true);
    }

    return unsubscribe;
  }, []);

  if (session === undefined) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (recovering) {
    return (
      <ResetPassword
        onDone={() => {
          setRecovering(false);
          window.history.replaceState(null, "", window.location.pathname);
        }}
      />
    );
  }

  if (!session) {
    return <Login />;
  }

  const isAdmin = session.user.email === ADMIN_EMAIL;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 14, color: "#555" }}>{session.user.email}</span>
        <button onClick={signOut}>Log out</button>
      </div>
      {isAdmin && <NotificationsPanel />}
      <ChamaLedger />
    </div>
  );
}
