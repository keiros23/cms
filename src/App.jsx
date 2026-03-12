import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const HSBC_RED = "#DB0011";
const HSBC_DARK = "#1a1a1a";
const HSBC_SIDEBAR = "#4a5568";
const HSBC_SIDEBAR_HOVER = "rgba(255,255,255,0.1)";
const HSBC_LIGHT = "#f5f5f5";
const HSBC_BORDER = "#e0e0e0";
const HSBC_TEXT = "#333333";
const HSBC_MUTED = "#767676";

const CASE_MANAGERS = ["Jackie", "Serife", "Sayed"];
const BUSINESS_LINES = ["CIB", "GPB", "IWPB - Other", "UK WPB", "UK CMB", "HK WPB", "HK CMB", "IWPB - EWS"];
const CLIENT_RELATIONSHIPS = ["Existing", "NTG"];
const ACCOUNT_TYPES = ["Business", "Private Bank PB", "Premier", "EA", "Mass Retail"];
const TRANSVERSAL_OPTIONS = ["Transversal", "Domestic"];

const CLIENT_REQUEST_CATEGORIES = [
  "Accounts Enquiries and Maintenance",
  "Issues",
  "Complaints",
  "Products",
  "Other Complex Queries"
];

const CLIENT_REQUESTS = [
  "Ac Inhibited/Ac Closure",
  "Account Access - Digital Channels",
  "Account Conversion & Upgrade",
  "Account Opening/New Product Offers",
  "Balances Statements and Other Correspondence",
  "Branch Appointment and Counter Service",
  "Business Banking",
  "Card Related",
  "Change of Address",
  "Charges and Interest",
  "Client Tax Reporting",
  "CSEM/EDD/SCC Related",
  "Fraud",
  "ID&V",
  "International Payments and Foreign Currency Transfer",
  "Lending Product Related",
  "Other Account Enquiry",
  "Other Products",
  "Payment Related",
  "Relationship Manager Request",
  "RM Servicing Related",
  "Savings Enquiry",
  "Third Party Mandates",
  "Feedback Provided",
  "Balance Certificate",
  "Deceased Customer",
  "Power of Attorney",
  "Other"
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
  within24: "Within 24hr",
  within48: "Within 48hr",
  within7: "Within 7 days",
  over7: "7 days+",
  notResolved: "Not Resolved"
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWorkingDays(start, end) {
  if (!start || !end) return null;
  const s = new Date(start), e = new Date(end);
  if (e < s) return null;
  let count = 0, cur = new Date(s);
  while (cur <= e) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return Math.max(0, count - 1);
}

function getTATCategory(days, resolved) {
  if (!resolved) return "notResolved";
  if (days === null) return "notResolved";
  if (days <= 1) return "within24";
  if (days <= 2) return "within48";
  if (days <= 7) return "within7";
  return "over7";
}

function getQuarter(date) {
  if (!date) return "";
  const m = new Date(date).getMonth();
  return `Q${Math.floor(m / 3) + 1}`;
}

function getMonth(date) {
  if (!date) return "";
  return new Date(date).toLocaleString("default", { month: "long" });
}

function getYear(date) {
  if (!date) return "";
  return new Date(date).getFullYear();
}

function generateCaseId(index) {
  return `CASE-${String(index + 1).padStart(4, "0")}`;
}

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
      <div
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          ...inp, display: "flex", justifyContent: "space-between", alignItems: "center",
          cursor: disabled ? "default" : "pointer", background: disabled ? "#f9f9f9" : "#fff",
          userSelect: "none"
        }}
      >
        <span style={{ color: value ? HSBC_TEXT : "#aaa", fontSize: 13 }}>{value || placeholder}</span>
        <span style={{ color: HSBC_MUTED, fontSize: 10 }}>▾</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 1000,
          background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 4,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)", maxHeight: 220, overflow: "hidden",
          display: "flex", flexDirection: "column"
        }}>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search…"
            style={{ ...inp, borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none", fontSize: 12 }}
          />
          <div style={{ overflowY: "auto", maxHeight: 160 }}>
            {value && (
              <div onClick={() => { onChange(""); setOpen(false); setQuery(""); }}
                style={{ padding: "8px 12px", fontSize: 12, color: HSBC_MUTED, cursor: "pointer", borderBottom: `1px solid ${HSBC_BORDER}` }}>
                Clear selection
              </div>
            )}
            {filtered.length === 0 ? (
              <div style={{ padding: "8px 12px", fontSize: 12, color: HSBC_MUTED }}>No results</div>
            ) : filtered.map(o => (
              <div key={o} onClick={() => { onChange(o); setOpen(false); setQuery(""); }}
                style={{
                  padding: "8px 12px", fontSize: 13, cursor: "pointer",
                  background: value === o ? "#fff5f5" : "transparent",
                  color: value === o ? HSBC_RED : HSBC_TEXT,
                  fontWeight: value === o ? 600 : 400,
                  borderLeft: value === o ? `3px solid ${HSBC_RED}` : "3px solid transparent"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = value === o ? "#fff5f5" : "transparent"}
              >{o}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const inp = {
  width: "100%", boxSizing: "border-box", border: `1px solid ${HSBC_BORDER}`,
  borderRadius: 4, padding: "8px 10px", fontSize: 13, color: HSBC_TEXT,
  outline: "none", background: "#fff", fontFamily: "inherit"
};

const label = { fontSize: 11, fontWeight: 700, color: HSBC_MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, display: "block" };

const btn = (variant = "primary") => ({
  padding: "9px 18px", borderRadius: 4, fontSize: 13, fontWeight: 700,
  cursor: "pointer", border: "none", fontFamily: "inherit",
  background: variant === "primary" ? HSBC_RED : variant === "outline" ? "#fff" : HSBC_LIGHT,
  color: variant === "primary" ? "#fff" : variant === "outline" ? HSBC_RED : HSBC_TEXT,
  border: variant === "outline" ? `1.5px solid ${HSBC_RED}` : "none",
  transition: "opacity 0.15s"
});

const card = { background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, padding: "20px 24px" };
const th = { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: HSBC_MUTED, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: `2px solid ${HSBC_BORDER}`, whiteSpace: "nowrap" };
const td = { padding: "11px 14px", fontSize: 13, borderBottom: `1px solid #f5f5f5`, verticalAlign: "middle" };
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 };

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label, color, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 8px",
      borderRadius: 3, fontSize: 11, fontWeight: 700, color, background: bg,
      border: `1px solid ${color}22`, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap"
    }}>{label}</span>
  );
}

const TAT_BADGE = {
  within24: { color: "#166534", bg: "#dcfce7" },
  within48: { color: "#065f46", bg: "#d1fae5" },
  within7:  { color: "#92400e", bg: "#fef3c7" },
  over7:    { color: "#991b1b", bg: "#fee2e2" },
  notResolved: { color: "#4b5563", bg: "#f3f4f6" }
};

// ─── Mini stat card ───────────────────────────────────────────────────────────
function StatCard({ label: l, value, sub, red }) {
  return (
    <div style={{
      background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6,
      padding: "18px 20px", flex: 1, minWidth: 140,
      borderTop: `3px solid ${red ? HSBC_RED : "#d1d5db"}`
    }}>
      <div style={{ fontSize: 30, fontWeight: 800, color: red ? HSBC_RED : HSBC_DARK, lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>{value}</div>
      <div style={{ fontSize: 12, color: HSBC_MUTED, marginTop: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</div>
      {sub && <div style={{ fontSize: 11, color: HSBC_MUTED, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── Bar ──────────────────────────────────────────────────────────────────────
function Bar({ label: l, count, max, pct }) {
  const p = pct !== undefined ? pct : (max ? Math.round((count / max) * 100) : 0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <div style={{ width: 180, fontSize: 12, color: HSBC_TEXT, flexShrink: 0, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l}</div>
      <div style={{ flex: 1, height: 7, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", background: HSBC_RED, borderRadius: 4, transition: "width 0.5s ease" }} />
      </div>
      <div style={{ width: 32, fontSize: 12, color: HSBC_MUTED, textAlign: "right", flexShrink: 0 }}>{pct !== undefined ? `${p}%` : count}</div>
    </div>
  );
}

// ─── Field group ──────────────────────────────────────────────────────────────
function Field({ label: l, children, span }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <span style={label}>{l}</span>
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

function Toggle({ value, onChange, label: l }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div onClick={() => onChange(!value)} style={{
        width: 40, height: 22, borderRadius: 11, background: value ? HSBC_RED : "#d1d5db",
        position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0
      }}>
        <div style={{
          position: "absolute", top: 3, left: value ? 21 : 3, width: 16, height: 16,
          borderRadius: "50%", background: "#fff", transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
        }} />
      </div>
      <span style={{ fontSize: 13, color: value ? HSBC_RED : HSBC_MUTED, fontWeight: value ? 700 : 400 }}>{value ? "Yes" : "No"}</span>
    </div>
  );
}

// ─── Empty form ───────────────────────────────────────────────────────────────
const emptyForm = () => ({
  localId: "", dateRaised: "", dateResolved: "",
  managedBy: "", vvip: false, ews: false, csuite: false,
  corporateName: "", clientPosition: "", mastergroup: "", clientName: "",
  clientRelationship: "", connection: "",
  countryClient: "", referrerName: "", referrerBusinessLine: "", referrerCountry: "",
  categoryRequest: "", clientRequest: "", countryRequest: "",
  accountType: "", transversal: "",
  informationProvided: "", specificRequest: ""
});

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────
const SAMPLE_CASES = [
  { id: "c1", caseNumber: "CASE-0001", localId: "HK-2024-001", dateRaised: "2024-01-08", dateResolved: "2024-01-09", managedBy: "Jackie", vvip: true, ews: false, csuite: false, corporateName: "Meridian Holdings", clientPosition: "Managing Director", mastergroup: "MG-Alpha", clientName: "James Weston", clientRelationship: "Existing", connection: "", countryClient: "Hong Kong", referrerName: "David Chan", referrerBusinessLine: "HK WPB", referrerCountry: "Hong Kong", categoryRequest: "Complaints", clientRequest: "Account Access - Digital Channels", countryRequest: "Hong Kong", accountType: "Private Bank PB", transversal: "Domestic", informationProvided: "Client unable to access digital banking for 3 days following system migration.", specificRequest: "Restore access and provide compensation." },
  { id: "c2", caseNumber: "CASE-0002", localId: "UK-2024-018", dateRaised: "2024-01-15", dateResolved: "2024-01-17", managedBy: "Serife", vvip: false, ews: true, csuite: false, corporateName: "Apex Capital", clientPosition: "CFO", mastergroup: "", clientName: "Sarah Mitchell", clientRelationship: "NTG", connection: "Referred by senior partner", countryClient: "United Kingdom", referrerName: "Tom Richards", referrerBusinessLine: "UK CMB", referrerCountry: "United Kingdom", categoryRequest: "Accounts Enquiries and Maintenance", clientRequest: "Account Opening/New Product Offers", countryRequest: "United Kingdom", accountType: "Business", transversal: "Transversal", informationProvided: "New client requiring expedited account opening for business operations.", specificRequest: "Open account within 48 hours." },
  { id: "c3", caseNumber: "CASE-0003", localId: "SG-2024-005", dateRaised: "2024-02-01", dateResolved: "", managedBy: "Sayed", vvip: false, ews: false, csuite: true, corporateName: "Sunvale Group", clientPosition: "Group CEO", mastergroup: "MG-Sunvale", clientName: "Li Wei", clientRelationship: "Existing", connection: "Group CEO", countryClient: "Singapore", referrerName: "Priya Shah", referrerBusinessLine: "GPB", referrerCountry: "Singapore", categoryRequest: "Issues", clientRequest: "International Payments and Foreign Currency Transfer", countryRequest: "Singapore", accountType: "Premier", transversal: "Transversal", informationProvided: "Urgent international transfer delayed for 5 business days with no explanation.", specificRequest: "Immediate release of funds and written explanation." },
  { id: "c4", caseNumber: "CASE-0004", localId: "HK-2024-012", dateRaised: "2024-02-10", dateResolved: "2024-02-11", managedBy: "Jackie", vvip: false, ews: false, csuite: false, corporateName: "Pinnacle Asset Mgmt", clientPosition: "Portfolio Manager", mastergroup: "", clientName: "Rachel Lam", clientRelationship: "Existing", connection: "", countryClient: "Hong Kong", referrerName: "David Chan", referrerBusinessLine: "HK WPB", referrerCountry: "Hong Kong", categoryRequest: "Complaints", clientRequest: "Charges and Interest", countryRequest: "Hong Kong", accountType: "Private Bank PB", transversal: "Domestic", informationProvided: "Client disputes management fee charged in January statement.", specificRequest: "Refund of incorrect charges." },
  { id: "c5", caseNumber: "CASE-0005", localId: "UK-2024-031", dateRaised: "2024-02-14", dateResolved: "", managedBy: "Serife", vvip: true, ews: false, csuite: false, corporateName: "Thornfield Family Office", clientPosition: "Principal", mastergroup: "MG-Thornfield", clientName: "Edward Thornfield", clientRelationship: "Existing", connection: "Founding family", countryClient: "United Kingdom", referrerName: "Anna Brooks", referrerBusinessLine: "GPB", referrerCountry: "United Kingdom", categoryRequest: "Products", clientRequest: "Lending Product Related", countryRequest: "United Kingdom", accountType: "Private Bank PB", transversal: "Transversal", informationProvided: "Client requesting expedited review of mortgage facility renewal.", specificRequest: "Decision within 5 working days." },
  { id: "c6", caseNumber: "CASE-0006", localId: "AE-2024-007", dateRaised: "2024-03-01", dateResolved: "2024-03-04", managedBy: "Sayed", vvip: false, ews: true, csuite: false, corporateName: "Gulf Star Trading", clientPosition: "Director", mastergroup: "", clientName: "Omar Al Rashid", clientRelationship: "NTG", connection: "", countryClient: "UAE", referrerName: "Khalid Hassan", referrerBusinessLine: "CIB", referrerCountry: "UAE", categoryRequest: "Accounts Enquiries and Maintenance", clientRequest: "Account Opening/New Product Offers", countryRequest: "UAE", accountType: "Business", transversal: "Domestic", informationProvided: "New corporate client onboarding stalled due to EDD requirements.", specificRequest: "Prioritise EDD review and proceed with account opening." },
  { id: "c7", caseNumber: "CASE-0007", localId: "SG-2024-019", dateRaised: "2024-03-05", dateResolved: "2024-03-06", managedBy: "Jackie", vvip: false, ews: false, csuite: false, corporateName: "Sunvale Group", clientPosition: "Chairman", mastergroup: "MG-Sunvale", clientName: "Li Wei", clientRelationship: "Existing", connection: "Group Chairman", countryClient: "Singapore", referrerName: "James Tan", referrerBusinessLine: "GPB", referrerCountry: "Singapore", categoryRequest: "Issues", clientRequest: "Card Related", countryRequest: "Singapore", accountType: "Premier", transversal: "Domestic", informationProvided: "Debit card blocked after failed overseas transaction attempt.", specificRequest: "Unblock card and reinstate international usage." },
  { id: "c8", caseNumber: "CASE-0008", localId: "HK-2024-028", dateRaised: "2024-03-12", dateResolved: "", managedBy: "Serife", vvip: false, ews: false, csuite: false, corporateName: "Crescent Capital HK", clientPosition: "Head of Operations", mastergroup: "", clientName: "Michael Cheung", clientRelationship: "Existing", connection: "", countryClient: "Hong Kong", referrerName: "David Chan", referrerBusinessLine: "HK CMB", referrerCountry: "Hong Kong", categoryRequest: "Other Complex Queries", clientRequest: "Third Party Mandates", countryRequest: "Hong Kong", accountType: "Business", transversal: "Domestic", informationProvided: "Client requesting addition of new authorised signatory following board changes.", specificRequest: "Process mandate update within standard timelines." },
];

// ─── Expandable Chart Card ────────────────────────────────────────────────────
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
          <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: `1px solid ${HSBC_RED}`, borderRadius: 3, cursor: "pointer", fontSize: 11, color: HSBC_RED, fontWeight: 700, padding: "3px 10px", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            {expanded ? "▲ Collapse" : `▼ Show all ${items.length}`}
          </button>
        )}
      </div>
      {items.length === 0
        ? <div style={{ fontSize: 13, color: HSBC_MUTED }}>No data</div>
        : <>
          {shown.map(({ label, count }) => {
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <div style={{ width: 190, fontSize: 12, color: HSBC_TEXT, flexShrink: 0, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={label}>{label}</div>
                <div style={{ flex: 1, height: 7, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${Math.round((count / max) * 100)}%`, height: "100%", background: HSBC_RED, borderRadius: 4, transition: "width 0.5s ease" }} />
                </div>
                <div style={{ width: 70, fontSize: 12, color: HSBC_MUTED, textAlign: "right", flexShrink: 0, whiteSpace: "nowrap" }}>{count} · {pct}%</div>
              </div>
            );
          })}
          {hasMore && !expanded && (
            <div style={{ fontSize: 11, color: HSBC_MUTED, marginTop: 6 }}>Showing {defaultShow} of {items.length} · click "Show all" to expand</div>
          )}
        </>
      }
    </div>
  );
}

// ─── Clients View Component ───────────────────────────────────────────────────
function ClientsView({ cases, clientSearch, setClientSearch, setSelectedCase, setView }) {
  const [expandedClient, setExpandedClient] = useState(null);

  const allClients = [...new Map(cases.map(c => [c.clientName, c])).values()];
  const clients = clientSearch
    ? allClients.filter(c => c.clientName?.toLowerCase().includes(clientSearch.toLowerCase()) || c.corporateName?.toLowerCase().includes(clientSearch.toLowerCase()))
    : allClients;

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: HSBC_DARK }}>Clients</h1>
      <div style={{ fontSize: 13, color: HSBC_MUTED, marginBottom: 18 }}>Case history by client · company and position tracked per case</div>
      <div style={{ marginBottom: 18 }}>
        <input style={{ ...inp, width: 300 }} placeholder="Search by client name or corporate…" value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {clients.map(client => {
          const cc = cases.filter(c => c.clientName === client.clientName).sort((a, b) => new Date(a.dateRaised) - new Date(b.dateRaised));
          const openCount = cc.filter(c => !c.dateResolved).length;
          const hasFlags = cc.some(c => c.vvip || c.csuite || c.ews);
          const isExpanded = expandedClient === client.clientName;

          const timeline = cc.reduce((acc, c) => {
            const last = acc[acc.length - 1];
            if (!last || last.corporateName !== c.corporateName || last.clientPosition !== c.clientPosition) {
              acc.push({ caseNumber: c.caseNumber, dateRaised: c.dateRaised, corporateName: c.corporateName, clientPosition: c.clientPosition });
            }
            return acc;
          }, []);
          const hasHistory = timeline.length > 1;

          return (
            <div key={client.clientName} style={{ background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, borderLeft: hasFlags ? `4px solid ${HSBC_RED}` : `4px solid transparent`, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                onClick={() => setExpandedClient(isExpanded ? null : client.clientName)}>
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: HSBC_DARK }}>{client.clientName}</div>
                    <div style={{ fontSize: 12, color: HSBC_MUTED, marginTop: 2 }}>
                      {cc[cc.length - 1]?.clientPosition && <span style={{ fontWeight: 600, color: HSBC_TEXT }}>{cc[cc.length - 1].clientPosition}</span>}
                      {cc[cc.length - 1]?.clientPosition && cc[cc.length - 1]?.corporateName && <span> · </span>}
                      {cc[cc.length - 1]?.corporateName && <span>{cc[cc.length - 1].corporateName}</span>}
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

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${HSBC_BORDER}`, padding: "20px 24px" }}>

                  {/* Timeline */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
                      Company & Position History
                      {!hasHistory && <span style={{ color: HSBC_MUTED, fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 11, marginLeft: 8 }}>— no changes recorded across cases</span>}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {timeline.map((t, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === timeline.length - 1 ? HSBC_RED : "#d1d5db", flexShrink: 0, marginTop: 4 }} />
                            {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: "#e5e7eb" }} />}
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

                  {/* Case history table */}
                  <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Case History</div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                      <thead>
                        <tr style={{ background: "#fafafa" }}>
                          {["Case No.", "Date", "Company at Time", "Position at Time", "Category", "TAT", "Status"].map(h => <th key={h} style={th}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {cc.map(c => {
                          const tat = getWorkingDays(c.dateRaised, c.dateResolved);
                          const tatCat = getTATCategory(tat, !!c.dateResolved);
                          return (
                            <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedCase(c); setView("cases"); }}>
                              <td style={td}><span style={{ fontWeight: 700, color: HSBC_RED, fontSize: 12 }}>{c.caseNumber}</span></td>
                              <td style={td}><span style={{ fontSize: 12 }}>{c.dateRaised}</span></td>
                              <td style={td}><span style={{ fontSize: 13, fontWeight: 500 }}>{c.corporateName || <span style={{ color: HSBC_MUTED, fontStyle: "italic" }}>—</span>}</span></td>
                              <td style={td}><span style={{ fontSize: 13 }}>{c.clientPosition || <span style={{ color: HSBC_MUTED, fontStyle: "italic" }}>—</span>}</span></td>
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
        {clients.length === 0 && (
          <div style={{ color: HSBC_MUTED, fontSize: 14, padding: 20 }}>
            {clientSearch ? "No clients match your search." : "No clients yet. Log your first case to get started."}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function HSBCComplaints() {
  const [cases, setCases] = useState([]);
  const [view, setView] = useState("cases");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCase, setEditCase] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [toast, setToast] = useState(null);

  // Filters
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
  const [aCategory, setACategory] = useState("");

  useEffect(() => { loadCases(); }, []);

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
      specificRequest: r.specific_request,
    }));
    setCases(mapped);
  } catch (e) {
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
    specific_request: c.specificRequest,
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

  async function handleSubmit() {
    if (!form.dateRaised || !form.managedBy || !form.clientName) {
      showToast("Please fill in required fields: Date Raised, Case Manager, Client Name.", "warn"); return;
    }
    const tat = getWorkingDays(form.dateRaised, form.dateResolved);
    const tatCat = getTATCategory(tat, !!form.dateResolved);
    if (editCase) {
      const updated = cases.map(c => c.id === editCase.id ? { ...c, ...form, tat, tatCategory: tatCat } : c);
      await saveCases(updated);
      showToast("Case updated.");
      setEditCase(null);
    } else {
      const newCase = {
        ...form, id: Date.now().toString(),
        caseNumber: generateCaseId(cases.length),
        tat, tatCategory: tatCat
      };
      const updated = [newCase, ...cases];
      await saveCases(updated);
      showToast("Case logged successfully.");
    }
    setForm(emptyForm()); setShowForm(false);
  }

  function openEdit(c) {
    setForm({ localId: c.localId||"", dateRaised: c.dateRaised||"", dateResolved: c.dateResolved||"", managedBy: c.managedBy||"", vvip: c.vvip||false, ews: c.ews||false, csuite: c.csuite||false, corporateName: c.corporateName||"", clientPosition: c.clientPosition||"", mastergroup: c.mastergroup||"", clientName: c.clientName||"", clientRelationship: c.clientRelationship||"", connection: c.connection||"", countryClient: c.countryClient||"", referrerName: c.referrerName||"", referrerBusinessLine: c.referrerBusinessLine||"", referrerCountry: c.referrerCountry||"", categoryRequest: c.categoryRequest||"", clientRequest: c.clientRequest||"", countryRequest: c.countryRequest||"", accountType: c.accountType||"", transversal: c.transversal||"", informationProvided: c.informationProvided||"", specificRequest: c.specificRequest||"" });
    setEditCase(c); setShowForm(true); setSelectedCase(null);
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
    if (aCategory && c.categoryRequest !== aCategory) return false;
    if (aDateFrom && c.dateRaised < aDateFrom) return false;
    if (aDateTo && c.dateRaised > aDateTo) return false;
    return true;
  });

  const resolved = aCases.filter(c => !!c.dateResolved);
  const open = aCases.filter(c => !c.dateResolved);

  const tatCounts = Object.keys(TAT_CATEGORIES).map(k => ({
    key: k, label: TAT_CATEGORIES[k],
    count: aCases.filter(c => {
      const tat = getWorkingDays(c.dateRaised, c.dateResolved);
      return getTATCategory(tat, !!c.dateResolved) === k;
    }).length
  }));

  const byManager = CASE_MANAGERS.map(m => ({ label: m, count: aCases.filter(c => c.managedBy === m).length }));
  const byCategory = CLIENT_REQUEST_CATEGORIES.map(cat => ({ label: cat, count: aCases.filter(c => c.categoryRequest === cat).length })).filter(x => x.count > 0);
  const byCountry = [...new Set(aCases.map(c => c.countryClient).filter(Boolean))].map(country => ({ label: country, count: aCases.filter(c => c.countryClient === country).length })).sort((a,b) => b.count - a.count);
  const byAccountType = ACCOUNT_TYPES.map(t => ({ label: t, count: aCases.filter(c => c.accountType === t).length })).filter(x => x.count > 0);
  const byBizLine = BUSINESS_LINES.map(b => ({ label: b, count: aCases.filter(c => c.referrerBusinessLine === b).length })).filter(x => x.count > 0);
  const byClientRequest = CLIENT_REQUESTS.map(r => ({ label: r, count: aCases.filter(c => c.clientRequest === r).length })).filter(x => x.count > 0).sort((a,b) => b.count - a.count);

  const maxCat = Math.max(...byCategory.map(x => x.count), 1);
  const maxCountry = Math.max(...byCountry.map(x => x.count), 1);
  const maxBizLine = Math.max(...byBizLine.map(x => x.count), 1);
  const maxManager = Math.max(...byManager.map(x => x.count), 1);
  const maxAccountType = Math.max(...byAccountType.map(x => x.count), 1);

  // Styles
  const sidebar = { width: 220, background: HSBC_SIDEBAR, color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh" };
  const navItem = (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "11px 20px", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 400, color: active ? "#fff" : "rgba(255,255,255,0.75)", background: active ? HSBC_RED : "transparent", transition: "all 0.15s" });

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: HSBC_LIGHT, fontFamily: "inherit" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: HSBC_RED, fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>HSBC</div>
        <div style={{ color: HSBC_MUTED, fontSize: 13 }}>Loading workspace…</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: HSBC_LIGHT, fontFamily: "'Plus Jakarta Sans', sans-serif", color: HSBC_TEXT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px;}
        .rh:hover{background:#fafafa!important;cursor:pointer;}
        .nh:hover{background:rgba(255,255,255,0.1)!important;}
        input:focus,textarea:focus,select:focus{border-color:${HSBC_RED}!important;box-shadow:0 0 0 2px rgba(219,0,17,0.08);}
        button:hover{opacity:0.88;}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.type === "warn" ? "#92400e" : "#166534", color: "#fff", padding: "11px 18px", borderRadius: 5, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <div style={sidebar}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: "'Playfair Display', serif", letterSpacing: "-0.5px" }}>HSBC</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>CRM Complaints</div>
        </div>
        <div style={{ padding: "12px 0", flex: 1 }}>
          {[
            { id: "cases", label: "Cases", icon: "≡" },
            { id: "clients", label: "Clients", icon: "◎" },
            { id: "reporting", label: "Management Reporting", icon: "▦" },
          ].map(item => (
            <div key={item.id} className="nh" style={navItem(view === item.id)} onClick={() => { setView(item.id); setSelectedCase(null); setShowForm(false); setEditCase(null); }}>
              <span style={{ fontSize: 15, width: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.15)", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          <div>Shared workspace · live sync</div>
          <div style={{ color: "#4ade80", marginTop: 3 }}>● Connected</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: "100vh", padding: "28px 32px" }}>

        {/* ── CASES ── */}
        {view === "cases" && !selectedCase && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: HSBC_DARK }}>All Cases</h1>
                <div style={{ fontSize: 13, color: HSBC_MUTED, marginTop: 3 }}>{cases.length} total · {cases.filter(c => !c.dateResolved).length} open</div>
              </div>
              <button style={btn("primary")} onClick={() => { setForm(emptyForm()); setEditCase(null); setShowForm(true); }}>+ New Case</button>
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
                <option value="">VVIP: All</option>
                <option value="yes">VVIP: Yes</option>
                <option value="no">VVIP: No</option>
              </select>
              <select style={{ ...inp, width: 120 }} value={fEWS} onChange={e => setFEWS(e.target.value)}>
                <option value="">EWS: All</option>
                <option value="yes">EWS: Yes</option>
                <option value="no">EWS: No</option>
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
              {(fSearch || fManager || fStatus || fCategory || fDateFrom || fDateTo || fVVIP || fEWS || fBizLine || fCountry) && (
                <button style={btn("ghost")} onClick={() => { setFSearch(""); setFManager(""); setFStatus(""); setFCategory(""); setFDateFrom(""); setFDateTo(""); setFVVIP(""); setFEWS(""); setFBizLine(""); setFCountry(""); }}>Clear all</button>
              )}
            </div>

            {/* New / Edit Case Form */}
            {showForm && (
              <div style={{ ...card, marginBottom: 22, borderTop: `3px solid ${HSBC_RED}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: HSBC_DARK }}>{editCase ? `Edit Case · ${editCase.caseNumber}` : "New Case"}</h2>
                  <button style={btn("ghost")} onClick={() => { setShowForm(false); setEditCase(null); }}>Cancel</button>
                </div>

                {/* Section: Case Details */}
                <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid #f0f0f0` }}>Case Details</div>
                <div style={{ ...grid3, marginBottom: 16 }}>
                  <Field label="Local Identifier No."><input style={inp} value={form.localId} onChange={e => setF("localId")(e.target.value)} placeholder="e.g. HK-2024-001" /></Field>
                  <Field label="Date Case Raised *"><input style={inp} type="date" value={form.dateRaised} onChange={e => setF("dateRaised")(e.target.value)} /></Field>
                  <Field label="Date Case Resolved"><input style={inp} type="date" value={form.dateResolved} onChange={e => setF("dateResolved")(e.target.value)} /></Field>
                  <Field label="Case Managed By *">
                    <Select value={form.managedBy} onChange={setF("managedBy")} options={CASE_MANAGERS} placeholder="Select…" />
                  </Field>
                  <Field label="Query Account Type">
                    <Select value={form.accountType} onChange={setF("accountType")} options={ACCOUNT_TYPES} placeholder="Select…" />
                  </Field>
                  <Field label="Transversal / Domestic">
                    <Select value={form.transversal} onChange={setF("transversal")} options={TRANSVERSAL_OPTIONS} placeholder="Select…" />
                  </Field>
                </div>

                {/* Flags */}
                <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid #f0f0f0` }}>Flags</div>
                <div style={{ display: "flex", gap: 32, marginBottom: 16 }}>
                  <Field label="VVIP"><Toggle value={form.vvip} onChange={setF("vvip")} /></Field>
                  <Field label="EWS in Any Market"><Toggle value={form.ews} onChange={setF("ews")} /></Field>
                  <Field label="C-Suite"><Toggle value={form.csuite} onChange={setF("csuite")} /></Field>
                </div>

                {/* Client Info */}
                <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid #f0f0f0` }}>Client Information <span style={{ color: HSBC_MUTED, fontSize: 10, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— captured as snapshot at time of this case</span></div>
                <div style={{ ...grid3, marginBottom: 16 }}>
                  <Field label="Client Name *"><input style={inp} value={form.clientName} onChange={e => setF("clientName")(e.target.value)} placeholder="Full name" /></Field>
                  <Field label="Client Relationship">
                    <Select value={form.clientRelationship} onChange={setF("clientRelationship")} options={CLIENT_RELATIONSHIPS} placeholder="Select…" />
                  </Field>
                  <Field label="Country Client Based">
                    <SearchableDropdown options={COUNTRIES} value={form.countryClient} onChange={setF("countryClient")} placeholder="Search country…" />
                  </Field>
                  <Field label="Corporate Name (at time of case)"><input style={inp} value={form.corporateName} onChange={e => setF("corporateName")(e.target.value)} placeholder="Company name" /></Field>
                  <Field label="Position / Job Title (at time of case)"><input style={inp} value={form.clientPosition} onChange={e => setF("clientPosition")(e.target.value)} placeholder="e.g. Managing Director" /></Field>
                  <Field label="Top 400 CIB Mastergroup"><input style={inp} value={form.mastergroup} onChange={e => setF("mastergroup")(e.target.value)} placeholder="MG name" /></Field>
                  <Field label="Connection"><input style={inp} value={form.connection} onChange={e => setF("connection")(e.target.value)} placeholder="e.g. Group CEO, Family of…" /></Field>
                </div>

                {/* Referrer */}
                <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid #f0f0f0` }}>Referrer</div>
                <div style={{ ...grid3, marginBottom: 16 }}>
                  <Field label="Referrer Name"><input style={inp} value={form.referrerName} onChange={e => setF("referrerName")(e.target.value)} placeholder="Full name" /></Field>
                  <Field label="Referrer Business Line">
                    <Select value={form.referrerBusinessLine} onChange={setF("referrerBusinessLine")} options={BUSINESS_LINES} placeholder="Select…" />
                  </Field>
                  <Field label="Referrer Country">
                    <SearchableDropdown options={COUNTRIES} value={form.referrerCountry} onChange={setF("referrerCountry")} placeholder="Search country…" />
                  </Field>
                </div>

                {/* Request */}
                <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid #f0f0f0` }}>Request Details</div>
                <div style={{ ...grid3, marginBottom: 16 }}>
                  <Field label="Category of Client Request">
                    <Select value={form.categoryRequest} onChange={setF("categoryRequest")} options={CLIENT_REQUEST_CATEGORIES} placeholder="Select…" />
                  </Field>
                  <Field label="Client Request">
                    <SearchableDropdown options={CLIENT_REQUESTS} value={form.clientRequest} onChange={setF("clientRequest")} placeholder="Search request type…" />
                  </Field>
                  <Field label="Country Request Relating To">
                    <SearchableDropdown options={COUNTRIES} value={form.countryRequest} onChange={setF("countryRequest")} placeholder="Search country…" />
                  </Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <Field label="Information Provided (Full Details)">
                    <textarea style={{ ...inp, height: 90, resize: "vertical" }} value={form.informationProvided} onChange={e => setF("informationProvided")(e.target.value)} placeholder="Full case details…" />
                  </Field>
                  <Field label="Specific Request (Outcome Desired)">
                    <textarea style={{ ...inp, height: 90, resize: "vertical" }} value={form.specificRequest} onChange={e => setF("specificRequest")(e.target.value)} placeholder="Summary of desired outcome…" />
                  </Field>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button style={btn("primary")} onClick={handleSubmit}>{editCase ? "Save Changes" : "Submit Case"}</button>
                  <button style={btn("ghost")} onClick={() => { setShowForm(false); setEditCase(null); }}>Cancel</button>
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
                      {["Case No.", "Local ID", "Client", "Corporate", "Manager", "Date Raised", "TAT", "Category", "Status", "Flags", ""].map(h => (
                        <th key={h} style={th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => {
                      const tat = getWorkingDays(c.dateRaised, c.dateResolved);
                      const tatCat = getTATCategory(tat, !!c.dateResolved);
                      return (
                        <tr key={c.id} className="rh" onClick={() => setSelectedCase(c)}>
                          <td style={td}><span style={{ fontWeight: 700, color: HSBC_RED, fontSize: 12 }}>{c.caseNumber}</span></td>
                          <td style={td}><span style={{ fontSize: 12, color: HSBC_MUTED }}>{c.localId}</span></td>
                          <td style={td}><span style={{ fontWeight: 600 }}>{c.clientName}</span></td>
                          <td style={td}><span style={{ fontSize: 12, color: HSBC_MUTED }}>{c.corporateName}</span></td>
                          <td style={td}><span style={{ fontSize: 12 }}>{c.managedBy}</span></td>
                          <td style={td}><span style={{ fontSize: 12 }}>{c.dateRaised}</span></td>
                          <td style={td}>
                            <Badge label={TAT_CATEGORIES[tatCat]} color={TAT_BADGE[tatCat].color} bg={TAT_BADGE[tatCat].bg} />
                          </td>
                          <td style={td}><span style={{ fontSize: 12, color: HSBC_MUTED }}>{c.categoryRequest}</span></td>
                          <td style={td}>
                            {c.dateResolved
                              ? <Badge label="Resolved" color="#166534" bg="#dcfce7" />
                              : <Badge label="Open" color={HSBC_RED} bg="#fff1f2" />}
                          </td>
                          <td style={td}>
                            <div style={{ display: "flex", gap: 4 }}>
                              {c.vvip && <Badge label="VVIP" color="#7c3aed" bg="#f5f3ff" />}
                              {c.csuite && <Badge label="C-Suite" color="#0369a1" bg="#e0f2fe" />}
                              {c.ews && <Badge label="EWS" color="#b45309" bg="#fef3c7" />}
                            </div>
                          </td>
                          <td style={td} onClick={e => { e.stopPropagation(); openEdit(c); }}>
                            <span style={{ fontSize: 12, color: HSBC_RED, fontWeight: 600, cursor: "pointer" }}>Edit</span>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr><td colSpan={11} style={{ ...td, textAlign: "center", color: HSBC_MUTED, padding: 40 }}>No cases match your filters.</td></tr>
                    )}
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
              <button style={{ ...btn("ghost"), marginBottom: 18, fontSize: 13 }} onClick={() => setSelectedCase(null)}>← Back to Cases</button>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: HSBC_RED }}>{c.caseNumber}</span>
                    {c.localId && <span style={{ fontSize: 13, color: HSBC_MUTED }}>· {c.localId}</span>}
                    {c.dateResolved ? <Badge label="Resolved" color="#166534" bg="#dcfce7" /> : <Badge label="Open" color={HSBC_RED} bg="#fff1f2" />}
                    {c.vvip && <Badge label="VVIP" color="#7c3aed" bg="#f5f3ff" />}
                    {c.csuite && <Badge label="C-Suite" color="#0369a1" bg="#e0f2fe" />}
                    {c.ews && <Badge label="EWS" color="#b45309" bg="#fef3c7" />}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: HSBC_DARK }}>{c.clientName}</div>
                  {c.corporateName && <div style={{ fontSize: 13, color: HSBC_MUTED }}>{c.corporateName}{c.mastergroup ? ` · ${c.mastergroup}` : ""}</div>}
                </div>
                <button style={btn("outline")} onClick={() => openEdit(c)}>Edit Case</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {/* Left */}
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={card}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Case Timing</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        ["Date Raised", c.dateRaised],
                        ["Date Resolved", c.dateResolved || "—"],
                        ["Year", getYear(c.dateRaised)],
                        ["Quarter", getQuarter(c.dateRaised)],
                        ["Month", getMonth(c.dateRaised)],
                        ["TAT (working days)", tat !== null ? tat : "—"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontSize: 11, color: HSBC_MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k}</div>
                          <div style={{ fontSize: 13, color: HSBC_TEXT, fontWeight: 500, marginTop: 2 }}>{v || "—"}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 11, color: HSBC_MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>TAT Category</div>
                      <Badge label={TAT_CATEGORIES[tatCat]} color={TAT_BADGE[tatCat].color} bg={TAT_BADGE[tatCat].bg} />
                    </div>
                  </div>

                  <div style={card}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Client Details</div>
                    {[
                      ["Relationship", c.clientRelationship],
                      ["Country", c.countryClient],
                      ["Corporate Name", c.corporateName],
                      ["Position", c.clientPosition],
                      ["Account Type", c.accountType],
                      ["Connection", c.connection],
                      ["Transversal/Domestic", c.transversal],
                    ].map(([k, v]) => v ? (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid #f5f5f5`, fontSize: 13 }}>
                        <span style={{ color: HSBC_MUTED }}>{k}</span>
                        <span style={{ fontWeight: 500 }}>{v}</span>
                      </div>
                    ) : null)}
                  </div>

                  <div style={card}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Referrer</div>
                    {[
                      ["Name", c.referrerName],
                      ["Business Line", c.referrerBusinessLine],
                      ["Country", c.referrerCountry],
                    ].map(([k, v]) => v ? (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid #f5f5f5`, fontSize: 13 }}>
                        <span style={{ color: HSBC_MUTED }}>{k}</span>
                        <span style={{ fontWeight: 500 }}>{v}</span>
                      </div>
                    ) : null)}
                    {[["Case Manager", c.managedBy]].map(([k,v]) => v ? (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid #f5f5f5`, fontSize: 13 }}>
                        <span style={{ color: HSBC_MUTED }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
                      </div>
                    ) : null)}
                  </div>
                </div>

                {/* Right */}
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={card}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Request Details</div>
                    {[
                      ["Category", c.categoryRequest],
                      ["Client Request", c.clientRequest],
                      ["Country Request Relating To", c.countryRequest],
                    ].map(([k, v]) => v ? (
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
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: HSBC_DARK }}>Management Reporting</h1>
                <div style={{ fontSize: 13, color: HSBC_MUTED, marginTop: 3 }}>Analytics & insights · filterable by date, manager and category</div>
              </div>
            </div>

            {/* Analytics Filters */}
            <div style={{ background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, padding: "14px 18px", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: HSBC_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>Filter:</span>
                <select style={{ ...inp, width: 150 }} value={aManager} onChange={e => setAManager(e.target.value)}>
                  <option value="">All Managers</option>
                  {CASE_MANAGERS.map(m => <option key={m}>{m}</option>)}
                </select>
                <select style={{ ...inp, width: 200 }} value={aCategory} onChange={e => setACategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {CLIENT_REQUEST_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input style={{ ...inp, width: 140 }} type="date" value={aDateFrom} onChange={e => setADateFrom(e.target.value)} title="From date" />
                <input style={{ ...inp, width: 140 }} type="date" value={aDateTo} onChange={e => setADateTo(e.target.value)} title="To date" />
                {(aManager || aCategory || aDateFrom || aDateTo) && (
                  <button style={btn("ghost")} onClick={() => { setAManager(""); setACategory(""); setADateFrom(""); setADateTo(""); }}>Clear</button>
                )}
              </div>
            </div>

            {/* KPI Row */}
            <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
              <StatCard label="Total Cases" value={aCases.length} red />
              <StatCard label="Open" value={open.length} sub={aCases.length ? `${Math.round((open.length / aCases.length) * 100)}% of total` : ""} />
              <StatCard label="Resolved" value={resolved.length} sub={aCases.length ? `${Math.round((resolved.length / aCases.length) * 100)}% resolution rate` : ""} />
              <StatCard label="VVIP Cases" value={aCases.filter(c => c.vvip).length} />
              <StatCard label="C-Suite" value={aCases.filter(c => c.csuite).length} />
              <StatCard label="EWS Flagged" value={aCases.filter(c => c.ews).length} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>

              {/* TAT Performance — fixed set, no expand needed */}
              <div style={{ background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, padding: "20px 24px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>TAT Performance</div>
                {tatCounts.map(({ key, label: l, count }) => {
                  const pct = aCases.length ? Math.round((count / aCases.length) * 100) : 0;
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                      <div style={{ width: 110, fontSize: 12, color: HSBC_TEXT, flexShrink: 0, textAlign: "right" }}>{l}</div>
                      <div style={{ flex: 1, height: 7, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: HSBC_RED, borderRadius: 4, transition: "width 0.5s ease" }} />
                      </div>
                      <div style={{ width: 70, fontSize: 12, color: HSBC_MUTED, textAlign: "right", flexShrink: 0 }}>{count} · {pct}%</div>
                    </div>
                  );
                })}
                <div style={{ fontSize: 11, color: HSBC_MUTED, marginTop: 10, paddingTop: 10, borderTop: `1px solid #f0f0f0` }}>
                  {aCases.length ? `${Math.round(((tatCounts.find(t => t.key === "within24")?.count || 0) + (tatCounts.find(t => t.key === "within48")?.count || 0)) / aCases.length * 100)}% resolved within 48 hours` : "No data"}
                </div>
              </div>

              {/* Volume by Manager — fixed 3, no expand needed */}
              <div style={{ background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, padding: "20px 24px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Volume by Case Manager</div>
                {byManager.map(({ label: l, count }) => {
                  const pct = aCases.length ? Math.round((count / aCases.length) * 100) : 0;
                  const max = Math.max(...byManager.map(x => x.count), 1);
                  return (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                      <div style={{ width: 70, fontSize: 12, color: HSBC_TEXT, flexShrink: 0, textAlign: "right" }}>{l}</div>
                      <div style={{ flex: 1, height: 7, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((count / max) * 100)}%`, height: "100%", background: HSBC_RED, borderRadius: 4, transition: "width 0.5s ease" }} />
                      </div>
                      <div style={{ width: 70, fontSize: 12, color: HSBC_MUTED, textAlign: "right", flexShrink: 0 }}>{count} · {pct}%</div>
                    </div>
                  );
                })}
              </div>

              {/* Expandable charts */}
              <ExpandableChart title="By Category of Request" items={byCategory} total={aCases.length} defaultShow={3} />
              <ExpandableChart title="By Client Country" items={byCountry} total={aCases.length} defaultShow={3} />
              <ExpandableChart title="By Referrer Business Line" items={byBizLine} total={aCases.length} defaultShow={3} />
              <ExpandableChart title="By Account Type" items={byAccountType} total={aCases.length} defaultShow={3} />
            </div>

            {/* Type of Request — full width expandable */}
            <div style={{ marginBottom: 18 }}>
              <ExpandableChart title="By Client Request Type" items={byClientRequest} total={aCases.length} defaultShow={3} />
            </div>

            {/* Flags Summary */}
            <div style={{ background: "#fff", border: `1px solid ${HSBC_BORDER}`, borderRadius: 6, padding: "20px 24px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: HSBC_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Flags Summary</div>
              <div style={{ fontSize: 12, color: HSBC_MUTED, marginBottom: 16 }}>Breakdown of all {aCases.length} case{aCases.length !== 1 ? "s" : ""} by priority flag status</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    {["Flag", "Total Cases", "Open", "Resolved", "% of All Cases"].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "VVIP", filter: c => c.vvip, badge: { color: "#7c3aed", bg: "#f5f3ff" } },
                    { label: "C-Suite", filter: c => c.csuite, badge: { color: "#0369a1", bg: "#e0f2fe" } },
                    { label: "EWS", filter: c => c.ews, badge: { color: "#b45309", bg: "#fef3c7" } },
                  ].map(({ label: l, filter, badge }) => {
                    const flagCases = aCases.filter(filter);
                    const flagOpen = flagCases.filter(c => !c.dateResolved).length;
                    const flagResolved = flagCases.filter(c => !!c.dateResolved).length;
                    return (
                      <tr key={l} style={{ borderBottom: `1px solid #f5f5f5` }}>
                        <td style={td}><Badge label={l} color={badge.color} bg={badge.bg} /></td>
                        <td style={{ ...td, fontWeight: 700 }}>{flagCases.length}</td>
                        <td style={td}>{flagOpen}</td>
                        <td style={td}>{flagResolved}</td>
                        <td style={td}>{aCases.length ? `${Math.round((flagCases.length / aCases.length) * 100)}% (${flagCases.length} of ${aCases.length})` : "—"}</td>
                      </tr>
                    );
                  })}
                  {(() => {
                    const noFlagCases = aCases.filter(c => !c.vvip && !c.csuite && !c.ews);
                    const noFlagOpen = noFlagCases.filter(c => !c.dateResolved).length;
                    const noFlagResolved = noFlagCases.filter(c => !!c.dateResolved).length;
                    return (
                      <tr style={{ borderBottom: `1px solid #f5f5f5`, background: "#fafafa" }}>
                        <td style={td}><Badge label="No Flag" color={HSBC_MUTED} bg="#f3f4f6" /></td>
                        <td style={{ ...td, fontWeight: 700 }}>{noFlagCases.length}</td>
                        <td style={td}>{noFlagOpen}</td>
                        <td style={td}>{noFlagResolved}</td>
                        <td style={td}>{aCases.length ? `${Math.round((noFlagCases.length / aCases.length) * 100)}% (${noFlagCases.length} of ${aCases.length})` : "—"}</td>
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
      </div>
    </div>
  );
}