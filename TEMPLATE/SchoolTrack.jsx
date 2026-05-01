import { useState, useRef, useEffect, useCallback } from "react";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const TOKEN = {
  bg: "#0A0E1A",
  surface: "#111827",
  card: "#161D2E",
  border: "#1E2D45",
  accent: "#3B82F6",
  accentGlow: "#3B82F640",
  green: "#10B981",
  red: "#EF4444",
  amber: "#F59E0B",
  purple: "#8B5CF6",
  text: "#F1F5F9",
  muted: "#64748B",
  light: "#94A3B8",
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED = {
  schools: [
    { id: "SCH001", name: "Greenwood Academy", city: "Mumbai", credits: 420, students: 312, active: true, adminEmail: "principal@greenwood.edu", adminPass: "school123" },
    { id: "SCH002", name: "Sunrise Public School", city: "Delhi", credits: 88, students: 198, active: true, adminEmail: "principal@sunrise.edu", adminPass: "sunrise123" },
    { id: "SCH003", name: "Blue Ridge International", city: "Bangalore", credits: 650, students: 445, active: true, adminEmail: "principal@blueridge.edu", adminPass: "blueridge123" },
  ],
  classes: [
    { id: "CLS001", schoolId: "SCH001", name: "Grade 5A", section: "A", grade: 5 },
    { id: "CLS002", schoolId: "SCH001", name: "Grade 5B", section: "B", grade: 5 },
    { id: "CLS003", schoolId: "SCH001", name: "Grade 6A", section: "A", grade: 6 },
  ],
  teachers: [
    { id: "T001", schoolId: "SCH001", name: "Ms. Priya Sharma", email: "priya@greenwood.edu", pass: "teacher123", classId: "CLS001", phone: "+919876543210" },
    { id: "T002", schoolId: "SCH001", name: "Mr. Rahul Mehta", email: "rahul@greenwood.edu", pass: "rahul123", classId: "CLS002", phone: "+919876543211" },
    { id: "T003", schoolId: "SCH001", name: "Ms. Anita Roy", email: "anita@greenwood.edu", pass: "anita123", classId: "CLS003", phone: "+919876543212" },
  ],
  students: [
    { id: "S001", schoolId: "SCH001", classId: "CLS001", name: "Aarav Patel", roll: "01", parentPhone: "+919800001111" },
    { id: "S002", schoolId: "SCH001", classId: "CLS001", name: "Diya Singh", roll: "02", parentPhone: "+919800001112" },
    { id: "S003", schoolId: "SCH001", classId: "CLS001", name: "Kabir Sharma", roll: "03", parentPhone: "+919800001113" },
    { id: "S004", schoolId: "SCH001", classId: "CLS001", name: "Meera Joshi", roll: "04", parentPhone: "+919800001114" },
    { id: "S005", schoolId: "SCH001", classId: "CLS001", name: "Rohan Gupta", roll: "05", parentPhone: "+919800001115" },
    { id: "S006", schoolId: "SCH001", classId: "CLS001", name: "Sia Kumar", roll: "06", parentPhone: "+919800001116" },
    { id: "S007", schoolId: "SCH001", classId: "CLS002", name: "Aditya Nair", roll: "01", parentPhone: "+919800002221" },
    { id: "S008", schoolId: "SCH001", classId: "CLS002", name: "Pooja Iyer", roll: "02", parentPhone: "+919800002222" },
    { id: "S009", schoolId: "SCH001", classId: "CLS002", name: "Vikram Das", roll: "03", parentPhone: "+919800002223" },
    { id: "S010", schoolId: "SCH001", classId: "CLS003", name: "Nisha Verma", roll: "01", parentPhone: "+919800003331" },
    { id: "S011", schoolId: "SCH001", classId: "CLS003", name: "Arjun Bose", roll: "02", parentPhone: "+919800003332" },
  ],
  attendance: [
    { id: "A001", schoolId: "SCH001", classId: "CLS001", studentId: "S001", date: "2026-03-04", status: "present", teacherId: "T001", photo: true },
    { id: "A002", schoolId: "SCH001", classId: "CLS001", studentId: "S002", date: "2026-03-04", status: "absent", teacherId: "T001", photo: true },
    { id: "A003", schoolId: "SCH001", classId: "CLS001", studentId: "S003", date: "2026-03-04", status: "present", teacherId: "T001", photo: true },
    { id: "A004", schoolId: "SCH001", classId: "CLS001", studentId: "S004", date: "2026-03-04", status: "present", teacherId: "T001", photo: true },
    { id: "A005", schoolId: "SCH001", classId: "CLS001", studentId: "S005", date: "2026-03-04", status: "absent", teacherId: "T001", photo: true },
    { id: "A006", schoolId: "SCH001", classId: "CLS001", studentId: "S006", date: "2026-03-04", status: "present", teacherId: "T001", photo: true },
  ],
  holidays: [
    { id: "H001", schoolId: "SCH001", date: "2026-03-25", title: "Holi" },
    { id: "H002", schoolId: "SCH001", date: "2026-04-14", title: "Dr. Ambedkar Jayanti" },
  ],
  messages: [
    { id: "M001", schoolId: "SCH001", studentName: "Diya Singh", parentPhone: "+919800001112", date: "2026-03-04 09:15", status: "delivered" },
    { id: "M002", schoolId: "SCH001", studentName: "Rohan Gupta", parentPhone: "+919800001115", date: "2026-03-04 09:16", status: "delivered" },
  ],
};

// ─── Utility ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const pct = (p, t) => t ? Math.round((p / t) * 100) : 0;

// ─── Styles ───────────────────────────────────────────────────────────────────
const gs = {
  app: { minHeight: "100vh", background: TOKEN.bg, fontFamily: "'DM Sans', sans-serif", color: TOKEN.text },
  card: { background: TOKEN.card, border: `1px solid ${TOKEN.border}`, borderRadius: 16, padding: 24 },
  btn: (color = TOKEN.accent) => ({
    background: color, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px",
    fontWeight: 600, cursor: "pointer", fontSize: 14, transition: "opacity .15s",
  }),
  btnGhost: { background: "transparent", color: TOKEN.light, border: `1px solid ${TOKEN.border}`, borderRadius: 10, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  input: { background: TOKEN.surface, border: `1px solid ${TOKEN.border}`, borderRadius: 10, padding: "10px 14px", color: TOKEN.text, fontSize: 14, width: "100%", boxSizing: "border-box", outline: "none" },
  badge: (color) => ({ background: color + "20", color, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }),
  row: { display: "flex", alignItems: "center", gap: 12 },
  col: { display: "flex", flexDirection: "column", gap: 8 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 },
};

// ─── Mini Components ─────────────────────────────────────────────────────────
const Stat = ({ label, value, color = TOKEN.accent, sub }) => (
  <div style={{ ...gs.card, display: "flex", flexDirection: "column", gap: 4 }}>
    <span style={{ color: TOKEN.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
    <span style={{ fontSize: 32, fontWeight: 800, color }}>{value}</span>
    {sub && <span style={{ color: TOKEN.muted, fontSize: 12 }}>{sub}</span>}
  </div>
);

const Badge = ({ text, color }) => <span style={gs.badge(color)}>{text}</span>;

const Tag = ({ on, onClick, children }) => (
  <button onClick={onClick} style={{
    background: on ? TOKEN.accent : TOKEN.surface, color: on ? "#fff" : TOKEN.muted,
    border: `1px solid ${on ? TOKEN.accent : TOKEN.border}`, borderRadius: 8, padding: "6px 14px",
    fontSize: 13, cursor: "pointer", fontWeight: on ? 700 : 400, transition: "all .15s",
  }}>{children}</button>
);

const Table = ({ cols, rows, renderRow }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${TOKEN.border}` }}>
          {cols.map(c => <th key={c} style={{ padding: "10px 14px", textAlign: "left", color: TOKEN.muted, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{c}</th>)}
        </tr>
      </thead>
      <tbody>{rows.map((r, i) => <tr key={i} style={{ borderBottom: `1px solid ${TOKEN.border}10` }}>{renderRow(r)}</tr>)}</tbody>
    </table>
  </div>
);

const Td = ({ children, align = "left" }) => (
  <td style={{ padding: "12px 14px", textAlign: align, verticalAlign: "middle" }}>{children}</td>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
    <div style={{ ...gs.card, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
      <div style={{ ...gs.row, justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ fontWeight: 700, fontSize: 18 }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: TOKEN.muted, fontSize: 22, cursor: "pointer" }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const ProgressBar = ({ value, color = TOKEN.accent }) => (
  <div style={{ background: TOKEN.border, borderRadius: 99, height: 6, overflow: "hidden" }}>
    <div style={{ width: `${value}%`, background: color, height: "100%", borderRadius: 99, transition: "width .5s" }} />
  </div>
);

// \u2500\u2500\u2500 Login Screen \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function LoginScreen({ onLogin, db }) {
  const [role, setRole] = React.useState("superadmin");
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [err, setErr] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);

  const doLogin = () => {
    setErr("");
    if (role === "superadmin") {
      if (email === "admin@schooltrack.in" && pass === "admin123") {
        onLogin({ role, email, name: "Platform Admin", schoolId: null });
      } else setErr("Invalid Super Admin credentials.");
      return;
    }
    if (role === "schooladmin") {
      const school = db.schools.find(s => s.adminEmail === email && s.adminPass === pass);
      if (!school) { setErr("No school account found with these credentials."); return; }
      if (!school.active) { setErr("This school account has been disabled."); return; }
      onLogin({ role, email, name: "Principal \u2014 " + school.name, schoolId: school.id });
      return;
    }
    if (role === "teacher") {
      const teacher = db.teachers.find(t => t.email === email && t.pass === pass);
      if (!teacher) { setErr("No teacher account found with these credentials."); return; }
      onLogin({ role, email, name: teacher.name, schoolId: teacher.schoolId, teacherId: teacher.id, classId: teacher.classId });
    }
  };

  const hints = {
    superadmin: [{ email: "admin@schooltrack.in", pass: "admin123", label: "Platform Admin" }],
    schooladmin: db.schools.map(s => ({ email: s.adminEmail, pass: s.adminPass, label: s.name })),
    teacher: db.teachers.map(t => ({ email: t.email, pass: t.pass, label: t.name })),
  };

  return (
    <div style={{ minHeight: "100vh", background: TOKEN.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, background: TOKEN.accent, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>&#x1F3EB;</div>
            <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk'" }}>SchoolTrack</span>
          </div>
          <p style={{ color: TOKEN.muted, fontSize: 15 }}>Attendance management, reimagined</p>
        </div>
        <div style={{ ...gs.card, display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <p style={{ color: TOKEN.muted, fontSize: 12, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Login As</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[["superadmin", "\uD83D\uDD11 Super Admin"], ["schooladmin", "\uD83C\uDFEB Principal"], ["teacher", "\uD83D\uDC69\u200D\uD83C\uDFEB Teacher"]].map(([r, l]) => (
                <Tag key={r} on={role === r} onClick={() => { setRole(r); setErr(""); setEmail(""); setPass(""); }}>{l}</Tag>
              ))}
            </div>
          </div>
          <div style={{ background: TOKEN.surface, borderRadius: 10, padding: 12 }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: TOKEN.amber, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Demo Accounts \u2014 click to fill</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {hints[role].map((h, i) => (
                <button key={i} onClick={() => { setEmail(h.email); setPass(h.pass); setErr(""); }} style={{
                  background: TOKEN.card, border: "1px solid " + TOKEN.border, borderRadius: 8, padding: "8px 12px",
                  textAlign: "left", cursor: "pointer", color: TOKEN.text,
                }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{h.label}</span>
                  <span style={{ color: TOKEN.muted, fontSize: 12, marginLeft: 8 }}>{h.email}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={gs.col}>
            <input style={gs.input} placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            <div style={{ position: "relative" }}>
              <input style={{ ...gs.input, paddingRight: 44 }} type={showPass ? "text" : "password"} placeholder="Password" value={pass}
                onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
              <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: TOKEN.muted, cursor: "pointer", fontSize: 16 }}>
                {showPass ? "\uD83D\uDE48" : "\uD83D\uDC41"}
              </button>
            </div>
          </div>
          {err && <p style={{ color: TOKEN.red, fontSize: 13, margin: 0 }}>\u26A0 {err}</p>}
          <button style={{ ...gs.btn(), padding: "13px", fontSize: 15 }} onClick={doLogin}>Sign In \u2192</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ user, activeTab, setTab, onLogout }) {
  const MENUS = {
    superadmin: [["🏠", "dashboard", "Dashboard"], ["🏫", "schools", "Schools"], ["💳", "credits", "Credits"], ["📊", "analytics", "Analytics"]],
    schooladmin: [["🏠", "dashboard", "Dashboard"], ["📋", "attendance", "Attendance"], ["👨‍🏫", "teachers", "Teachers"], ["👩‍🎓", "students", "Students"], ["📅", "holidays", "Holidays"], ["💬", "messages", "Messages"], ["📈", "reports", "Reports"]],
    teacher: [["🏠", "dashboard", "Dashboard"], ["✅", "markattendance", "Mark Attendance"], ["📋", "myclass", "My Class"]],
  };
  const items = MENUS[user.role] || [];

  return (
    <div style={{ width: 220, minHeight: "100vh", background: TOKEN.surface, borderRight: `1px solid ${TOKEN.border}`, display: "flex", flexDirection: "column", padding: "24px 16px", gap: 4, flexShrink: 0 }}>
      <div style={{ ...gs.row, marginBottom: 24, paddingLeft: 8 }}>
        <div style={{ width: 32, height: 32, background: TOKEN.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏫</div>
        <span style={{ fontWeight: 800, fontFamily: "'Space Grotesk'", fontSize: 16 }}>SchoolTrack</span>
      </div>

      {items.map(([icon, key, label]) => (
        <button key={key} onClick={() => setTab(key)} style={{
          background: activeTab === key ? TOKEN.accentGlow : "transparent",
          color: activeTab === key ? TOKEN.accent : TOKEN.light,
          border: activeTab === key ? `1px solid ${TOKEN.accent}30` : "1px solid transparent",
          borderRadius: 10, padding: "10px 14px", textAlign: "left", cursor: "pointer",
          fontWeight: activeTab === key ? 700 : 400, fontSize: 14, display: "flex", alignItems: "center", gap: 10, transition: "all .15s",
        }}>{icon} {label}</button>
      ))}

      <div style={{ marginTop: "auto" }}>
        <div style={{ ...gs.card, padding: 12, marginBottom: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{user.name}</p>
          <p style={{ fontSize: 11, color: TOKEN.muted, margin: 0, marginTop: 2, textTransform: "capitalize" }}>{user.role.replace("admin", " Admin")}</p>
        </div>
        <button onClick={onLogout} style={{ ...gs.btnGhost, width: "100%", textAlign: "center" }}>Sign Out</button>
      </div>
    </div>
  );
}

// \u2500\u2500\u2500 Super Admin: Schools \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function SchoolsPage({ db, setDb }) {
  const [modal, setModal] = React.useState(false);
  const [credModal, setCredModal] = React.useState(null);
  const [form, setForm] = React.useState({ name: "", city: "", credits: 200, adminEmail: "", adminPass: "" });
  const [credForm, setCredForm] = React.useState({ adminEmail: "", adminPass: "" });
  const [showPassMap, setShowPassMap] = React.useState({});

  const addSchool = () => {
    if (!form.name || !form.adminEmail || !form.adminPass) return alert("Fill all fields");
    const id = "SCH" + String(db.schools.length + 1).padStart(3, "0");
    setDb(d => ({ ...d, schools: [...d.schools, { id, ...form, students: 0, active: true, credits: +form.credits }] }));
    setModal(false);
    setForm({ name: "", city: "", credits: 200, adminEmail: "", adminPass: "" });
  };

  const saveCreds = () => {
    setDb(d => ({ ...d, schools: d.schools.map(s => s.id === credModal ? { ...s, ...credForm } : s) }));
    setCredModal(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ ...gs.row, justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Schools</h2>
        <button style={gs.btn()} onClick={() => setModal(true)}>+ Add School</button>
      </div>

      <div style={gs.card}>
        <Table
          cols={["School ID", "Name", "City", "Students", "Credits", "Admin Email", "Password", "Status", "Actions"]}
          rows={db.schools}
          renderRow={s => (<>
            <Td><code style={{ background: TOKEN.surface, padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>{s.id}</code></Td>
            <Td><strong>{s.name}</strong></Td>
            <Td>{s.city}</Td>
            <Td>{s.students}</Td>
            <Td><span style={{ color: s.credits < 100 ? TOKEN.red : TOKEN.green, fontWeight: 700 }}>{s.credits}</span></Td>
            <Td><span style={{ fontSize: 13, color: TOKEN.light }}>{s.adminEmail || <span style={{color:TOKEN.red}}>Not set</span>}</span></Td>
            <Td>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontFamily: "monospace", color: TOKEN.light }}>
                  {showPassMap[s.id] ? (s.adminPass || "—") : (s.adminPass ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : <span style={{color:TOKEN.red}}>Not set</span>)}
                </span>
                <button onClick={() => setShowPassMap(m => ({ ...m, [s.id]: !m[s.id] }))} style={{ background: "none", border: "none", cursor: "pointer", color: TOKEN.muted, fontSize: 13 }}>
                  {showPassMap[s.id] ? "\uD83D\uDE48" : "\uD83D\uDC41"}
                </button>
              </div>
            </Td>
            <Td><Badge text={s.active ? "Active" : "Inactive"} color={s.active ? TOKEN.green : TOKEN.red} /></Td>
            <Td>
              <div style={gs.row}>
                <button style={{ ...gs.btn(TOKEN.purple), padding: "6px 12px", fontSize: 12 }} onClick={() => { setCredModal(s.id); setCredForm({ adminEmail: s.adminEmail || "", adminPass: s.adminPass || "" }); }}>
                  \uD83D\uDD11 Credentials
                </button>
                <button onClick={() => setDb(d => ({ ...d, schools: d.schools.map(x => x.id === s.id ? { ...x, active: !x.active } : x) }))}
                  style={{ ...gs.btn(s.active ? TOKEN.red : TOKEN.green), padding: "6px 12px", fontSize: 12 }}>
                  {s.active ? "Disable" : "Enable"}
                </button>
              </div>
            </Td>
          </>)}
        />
      </div>

      {modal && (
        <Modal title="Add New School" onClose={() => setModal(false)}>
          <div style={gs.col}>
            <input style={gs.input} placeholder="School Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input style={gs.input} placeholder="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            <input style={gs.input} type="number" placeholder="Initial Credits" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))} />
            <hr style={{ border: "none", borderTop: "1px solid " + TOKEN.border }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: TOKEN.muted }}>Principal (School Admin) Login</p>
            <input style={gs.input} placeholder="Admin Email *" value={form.adminEmail} onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))} />
            <input style={gs.input} placeholder="Admin Password *" value={form.adminPass} onChange={e => setForm(f => ({ ...f, adminPass: e.target.value }))} />
            <button style={gs.btn()} onClick={addSchool}>Create School</button>
          </div>
        </Modal>
      )}

      {credModal && (
        <Modal title={"Update Credentials \u2014 " + (db.schools.find(s => s.id === credModal)?.name || "")} onClose={() => setCredModal(null)}>
          <div style={gs.col}>
            <p style={{ margin: 0, color: TOKEN.muted, fontSize: 13 }}>These are the login credentials for the School Admin (Principal) of this school.</p>
            <input style={gs.input} placeholder="Admin Email" value={credForm.adminEmail} onChange={e => setCredForm(f => ({ ...f, adminEmail: e.target.value }))} />
            <input style={gs.input} placeholder="Admin Password" value={credForm.adminPass} onChange={e => setCredForm(f => ({ ...f, adminPass: e.target.value }))} />
            <div style={{ background: TOKEN.surface, borderRadius: 10, padding: 12, fontSize: 13 }}>
              <p style={{ margin: "0 0 4px", color: TOKEN.amber, fontWeight: 700 }}>\uD83D\uDCCB Share these with the Principal:</p>
              <p style={{ margin: 0, color: TOKEN.light }}>URL: schooltrack.app/login</p>
              <p style={{ margin: 0, color: TOKEN.light }}>Email: {credForm.adminEmail}</p>
              <p style={{ margin: 0, color: TOKEN.light }}>Password: {credForm.adminPass}</p>
            </div>
            <button style={gs.btn()} onClick={saveCreds}>Save Credentials</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Super Admin: Credits ─────────────────────────────────────────────────────
function CreditsPage({ db, setDb }) {
  const [sel, setSel] = useState(null);
  const [amt, setAmt] = useState(100);
  const topup = () => {
    setDb(d => ({ ...d, schools: d.schools.map(s => s.id === sel ? { ...s, credits: s.credits + +amt } : s) }));
    setSel(null);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Credit Management</h2>
      <div style={gs.grid3}>
        {db.schools.map(s => (
          <div key={s.id} style={{ ...gs.card, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700 }}>{s.name}</p>
              <p style={{ margin: 0, fontSize: 12, color: TOKEN.muted }}>{s.city}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: TOKEN.muted }}>Balance</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: s.credits < 100 ? TOKEN.red : TOKEN.green }}>{s.credits}</p>
            </div>
            <ProgressBar value={Math.min((s.credits / 500) * 100, 100)} color={s.credits < 100 ? TOKEN.red : TOKEN.green} />
            <button style={gs.btn(TOKEN.accent)} onClick={() => setSel(s.id)}>Top Up</button>
          </div>
        ))}
      </div>
      {sel && (
        <Modal title="Add Credits" onClose={() => setSel(null)}>
          <div style={gs.col}>
            <p style={{ color: TOKEN.muted }}>School: <strong style={{ color: TOKEN.text }}>{db.schools.find(s => s.id === sel)?.name}</strong></p>
            <input style={gs.input} type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="Credits to add" />
            <button style={gs.btn()} onClick={topup}>Add {amt} Credits</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Students Page ────────────────────────────────────────────────────────────
function StudentsPage({ db, setDb, schoolId }) {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", classId: "", roll: "", parentPhone: "" });
  const students = db.students.filter(s => s.schoolId === schoolId && (s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.includes(search)));
  const classes = db.classes.filter(c => c.schoolId === schoolId);

  const addStudent = () => {
    const id = `S${String(db.students.length + 1).padStart(3, "0")}`;
    setDb(d => ({ ...d, students: [...d.students, { id, schoolId, ...form }] }));
    setModal(false); setForm({ name: "", classId: "", roll: "", parentPhone: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ ...gs.row, justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Students</h2>
        <div style={gs.row}>
          <input style={{ ...gs.input, width: 220 }} placeholder="Search name or roll..." value={search} onChange={e => setSearch(e.target.value)} />
          <button style={gs.btn()} onClick={() => setModal(true)}>+ Add Student</button>
        </div>
      </div>
      <div style={gs.card}>
        <Table
          cols={["Roll", "Name", "Class", "Parent Phone", "Actions"]}
          rows={students}
          renderRow={s => (<>
            <Td><strong>{s.roll}</strong></Td>
            <Td>{s.name}</Td>
            <Td>{classes.find(c => c.id === s.classId)?.name || s.classId}</Td>
            <Td>{s.parentPhone}</Td>
            <Td><button style={{ ...gs.btn(TOKEN.red), padding: "5px 10px", fontSize: 12 }} onClick={() => setDb(d => ({ ...d, students: d.students.filter(x => x.id !== s.id) }))}>Remove</button></Td>
          </>)}
        />
      </div>
      {modal && (
        <Modal title="Add Student" onClose={() => setModal(false)}>
          <div style={gs.col}>
            <input style={gs.input} placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <select style={gs.input} value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input style={gs.input} placeholder="Roll Number" value={form.roll} onChange={e => setForm(f => ({ ...f, roll: e.target.value }))} />
            <input style={gs.input} placeholder="Parent Phone (+91...)" value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} />
            <button style={gs.btn()} onClick={addStudent}>Add Student</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Teachers Page ────────────────────────────────────────────────────────────
function TeachersPage({ db, setDb, schoolId }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", pass: "", classId: "", phone: "" });
  const teachers = db.teachers.filter(t => t.schoolId === schoolId);
  const classes = db.classes.filter(c => c.schoolId === schoolId);

  const addTeacher = () => {
    if (!form.name || !form.email || !form.pass) return alert("Name, email and password are required");
    const id = `T${String(db.teachers.length + 1).padStart(3, "0")}`;
    setDb(d => ({ ...d, teachers: [...d.teachers, { id, schoolId, ...form }] }));
    setModal(false); setForm({ name: "", email: "", pass: "", classId: "", phone: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ ...gs.row, justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Teachers</h2>
        <button style={gs.btn()} onClick={() => setModal(true)}>+ Add Teacher</button>
      </div>
      <div style={gs.card}>
        <Table
          cols={["Name", "Email", "Assigned Class", "Phone"]}
          rows={teachers}
          renderRow={t => (<>
            <Td><strong>{t.name}</strong></Td>
            <Td style={{ color: TOKEN.muted }}>{t.email}</Td>
            <Td><Badge text={classes.find(c => c.id === t.classId)?.name || "Unassigned"} color={t.classId ? TOKEN.accent : TOKEN.amber} /></Td>
            <Td>{t.phone}</Td>
          </>)}
        />
      </div>
      {modal && (
        <Modal title="Add Teacher" onClose={() => setModal(false)}>
          <div style={gs.col}>
            <input style={gs.input} placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input style={gs.input} placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <input style={gs.input} placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <input style={gs.input} placeholder="Login Password *" value={form.pass} onChange={e => setForm(f => ({ ...f, pass: e.target.value }))} />
            <select style={gs.input} value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}>
              <option value="">Assign Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button style={gs.btn()} onClick={addTeacher}>Add Teacher</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Holidays Page ────────────────────────────────────────────────────────────
function HolidaysPage({ db, setDb, schoolId }) {
  const [form, setForm] = useState({ date: "", title: "" });
  const holidays = db.holidays.filter(h => h.schoolId === schoolId);

  const addHoliday = () => {
    if (!form.date || !form.title) return;
    const id = `H${Date.now()}`;
    setDb(d => ({ ...d, holidays: [...d.holidays, { id, schoolId, ...form }] }));
    setForm({ date: "", title: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Holiday Management</h2>
      <div style={{ ...gs.card }}>
        <p style={{ margin: "0 0 16px", fontWeight: 600 }}>Add Holiday</p>
        <div style={{ ...gs.row, flexWrap: "wrap" }}>
          <input style={{ ...gs.input, width: 180 }} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <input style={{ ...gs.input, flex: 1 }} placeholder="Holiday Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <button style={gs.btn()} onClick={addHoliday}>Add</button>
        </div>
      </div>
      <div style={gs.card}>
        <Table
          cols={["Date", "Title", "Day", "Actions"]}
          rows={holidays.sort((a, b) => a.date.localeCompare(b.date))}
          renderRow={h => (<>
            <Td><strong>{fmt(h.date)}</strong></Td>
            <Td>{h.title}</Td>
            <Td><Badge text={new Date(h.date).toLocaleDateString("en", { weekday: "long" })} color={TOKEN.purple} /></Td>
            <Td><button style={{ ...gs.btn(TOKEN.red), padding: "5px 10px", fontSize: 12 }} onClick={() => setDb(d => ({ ...d, holidays: d.holidays.filter(x => x.id !== h.id) }))}>Remove</button></Td>
          </>)}
        />
      </div>
    </div>
  );
}

// ─── Messages / WhatsApp ──────────────────────────────────────────────────────
function MessagesPage({ db, setDb, schoolId }) {
  const [filter, setFilter] = useState("class");
  const [selClass, setSelClass] = useState("CLS001");
  const [sent, setSent] = useState(false);
  const school = db.schools.find(s => s.id === schoolId);
  const classes = db.classes.filter(c => c.schoolId === schoolId);
  const todayAtt = db.attendance.filter(a => a.schoolId === schoolId && a.date === "2026-03-04" && a.status === "absent");
  const messages = db.messages.filter(m => m.schoolId === schoolId);

  const absentStudents = todayAtt.map(a => db.students.find(s => s.id === a.studentId)).filter(Boolean);
  const filtered = filter === "class" ? absentStudents.filter(s => s.classId === selClass) : absentStudents;

  const sendMessages = () => {
    if (!school || school.credits < filtered.length) return alert("Insufficient credits!");
    const newMsgs = filtered.map(s => ({ id: `M${Date.now()}-${s.id}`, schoolId, studentName: s.name, parentPhone: s.parentPhone, date: new Date().toLocaleString("en-IN"), status: "delivered" }));
    setDb(d => ({
      ...d,
      messages: [...d.messages, ...newMsgs],
      schools: d.schools.map(x => x.id === schoolId ? { ...x, credits: x.credits - filtered.length } : x),
    }));
    setSent(true); setTimeout(() => setSent(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>WhatsApp Notifications</h2>

      <div style={{ ...gs.card }}>
        <div style={{ ...gs.row, justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontWeight: 700 }}>Send Absence Notifications</span>
          <div style={gs.row}>
            <span style={{ color: TOKEN.muted, fontSize: 13 }}>Credits: </span>
            <span style={{ color: TOKEN.green, fontWeight: 700 }}>{school?.credits}</span>
          </div>
        </div>

        <div style={{ ...gs.row, marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <Tag on={filter === "class"} onClick={() => setFilter("class")}>By Class</Tag>
          <Tag on={filter === "school"} onClick={() => setFilter("school")}>Entire School</Tag>
          {filter === "class" && (
            <select style={{ ...gs.input, width: 160 }} value={selClass} onChange={e => setSelClass(e.target.value)}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>

        <div style={{ background: TOKEN.surface, borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, color: TOKEN.muted }}>Message Preview:</p>
          <p style={{ margin: 0, fontSize: 13, color: TOKEN.text, lineHeight: 1.6 }}>
            "Dear Parent, your child [Student Name] from Class [Class Name] was absent today. Please contact the school if this was unexpected."
          </p>
        </div>

        <div style={{ ...gs.row, justifyContent: "space-between" }}>
          <span style={{ color: TOKEN.muted, fontSize: 13 }}>{filtered.length} parent(s) will receive message · {filtered.length} credit(s) used</span>
          <button style={gs.btn(sent ? TOKEN.green : TOKEN.accent)} onClick={sendMessages} disabled={filtered.length === 0}>
            {sent ? "✓ Sent!" : `Send to ${filtered.length} Parent(s)`}
          </button>
        </div>
      </div>

      <div style={gs.card}>
        <p style={{ margin: "0 0 16px", fontWeight: 700 }}>Message Log</p>
        <Table
          cols={["Student", "Parent Phone", "Date & Time", "Status"]}
          rows={messages}
          renderRow={m => (<>
            <Td><strong>{m.studentName}</strong></Td>
            <Td>{m.parentPhone}</Td>
            <Td style={{ color: TOKEN.muted }}>{m.date}</Td>
            <Td><Badge text={m.status} color={TOKEN.green} /></Td>
          </>)}
        />
      </div>
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────
function ReportsPage({ db, schoolId }) {
  const classes = db.classes.filter(c => c.schoolId === schoolId);
  const students = db.students.filter(s => s.schoolId === schoolId);
  const attendance = db.attendance.filter(a => a.schoolId === schoolId);

  const classStats = classes.map(cls => {
    const clsStudents = students.filter(s => s.classId === cls.id);
    const clsAtt = attendance.filter(a => a.classId === cls.id && a.date === "2026-03-04");
    const present = clsAtt.filter(a => a.status === "present").length;
    return { cls, total: clsStudents.length, present, absent: clsAtt.filter(a => a.status === "absent").length };
  });

  const studentStats = students.map(s => {
    const sAtt = attendance.filter(a => a.studentId === s.id);
    const present = sAtt.filter(a => a.status === "present").length;
    return { s, total: sAtt.length, present, pct: pct(present, sAtt.length) };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Attendance Reports</h2>

      <div>
        <p style={{ fontWeight: 700, marginBottom: 12 }}>Today's Class Summary — {fmt(today())}</p>
        <div style={gs.grid3}>
          {classStats.map(({ cls, total, present, absent }) => (
            <div key={cls.id} style={{ ...gs.card, display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{cls.name}</p>
              <div style={{ ...gs.row, justifyContent: "space-between" }}>
                <span style={{ color: TOKEN.green, fontWeight: 700 }}>✓ {present} Present</span>
                <span style={{ color: TOKEN.red, fontWeight: 700 }}>✗ {absent} Absent</span>
              </div>
              <ProgressBar value={pct(present, total)} color={TOKEN.green} />
              <p style={{ margin: 0, fontSize: 12, color: TOKEN.muted }}>{pct(present, total)}% attendance</p>
            </div>
          ))}
        </div>
      </div>

      <div style={gs.card}>
        <p style={{ margin: "0 0 16px", fontWeight: 700 }}>Student Attendance Analytics</p>
        <Table
          cols={["Student", "Class", "Days Tracked", "Present", "Attendance %"]}
          rows={studentStats}
          renderRow={({ s, total, present, pct: p }) => (<>
            <Td><strong>{s.name}</strong></Td>
            <Td>{classes.find(c => c.id === s.classId)?.name}</Td>
            <Td>{total}</Td>
            <Td>{present}</Td>
            <Td>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ProgressBar value={p} color={p >= 75 ? TOKEN.green : p >= 50 ? TOKEN.amber : TOKEN.red} />
                <span style={{ color: p >= 75 ? TOKEN.green : p >= 50 ? TOKEN.amber : TOKEN.red, fontWeight: 700, minWidth: 36 }}>{p}%</span>
              </div>
            </Td>
          </>)}
        />
      </div>
    </div>
  );
}

// ─── Attendance Marking (Teacher) ─────────────────────────────────────────────
function MarkAttendance({ db, setDb, user }) {
  const [step, setStep] = useState("mark"); // mark | camera | done
  const [statusMap, setStatusMap] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [camErr, setCamErr] = useState("");

  const classId = user.classId;
  const students = db.students.filter(s => s.classId === classId);
  const classInfo = db.classes.find(c => c.id === classId);
  const isHoliday = db.holidays.some(h => h.date === today());
  const alreadyMarked = db.attendance.some(a => a.classId === classId && a.date === today());

  const allMarked = students.length > 0 && students.every(s => statusMap[s.id]);

  const toggle = (id) => setStatusMap(m => ({ ...m, [id]: m[id] === "present" ? "absent" : m[id] === "absent" ? undefined : "present" }));
  const markAll = (status) => setStatusMap(Object.fromEntries(students.map(s => [s.id, status])));

  const submitAttendance = () => {
    setStep("camera");
    setTimeout(() => {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
        .then(s => { setStream(s); if (videoRef.current) videoRef.current.srcObject = s; })
        .catch(() => setCamErr("Camera permission denied or not available. In a real device, this captures a live classroom photo."));
    }, 300);
  };

  const takePhoto = useCallback(() => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth || 640;
      canvasRef.current.height = videoRef.current.videoHeight || 480;
      ctx.drawImage(videoRef.current, 0, 0);
      setPhoto(canvasRef.current.toDataURL("image/jpeg", 0.8));
    } else {
      setPhoto("captured");
    }
    if (stream) stream.getTracks().forEach(t => t.stop());
    const records = students.map(s => ({
      id: `A${Date.now()}-${s.id}`, schoolId: user.schoolId, classId, studentId: s.id,
      date: today(), status: statusMap[s.id] || "absent", teacherId: user.teacherId, photo: true, timestamp: new Date().toISOString(),
    }));
    setDb(d => ({ ...d, attendance: [...d.attendance.filter(a => !(a.classId === classId && a.date === today())), ...records] }));
    setSubmitted(true);
    setStep("done");
  }, [stream, students, statusMap, classId, user, setDb]);

  const reset = () => { setStep("mark"); setStatusMap({}); setPhoto(null); setSubmitted(false); setCamErr(""); };

  if (isHoliday) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ margin: 0, fontWeight: 800 }}>Mark Attendance</h2>
      <div style={{ ...gs.card, textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <p style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Today is a Holiday!</p>
        <p style={{ color: TOKEN.muted }}>{db.holidays.find(h => h.date === today())?.title}</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ ...gs.row, justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontWeight: 800 }}>Mark Attendance — {classInfo?.name}</h2>
        <Badge text={fmt(today())} color={TOKEN.accent} />
      </div>

      {alreadyMarked && !submitted && (
        <div style={{ background: TOKEN.amber + "20", border: `1px solid ${TOKEN.amber}40`, borderRadius: 10, padding: 14, color: TOKEN.amber, fontSize: 14 }}>
          ⚠️ Attendance has already been submitted for today. You can re-mark to update.
        </div>
      )}

      {step === "mark" && (
        <div style={gs.card}>
          <div style={{ ...gs.row, justifyContent: "space-between", marginBottom: 20 }}>
            <div style={gs.row}>
              <button style={{ ...gs.btn(TOKEN.green), padding: "6px 14px" }} onClick={() => markAll("present")}>All Present</button>
              <button style={{ ...gs.btn(TOKEN.red), padding: "6px 14px" }} onClick={() => markAll("absent")}>All Absent</button>
            </div>
            <span style={{ color: TOKEN.muted, fontSize: 13 }}>{Object.values(statusMap).filter(v => v).length}/{students.length} marked</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {students.map(s => {
              const st = statusMap[s.id];
              return (
                <div key={s.id} onClick={() => toggle(s.id)} style={{
                  ...gs.row, justifyContent: "space-between", padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                  background: st === "present" ? TOKEN.green + "15" : st === "absent" ? TOKEN.red + "15" : TOKEN.surface,
                  border: `1px solid ${st === "present" ? TOKEN.green + "40" : st === "absent" ? TOKEN.red + "40" : TOKEN.border}`,
                  transition: "all .15s",
                }}>
                  <div style={gs.row}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: st === "present" ? TOKEN.green : st === "absent" ? TOKEN.red : TOKEN.border, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: st ? "#fff" : TOKEN.muted, flexShrink: 0 }}>
                      {s.roll}
                    </div>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                  </div>
                  <div style={{ ...gs.row, gap: 6 }}>
                    <span style={{ fontSize: 18 }}>{st === "present" ? "✅" : st === "absent" ? "❌" : "⬜"}</span>
                    {st && <Badge text={st} color={st === "present" ? TOKEN.green : TOKEN.red} />}
                  </div>
                </div>
              );
            })}
          </div>

          {allMarked && (
            <button style={{ ...gs.btn(TOKEN.green), width: "100%", marginTop: 20, padding: "14px", fontSize: 16 }} onClick={submitAttendance}>
              Submit & Take Classroom Photo →
            </button>
          )}
        </div>
      )}

      {step === "camera" && (
        <div style={{ ...gs.card, textAlign: "center" }}>
          <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>📸 Classroom Photo Required</p>
          <p style={{ color: TOKEN.muted, fontSize: 13, marginBottom: 20 }}>Take a live photo of the classroom as proof of attendance. Gallery upload is disabled.</p>

          {camErr ? (
            <div style={{ background: TOKEN.amber + "20", border: `1px solid ${TOKEN.amber}40`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
              <p style={{ color: TOKEN.amber, margin: 0, fontSize: 13 }}>{camErr}</p>
              <p style={{ color: TOKEN.muted, margin: "8px 0 0", fontSize: 12 }}>In a production deployment on a mobile device, the camera opens automatically here.</p>
            </div>
          ) : (
            <div style={{ position: "relative", marginBottom: 20 }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", borderRadius: 12, background: "#000", maxHeight: 320, objectFit: "cover" }} />
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />
          <button style={{ ...gs.btn(TOKEN.green), padding: "14px 32px", fontSize: 16 }} onClick={takePhoto}>
            📷 Capture Photo
          </button>
        </div>
      )}

      {step === "done" && (
        <div style={{ ...gs.card, textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <p style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Attendance Submitted!</p>
          <p style={{ color: TOKEN.muted, marginBottom: 24 }}>
            {students.filter(s => statusMap[s.id] === "present").length} Present ·{" "}
            {students.filter(s => statusMap[s.id] === "absent").length} Absent · Photo saved with timestamp
          </p>
          <div style={{ background: TOKEN.green + "20", border: `1px solid ${TOKEN.green}40`, borderRadius: 10, padding: 14, marginBottom: 24, fontSize: 13, color: TOKEN.green }}>
            📸 Classroom photo linked to today's attendance record
          </div>
          <button style={gs.btnGhost} onClick={reset}>Mark Again (Override)</button>
        </div>
      )}
    </div>
  );
}

// ─── My Class (Teacher) ───────────────────────────────────────────────────────
function MyClass({ db, user }) {
  const classInfo = db.classes.find(c => c.id === user.classId);
  const students = db.students.filter(s => s.classId === user.classId);
  const todayAtt = db.attendance.filter(a => a.classId === user.classId && a.date === "2026-03-04");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ margin: 0, fontWeight: 800 }}>My Class — {classInfo?.name}</h2>
      <div style={gs.grid3}>
        <Stat label="Total Students" value={students.length} />
        <Stat label="Present Today" value={todayAtt.filter(a => a.status === "present").length} color={TOKEN.green} />
        <Stat label="Absent Today" value={todayAtt.filter(a => a.status === "absent").length} color={TOKEN.red} />
      </div>
      <div style={gs.card}>
        <Table
          cols={["Roll", "Name", "Today's Status"]}
          rows={students}
          renderRow={s => {
            const att = todayAtt.find(a => a.studentId === s.id);
            return (<>
              <Td><strong>{s.roll}</strong></Td>
              <Td>{s.name}</Td>
              <Td>{att ? <Badge text={att.status} color={att.status === "present" ? TOKEN.green : TOKEN.red} /> : <Badge text="Not Marked" color={TOKEN.muted} />}</Td>
            </>);
          }}
        />
      </div>
    </div>
  );
}

// ─── Super Admin Dashboard ────────────────────────────────────────────────────
function SuperDashboard({ db }) {
  const totalStudents = db.schools.reduce((a, s) => a + s.students, 0);
  const totalMsgs = db.messages.length;
  const totalCredits = db.schools.reduce((a, s) => a + s.credits, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Platform Overview</h2>
      <div style={gs.grid4}>
        <Stat label="Total Schools" value={db.schools.length} color={TOKEN.accent} />
        <Stat label="Total Students" value={totalStudents} color={TOKEN.purple} />
        <Stat label="Messages Sent" value={totalMsgs} color={TOKEN.green} />
        <Stat label="Platform Credits" value={totalCredits} color={TOKEN.amber} />
      </div>
      <div style={gs.grid2}>
        <div style={gs.card}>
          <p style={{ fontWeight: 700, margin: "0 0 16px" }}>School Credit Status</p>
          {db.schools.map(s => (
            <div key={s.id} style={{ marginBottom: 14 }}>
              <div style={{ ...gs.row, justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{s.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: s.credits < 100 ? TOKEN.red : TOKEN.green }}>{s.credits} credits</span>
              </div>
              <ProgressBar value={Math.min((s.credits / 500) * 100, 100)} color={s.credits < 100 ? TOKEN.red : TOKEN.green} />
            </div>
          ))}
        </div>
        <div style={gs.card}>
          <p style={{ fontWeight: 700, margin: "0 0 16px" }}>Schools</p>
          {db.schools.map(s => (
            <div key={s.id} style={{ ...gs.row, justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${TOKEN.border}` }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{s.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: TOKEN.muted }}>{s.city} · {s.students} students</p>
              </div>
              <Badge text={s.active ? "Active" : "Inactive"} color={s.active ? TOKEN.green : TOKEN.red} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── School Admin Dashboard ───────────────────────────────────────────────────
function SchoolDashboard({ db, schoolId }) {
  const school = db.schools.find(s => s.id === schoolId);
  const students = db.students.filter(s => s.schoolId === schoolId);
  const classes = db.classes.filter(c => c.schoolId === schoolId);
  const todayAtt = db.attendance.filter(a => a.schoolId === schoolId && a.date === "2026-03-04");
  const present = todayAtt.filter(a => a.status === "present").length;
  const absent = todayAtt.filter(a => a.status === "absent").length;

  const absentStudents = todayAtt.filter(a => a.status === "absent").map(a => ({
    ...db.students.find(s => s.id === a.studentId),
    cls: classes.find(c => c.id === a.classId)?.name,
  })).filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ ...gs.row, justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>{school?.name}</h2>
          <p style={{ margin: 0, color: TOKEN.muted, fontSize: 14 }}>Today — {fmt(today())}</p>
        </div>
        <Badge text={`${school?.credits} Credits`} color={TOKEN.amber} />
      </div>

      <div style={gs.grid4}>
        <Stat label="Total Students" value={students.length} color={TOKEN.accent} />
        <Stat label="Present Today" value={present} color={TOKEN.green} />
        <Stat label="Absent Today" value={absent} color={TOKEN.red} />
        <Stat label="Attendance %" value={`${pct(present, present + absent)}%`} color={TOKEN.purple} />
      </div>

      <div style={gs.grid2}>
        <div style={gs.card}>
          <p style={{ fontWeight: 700, margin: "0 0 16px" }}>Class-wise Summary</p>
          {classes.map(cls => {
            const clsAtt = todayAtt.filter(a => a.classId === cls.id);
            const cp = clsAtt.filter(a => a.status === "present").length;
            const ct = db.students.filter(s => s.classId === cls.id).length;
            return (
              <div key={cls.id} style={{ marginBottom: 14 }}>
                <div style={{ ...gs.row, justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{cls.name}</span>
                  <span style={{ fontSize: 12, color: TOKEN.muted }}>{cp}/{ct}</span>
                </div>
                <ProgressBar value={pct(cp, ct)} color={pct(cp, ct) >= 75 ? TOKEN.green : TOKEN.amber} />
              </div>
            );
          })}
        </div>
        <div style={gs.card}>
          <p style={{ fontWeight: 700, margin: "0 0 16px" }}>Absent Students — Today</p>
          {absentStudents.length === 0 ? (
            <p style={{ color: TOKEN.muted, fontSize: 14 }}>No absences recorded today.</p>
          ) : absentStudents.map((s, i) => (
            <div key={i} style={{ ...gs.row, justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${TOKEN.border}` }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{s.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: TOKEN.muted }}>{s.cls} · Roll {s.roll}</p>
              </div>
              <span style={{ fontSize: 18 }}>❌</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Teacher Dashboard ────────────────────────────────────────────────────────
function TeacherDashboard({ db, user }) {
  const classInfo = db.classes.find(c => c.id === user.classId);
  const students = db.students.filter(s => s.classId === user.classId);
  const todayAtt = db.attendance.filter(a => a.classId === user.classId && a.date === "2026-03-04");
  const present = todayAtt.filter(a => a.status === "present").length;
  const isMarked = todayAtt.length > 0;
  const isHoliday = db.holidays.some(h => h.date === today());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Good morning, {user.name.split(" ")[1] || user.name}! 👋</h2>
      <div style={gs.grid3}>
        <Stat label="My Class" value={classInfo?.name || "—"} color={TOKEN.accent} />
        <Stat label="Total Students" value={students.length} />
        <Stat label="Today's Status" value={isHoliday ? "Holiday" : isMarked ? "Submitted" : "Pending"} color={isHoliday ? TOKEN.amber : isMarked ? TOKEN.green : TOKEN.red} />
      </div>
      {!isHoliday && !isMarked && (
        <div style={{ background: TOKEN.amber + "20", border: `1px solid ${TOKEN.amber}40`, borderRadius: 10, padding: 16, color: TOKEN.amber, fontWeight: 600 }}>
          ⏰ Attendance for today hasn't been marked yet. Please mark it as soon as possible.
        </div>
      )}
      {isMarked && (
        <div style={{ ...gs.card, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, background: TOKEN.green + "20", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✅</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>Today's attendance submitted</p>
            <p style={{ margin: 0, fontSize: 13, color: TOKEN.muted }}>{present} present · {students.length - present} absent · Photo proof saved</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function AnalyticsPage({ db }) {
  const totalAtt = db.attendance.length;
  const totalPresent = db.attendance.filter(a => a.status === "present").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ margin: 0, fontWeight: 800 }}>Platform Analytics</h2>
      <div style={gs.grid4}>
        <Stat label="Total Records" value={totalAtt} />
        <Stat label="Overall Attendance" value={`${pct(totalPresent, totalAtt)}%`} color={TOKEN.green} />
        <Stat label="Schools Active" value={db.schools.filter(s => s.active).length} color={TOKEN.accent} />
        <Stat label="Total Messages" value={db.messages.length} color={TOKEN.purple} />
      </div>
      <div style={gs.card}>
        <p style={{ fontWeight: 700, margin: "0 0 20px" }}>Attendance by School</p>
        {db.schools.map(s => {
          const sAtt = db.attendance.filter(a => a.schoolId === s.id);
          const sPresent = sAtt.filter(a => a.status === "present").length;
          const p = pct(sPresent, sAtt.length);
          return (
            <div key={s.id} style={{ marginBottom: 18 }}>
              <div style={{ ...gs.row, justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  <span style={{ color: TOKEN.muted, fontSize: 12, marginLeft: 10 }}>{s.city}</span>
                </div>
                <span style={{ fontWeight: 700, color: p >= 75 ? TOKEN.green : TOKEN.amber }}>{p || "—"}%</span>
              </div>
              {sAtt.length > 0 && <ProgressBar value={p} color={p >= 75 ? TOKEN.green : TOKEN.amber} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Attendance Report (Admin view) ──────────────────────────────────────────
function AttendancePage({ db, schoolId }) {
  const [date, setDate] = useState("2026-03-04");
  const [selClass, setSelClass] = useState("all");
  const classes = db.classes.filter(c => c.schoolId === schoolId);
  const att = db.attendance.filter(a => a.schoolId === schoolId && a.date === date && (selClass === "all" || a.classId === selClass));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ margin: 0, fontWeight: 800 }}>Attendance Records</h2>
      <div style={{ ...gs.row, flexWrap: "wrap" }}>
        <input style={{ ...gs.input, width: 180 }} type="date" value={date} onChange={e => setDate(e.target.value)} />
        <select style={{ ...gs.input, width: 180 }} value={selClass} onChange={e => setSelClass(e.target.value)}>
          <option value="all">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={gs.row}>
          <Badge text={`${att.filter(a => a.status === "present").length} Present`} color={TOKEN.green} />
          <Badge text={`${att.filter(a => a.status === "absent").length} Absent`} color={TOKEN.red} />
        </div>
      </div>
      <div style={gs.card}>
        <Table
          cols={["Student", "Class", "Status", "Photo Proof", "Time"]}
          rows={att}
          renderRow={a => {
            const s = db.students.find(x => x.id === a.studentId);
            const cls = db.classes.find(x => x.id === a.classId);
            return (<>
              <Td><strong>{s?.name || a.studentId}</strong></Td>
              <Td>{cls?.name}</Td>
              <Td><Badge text={a.status} color={a.status === "present" ? TOKEN.green : TOKEN.red} /></Td>
              <Td>{a.photo ? <Badge text="✓ Saved" color={TOKEN.green} /> : <Badge text="Missing" color={TOKEN.red} />}</Td>
              <Td style={{ color: TOKEN.muted }}>{a.timestamp ? new Date(a.timestamp).toLocaleTimeString("en-IN") : "09:00 AM"}</Td>
            </>);
          }}
        />
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [db, setDb] = useState(SEED);

  const handleLogin = (u) => { setUser(u); setTab("dashboard"); };
  const handleLogout = () => { setUser(null); setTab("dashboard"); };

  if (!user) return <LoginScreen onLogin={handleLogin} db={db} />;

  const renderContent = () => {
    if (user.role === "superadmin") {
      if (tab === "dashboard") return <SuperDashboard db={db} />;
      if (tab === "schools") return <SchoolsPage db={db} setDb={setDb} />;
      if (tab === "credits") return <CreditsPage db={db} setDb={setDb} />;
      if (tab === "analytics") return <AnalyticsPage db={db} />;
    }
    if (user.role === "schooladmin") {
      if (tab === "dashboard") return <SchoolDashboard db={db} schoolId={user.schoolId} />;
      if (tab === "attendance") return <AttendancePage db={db} schoolId={user.schoolId} />;
      if (tab === "teachers") return <TeachersPage db={db} setDb={setDb} schoolId={user.schoolId} />;
      if (tab === "students") return <StudentsPage db={db} setDb={setDb} schoolId={user.schoolId} />;
      if (tab === "holidays") return <HolidaysPage db={db} setDb={setDb} schoolId={user.schoolId} />;
      if (tab === "messages") return <MessagesPage db={db} setDb={setDb} schoolId={user.schoolId} />;
      if (tab === "reports") return <ReportsPage db={db} schoolId={user.schoolId} />;
    }
    if (user.role === "teacher") {
      if (tab === "dashboard") return <TeacherDashboard db={db} user={user} />;
      if (tab === "markattendance") return <MarkAttendance db={db} setDb={setDb} user={user} />;
      if (tab === "myclass") return <MyClass db={db} user={user} />;
    }
    return <div style={{ padding: 40, color: TOKEN.muted }}>Page not found</div>;
  };

  return (
    <div style={gs.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800&family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar user={user} activeTab={tab} setTab={setTab} onLogout={handleLogout} />
        <div style={{ flex: 1, padding: 32, overflowY: "auto", overflowX: "hidden" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
