from pathlib import Path

p = Path("ChamaLedger.jsx")
s = p.read_text()

old = '''            </button>
          </div>

          <SummaryChips accountView={accountView} txns={txns} />'''

new = '''            </button>

            <button
              onClick={() => setAccountView("journal")}
              style={{
                fontFamily: "'Roboto Slab', serif",
                fontWeight: 700,
                fontSize: 14,
                background: "none",
                border: "none",
                padding: "9px 20px 10px",
                cursor: "pointer",
                color: accountView === "journal" ? C.gold2 : C.textSoft,
                position: "relative",
                top: 2,
                display: "flex",
                alignItems: "center",
                gap: 6,
                borderBottom: accountView === "journal"
                  ? `3px solid ${C.gold}`
                  : "3px solid transparent",
              }}
            >
              Journal
            </button>
          </div>

          <SummaryChips accountView={accountView} txns={txns} />'''

if old not in s:
    print("ERROR: Could not find the expected tab section.")
    raise SystemExit(1)

p.write_text(s.replace(old, new, 1))
print("SUCCESS: Journal tab added.")
