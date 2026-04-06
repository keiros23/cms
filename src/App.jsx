import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  "https://smljhunjjgybmrtoqgzs.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbGpodW5qamd5Ym1ydG9xZ3pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDA3MzcsImV4cCI6MjA4ODcxNjczN30.qSr5GS5JJTTwE33gaNoHUNRzhyNXU27ioQrOTMq5X2Y"
);

import { useState, useEffect, useRef } from "react";

// ─── Users ────────────────────────────────────────────────────────────────────
const USERS = {
  "Jackie": { password: "1111", role: "user" },
  "Serife": { password: "2222", role: "user" },
  "Olivia": { password: "3333", role: "user" },
  "Coty":   { password: "4444", role: "user" },
  "Keith":  { password: "5555", role: "user" },
  "Admin":  { password: "6666", role: "admin" },
};

// ─── Constants ────────────────────────────────────────────────────────────────
const HSBC_RED = "#DB0011";
const HSBC_DARK = "#1a1a1a";
const HSBC_SIDEBAR = "#4a5568";
const HSBC_LIGHT = "#f5f5f5";
const HSBC_BORDER = "#e0e0e0";
const HSBC_TEXT = "#333333";
const HSBC_MUTED = "#767676";

const CASE_MANAGERS = ["Jackie", "Serife", "Olivia", "Coty", "Keith", "Sayed"];
const BUSINESS_LINES = ["CIB", "GPB", "IWPB - Other", "UK WPB", "UK CMB", "HK WPB", "HK CMB", "IWPB - EWS"];
const CLIENT_RELATIONSHIPS = ["Existing", "NTG"];
const ACCOUNT_TYPES = ["Business", "Private Bank PB", "Premier", "EA", "Mass Retail"];
const TRANSVERSAL_OPTIONS = ["Transversal", "Domestic"];

const CLIENT_REQUEST_CATEGORIES = [
  "Accounts Enquiries and Maintenance", "Issues", "Complaints", "Products", "Other Complex Queries"
];

const CLIENT_REQUESTS = [
  "Ac Inhibited/Ac Closure", "Account Access - Digital Channels", "Account Conversion & Upgrade",
  "Account Opening/New Product Offers", "Balances Statements and Other Correspondence",
  "Branch Appointment and Counter Service", "Business Banking", "Card Related", "Change of Address",
  "Charges and Interest", "Client Tax Reporting", "CSEM/EDD/SCC Related", "Fraud", "ID&V",
  "International Payments and Foreign Currency Transfer", "Lending Product Related",
  "Other Account Enquiry", "Other Products", "Payment Related", "Relationship Manager Request",
  "RM Servicing Related", "Savings Enquiry", "Third Party Mandates", "Feedback Provided",
  "Balance Certificate", "Deceased Customer", "Power of Attorney", "Other"
];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bahrain","Bangladesh",
  "Belgium","Brazil","Canada","Chile","China","Colombia","Croatia","Cyprus","Czech Republic",
  "Denmark","Egypt","Finland","France","Germany","Ghana","Greece","Hong Kong","Hungary",
  "India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kenya",
  "Kuwait","Lebanon","Luxembourg","Malaysia","Malta","Mexico","Morocco","Netherlands",
  "New Zealand","Nigeria","Norway","Oman","Pakistan","Philippines","Poland","Portugal",
  "Qatar","Romania","Russia","Saudi Arabia","Singapore","South Africa","South Korea","Spain",
  "Sri Lanka","Sweden","Switzerland","Taiwan","Thailand","Turkey","UAE","Uganda","Ukraine",
  "United Kingdom","United States","Vietnam","Zimbabwe"
];

const TAT_CATEGORIES = {
  within24: "Within 24hr", within48: "Within 48hr", within7: "Within 7 days",
  over7: "7 days+", notResolved: "Not Resolved"
};

const TAT_BADGE = {
  within24:    { color: "#166534", bg: "#dcfce7" },
  within48:    { color: "#065f46", bg: "#d1fae5" },
  within7:     { color: "#92400e", bg: "#fef3c7" },
  over7:       { color: "#991b1b", bg: "#fee2e2" },
  notResolved: { color: "#4b5563", bg: "#f3f4f6" },
};

// ─── Shared styles ─────────────────────────────────────────────────────────────
const card  = { background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, padding: "20px 24px" };
const th    = { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: HSBC_MUTED, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: `2px solid ${HSBC_BORDER}`, whiteSpace: "nowrap" };
const td    = { padding: "11px 14px", fontSize: 13, borderBottom: `1px solid #f5f5f5`, verticalAlign: "middle" };
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 };
const inp   = { width: "100%", padding: "8px 10px", border: `1px solid ${HSBC_BORDER}`, borderRadius: 4, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fff" };
const label = { fontSize: 11, fontWeight: 700, color: HSBC_MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, display: "block" };
const btn   = (variant = "primary") => ({
  padding: "9px 18px", borderRadius: 4, fontSize: 13, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s",
  background: variant === "primary" ? HSBC_RED : variant === "danger" ? "#fff" : HSBC_LIGHT,
  color: variant === "primary" ? "#fff" : variant === "danger" ? "#991b1b" : HSBC_TEXT,
  border: variant === "danger" ? "1.5px solid #991b1b" : "none",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWorkingDays(start, end) {
  if (!start || !end) return null;
  const s = new Date(start), e = new Date(end);
  if (e < s) return null;
  let count = 0, cur = new Date(s);
  while (cur <= e) { const d = cur.getDay(); if (d !== 0 && d !== 6) count++; cur.setDate(cur.getDate() + 1); }
  return Math.max(0, count - 1);
}
function getTATCategory(days, resolved) {
  if (!resolved || days === null) return "notResolved";
  if (days <= 1) return "within24"; if (days <= 2) return "within48";
  if (days <= 7) return "within7"; return "over7";
}
function getQuarter(date) { if (!date) return ""; const m = new Date(date).getMonth(); return `Q${Math.floor(m/3)+1}`; }
function getMonth(date)   { if (!date) return ""; return new Date(date).toLocaleString("default", { month: "long" }); }
function getYear(date)    { if (!date) return ""; return new Date(date).getFullYear(); }
function generateCaseId(index) { return `CASE-${String(index + 1).padStart(4, "0")}`; }
function nowStr() { return new Date().toISOString(); }
function fmtDateTime(iso) { if (!iso) return "—"; const d = new Date(iso); return d.toLocaleDateString("en-GB") + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); }

// ─── Searchable Dropdown ───────────────────────────────────────────────────────
function SearchableDropdown({ options, value, onChange, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef();
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => !disabled && setOpen(o => !o)} style={{ ...inp, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: disabled ? "default" : "pointer", background: disabled ? "#f9f9f9" : "#fff" }}>
        <span style={{ color: value ? HSBC_TEXT : "#aaa", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || placeholder}</span>
        <span style={{ fontSize: 10, color: HSBC_MUTED, flexShrink: 0, marginLeft: 6 }}>▼</span>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 4, zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxHeight: 220, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <input autoFocus style={{ ...inp, borderRadius: 0, borderBottom: `1px solid ${HSBC_BORDER}`, fontSize: 12 }} placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} />
          <div style={{ overflowY: "auto", maxHeight: 170 }}>
            {filtered.length === 0 ? <div style={{ padding: "10px 12px", fontSize: 12, color: HSBC_MUTED }}>No results</div>
              : filtered.map(o => (
                <div key={o} onClick={() => { onChange(o); setOpen(false); setQuery(""); }} style={{ padding: "9px 12px", fontSize: 13, cursor: "pointer", background: o === value ? "#fff5f5" : "#fff", color: o === value ? HSBC_RED : HSBC_TEXT, fontWeight: o === value ? 700 : 400 }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={e => e.currentTarget.style.background = o === value ? "#fff5f5" : "#fff"}>
                  {o}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label: l, color, bg }) {
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 3, fontSize: 11, fontWeight: 700, color, background: bg, border: `1px solid ${color}22`, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{l}</span>;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label: l, value, sub, red }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, padding: "18px 20px", flex: 1, minWidth: 140, borderTop: `3px solid ${red ? HSBC_RED : "#d1d5db"}` }}>
      <div style={{ fontSize: 30, fontWeight: 800, color: red ? HSBC_RED : HSBC_DARK, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: HSBC_MUTED, marginTop: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</div>
      {sub && <div style={{ fontSize: 11, color: HSBC_MUTED, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label: l, children, span, required }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <span style={label}>{l}{required && <span style={{ color: HSBC_RED }}> *</span>}</span>
      {children}
    </div>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inp, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28, cursor: "pointer" }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Toggle({ value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, background: value ? HSBC_RED : "#d1d5db", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
      <span style={{ fontSize: 13, color: value ? HSBC_RED : HSBC_MUTED, fontWeight: value ? 700 : 400 }}>{value ? "Yes" : "No"}</span>
    </div>
  );
}

// ─── ExpandableChart ──────────────────────────────────────────────────────────
function ExpandableChart({ title, items, total, defaultShow = 3 }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > defaultShow;
  const shown = expanded ? items : items.slice(0, defaultShow);
  const max = Math.max(...items.map(x => x.count), 1);
  return (
    <div style={{ background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em" }}>{title}</div>
        {hasMore && (
          <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: `1px solid ${HSBC_RED}`, borderRadius: 3, cursor: "pointer", fontSize: 11, color: HSBC_RED, fontWeight: 700, padding: "3px 10px", fontFamily: "inherit" }}>
            {expanded ? "▲ Collapse" : `▼ Show all ${items.length}`}
          </button>
        )}
      </div>
      {items.length === 0 ? <div style={{ fontSize: 13, color: HSBC_MUTED }}>No data</div> : (
        <>
          {shown.map(({ label: l, count }) => {
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <div style={{ width: 190, fontSize: 12, color: HSBC_TEXT, flexShrink: 0, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={l}>{l}</div>
                <div style={{ flex: 1, height: 7, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${Math.round((count/max)*100)}%`, height: "100%", background: HSBC_RED, borderRadius: 4, transition: "width 0.5s ease" }} />
                </div>
                <div style={{ width: 70, fontSize: 12, color: HSBC_MUTED, textAlign: "right", flexShrink: 0, whiteSpace: "nowrap" }}>{count} · {pct}%</div>
              </div>
            );
          })}
          {hasMore && !expanded && <div style={{ fontSize: 11, color: HSBC_MUTED, marginTop: 6 }}>Showing {defaultShow} of {items.length}</div>}
        </>
      )}
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    const user = USERS[username];
    if (!user || user.password !== password) {
      setError("Invalid username or password."); return;
    }
    setError("");
    onLogin({ name: username, role: user.role });
  }

  return (
    <div style={{ minHeight: "100vh", background: HSBC_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: "40px 48px", width: 380, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", borderTop: `4px solid ${HSBC_RED}` }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: HSBC_RED, letterSpacing: "-0.5px", marginBottom: 4 }}>HSBC</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: HSBC_DARK }}>VVIP Logging</div>
          <div style={{ fontSize: 12, color: HSBC_MUTED, marginTop: 4 }}>Sign in to continue</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <span style={label}>Username</span>
          <Select value={username} onChange={setUsername} options={Object.keys(USERS)} placeholder="Select your name…" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <span style={label}>Password</span>
          <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter your password" />
        </div>
        {error && <div style={{ fontSize: 12, color: "#991b1b", marginBottom: 14, background: "#fee2e2", padding: "8px 12px", borderRadius: 4 }}>{error}</div>}
        <button style={{ ...btn("primary"), width: "100%", padding: "11px 18px" }} onClick={handleLogin}>Sign In</button>
      </div>
    </div>
  );
}

// ─── Clients View ─────────────────────────────────────────────────────────────
function ClientsView({ cases, clientSearch, setClientSearch, setSelectedCase, setView }) {
  const [expandedClient, setExpandedClient] = useState(null);
  const allClients = [...new Map(cases.map(c => [c.clientName, c])).values()];
  const clients = clientSearch
    ? allClients.filter(c => c.clientName?.toLowerCase().includes(clientSearch.toLowerCase()) || c.corporateName?.toLowerCase().includes(clientSearch.toLowerCase()))
    : allClients;

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: HSBC_DARK }}>Clients</h1>
      <div style={{ fontSize: 13, color: HSBC_MUTED, marginBottom: 18 }}>Case history by client · company and position tracked per case</div>
      <div style={{ marginBottom: 18 }}>
        <input style={{ ...inp, width: 300 }} placeholder="Search by client name or corporate…" value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {clients.map(client => {
          const cc = cases.filter(c => c.clientName === client.clientName).sort((a,b) => new Date(a.dateRaised) - new Date(b.dateRaised));
          const openCount = cc.filter(c => !c.dateResolved).length;
          const hasFlags = cc.some(c => c.vvip || c.csuite || c.ews);
          const isExpanded = expandedClient === client.clientName;
          const timeline = cc.reduce((acc, c) => {
            const last = acc[acc.length - 1];
            if (!last || last.corporateName !== c.corporateName || last.clientPosition !== c.clientPosition)
              acc.push({ caseNumber: c.caseNumber, dateRaised: c.dateRaised, corporateName: c.corporateName, clientPosition: c.clientPosition });
            return acc;
          }, []);
          const hasHistory = timeline.length > 1;
          return (
            <div key={client.clientName} style={{ background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, borderLeft: hasFlags ? `4px solid ${HSBC_RED}` : `4px solid transparent`, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setExpandedClient(isExpanded ? null : client.clientName)}>
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: HSBC_DARK }}>{client.clientName}</div>
                    <div style={{ fontSize: 12, color: HSBC_MUTED, marginTop: 2 }}>
                      {cc[cc.length-1]?.clientPosition && <span style={{ fontWeight: 600, color: HSBC_TEXT }}>{cc[cc.length-1].clientPosition}</span>}
                      {cc[cc.length-1]?.clientPosition && cc[cc.length-1]?.corporateName && <span> · </span>}
                      {cc[cc.length-1]?.corporateName && <span>{cc[cc.length-1].corporateName}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, fontSize: 12, color: HSBC_MUTED, flexWrap: "wrap" }}>
                    <span>{cc.length} case{cc.length !== 1 ? "s" : ""}</span>
                    {openCount > 0 && <span style={{ color: HSBC_RED, fontWeight: 700 }}>{openCount} open</span>}
                    <span>{client.countryClient}</span>
                    {hasHistory && <span style={{ color: "#0369a1", fontWeight: 600 }}>⟳ Role history</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {cc.some(c => c.vvip) && <Badge label="VVIP" color="#7c3aed" bg="#f5f3ff" />}
                    {cc.some(c => c.csuite) && <Badge label="C-Suite" color="#0369a1" bg="#e0f2fe" />}
                    {cc.some(c => c.ews) && <Badge label="EWS" color="#b45309" bg="#fef3c7" />}
                  </div>
                </div>
                <span style={{ fontSize: 13, color: HSBC_MUTED, flexShrink: 0, marginLeft: 12 }}>{isExpanded ? "▲" : "▼"}</span>
              </div>
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${HSBC_BORDER}`, padding: "20px 24px" }}>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
                      Company & Position History
                      {!hasHistory && <span style={{ color: HSBC_MUTED, fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 11, marginLeft: 8 }}>— no changes recorded</span>}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {timeline.map((t, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === timeline.length-1 ? HSBC_RED : "#d1d5db", flexShrink: 0, marginTop: 4 }} />
                            {i < timeline.length-1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: "#e5e7eb" }} />}
                          </div>
                          <div style={{ paddingLeft: 12, paddingBottom: 20, paddingRight: 32 }}>
                            <div style={{ fontSize: 11, color: HSBC_MUTED, marginBottom: 3 }}>{t.dateRaised} · {t.caseNumber}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: HSBC_DARK }}>{t.clientPosition || <span style={{ color: HSBC_MUTED, fontStyle: "italic" }}>Position not recorded</span>}</div>
                            <div style={{ fontSize: 12, color: HSBC_MUTED }}>{t.corporateName || <span style={{ fontStyle: "italic" }}>Company not recorded</span>}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Case History</div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                      <thead><tr style={{ background: "#fafafa" }}>
                        {["Case No.", "Date", "Company at Time", "Position at Time", "Category", "TAT", "Status"].map(h => <th key={h} style={th}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {cc.map(c => {
                          const tat = getWorkingDays(c.dateRaised, c.dateResolved);
                          const tatCat = getTATCategory(tat, !!c.dateResolved);
                          return (
                            <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedCase(c); setView("cases"); }}>
                              <td style={td}><span style={{ fontWeight: 700, color: HSBC_RED, fontSize: 12 }}>{c.caseNumber}</span></td>
                              <td style={td}><span style={{ fontSize: 12 }}>{c.dateRaised}</span></td>
                              <td style={td}><span style={{ fontSize: 13, fontWeight: 500 }}>{c.corporateName || "—"}</span></td>
                              <td style={td}><span style={{ fontSize: 13 }}>{c.clientPosition || "—"}</span></td>
                              <td style={td}><span style={{ fontSize: 12, color: HSBC_MUTED }}>{c.categoryRequest}</span></td>
                              <td style={td}><Badge label={TAT_CATEGORIES[tatCat]} color={TAT_BADGE[tatCat].color} bg={TAT_BADGE[tatCat].bg} /></td>
                              <td style={td}>{c.dateResolved ? <Badge label="Resolved" color="#166534" bg="#dcfce7" /> : <Badge label="Open" color={HSBC_RED} bg="#fff1f2" />}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {clients.length === 0 && <div style={{ color: HSBC_MUTED, fontSize: 14, padding: 20 }}>{clientSearch ? "No clients match your search." : "No clients yet."}</div>}
      </div>
    </div>
  );
}

// ─── Auto-Suggest Input ───────────────────────────────────────────────────────
function AutoSuggestInput({ value, onChange, onSelect, suggestions, placeholder, style, inputStyle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = value.trim().length > 0
    ? [...new Map(suggestions.filter(s => s.label.toLowerCase().includes(value.toLowerCase())).map(s => [s.label, s])).values()].slice(0, 8)
    : [];

  return (
    <div ref={ref} style={{ position: "relative", ...(style||{}) }}>
      <input
        style={inputStyle || inp}
        value={value}
        placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 4, zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxHeight: 220, overflowY: "auto" }}>
          {filtered.map((s, i) => (
            <div key={i} onClick={() => { onSelect(s); setOpen(false); }}
              style={{ padding: "9px 12px", cursor: "pointer", borderBottom: `1px solid #f5f5f5` }}
              onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
              <div style={{ fontSize: 13, fontWeight: 600, color: HSBC_DARK }}>{s.label}</div>
              {s.sub && <div style={{ fontSize: 11, color: HSBC_MUTED, marginTop: 1 }}>{s.sub}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Empty form ────────────────────────────────────────────────────────────────
const emptyForm = () => ({
  localId: "", dateRaised: new Date().toISOString().split("T")[0], dateResolved: "", managedBy: "", vvip: false, ews: false, csuite: false,
  corporateName: "", clientPosition: "", mastergroup: "", clientName: "", clientRelationship: "",
  connection: "", countryClient: "", referrerName: "", referrerBusinessLine: "", referrerCountry: "",
  categoryRequest: "", clientRequest: "", countryRequest: "", accountType: "", transversal: "",
  informationProvided: "", specificRequest: ""
});

// ─── Sample Data ──────────────────────────────────────────────────────────────
const SAMPLE_CASES = [
  { id:"c1", caseNumber:"CASE-0001", localId:"HK-2024-001", dateRaised:"2024-01-08", dateResolved:"2024-01-09", managedBy:"Jackie", vvip:true, ews:false, csuite:false, corporateName:"Meridian Holdings", clientPosition:"Managing Director", mastergroup:"MG-Alpha", clientName:"James Weston", clientRelationship:"Existing", connection:"", countryClient:"Hong Kong", referrerName:"David Chan", referrerBusinessLine:"HK WPB", referrerCountry:"Hong Kong", categoryRequest:"Complaints", clientRequest:"Account Access - Digital Channels", countryRequest:"Hong Kong", accountType:"Private Bank PB", transversal:"Domestic", informationProvided:"Client unable to access digital banking for 3 days.", specificRequest:"Restore access and provide compensation.", loggedBy:"Jackie", loggedAt:"2024-01-08T09:00:00Z", lastEditedBy:"Jackie", lastEditedAt:"2024-01-08T09:00:00Z", notes:[] },
  { id:"c2", caseNumber:"CASE-0002", localId:"UK-2024-018", dateRaised:"2024-01-15", dateResolved:"2024-01-17", managedBy:"Serife", vvip:false, ews:true, csuite:false, corporateName:"Apex Capital", clientPosition:"CFO", mastergroup:"", clientName:"Sarah Mitchell", clientRelationship:"NTG", connection:"Referred by senior partner", countryClient:"United Kingdom", referrerName:"Tom Richards", referrerBusinessLine:"UK CMB", referrerCountry:"United Kingdom", categoryRequest:"Accounts Enquiries and Maintenance", clientRequest:"Account Opening/New Product Offers", countryRequest:"United Kingdom", accountType:"Business", transversal:"Transversal", informationProvided:"New client requiring expedited account opening.", specificRequest:"Open account within 48 hours.", loggedBy:"Serife", loggedAt:"2024-01-15T10:00:00Z", lastEditedBy:"Serife", lastEditedAt:"2024-01-15T10:00:00Z", notes:[] },
  { id:"c3", caseNumber:"CASE-0003", localId:"SG-2024-005", dateRaised:"2024-02-01", dateResolved:"", managedBy:"Sayed", vvip:false, ews:false, csuite:true, corporateName:"Sunvale Group", clientPosition:"Group CEO", mastergroup:"MG-Sunvale", clientName:"Li Wei", clientRelationship:"Existing", connection:"Group CEO", countryClient:"Singapore", referrerName:"Priya Shah", referrerBusinessLine:"GPB", referrerCountry:"Singapore", categoryRequest:"Issues", clientRequest:"International Payments and Foreign Currency Transfer", countryRequest:"Singapore", accountType:"Premier", transversal:"Transversal", informationProvided:"Urgent international transfer delayed for 5 business days.", specificRequest:"Immediate release of funds.", loggedBy:"Sayed", loggedAt:"2024-02-01T08:00:00Z", lastEditedBy:"Sayed", lastEditedAt:"2024-02-01T08:00:00Z", notes:[{ text:"Escalated to senior team.", author:"Sayed", at:"2024-02-02T09:00:00Z" }] },
  { id:"c4", caseNumber:"CASE-0004", localId:"HK-2024-012", dateRaised:"2024-02-10", dateResolved:"2024-02-11", managedBy:"Jackie", vvip:false, ews:false, csuite:false, corporateName:"Pinnacle Asset Mgmt", clientPosition:"Portfolio Manager", mastergroup:"", clientName:"Rachel Lam", clientRelationship:"Existing", connection:"", countryClient:"Hong Kong", referrerName:"David Chan", referrerBusinessLine:"HK WPB", referrerCountry:"Hong Kong", categoryRequest:"Complaints", clientRequest:"Charges and Interest", countryRequest:"Hong Kong", accountType:"Private Bank PB", transversal:"Domestic", informationProvided:"Client disputes management fee.", specificRequest:"Refund of incorrect charges.", loggedBy:"Jackie", loggedAt:"2024-02-10T10:00:00Z", lastEditedBy:"Jackie", lastEditedAt:"2024-02-10T10:00:00Z", notes:[] },
  { id:"c5", caseNumber:"CASE-0005", localId:"UK-2024-031", dateRaised:"2024-02-14", dateResolved:"", managedBy:"Serife", vvip:true, ews:false, csuite:false, corporateName:"Thornfield Family Office", clientPosition:"Principal", mastergroup:"MG-Thornfield", clientName:"Edward Thornfield", clientRelationship:"Existing", connection:"Founding family", countryClient:"United Kingdom", referrerName:"Anna Brooks", referrerBusinessLine:"GPB", referrerCountry:"United Kingdom", categoryRequest:"Products", clientRequest:"Lending Product Related", countryRequest:"United Kingdom", accountType:"Private Bank PB", transversal:"Transversal", informationProvided:"Client requesting expedited mortgage review.", specificRequest:"Decision within 5 working days.", loggedBy:"Serife", loggedAt:"2024-02-14T11:00:00Z", lastEditedBy:"Serife", lastEditedAt:"2024-02-14T11:00:00Z", notes:[] },
  { id:"c6", caseNumber:"CASE-0006", localId:"AE-2024-007", dateRaised:"2024-03-01", dateResolved:"2024-03-04", managedBy:"Sayed", vvip:false, ews:true, csuite:false, corporateName:"Gulf Star Trading", clientPosition:"Director", mastergroup:"", clientName:"Omar Al Rashid", clientRelationship:"NTG", connection:"", countryClient:"UAE", referrerName:"Khalid Hassan", referrerBusinessLine:"CIB", referrerCountry:"UAE", categoryRequest:"Accounts Enquiries and Maintenance", clientRequest:"Account Opening/New Product Offers", countryRequest:"UAE", accountType:"Business", transversal:"Domestic", informationProvided:"New corporate client onboarding stalled.", specificRequest:"Prioritise EDD review.", loggedBy:"Sayed", loggedAt:"2024-03-01T09:00:00Z", lastEditedBy:"Sayed", lastEditedAt:"2024-03-01T09:00:00Z", notes:[] },
  { id:"c7", caseNumber:"CASE-0007", localId:"SG-2024-019", dateRaised:"2024-03-05", dateResolved:"2024-03-06", managedBy:"Jackie", vvip:false, ews:false, csuite:false, corporateName:"Sunvale Group", clientPosition:"Chairman", mastergroup:"MG-Sunvale", clientName:"Li Wei", clientRelationship:"Existing", connection:"Group Chairman", countryClient:"Singapore", referrerName:"James Tan", referrerBusinessLine:"GPB", referrerCountry:"Singapore", categoryRequest:"Issues", clientRequest:"Card Related", countryRequest:"Singapore", accountType:"Premier", transversal:"Domestic", informationProvided:"Debit card blocked after failed overseas transaction.", specificRequest:"Unblock card.", loggedBy:"Jackie", loggedAt:"2024-03-05T10:00:00Z", lastEditedBy:"Jackie", lastEditedAt:"2024-03-05T10:00:00Z", notes:[] },
  { id:"c8", caseNumber:"CASE-0008", localId:"HK-2024-028", dateRaised:"2024-03-12", dateResolved:"", managedBy:"Serife", vvip:false, ews:false, csuite:false, corporateName:"Crescent Capital HK", clientPosition:"Head of Operations", mastergroup:"", clientName:"Michael Cheung", clientRelationship:"Existing", connection:"", countryClient:"Hong Kong", referrerName:"David Chan", referrerBusinessLine:"HK CMB", referrerCountry:"Hong Kong", categoryRequest:"Other Complex Queries", clientRequest:"Third Party Mandates", countryRequest:"Hong Kong", accountType:"Business", transversal:"Domestic", informationProvided:"Client requesting new authorised signatory.", specificRequest:"Process mandate update.", loggedBy:"Serife", loggedAt:"2024-03-12T09:00:00Z", lastEditedBy:"Serife", lastEditedAt:"2024-03-12T09:00:00Z", notes:[] },
];

// ─── Import View ──────────────────────────────────────────────────────────────
function ImportView({ cases, saveCases, showToast, currentUser }) {
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [preview, setPreview] = useState([]);
  const [imported, setImported] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileRef = useRef();

  const CMS_FIELDS = [
    { key: "localId",              label: "Local ID" },
    { key: "dateRaised",           label: "Date Raised (YYYY-MM-DD)" },
    { key: "dateResolved",         label: "Date Resolved (YYYY-MM-DD)" },
    { key: "managedBy",            label: "Case Manager" },
    { key: "clientName",           label: "Client Name" },
    { key: "corporateName",        label: "Corporate Name" },
    { key: "clientPosition",       label: "Client Position" },
    { key: "clientRelationship",   label: "Client Relationship" },
    { key: "countryClient",        label: "Client Country" },
    { key: "connection",           label: "Connection" },
    { key: "mastergroup",          label: "Mastergroup" },
    { key: "referrerName",         label: "Referrer Name" },
    { key: "referrerBusinessLine", label: "Referrer Business Line" },
    { key: "referrerCountry",      label: "Referrer Country" },
    { key: "categoryRequest",      label: "Category of Request" },
    { key: "clientRequest",        label: "Client Request" },
    { key: "countryRequest",       label: "Country of Request" },
    { key: "accountType",          label: "Account Type" },
    { key: "transversal",          label: "Transversal / Domestic" },
    { key: "vvip",                 label: "VVIP (Yes/No)" },
    { key: "ews",                  label: "EWS (Yes/No)" },
    { key: "csuite",               label: "C-Suite (Yes/No)" },
    { key: "informationProvided",  label: "Information Provided" },
    { key: "specificRequest",      label: "Specific Request" },
  ];

  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    const parseRow = line => {
      const cols = []; let cur = "", inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQ = !inQ; continue; }
        if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ""; continue; }
        cur += ch;
      }
      cols.push(cur.trim());
      return cols;
    };
    return lines.map(parseRow);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target.result;
      const parsed = parseCSV(text);
      if (parsed.length < 2) { showToast("File appears empty or unreadable.", "warn"); return; }
      const hdrs = parsed[0];
      const dataRows = parsed.slice(1).filter(r => r.some(c => c));
      setHeaders(hdrs);
      setRows(dataRows);
      setPreview(dataRows.slice(0, 3));
      // Auto-map: try to match header names to CMS fields
      const autoMap = {};
      CMS_FIELDS.forEach(({ key, label }) => {
        const match = hdrs.findIndex(h => h.toLowerCase().replace(/[^a-z]/g,"") === label.toLowerCase().replace(/[^a-z]/g,"") || h.toLowerCase().replace(/[^a-z]/g,"") === key.toLowerCase());
        if (match >= 0) autoMap[key] = match.toString();
      });
      setMapping(autoMap);
      setImported(false);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!rows.length) return;
    setImporting(true);
    const now = nowStr();
    const existing = new Set(cases.map(c => c.localId).filter(Boolean));
    const newCases = [];
    let skipped = 0;

    const parseDate = v => {
      if (!v) return "";
      const dmySlash = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (dmySlash) return `${dmySlash[3]}-${dmySlash[2].padStart(2,"0")}-${dmySlash[1].padStart(2,"0")}`;
      const dmyDash = v.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
      if (dmyDash) return `${dmyDash[3]}-${dmyDash[2].padStart(2,"0")}-${dmyDash[1].padStart(2,"0")}`;
      if (v.match(/^\d{4}-\d{2}-\d{2}$/)) return v;
      return v;
    };

    rows.forEach((row, i) => {
      const get = key => mapping[key] !== undefined ? (row[parseInt(mapping[key])] || "").trim() : "";
      const localId = get("localId");
      if (localId && existing.has(localId)) { skipped++; return; }
      const bool = v => ["yes","true","1","y"].includes((v||"").toLowerCase());
      newCases.push({
        id: `import_${Date.now()}_${i}`,
        caseNumber: generateCaseId(cases.length + newCases.length),
        localId,
        dateRaised:           parseDate(get("dateRaised")),
        dateResolved:         parseDate(get("dateResolved")),
        managedBy:            get("managedBy"),
        clientName:           get("clientName"),
        corporateName:        get("corporateName"),
        clientPosition:       get("clientPosition"),
        clientRelationship:   get("clientRelationship"),
        countryClient:        get("countryClient"),
        connection:           get("connection"),
        mastergroup:          get("mastergroup"),
        referrerName:         get("referrerName"),
        referrerBusinessLine: get("referrerBusinessLine"),
        referrerCountry:      get("referrerCountry"),
        categoryRequest:      get("categoryRequest"),
        clientRequest:        get("clientRequest"),
        countryRequest:       get("countryRequest"),
        accountType:          get("accountType"),
        transversal:          get("transversal"),
        vvip:   bool(get("vvip")),
        ews:    bool(get("ews")),
        csuite: bool(get("csuite")),
        informationProvided: get("informationProvided"),
        specificRequest:     get("specificRequest"),
        loggedBy: currentUser.name, loggedAt: now,
        lastEditedBy: currentUser.name, lastEditedAt: now,
        notes: [],
      });
    });

    if (newCases.length === 0) {
      setImporting(false);
      showToast(`Nothing to import. ${skipped} row(s) skipped (duplicate Local ID).`, "warn");
      return;
    }

    setImportProgress(0);
    // Insert in batches of 20 to avoid timeouts
    try {
      const toInsert = newCases.map(c => ({
        id: c.id, case_number: c.caseNumber, local_id: c.localId,
        date_raised: c.dateRaised, date_resolved: c.dateResolved,
        managed_by: c.managedBy, vvip: c.vvip, ews: c.ews, csuite: c.csuite,
        corporate_name: c.corporateName, client_position: c.clientPosition,
        mastergroup: c.mastergroup, client_name: c.clientName,
        client_relationship: c.clientRelationship, connection: c.connection,
        country_client: c.countryClient, referrer_name: c.referrerName,
        referrer_business_line: c.referrerBusinessLine, referrer_country: c.referrerCountry,
        category_request: c.categoryRequest, client_request: c.clientRequest,
        country_request: c.countryRequest, account_type: c.accountType,
        transversal: c.transversal, information_provided: c.informationProvided,
        specific_request: c.specificRequest, logged_by: c.loggedBy,
        logged_at: c.loggedAt, last_edited_by: c.lastEditedBy,
        last_edited_at: c.lastEditedAt, notes: c.notes || [],
      }));
      const batchSize = 20;
      const totalBatches = Math.ceil(toInsert.length / batchSize);
      for (let i = 0; i < toInsert.length; i += batchSize) {
        const batch = toInsert.slice(i, i + batchSize);
        const { error } = await supabase.from("cases").upsert(batch);
        if (error) throw error;
        const batchNum = Math.floor(i / batchSize) + 1;
        setImportProgress(Math.round((batchNum / totalBatches) * 100));
      }
      setCases([...cases, ...newCases]);
      setImporting(false);
      setImported(true);
      showToast(`Imported ${newCases.length} cases.${skipped ? ` ${skipped} skipped (duplicate Local ID).` : ""}`);
    } catch(e) {
      console.error(e);
      setImporting(false);
      showToast("Import failed: " + (e.message || "unknown error"), "warn");
    }
  }

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: HSBC_DARK }}>Import Cases</h1>
      <div style={{ fontSize: 13, color: HSBC_MUTED, marginBottom: 24 }}>Upload a CSV file and map your columns to the system fields. Duplicate Local IDs will be skipped.</div>

      {/* Step 1: Upload */}
      <div style={{ ...card, marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Step 1 — Upload your CSV file</div>
        <div style={{ fontSize: 12, color: HSBC_MUTED, marginBottom: 12 }}>Save your Excel file as CSV (File → Save As → CSV) before uploading.</div>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: "none" }} />
        <button style={btn("primary")} onClick={() => fileRef.current.click()}>Choose CSV File</button>
        {headers.length > 0 && (
          <span style={{ marginLeft: 14, fontSize: 13, color: HSBC_MUTED }}>{rows.length} rows detected · {headers.length} columns</span>
        )}
      </div>

      {/* Step 2: Map columns */}
      {headers.length > 0 && (
        <div style={{ ...card, marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Step 2 — Map your columns</div>
          <div style={{ fontSize: 12, color: HSBC_MUTED, marginBottom: 16 }}>Match each system field to a column from your file. Fields with no match will be left blank.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {CMS_FIELDS.map(({ key, label: l }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 200, fontSize: 12, color: HSBC_TEXT, fontWeight: 600, flexShrink: 0 }}>{l}</div>
                <select style={{ ...inp }} value={mapping[key] ?? ""} onChange={e => setMapping(p => ({ ...p, [key]: e.target.value }))}>
                  <option value="">— skip —</option>
                  {headers.map((h, i) => <option key={i} value={i.toString()}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {headers.length > 0 && preview.length > 0 && (
        <div style={{ ...card, marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Step 3 — Preview (first 3 rows)</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead><tr style={{ background: "#fafafa" }}>
                {CMS_FIELDS.filter(f => mapping[f.key] !== undefined && mapping[f.key] !== "").map(f => (
                  <th key={f.key} style={th}>{f.label}</th>
                ))}
              </tr></thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {CMS_FIELDS.filter(f => mapping[f.key] !== undefined && mapping[f.key] !== "").map(f => (
                      <td key={f.key} style={td}>{row[parseInt(mapping[f.key])] || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 4: Import */}
      {headers.length > 0 && !imported && (
        <div style={{ ...card }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Step 4 — Import</div>
          <div style={{ fontSize: 13, color: HSBC_MUTED, marginBottom: 16 }}>This will add <strong>{rows.length} rows</strong> to the system. Rows with duplicate Local IDs will be skipped. This action cannot be undone.</div>
          <button style={btn("primary")} onClick={handleImport} disabled={importing}>
            {importing ? `Importing… ${importProgress}%` : `Import ${rows.length} rows`}
          </button>
          {importing && (
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 6, background: "#f0f0f0", borderRadius: 4, overflow: "hidden", width: "100%", maxWidth: 320 }}>
                <div style={{ height: "100%", background: HSBC_RED, borderRadius: 4, width: `${importProgress}%`, transition: "width 0.3s ease" }} />
              </div>
              <div style={{ fontSize: 11, color: HSBC_MUTED, marginTop: 5 }}>{importProgress}% complete — please do not close this page</div>
            </div>
          )}
        </div>
      )}

      {imported && (
        <div style={{ ...card, borderTop: `3px solid #16a34a` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#166534", marginBottom: 6 }}>✓ Import complete</div>
          <div style={{ fontSize: 13, color: HSBC_MUTED }}>Your cases have been added to the system. Go to Cases to review them.</div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function HSBCComplaints() {
  const [currentUser, setCurrentUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [view, setView] = useState("cases");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCase, setEditCase] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [toast, setToast] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newNote, setNewNote] = useState("");

  // Case filters
  const [fSearch, setFSearch] = useState("");
  const [fManager, setFManager] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fCategory, setFCategory] = useState("");
  const [fDateFrom, setFDateFrom] = useState("");
  const [fDateTo, setFDateTo] = useState("");
  const [fVVIP, setFVVIP] = useState("");
  const [fEWS, setFEWS] = useState("");
  const [fBizLine, setFBizLine] = useState("");
  const [fCountry, setFCountry] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  // Analytics filters
  const [aManager, setAManager] = useState("");
  const [aDateFrom, setADateFrom] = useState("");
  const [aDateTo, setADateTo] = useState("");
  const [aBizLine, setABizLine] = useState("");
  const [aCountry, setACountry] = useState("");

  useEffect(() => { if (currentUser) loadCases(); }, [currentUser]);

  async function loadCases() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      const mapped = (data || []).map(r => ({
        id: r.id, caseNumber: r.case_number, localId: r.local_id,
        dateRaised: r.date_raised, dateResolved: r.date_resolved,
        managedBy: r.managed_by, vvip: r.vvip, ews: r.ews, csuite: r.csuite,
        corporateName: r.corporate_name, clientPosition: r.client_position,
        mastergroup: r.mastergroup, clientName: r.client_name,
        clientRelationship: r.client_relationship, connection: r.connection,
        countryClient: r.country_client, referrerName: r.referrer_name,
        referrerBusinessLine: r.referrer_business_line, referrerCountry: r.referrer_country,
        categoryRequest: r.category_request, clientRequest: r.client_request,
        countryRequest: r.country_request, accountType: r.account_type,
        transversal: r.transversal, informationProvided: r.information_provided,
        specificRequest: r.specific_request, loggedBy: r.logged_by,
        loggedAt: r.logged_at, lastEditedBy: r.last_edited_by,
        lastEditedAt: r.last_edited_at, notes: r.notes || [],
      }));
      setCases(mapped);
    } catch(e) {
      console.error(e);
      setCases([]);
    }
    setLoading(false);
  }

  async function saveCases(updated) {
    const rows = updated.map(c => ({
      id: c.id, case_number: c.caseNumber, local_id: c.localId,
      date_raised: c.dateRaised, date_resolved: c.dateResolved,
      managed_by: c.managedBy, vvip: c.vvip, ews: c.ews, csuite: c.csuite,
      corporate_name: c.corporateName, client_position: c.clientPosition,
      mastergroup: c.mastergroup, client_name: c.clientName,
      client_relationship: c.clientRelationship, connection: c.connection,
      country_client: c.countryClient, referrer_name: c.referrerName,
      referrer_business_line: c.referrerBusinessLine, referrer_country: c.referrerCountry,
      category_request: c.categoryRequest, client_request: c.clientRequest,
      country_request: c.countryRequest, account_type: c.accountType,
      transversal: c.transversal, information_provided: c.informationProvided,
      specific_request: c.specificRequest, logged_by: c.loggedBy,
      logged_at: c.loggedAt, last_edited_by: c.lastEditedBy,
      last_edited_at: c.lastEditedAt, notes: c.notes || [],
    }));
    const { error } = await supabase.from('cases').upsert(rows);
    if (error) { console.error('Save error:', error); return; }
    setCases(updated);
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function setF(field) { return v => setForm(p => ({ ...p, [field]: v })); }

  function validateForm() {
    const errors = {};
    if (!form.dateRaised)  errors.dateRaised  = true;
    if (!form.managedBy)   errors.managedBy   = true;
    if (!form.clientName)  errors.clientName  = true;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) { showToast("Please fill in all required fields.", "warn"); return; }
    const tat = getWorkingDays(form.dateRaised, form.dateResolved);
    const tatCat = getTATCategory(tat, !!form.dateResolved);
    const now = nowStr();
    if (editCase) {
      const updated = cases.map(c => c.id === editCase.id
        ? { ...c, ...form, tat, tatCategory: tatCat, lastEditedBy: currentUser.name, lastEditedAt: now }
        : c);
      await saveCases(updated);
      setSelectedCase(updated.find(c => c.id === editCase.id));
      showToast("Case updated.");
      setEditCase(null);
    } else {
      const newCase = {
        ...form, id: Date.now().toString(),
        caseNumber: generateCaseId(cases.length),
        tat, tatCategory: tatCat,
        loggedBy: currentUser.name, loggedAt: now,
        lastEditedBy: currentUser.name, lastEditedAt: now,
        notes: [],
      };
      const updated = [newCase, ...cases];
      await saveCases(updated);
      showToast("Case logged successfully.");
    }
    setForm(emptyForm()); setShowForm(false); setFormErrors({});
  }

  function openEdit(c) {
    setForm({ localId:c.localId||"", dateRaised:c.dateRaised||"", dateResolved:c.dateResolved||"", managedBy:c.managedBy||"", vvip:c.vvip||false, ews:c.ews||false, csuite:c.csuite||false, corporateName:c.corporateName||"", clientPosition:c.clientPosition||"", mastergroup:c.mastergroup||"", clientName:c.clientName||"", clientRelationship:c.clientRelationship||"", connection:c.connection||"", countryClient:c.countryClient||"", referrerName:c.referrerName||"", referrerBusinessLine:c.referrerBusinessLine||"", referrerCountry:c.referrerCountry||"", categoryRequest:c.categoryRequest||"", clientRequest:c.clientRequest||"", countryRequest:c.countryRequest||"", accountType:c.accountType||"", transversal:c.transversal||"", informationProvided:c.informationProvided||"", specificRequest:c.specificRequest||"" });
    setEditCase(c); setShowForm(true); setSelectedCase(null); setFormErrors({});
  }

  async function handleDelete(id) {
    const updated = cases.filter(c => c.id !== id);
    await saveCases(updated);
    setShowDeleteConfirm(null);
    setSelectedCase(null);
    showToast("Case deleted.");
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    const note = { text: newNote.trim(), author: currentUser.name, at: nowStr() };
    const updated = cases.map(c => c.id === selectedCase.id
      ? { ...c, notes: [...(c.notes || []), note], lastEditedBy: currentUser.name, lastEditedAt: nowStr() }
      : c);
    await saveCases(updated);
    setSelectedCase(updated.find(c => c.id === selectedCase.id));
    setNewNote("");
    showToast("Note added.");
  }

  // Export to Excel (CSV)
  function exportToCSV() {
    const headers = ["Case No.","Local ID","Date Raised","Date Resolved","TAT (days)","TAT Category","Manager","Client Name","Corporate","Position","Relationship","Country","Referrer","Business Line","Category","Request","Account Type","Transversal","VVIP","EWS","C-Suite","Logged By","Logged At"];
    const rows = aCases.map(c => {
      const tat = getWorkingDays(c.dateRaised, c.dateResolved);
      const tatCat = TAT_CATEGORIES[getTATCategory(tat, !!c.dateResolved)];
      return [c.caseNumber,c.localId,c.dateRaised,c.dateResolved,tat??"",[tatCat],c.managedBy,c.clientName,c.corporateName,c.clientPosition,c.clientRelationship,c.countryClient,c.referrerName,c.referrerBusinessLine,c.categoryRequest,c.clientRequest,c.accountType,c.transversal,c.vvip?"Yes":"No",c.ews?"Yes":"No",c.csuite?"Yes":"No",c.loggedBy,c.loggedAt?fmtDateTime(c.loggedAt):""];
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${(v||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "cms_export.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  // Filtered cases
  const filtered = cases.filter(c => {
    if (fSearch && !c.clientName?.toLowerCase().includes(fSearch.toLowerCase()) && !c.corporateName?.toLowerCase().includes(fSearch.toLowerCase()) && !c.caseNumber?.toLowerCase().includes(fSearch.toLowerCase()) && !c.localId?.toLowerCase().includes(fSearch.toLowerCase())) return false;
    if (fManager && c.managedBy !== fManager) return false;
    if (fStatus === "open" && c.dateResolved) return false;
    if (fStatus === "resolved" && !c.dateResolved) return false;
    if (fCategory && c.categoryRequest !== fCategory) return false;
    if (fDateFrom && c.dateRaised < fDateFrom) return false;
    if (fDateTo && c.dateRaised > fDateTo) return false;
    if (fVVIP === "yes" && !c.vvip) return false;
    if (fVVIP === "no" && c.vvip) return false;
    if (fEWS === "yes" && !c.ews) return false;
    if (fEWS === "no" && c.ews) return false;
    if (fBizLine && c.referrerBusinessLine !== fBizLine) return false;
    if (fCountry && c.countryClient !== fCountry) return false;
    return true;
  });

  // Analytics filtered
  const aCases = cases.filter(c => {
    if (aManager && c.managedBy !== aManager) return false;
    if (aBizLine && c.referrerBusinessLine !== aBizLine) return false;
    if (aCountry && c.countryClient !== aCountry) return false;
    if (aDateFrom && c.dateRaised < aDateFrom) return false;
    if (aDateTo && c.dateRaised > aDateTo) return false;
    return true;
  });

  const resolved = aCases.filter(c => !!c.dateResolved);
  const open = aCases.filter(c => !c.dateResolved);

  const tatCounts = Object.keys(TAT_CATEGORIES).map(k => ({
    key: k, label: TAT_CATEGORIES[k],
    count: aCases.filter(c => { const t = getWorkingDays(c.dateRaised, c.dateResolved); return getTATCategory(t, !!c.dateResolved) === k; }).length
  }));

  function countBy(fn) {
    const m = {}; aCases.forEach(c => { const k = fn(c); if (k) m[k] = (m[k]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([label,count])=>({label,count}));
  }

  const byManager      = CASE_MANAGERS.map(m => ({ label: m, count: aCases.filter(c => c.managedBy === m).length }));
  const byCategory     = countBy(c => c.categoryRequest);
  const byCountry      = countBy(c => c.countryClient);
  const byBizLine      = countBy(c => c.referrerBusinessLine);
  const byAccountType  = countBy(c => c.accountType);
  const byClientRequest = countBy(c => c.clientRequest);

  const byPeriod = countBy(c => c.dateRaised ? `${getYear(c.dateRaised)} ${getMonth(c.dateRaised)}` : null);

  // Styles
  const sidebar  = { width: 220, background: HSBC_SIDEBAR, color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh" };
  const navItem  = (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "11px 20px", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 400, color: active ? "#fff" : "rgba(255,255,255,0.75)", background: active ? HSBC_RED : "transparent", transition: "all 0.15s" });
  const errInp   = (field) => ({ ...inp, borderColor: formErrors[field] ? "#ef4444" : HSBC_BORDER });

  if (!currentUser) return <LoginScreen onLogin={setCurrentUser} />;
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: HSBC_LIGHT }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: HSBC_RED, marginBottom: 8 }}>HSBC</div>
        <div style={{ color: HSBC_MUTED, fontSize: 13 }}>Loading workspace…</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", background: HSBC_LIGHT }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: toast.type === "warn" ? "#fef3c7" : "#dcfce7", border: `1px solid ${toast.type === "warn" ? "#f59e0b" : "#16a34a"}`, color: toast.type === "warn" ? "#92400e" : "#166534", padding: "10px 18px", borderRadius: 6, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          {toast.msg}
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: "28px 32px", width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: HSBC_DARK, marginBottom: 8 }}>Delete Case</div>
            <div style={{ fontSize: 13, color: HSBC_MUTED, marginBottom: 24 }}>Are you sure you want to delete <strong>{showDeleteConfirm.caseNumber}</strong>? This cannot be undone.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={btn("danger")} onClick={() => handleDelete(showDeleteConfirm.id)}>Delete</button>
              <button style={btn("ghost")} onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div style={sidebar}>
        <div style={{ padding: "24px 20px 16px" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>HSBC</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>VVIP Logging</div>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "0 20px 12px" }} />
        {[
          { key: "cases",     icon: "📋", label: "Cases" },
          { key: "clients",   icon: "👤", label: "Clients" },
          { key: "reporting", icon: "📊", label: "Management Reporting" },
          { key: "import",    icon: "📥", label: "Import Cases" },
        ].map(({ key, icon, label: l }) => (
          <div key={key} style={navItem(view === key)} onClick={() => { setView(key); setSelectedCase(null); setShowForm(false); }}>
            <span>{icon}</span><span>{l}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>Signed in as</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{currentUser.name}</div>
          {currentUser.role === "admin" && <Badge label="Admin" color="#f59e0b" bg="rgba(245,158,11,0.2)" />}
          <button onClick={() => setCurrentUser(null)} style={{ marginTop: 10, background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 4, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: "100vh", padding: "28px 32px" }}>

        {/* ── CASES ── */}
        {view === "cases" && !selectedCase && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: HSBC_DARK }}>All Cases</h1>
                <div style={{ fontSize: 13, color: HSBC_MUTED, marginTop: 3 }}>{cases.length} total · {cases.filter(c => !c.dateResolved).length} open</div>
              </div>
              <button style={btn("primary")} onClick={() => { setForm(emptyForm()); setEditCase(null); setShowForm(true); setFormErrors({}); }}>+ New Case</button>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
              <input style={{ ...inp, width: 220 }} placeholder="Search case, client, ID…" value={fSearch} onChange={e => setFSearch(e.target.value)} />
              <select style={{ ...inp, width: 150 }} value={fManager} onChange={e => setFManager(e.target.value)}>
                <option value="">All Managers</option>
                {CASE_MANAGERS.map(m => <option key={m}>{m}</option>)}
              </select>
              <select style={{ ...inp, width: 130 }} value={fStatus} onChange={e => setFStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
              <select style={{ ...inp, width: 190 }} value={fCategory} onChange={e => setFCategory(e.target.value)}>
                <option value="">All Categories</option>
                {CLIENT_REQUEST_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select style={{ ...inp, width: 120 }} value={fVVIP} onChange={e => setFVVIP(e.target.value)}>
                <option value="">VVIP: All</option><option value="yes">VVIP: Yes</option><option value="no">VVIP: No</option>
              </select>
              <select style={{ ...inp, width: 120 }} value={fEWS} onChange={e => setFEWS(e.target.value)}>
                <option value="">EWS: All</option><option value="yes">EWS: Yes</option><option value="no">EWS: No</option>
              </select>
              <select style={{ ...inp, width: 160 }} value={fBizLine} onChange={e => setFBizLine(e.target.value)}>
                <option value="">All Business Lines</option>
                {BUSINESS_LINES.map(b => <option key={b}>{b}</option>)}
              </select>
              <select style={{ ...inp, width: 160 }} value={fCountry} onChange={e => setFCountry(e.target.value)}>
                <option value="">All Countries</option>
                {[...new Set(cases.map(c => c.countryClient).filter(Boolean))].sort().map(c => <option key={c}>{c}</option>)}
              </select>
              <input style={{ ...inp, width: 130 }} type="date" value={fDateFrom} onChange={e => setFDateFrom(e.target.value)} title="From date" />
              <input style={{ ...inp, width: 130 }} type="date" value={fDateTo} onChange={e => setFDateTo(e.target.value)} title="To date" />
              {(fSearch||fManager||fStatus||fCategory||fDateFrom||fDateTo||fVVIP||fEWS||fBizLine||fCountry) && (
                <button style={btn("ghost")} onClick={() => { setFSearch(""); setFManager(""); setFStatus(""); setFCategory(""); setFDateFrom(""); setFDateTo(""); setFVVIP(""); setFEWS(""); setFBizLine(""); setFCountry(""); }}>Clear all</button>
              )}
            </div>

            {/* New / Edit Case Form */}
            {showForm && (
              <div style={{ ...card, marginBottom: 22, borderTop: `3px solid ${HSBC_RED}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: HSBC_DARK }}>{editCase ? `Edit Case · ${editCase.caseNumber}` : "New Case"}</h2>
                  <button style={btn("ghost")} onClick={() => { setShowForm(false); setEditCase(null); setFormErrors({}); }}>Cancel</button>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid #f0f0f0` }}>Case Details</div>
                <div style={{ ...grid3, marginBottom: 16 }}>
                  <Field label="Local Identifier No.">
                    <AutoSuggestInput
                      value={form.localId}
                      placeholder="e.g. HK-2024-001"
                      suggestions={cases.filter(c => c.localId).map(c => ({ label: c.localId, sub: c.clientName, case: c }))}
                      onChange={v => setF("localId")(v)}
                      onSelect={s => {
                        const last = cases.find(c => c.localId === s.label);
                        if (last) {
                          setForm(p => ({ ...p,
                            localId: last.localId, clientName: last.clientName||"",
                            corporateName: last.corporateName||"", clientPosition: last.clientPosition||"",
                            clientRelationship: last.clientRelationship||"", countryClient: last.countryClient||"",
                            connection: last.connection||"", mastergroup: last.mastergroup||"",
                            vvip: last.vvip||false, ews: last.ews||false, csuite: last.csuite||false,
                            referrerName: last.referrerName||"", referrerBusinessLine: last.referrerBusinessLine||"",
                            referrerCountry: last.referrerCountry||"",
                          }));
                        } else {
                          setF("localId")(s.label);
                        }
                      }}
                    />
                  </Field>
                  <Field label="Date Case Raised" required><input style={errInp("dateRaised")} type="date" value={form.dateRaised} onChange={e => setF("dateRaised")(e.target.value)} /></Field>
                  <Field label="Date Case Resolved"><input style={inp} type="date" value={form.dateResolved} onChange={e => setF("dateResolved")(e.target.value)} /></Field>
                  <Field label="Case Managed By" required><Select value={form.managedBy} onChange={v => { setF("managedBy")(v); setFormErrors(p => ({ ...p, managedBy: false })); }} options={CASE_MANAGERS} placeholder="Select…" /></Field>
                  <Field label="Query Account Type"><Select value={form.accountType} onChange={setF("accountType")} options={ACCOUNT_TYPES} placeholder="Select…" /></Field>
                  <Field label="Transversal / Domestic"><Select value={form.transversal} onChange={setF("transversal")} options={TRANSVERSAL_OPTIONS} placeholder="Select…" /></Field>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid #f0f0f0` }}>Flags</div>
                <div style={{ display: "flex", gap: 32, marginBottom: 16 }}>
                  <Field label="VVIP"><Toggle value={form.vvip} onChange={setF("vvip")} /></Field>
                  <Field label="EWS in Any Market"><Toggle value={form.ews} onChange={setF("ews")} /></Field>
                  <Field label="C-Suite"><Toggle value={form.csuite} onChange={setF("csuite")} /></Field>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid #f0f0f0` }}>Client Information <span style={{ color: HSBC_MUTED, fontSize: 10, fontWeight: 400, textTransform: "none" }}>— snapshot at time of case</span></div>
                <div style={{ ...grid3, marginBottom: 16 }}>
                  <Field label="Client Name" required>
                    <AutoSuggestInput
                      value={form.clientName}
                      inputStyle={errInp("clientName")}
                      placeholder="Full name"
                      suggestions={[...new Map(cases.map(c => [c.clientName, { label: c.clientName, sub: [c.clientPosition, c.corporateName].filter(Boolean).join(" · "), case: c }])).values()].filter(s => s.label)}
                      onChange={v => { setF("clientName")(v); setFormErrors(p => ({ ...p, clientName: false })); }}
                      onSelect={s => {
                        const last = [...cases].filter(c => c.clientName === s.label).sort((a,b) => new Date(b.dateRaised)-new Date(a.dateRaised))[0];
                        if (last) {
                          setForm(p => ({ ...p,
                            clientName: last.clientName, corporateName: last.corporateName||"",
                            clientPosition: last.clientPosition||"", clientRelationship: last.clientRelationship||"",
                            countryClient: last.countryClient||"", connection: last.connection||"",
                            mastergroup: last.mastergroup||"", vvip: last.vvip||false,
                            ews: last.ews||false, csuite: last.csuite||false,
                            referrerName: last.referrerName||"", referrerBusinessLine: last.referrerBusinessLine||"",
                            referrerCountry: last.referrerCountry||"",
                          }));
                        } else {
                          setF("clientName")(s.label);
                        }
                        setFormErrors(p => ({ ...p, clientName: false }));
                      }}
                    />
                  </Field>
                  <Field label="Client Relationship"><Select value={form.clientRelationship} onChange={setF("clientRelationship")} options={CLIENT_RELATIONSHIPS} placeholder="Select…" /></Field>
                  <Field label="Country Client Based"><SearchableDropdown options={COUNTRIES} value={form.countryClient} onChange={setF("countryClient")} placeholder="Search country…" /></Field>
                  <Field label="Corporate Name (at time of case)"><input style={inp} value={form.corporateName} onChange={e => setF("corporateName")(e.target.value)} placeholder="Company name" /></Field>
                  <Field label="Position / Job Title (at time of case)"><input style={inp} value={form.clientPosition} onChange={e => setF("clientPosition")(e.target.value)} placeholder="e.g. Managing Director" /></Field>
                  <Field label="Top 400 CIB Mastergroup"><input style={inp} value={form.mastergroup} onChange={e => setF("mastergroup")(e.target.value)} placeholder="MG name" /></Field>
                  <Field label="Connection"><input style={inp} value={form.connection} onChange={e => setF("connection")(e.target.value)} placeholder="e.g. Group CEO" /></Field>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid #f0f0f0` }}>Referrer</div>
                <div style={{ ...grid3, marginBottom: 16 }}>
                  <Field label="Referrer Name"><input style={inp} value={form.referrerName} onChange={e => setF("referrerName")(e.target.value)} placeholder="Full name" /></Field>
                  <Field label="Referrer Business Line"><Select value={form.referrerBusinessLine} onChange={setF("referrerBusinessLine")} options={BUSINESS_LINES} placeholder="Select…" /></Field>
                  <Field label="Referrer Country"><SearchableDropdown options={COUNTRIES} value={form.referrerCountry} onChange={setF("referrerCountry")} placeholder="Search country…" /></Field>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid #f0f0f0` }}>Request Details</div>
                <div style={{ ...grid3, marginBottom: 16 }}>
                  <Field label="Category of Client Request"><Select value={form.categoryRequest} onChange={setF("categoryRequest")} options={CLIENT_REQUEST_CATEGORIES} placeholder="Select…" /></Field>
                  <Field label="Client Request"><SearchableDropdown options={CLIENT_REQUESTS} value={form.clientRequest} onChange={setF("clientRequest")} placeholder="Search request type…" /></Field>
                  <Field label="Country Request Relating To"><SearchableDropdown options={COUNTRIES} value={form.countryRequest} onChange={setF("countryRequest")} placeholder="Search country…" /></Field>
                </div>
                <div style={{ ...grid2, marginBottom: 16 }}>
                  <Field label="Information Provided"><textarea style={{ ...inp, height: 90, resize: "vertical" }} value={form.informationProvided} onChange={e => setF("informationProvided")(e.target.value)} placeholder="Full case details…" /></Field>
                  <Field label="Specific Request / Outcome Desired"><textarea style={{ ...inp, height: 90, resize: "vertical" }} value={form.specificRequest} onChange={e => setF("specificRequest")(e.target.value)} placeholder="Summary of desired outcome…" /></Field>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button style={btn("primary")} onClick={handleSubmit}>{editCase ? "Save Changes" : "Submit Case"}</button>
                  <button style={btn("ghost")} onClick={() => { setShowForm(false); setEditCase(null); setFormErrors({}); }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Cases Table */}
            <div style={card}>
              <div style={{ fontSize: 12, color: HSBC_MUTED, marginBottom: 12 }}>{filtered.length} case{filtered.length !== 1 ? "s" : ""} shown</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      {["Case No.", "Local ID", "Client", "Corporate", "Position", "Manager", "Date Raised", "TAT", "Category", "Status", "Flags", ""].map(h => <th key={h} style={th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={12} style={{ ...td, textAlign: "center", color: HSBC_MUTED, padding: 32 }}>No cases match your filters.</td></tr>
                    ) : filtered.map(c => {
                      const tat = getWorkingDays(c.dateRaised, c.dateResolved);
                      const tatCat = getTATCategory(tat, !!c.dateResolved);
                      return (
                        <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setSelectedCase(c)}>
                          <td style={td}><span style={{ fontWeight: 700, color: HSBC_RED, fontSize: 12 }}>{c.caseNumber}</span></td>
                          <td style={td}><span style={{ fontSize: 12, color: HSBC_MUTED }}>{c.localId || "—"}</span></td>
                          <td style={td}><span style={{ fontWeight: 600 }}>{c.clientName}</span></td>
                          <td style={td}><span style={{ fontSize: 12 }}>{c.corporateName || "—"}</span></td>
                          <td style={td}><span style={{ fontSize: 12 }}>{c.clientPosition || "—"}</span></td>
                          <td style={td}>{c.managedBy}</td>
                          <td style={td}><span style={{ fontSize: 12 }}>{c.dateRaised}</span></td>
                          <td style={td}><Badge label={TAT_CATEGORIES[tatCat]} color={TAT_BADGE[tatCat].color} bg={TAT_BADGE[tatCat].bg} /></td>
                          <td style={td}><span style={{ fontSize: 12 }}>{c.categoryRequest}</span></td>
                          <td style={td}>{c.dateResolved ? <Badge label="Resolved" color="#166534" bg="#dcfce7" /> : <Badge label="Open" color={HSBC_RED} bg="#fff1f2" />}</td>
                          <td style={td}>
                            <div style={{ display: "flex", gap: 4 }}>
                              {c.vvip   && <Badge label="VVIP"    color="#7c3aed" bg="#f5f3ff" />}
                              {c.csuite && <Badge label="C-Suite" color="#0369a1" bg="#e0f2fe" />}
                              {c.ews    && <Badge label="EWS"     color="#b45309" bg="#fef3c7" />}
                            </div>
                          </td>
                          <td style={td} onClick={e => e.stopPropagation()}>
                            <button style={{ ...btn("ghost"), padding: "4px 10px", fontSize: 11 }} onClick={() => openEdit(c)}>Edit</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CASE DETAIL ── */}
        {view === "cases" && selectedCase && (() => {
          const c = selectedCase;
          const tat = getWorkingDays(c.dateRaised, c.dateResolved);
          const tatCat = getTATCategory(tat, !!c.dateResolved);
          return (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <button style={{ ...btn("ghost"), padding: "6px 14px" }} onClick={() => setSelectedCase(null)}>← Back</button>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: HSBC_DARK }}>{c.caseNumber}</h1>
                {c.localId && <span style={{ fontSize: 13, color: HSBC_MUTED }}>{c.localId}</span>}
                {c.dateResolved ? <Badge label="Resolved" color="#166534" bg="#dcfce7" /> : <Badge label="Open" color={HSBC_RED} bg="#fff1f2" />}
                <div style={{ flex: 1 }} />
                <button style={{ ...btn("ghost"), padding: "6px 14px" }} onClick={() => openEdit(c)}>Edit</button>
                <button style={{ ...btn("danger"), padding: "6px 14px" }} onClick={() => setShowDeleteConfirm(c)}>Delete</button>
              </div>

              {/* Audit stamp */}
              <div style={{ fontSize: 11, color: HSBC_MUTED, marginBottom: 18, display: "flex", gap: 20 }}>
                {c.loggedBy && <span>Logged by <strong>{c.loggedBy}</strong> on {fmtDateTime(c.loggedAt)}</span>}
                {c.lastEditedBy && c.lastEditedAt !== c.loggedAt && <span>Last edited by <strong>{c.lastEditedBy}</strong> on {fmtDateTime(c.lastEditedAt)}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Case metrics */}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {[
                      ["Year", getYear(c.dateRaised)], ["Quarter", getQuarter(c.dateRaised)],
                      ["Month", getMonth(c.dateRaised)], ["TAT (working days)", tat !== null ? tat : "—"],
                    ].map(([k,v]) => (
                      <div key={k} style={{ background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, padding: "12px 16px", flex: 1, minWidth: 90 }}>
                        <div style={{ fontSize: 11, color: HSBC_MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: HSBC_DARK, marginTop: 2 }}>{v || "—"}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ ...card }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>TAT Category</div>
                    <Badge label={TAT_CATEGORIES[tatCat]} color={TAT_BADGE[tatCat].color} bg={TAT_BADGE[tatCat].bg} />
                  </div>
                  <div style={card}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Client Details</div>
                    {[["Relationship",c.clientRelationship],["Country",c.countryClient],["Corporate Name",c.corporateName],["Position",c.clientPosition],["Account Type",c.accountType],["Connection",c.connection],["Transversal/Domestic",c.transversal]].map(([k,v]) => v ? (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid #f5f5f5`, fontSize: 13 }}>
                        <span style={{ color: HSBC_MUTED }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
                      </div>
                    ) : null)}
                  </div>
                  <div style={card}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Flags</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {c.vvip   ? <Badge label="VVIP"    color="#7c3aed" bg="#f5f3ff" /> : <span style={{ fontSize: 12, color: HSBC_MUTED }}>No VVIP</span>}
                      {c.csuite ? <Badge label="C-Suite" color="#0369a1" bg="#e0f2fe" /> : null}
                      {c.ews    ? <Badge label="EWS"     color="#b45309" bg="#fef3c7" /> : null}
                    </div>
                  </div>
                  <div style={card}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Referrer</div>
                    {[["Name",c.referrerName],["Business Line",c.referrerBusinessLine],["Country",c.referrerCountry],["Case Manager",c.managedBy]].map(([k,v]) => v ? (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid #f5f5f5`, fontSize: 13 }}>
                        <span style={{ color: HSBC_MUTED }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
                      </div>
                    ) : null)}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={card}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Request Details</div>
                    {[["Category",c.categoryRequest],["Client Request",c.clientRequest],["Country Request Relating To",c.countryRequest]].map(([k,v]) => v ? (
                      <div key={k} style={{ padding: "6px 0", borderBottom: `1px solid #f5f5f5`, fontSize: 13 }}>
                        <div style={{ color: HSBC_MUTED, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k}</div>
                        <div style={{ fontWeight: 500, marginTop: 2 }}>{v}</div>
                      </div>
                    ) : null)}
                  </div>
                  {c.informationProvided && (
                    <div style={card}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Information Provided</div>
                      <div style={{ fontSize: 13, lineHeight: 1.7, color: HSBC_TEXT }}>{c.informationProvided}</div>
                    </div>
                  )}
                  {c.specificRequest && (
                    <div style={card}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Specific Request / Outcome Desired</div>
                      <div style={{ fontSize: 13, lineHeight: 1.7, color: HSBC_TEXT }}>{c.specificRequest}</div>
                    </div>
                  )}

                  {/* Notes */}
                  <div style={card}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Notes & Activity</div>
                    {(!c.notes || c.notes.length === 0) && <div style={{ fontSize: 13, color: HSBC_MUTED, marginBottom: 14 }}>No notes yet.</div>}
                    {(c.notes || []).map((n, i) => (
                      <div key={i} style={{ background: "#fafafa", borderRadius: 6, padding: "10px 14px", marginBottom: 10, borderLeft: `3px solid ${HSBC_RED}` }}>
                        <div style={{ fontSize: 13, color: HSBC_TEXT, lineHeight: 1.6 }}>{n.text}</div>
                        <div style={{ fontSize: 11, color: HSBC_MUTED, marginTop: 6 }}>{n.author} · {fmtDateTime(n.at)}</div>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <textarea style={{ ...inp, height: 70, resize: "vertical", flex: 1 }} placeholder="Add a note…" value={newNote} onChange={e => setNewNote(e.target.value)} />
                      <button style={{ ...btn("primary"), alignSelf: "flex-end", padding: "8px 14px" }} onClick={handleAddNote}>Add</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── CLIENTS ── */}
        {view === "clients" && (
          <ClientsView cases={cases} clientSearch={clientSearch} setClientSearch={setClientSearch} setSelectedCase={setSelectedCase} setView={setView} />
        )}

        {/* ── MANAGEMENT REPORTING ── */}
        {view === "reporting" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: HSBC_DARK }}>Management Reporting</h1>
                <div style={{ fontSize: 13, color: HSBC_MUTED, marginTop: 3 }}>Analytics & insights</div>
              </div>
              <button style={btn("primary")} onClick={exportToCSV}>↓ Export to Excel</button>
            </div>

            {/* Analytics Filters */}
            <div style={{ background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, padding: "14px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Filter</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <select style={{ ...inp, width: 150 }} value={aManager} onChange={e => setAManager(e.target.value)}>
                  <option value="">All Managers</option>
                  {CASE_MANAGERS.map(m => <option key={m}>{m}</option>)}
                </select>
                <select style={{ ...inp, width: 170 }} value={aBizLine} onChange={e => setABizLine(e.target.value)}>
                  <option value="">All Business Lines</option>
                  {BUSINESS_LINES.map(b => <option key={b}>{b}</option>)}
                </select>
                <select style={{ ...inp, width: 160 }} value={aCountry} onChange={e => setACountry(e.target.value)}>
                  <option value="">All Countries</option>
                  {[...new Set(cases.map(c => c.countryClient).filter(Boolean))].sort().map(c => <option key={c}>{c}</option>)}
                </select>
                <input style={{ ...inp, width: 130 }} type="date" value={aDateFrom} onChange={e => setADateFrom(e.target.value)} title="From date" />
                <input style={{ ...inp, width: 130 }} type="date" value={aDateTo} onChange={e => setADateTo(e.target.value)} title="To date" />
                {(aManager||aBizLine||aCountry||aDateFrom||aDateTo) && (
                  <button style={btn("ghost")} onClick={() => { setAManager(""); setABizLine(""); setACountry(""); setADateFrom(""); setADateTo(""); }}>Clear</button>
                )}
                {(aManager||aBizLine||aCountry||aDateFrom||aDateTo) && (
                  <span style={{ fontSize: 12, color: HSBC_RED, fontWeight: 600 }}>Showing {aCases.length} of {cases.length} cases</span>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
              <StatCard label="Total Cases"    value={aCases.length}   red />
              <StatCard label="Open"           value={open.length}     sub={aCases.length ? `${Math.round(open.length/aCases.length*100)}% of total` : ""} />
              <StatCard label="Resolved"       value={resolved.length} sub={aCases.length ? `${Math.round(resolved.length/aCases.length*100)}% of total` : ""} />
              <StatCard label="VVIP / C-Suite" value={aCases.filter(c => c.vvip || c.csuite).length} />
              <StatCard label="EWS"            value={aCases.filter(c => c.ews).length} />
            </div>

            {/* Charts Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
              {/* TAT */}
              <div style={{ background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, padding: "20px 24px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>TAT Performance</div>
                {tatCounts.map(({ key, label: l, count }) => {
                  const pct = aCases.length ? Math.round((count/aCases.length)*100) : 0;
                  const max = Math.max(...tatCounts.map(x => x.count), 1);
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                      <div style={{ width: 110, fontSize: 12, color: HSBC_TEXT, flexShrink: 0, textAlign: "right" }}>{l}</div>
                      <div style={{ flex: 1, height: 7, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((count/max)*100)}%`, height: "100%", background: HSBC_RED, borderRadius: 4, transition: "width 0.5s ease" }} />
                      </div>
                      <div style={{ width: 60, fontSize: 12, color: HSBC_MUTED, textAlign: "right", flexShrink: 0 }}>{count} · {pct}%</div>
                    </div>
                  );
                })}
                <div style={{ fontSize: 11, color: HSBC_MUTED, marginTop: 10, paddingTop: 10, borderTop: `1px solid #f0f0f0` }}>
                  {aCases.length ? `${Math.round(((tatCounts.find(t=>t.key==="within24")?.count||0)+(tatCounts.find(t=>t.key==="within48")?.count||0))/aCases.length*100)}% resolved within 48 hours` : "No data"}
                </div>
              </div>

              {/* Volume by Manager */}
              <div style={{ background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, padding: "20px 24px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Volume by Case Manager</div>
                {byManager.map(({ label: l, count }) => {
                  const pct = aCases.length ? Math.round((count/aCases.length)*100) : 0;
                  const max = Math.max(...byManager.map(x => x.count), 1);
                  return (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                      <div style={{ width: 70, fontSize: 12, color: HSBC_TEXT, flexShrink: 0, textAlign: "right" }}>{l}</div>
                      <div style={{ flex: 1, height: 7, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((count/max)*100)}%`, height: "100%", background: HSBC_RED, borderRadius: 4 }} />
                      </div>
                      <div style={{ width: 60, fontSize: 12, color: HSBC_MUTED, textAlign: "right", flexShrink: 0 }}>{count} · {pct}%</div>
                    </div>
                  );
                })}
              </div>

              <ExpandableChart title="By Category of Request"    items={byCategory}    total={aCases.length} defaultShow={3} />
              <ExpandableChart title="By Client Country"         items={byCountry}     total={aCases.length} defaultShow={3} />
              <ExpandableChart title="By Referrer Business Line" items={byBizLine}     total={aCases.length} defaultShow={3} />
              <ExpandableChart title="By Account Type"           items={byAccountType} total={aCases.length} defaultShow={3} />
            </div>

            {/* Volume by Period */}
            <div style={{ marginBottom: 18 }}>
              <ExpandableChart title="Volume by Period (Month)" items={byPeriod} total={aCases.length} defaultShow={6} />
            </div>

            {/* Client Request — full width */}
            <div style={{ marginBottom: 18 }}>
              <ExpandableChart title="By Client Request Type" items={byClientRequest} total={aCases.length} defaultShow={3} />
            </div>

            {/* Flags Summary */}
            <div style={{ background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, padding: "20px 24px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Flags Summary</div>
              <div style={{ fontSize: 12, color: HSBC_MUTED, marginBottom: 16 }}>Breakdown of all {aCases.length} case{aCases.length !== 1 ? "s" : ""} by priority flag status</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ background: "#fafafa" }}>
                  {["Flag","Total Cases","Open","Resolved","% of All Cases"].map(h => <th key={h} style={th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {[
                    { label:"VVIP",    filter: c => c.vvip,   badge:{ color:"#7c3aed", bg:"#f5f3ff" } },
                    { label:"C-Suite", filter: c => c.csuite, badge:{ color:"#0369a1", bg:"#e0f2fe" } },
                    { label:"EWS",     filter: c => c.ews,    badge:{ color:"#b45309", bg:"#fef3c7" } },
                  ].map(({ label: l, filter, badge }) => {
                    const fc = aCases.filter(filter);
                    return (
                      <tr key={l} style={{ borderBottom: `1px solid #f5f5f5` }}>
                        <td style={td}><Badge label={l} color={badge.color} bg={badge.bg} /></td>
                        <td style={{ ...td, fontWeight: 700 }}>{fc.length}</td>
                        <td style={td}>{fc.filter(c => !c.dateResolved).length}</td>
                        <td style={td}>{fc.filter(c => !!c.dateResolved).length}</td>
                        <td style={td}>{aCases.length ? `${Math.round((fc.length/aCases.length)*100)}% (${fc.length} of ${aCases.length})` : "—"}</td>
                      </tr>
                    );
                  })}
                  {(() => {
                    const nf = aCases.filter(c => !c.vvip && !c.csuite && !c.ews);
                    return (
                      <tr style={{ borderBottom: `1px solid #f5f5f5`, background: "#fafafa" }}>
                        <td style={td}><Badge label="No Flag" color={HSBC_MUTED} bg="#f3f4f6" /></td>
                        <td style={{ ...td, fontWeight: 700 }}>{nf.length}</td>
                        <td style={td}>{nf.filter(c => !c.dateResolved).length}</td>
                        <td style={td}>{nf.filter(c => !!c.dateResolved).length}</td>
                        <td style={td}>{aCases.length ? `${Math.round((nf.length/aCases.length)*100)}% (${nf.length} of ${aCases.length})` : "—"}</td>
                      </tr>
                    );
                  })()}
                  <tr style={{ background: "#f9f9f9", borderTop: `2px solid ${HSBC_BORDER}` }}>
                    <td style={{ ...td, fontWeight: 700, color: HSBC_DARK }}>Total</td>
                    <td style={{ ...td, fontWeight: 700, color: HSBC_DARK }}>{aCases.length}</td>
                    <td style={{ ...td, fontWeight: 700, color: HSBC_DARK }}>{aCases.filter(c => !c.dateResolved).length}</td>
                    <td style={{ ...td, fontWeight: 700, color: HSBC_DARK }}>{aCases.filter(c => !!c.dateResolved).length}</td>
                    <td style={{ ...td, fontWeight: 700, color: HSBC_DARK }}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── IMPORT ── */}
        {view === "import" && (
          <ImportView cases={cases} saveCases={saveCases} showToast={showToast} currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}