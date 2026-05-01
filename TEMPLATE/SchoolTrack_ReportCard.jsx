import { useState, useRef } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#0A0E1A", surface: "#111827", card: "#161D2E", border: "#1E2D45",
  accent: "#3B82F6", accentGlow: "#3B82F640", green: "#10B981", red: "#EF4444",
  amber: "#F59E0B", purple: "#8B5CF6", teal: "#14B8A6",
  text: "#F1F5F9", muted: "#64748B", light: "#94A3B8",
};

// ─── Grading System ───────────────────────────────────────────────────────────
const getGrade = (pct) => {
  if (pct >= 90) return { grade: "A+", gp: 10, color: "#10B981" };
  if (pct >= 80) return { grade: "A",  gp: 9,  color: "#10B981" };
  if (pct >= 70) return { grade: "B+", gp: 8,  color: "#3B82F6" };
  if (pct >= 60) return { grade: "B",  gp: 7,  color: "#3B82F6" };
  if (pct >= 50) return { grade: "C+", gp: 6,  color: "#F59E0B" };
  if (pct >= 40) return { grade: "C",  gp: 5,  color: "#F59E0B" };
  if (pct >= 33) return { grade: "D",  gp: 4,  color: "#F97316" };
  return              { grade: "F",  gp: 0,  color: "#EF4444" };
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SCHOOL = {
  name: "Greenwood Academy",
  address: "123 School Road, Andheri West, Mumbai - 400053",
  phone: "+91 22 1234 5678",
  email: "info@greenwood.edu",
  affiliation: "CBSE Affiliation No. 1234567",
  session: "2025–2026",
};

const SUBJECTS = [
  { id: "SUB001", name: "English", hasTheory: true, hasPractical: false, theoryMax: 80, practicalMax: 0, passingMarks: 27 },
  { id: "SUB002", name: "Mathematics", hasTheory: true, hasPractical: false, theoryMax: 80, practicalMax: 0, passingMarks: 27 },
  { id: "SUB003", name: "Science", hasTheory: true, hasPractical: true, theoryMax: 60, practicalMax: 20, passingMarks: 23 },
  { id: "SUB004", name: "Social Science", hasTheory: true, hasPractical: false, theoryMax: 80, practicalMax: 0, passingMarks: 27 },
  { id: "SUB005", name: "Hindi", hasTheory: true, hasPractical: false, theoryMax: 80, practicalMax: 0, passingMarks: 27 },
  { id: "SUB006", name: "Computer Science", hasTheory: true, hasPractical: true, theoryMax: 50, practicalMax: 30, passingMarks: 20 },
];

const EXAMS = [
  { id: "EX001", name: "Unit Test 1", classId: "CLS001", maxMarks: 100, session: "2025-26", status: "closed", date: "July 2025" },
  { id: "EX002", name: "Half Yearly", classId: "CLS001", maxMarks: 100, session: "2025-26", status: "open", date: "September 2025" },
  { id: "EX003", name: "Unit Test 2", classId: "CLS001", maxMarks: 100, session: "2025-26", status: "upcoming", date: "November 2025" },
  { id: "EX004", name: "Final Examination", classId: "CLS001", maxMarks: 100, session: "2025-26", status: "upcoming", date: "March 2026" },
];

const STUDENTS = [
  { id: "S001", name: "Aarav Patel",  roll: "01", class: "Grade 5A", dob: "12 Jan 2015", gender: "Male",   fatherName: "Rajesh Patel",  motherName: "Priya Patel",  phone: "+919800001111", attendance: 92 },
  { id: "S002", name: "Diya Singh",   roll: "02", class: "Grade 5A", dob: "03 Mar 2015", gender: "Female", fatherName: "Amit Singh",    motherName: "Sunita Singh", phone: "+919800001112", attendance: 88 },
  { id: "S003", name: "Kabir Sharma", roll: "03", class: "Grade 5A", dob: "22 Jun 2015", gender: "Male",   fatherName: "Vikram Sharma", motherName: "Neha Sharma",  phone: "+919800001113", attendance: 95 },
  { id: "S004", name: "Meera Joshi",  roll: "04", class: "Grade 5A", dob: "15 Aug 2015", gender: "Female", fatherName: "Suresh Joshi",  motherName: "Kavita Joshi", phone: "+919800001114", attendance: 79 },
];

// seed marks for EX001
const SEED_MARKS = {
  "EX001-S001": { SUB001: { theory: 72, practical: 0 }, SUB002: { theory: 78, practical: 0 }, SUB003: { theory: 54, practical: 18 }, SUB004: { theory: 68, practical: 0 }, SUB005: { theory: 65, practical: 0 }, SUB006: { theory: 44, practical: 27 } },
  "EX001-S002": { SUB001: { theory: 58, practical: 0 }, SUB002: { theory: 62, practical: 0 }, SUB003: { theory: 48, practical: 15 }, SUB004: { theory: 55, practical: 0 }, SUB005: { theory: 70, practical: 0 }, SUB006: { theory: 38, practical: 22 } },
  "EX001-S003": { SUB001: { theory: 76, practical: 0 }, SUB002: { theory: 80, practical: 0 }, SUB003: { theory: 58, practical: 20 }, SUB004: { theory: 74, practical: 0 }, SUB005: { theory: 72, practical: 0 }, SUB006: { theory: 48, practical: 29 } },
  "EX001-S004": { SUB001: { theory: 45, practical: 0 }, SUB002: { theory: 38, practical: 0 }, SUB003: { theory: 35, practical: 12 }, SUB004: { theory: 42, practical: 0 }, SUB005: { theory: 50, practical: 0 }, SUB006: { theory: 30, practical: 18 } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const gs = {
  card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 },
  btn:  (c = T.accent) => ({ background: c, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14 }),
  ghost: { background: "transparent", color: T.light, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  input: { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 14, width: "100%", boxSizing: "border-box", outline: "none" },
  row:  { display: "flex", alignItems: "center", gap: 12 },
  col:  { display: "flex", flexDirection: "column", gap: 10 },
  badge: (c) => ({ background: c + "20", color: c, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }),
};

const Badge = ({ text, color }) => <span style={gs.badge(color)}>{text}</span>;
const Divider = () => <div style={{ borderTop: `1px solid ${T.border}`, margin: "4px 0" }} />;

const calcStudentStats = (examId, studentId) => {
  const key = `${examId}-${studentId}`;
  const marks = SEED_MARKS[key];
  if (!marks) return null;
  let totalObtained = 0, totalMax = 0;
  const subjectRows = SUBJECTS.map(sub => {
    const m = marks[sub.id] || { theory: 0, practical: 0 };
    const obtained = m.theory + m.practical;
    const max = sub.theoryMax + sub.practicalMax;
    totalObtained += obtained;
    totalMax += max;
    const pct = Math.round((obtained / max) * 100);
    const { grade, gp, color } = getGrade(pct);
    const passed = obtained >= sub.passingMarks;
    return { sub, theory: m.theory, practical: m.practical, obtained, max, pct, grade, gp, color, passed };
  });
  const overallPct = Math.round((totalObtained / totalMax) * 100);
  const { grade: overallGrade, gp: overallGP } = getGrade(overallPct);
  const cgpa = (subjectRows.reduce((a, r) => a + r.gp, 0) / subjectRows.length).toFixed(1);
  const passed = subjectRows.every(r => r.passed);
  return { subjectRows, totalObtained, totalMax, overallPct, overallGrade, cgpa, passed };
};

// ─── REPORT CARD PRINT VIEW ───────────────────────────────────────────────────
function ReportCardView({ student, exam, stats, onClose, onShare }) {
  const printRef = useRef();

  const handlePrint = () => {
    const style = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Serif+4:wght@400;600&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Source Serif 4', serif; color: #1a1a2e; background: white; }
      @page { size: A4; margin: 12mm; }
    `;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><style>${style}</style></head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  if (!stats) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", overflowY: "auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Serif+4:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Controls */}
      <div style={{ width: "100%", maxWidth: 794, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button onClick={onClose} style={gs.ghost}>← Back</button>
        <div style={gs.row}>
          <button onClick={() => onShare(student)} style={{ ...gs.btn(T.green), display: "flex", alignItems: "center", gap: 8 }}>
            <span>💬</span> Share via WhatsApp
          </button>
          <button onClick={handlePrint} style={{ ...gs.btn(T.accent), display: "flex", alignItems: "center", gap: 8 }}>
            <span>⬇</span> Download PDF
          </button>
        </div>
      </div>

      {/* A4 Report Card */}
      <div ref={printRef} style={{
        width: 794, background: "#fff", color: "#1a1a2e",
        fontFamily: "'Source Serif 4', serif",
        boxShadow: "0 25px 80px #0008", borderRadius: 4,
        overflow: "hidden",
      }}>
        {/* Header Strip */}
        <div style={{ background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)", padding: "28px 40px", display: "flex", alignItems: "center", gap: 24 }}>
          {/* Logo placeholder */}
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0, boxShadow: "0 4px 20px #0004" }}>🏫</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif", letterSpacing: 0.5 }}>{SCHOOL.name}</div>
            <div style={{ color: "#90CAF9", fontSize: 13, marginTop: 4 }}>{SCHOOL.address}</div>
            <div style={{ color: "#90CAF9", fontSize: 12, marginTop: 2 }}>{SCHOOL.phone} · {SCHOOL.email}</div>
            <div style={{ color: "#BBDEFB", fontSize: 11, marginTop: 2 }}>{SCHOOL.affiliation}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ background: "#ffffff20", borderRadius: 8, padding: "8px 16px", display: "inline-block" }}>
              <div style={{ color: "#90CAF9", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Academic Session</div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{SCHOOL.session}</div>
            </div>
          </div>
        </div>

        {/* Report Title Bar */}
        <div style={{ background: "#E3F2FD", borderBottom: "3px solid #1565c0", padding: "10px 40px", textAlign: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1565c0", letterSpacing: 2, textTransform: "uppercase" }}>
            Progress Report Card — {exam.name}
          </span>
        </div>

        <div style={{ padding: "24px 40px" }}>
          {/* Student Info Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, border: "1.5px solid #1565c0", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
            {[
              ["Student Name", student.name],
              ["Class & Section", student.class],
              ["Roll Number", student.roll],
              ["Date of Birth", student.dob],
              ["Gender", student.gender],
              ["Examination", exam.name],
              ["Father's Name", student.fatherName],
              ["Mother's Name", student.motherName],
              ["Date of Exam", exam.date],
            ].map(([label, value], i) => (
              <div key={i} style={{ padding: "8px 14px", borderRight: i % 3 !== 2 ? "1px solid #BBDEFB" : "none", borderBottom: i < 6 ? "1px solid #BBDEFB" : "none", background: i % 2 === 0 ? "#F8FFFE" : "#fff" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#1565c0", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Marks Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 20 }}>
            <thead>
              <tr style={{ background: "#1565c0" }}>
                {["Subject", "Theory Max", "Theory Obtained", "Practical Max", "Practical Obtained", "Total", "Max", "%", "Grade", "GP", "Status"].map(h => (
                  <th key={h} style={{ padding: "9px 8px", color: "#fff", fontWeight: 700, fontSize: 11, textAlign: "center", letterSpacing: 0.3 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.subjectRows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#F8FAFE" : "#fff", borderBottom: "1px solid #E3F2FD" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1a1a2e" }}>{row.sub.name}</td>
                  <td style={{ padding: "8px", textAlign: "center", color: "#555" }}>{row.sub.theoryMax}</td>
                  <td style={{ padding: "8px", textAlign: "center", fontWeight: 700, color: row.theory >= row.sub.passingMarks * (row.sub.theoryMax / (row.sub.theoryMax + row.sub.practicalMax)) ? "#1565c0" : "#c62828" }}>{row.theory}</td>
                  <td style={{ padding: "8px", textAlign: "center", color: "#555" }}>{row.sub.practicalMax || "—"}</td>
                  <td style={{ padding: "8px", textAlign: "center", fontWeight: row.sub.hasPractical ? 700 : 400, color: row.sub.hasPractical ? "#1565c0" : "#aaa" }}>{row.sub.hasPractical ? row.practical : "—"}</td>
                  <td style={{ padding: "8px", textAlign: "center", fontWeight: 800, color: "#1a1a2e", fontSize: 14 }}>{row.obtained}</td>
                  <td style={{ padding: "8px", textAlign: "center", color: "#555" }}>{row.max}</td>
                  <td style={{ padding: "8px", textAlign: "center", color: "#555" }}>{row.pct}%</td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    <span style={{ background: row.color + "20", color: row.color, borderRadius: 4, padding: "2px 8px", fontWeight: 800, fontSize: 13 }}>{row.grade}</span>
                  </td>
                  <td style={{ padding: "8px", textAlign: "center", fontWeight: 700, color: "#555" }}>{row.gp}</td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    <span style={{ color: row.passed ? "#2e7d32" : "#c62828", fontWeight: 700, fontSize: 11 }}>{row.passed ? "PASS" : "FAIL"}</span>
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr style={{ background: "#1565c0", color: "#fff" }}>
                <td style={{ padding: "10px", fontWeight: 800, fontSize: 14 }} colSpan={5}>GRAND TOTAL</td>
                <td style={{ padding: "10px", textAlign: "center", fontWeight: 800, fontSize: 16 }}>{stats.totalObtained}</td>
                <td style={{ padding: "10px", textAlign: "center", fontWeight: 700 }}>{stats.totalMax}</td>
                <td style={{ padding: "10px", textAlign: "center", fontWeight: 800 }}>{stats.overallPct}%</td>
                <td style={{ padding: "10px", textAlign: "center", fontWeight: 800, fontSize: 15 }}>{stats.overallGrade}</td>
                <td style={{ padding: "10px", textAlign: "center", fontWeight: 800 }}>{stats.cgpa}</td>
                <td style={{ padding: "10px", textAlign: "center", fontWeight: 800, fontSize: 13 }}>{stats.passed ? "PASS ✓" : "FAIL ✗"}</td>
              </tr>
            </tbody>
          </table>

          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total Marks", value: `${stats.totalObtained}/${stats.totalMax}`, color: "#1565c0" },
              { label: "Percentage", value: `${stats.overallPct}%`, color: stats.overallPct >= 60 ? "#2e7d32" : stats.overallPct >= 33 ? "#e65100" : "#c62828" },
              { label: "CGPA", value: stats.cgpa, color: "#6a1b9a" },
              { label: "Attendance", value: `${student.attendance}%`, color: student.attendance >= 75 ? "#2e7d32" : "#c62828" },
            ].map((item, i) => (
              <div key={i} style={{ border: `2px solid ${item.color}20`, borderRadius: 10, padding: "12px 16px", textAlign: "center", background: item.color + "08" }}>
                <div style={{ fontSize: 11, color: "#666", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: item.color, fontFamily: "'Playfair Display', serif" }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Grade Scale */}
          <div style={{ background: "#F8FAFE", border: "1px solid #BBDEFB", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1565c0", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Grading Scale</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[["A+ (90-100)", "10 GP"], ["A (80-89)", "9 GP"], ["B+ (70-79)", "8 GP"], ["B (60-69)", "7 GP"], ["C+ (50-59)", "6 GP"], ["C (40-49)", "5 GP"], ["D (33-39)", "4 GP"], ["F (<33)", "0 GP"]].map(([g, gp]) => (
                <span key={g} style={{ fontSize: 11, color: "#444" }}><strong>{g}</strong> = {gp}</span>
              ))}
            </div>
          </div>

          {/* Remarks & Signatures */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
            <div style={{ border: "1px solid #BBDEFB", borderRadius: 8, padding: "14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#1565c0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Teacher's Remarks</div>
              <div style={{ minHeight: 48, fontSize: 13, color: "#333", fontStyle: "italic" }}>
                {stats.overallPct >= 75 ? "Excellent performance. Keep up the great work!" :
                 stats.overallPct >= 50 ? "Good effort. Focus on weaker subjects for improvement." :
                 "Needs improvement. Regular practice and attention recommended."}
              </div>
            </div>
            <div style={{ border: "1px solid #BBDEFB", borderRadius: 8, padding: "14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#1565c0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Result</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: stats.passed ? "#2e7d32" : "#c62828", fontFamily: "'Playfair Display', serif" }}>
                {stats.passed ? "PROMOTED" : "DETAINED"}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Overall Grade: {stats.overallGrade} · CGPA: {stats.cgpa}</div>
            </div>
          </div>

          {/* Signature Line */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, borderTop: "1px solid #BBDEFB", paddingTop: 16 }}>
            {["Class Teacher", "Examination Controller", "Principal"].map(role => (
              <div key={role} style={{ textAlign: "center" }}>
                <div style={{ borderBottom: "1.5px solid #1a1a2e", margin: "0 20px 6px", height: 36 }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1565c0" }}>{role}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid #E3F2FD" }}>
            <div style={{ fontSize: 10, color: "#aaa" }}>This is a computer-generated report card. · {SCHOOL.name} · {SCHOOL.session}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MARKS ENTRY (Teacher Panel) ─────────────────────────────────────────────
function MarksEntry({ exam, onBack }) {
  const [selStudent, setSelStudent] = useState(STUDENTS[0].id);
  const [marks, setMarks] = useState(() => {
    const key = `${exam.id}-${selStudent}`;
    return SEED_MARKS[key] ? JSON.parse(JSON.stringify(SEED_MARKS[key])) :
      Object.fromEntries(SUBJECTS.map(s => [s.id, { theory: "", practical: "" }]));
  });
  const [saved, setSaved] = useState(false);

  const switchStudent = (id) => {
    setSelStudent(id);
    const key = `${exam.id}-${id}`;
    setMarks(SEED_MARKS[key] ? JSON.parse(JSON.stringify(SEED_MARKS[key])) :
      Object.fromEntries(SUBJECTS.map(s => [s.id, { theory: "", practical: "" }])));
    setSaved(false);
  };

  const updateMark = (subId, type, val) => {
    const sub = SUBJECTS.find(s => s.id === subId);
    const max = type === "theory" ? sub.theoryMax : sub.practicalMax;
    const num = Math.min(+val, max);
    setMarks(m => ({ ...m, [subId]: { ...m[subId], [type]: num >= 0 ? num : "" } }));
    setSaved(false);
  };

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const student = STUDENTS.find(s => s.id === selStudent);
  const total = SUBJECTS.reduce((a, s) => a + (+marks[s.id]?.theory || 0) + (+marks[s.id]?.practical || 0), 0);
  const maxTotal = SUBJECTS.reduce((a, s) => a + s.theoryMax + s.practicalMax, 0);
  const pctNow = Math.round((total / maxTotal) * 100);
  const { grade } = getGrade(pctNow);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <div style={gs.row}>
          <button onClick={onBack} style={gs.ghost}>← Back</button>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>Enter Marks — {exam.name}</h2>
            <p style={{ margin: 0, color: T.muted, fontSize: 13 }}>Date: {exam.date}</p>
          </div>
        </div>
        <button onClick={save} style={gs.btn(saved ? T.green : T.accent)}>
          {saved ? "✓ Saved!" : "Save Marks"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        {/* Student List */}
        <div style={gs.card}>
          <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>Students</p>
          <div style={gs.col}>
            {STUDENTS.map(s => {
              const k = `${exam.id}-${s.id}`;
              const hasMarks = !!SEED_MARKS[k];
              return (
                <button key={s.id} onClick={() => switchStudent(s.id)} style={{
                  background: selStudent === s.id ? T.accentGlow : "transparent",
                  border: `1px solid ${selStudent === s.id ? T.accent : T.border}`,
                  borderRadius: 10, padding: "10px 12px", textAlign: "left", cursor: "pointer", color: T.text,
                }}>
                  <div style={gs.row}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: selStudent === s.id ? T.accent : T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {s.roll}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                      {hasMarks && <div style={{ fontSize: 11, color: T.green }}>✓ Marks entered</div>}
                      {!hasMarks && selStudent !== s.id && <div style={{ fontSize: 11, color: T.amber }}>Pending</div>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Marks Form */}
        <div style={gs.card}>
          <div style={{ ...gs.row, justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{student?.name}</p>
              <p style={{ margin: 0, color: T.muted, fontSize: 13 }}>Roll {student?.roll} · {student?.class}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: T.accent }}>{total}<span style={{ fontSize: 14, color: T.muted }}>/{maxTotal}</span></div>
              <div style={{ fontSize: 13, color: T.muted }}>{pctNow}% · Grade {grade}</div>
            </div>
          </div>

          {/* Column Headers */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1fr 1.2fr 1fr 80px", gap: 8, marginBottom: 8, padding: "0 4px" }}>
            {["Subject", "Theory Max", "Theory Marks", "Practical Max", "Practical Marks", "Total", "Grade"].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
            ))}
          </div>
          <Divider />

          <div style={gs.col}>
            {SUBJECTS.map((sub, i) => {
              const m = marks[sub.id] || { theory: "", practical: "" };
              const obtained = (+m.theory || 0) + (+m.practical || 0);
              const max = sub.theoryMax + sub.practicalMax;
              const pct = max ? Math.round((obtained / max) * 100) : 0;
              const { grade: g, color: gc } = getGrade(pct);
              return (
                <div key={sub.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1fr 1.2fr 1fr 80px", gap: 8, alignItems: "center", padding: "8px 4px", borderRadius: 8, background: i % 2 === 0 ? T.surface + "80" : "transparent" }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{sub.name}</span>
                  <span style={{ color: T.muted, fontSize: 13, textAlign: "center" }}>{sub.theoryMax}</span>
                  <input
                    style={{ ...gs.input, textAlign: "center", fontWeight: 700, fontSize: 15, padding: "8px" }}
                    type="number" min={0} max={sub.theoryMax}
                    value={m.theory}
                    onChange={e => updateMark(sub.id, "theory", e.target.value)}
                    placeholder="—"
                  />
                  <span style={{ color: T.muted, fontSize: 13, textAlign: "center" }}>{sub.hasPractical ? sub.practicalMax : "—"}</span>
                  {sub.hasPractical ? (
                    <input
                      style={{ ...gs.input, textAlign: "center", fontWeight: 700, fontSize: 15, padding: "8px" }}
                      type="number" min={0} max={sub.practicalMax}
                      value={m.practical}
                      onChange={e => updateMark(sub.id, "practical", e.target.value)}
                      placeholder="—"
                    />
                  ) : <span style={{ color: T.muted, textAlign: "center" }}>—</span>}
                  <span style={{ fontWeight: 800, fontSize: 16, textAlign: "center", color: T.text }}>{obtained || "—"}</span>
                  <span style={{ ...gs.badge(gc), textAlign: "center", fontSize: 14, fontWeight: 800 }}>{obtained ? g : "—"}</span>
                </div>
              );
            })}
          </div>

          <Divider />
          <div style={{ ...gs.row, justifyContent: "space-between", padding: "12px 4px 0" }}>
            <span style={{ fontWeight: 700, color: T.muted }}>Grand Total</span>
            <div style={gs.row}>
              <span style={{ fontWeight: 800, fontSize: 20 }}>{total}<span style={{ fontSize: 13, color: T.muted }}>/{maxTotal}</span></span>
              <Badge text={`${pctNow}%`} color={T.accent} />
              <Badge text={grade} color={getGrade(pctNow).color} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXAM SETUP (Principal Panel) ────────────────────────────────────────────
function ExamSetup({ onBack }) {
  const [exams, setExams] = useState(EXAMS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", maxMarks: 100 });

  const addExam = () => {
    if (!form.name) return;
    setExams(e => [...e, { id: `EX${Date.now()}`, classId: "CLS001", status: "upcoming", session: "2025-26", ...form }]);
    setForm({ name: "", date: "", maxMarks: 100 });
    setShowForm(false);
  };

  const cycleStatus = (id) => {
    const cycle = { upcoming: "open", open: "closed", closed: "upcoming" };
    setExams(e => e.map(x => x.id === id ? { ...x, status: cycle[x.status] } : x));
  };

  const statusColor = { open: T.green, closed: T.muted, upcoming: T.amber };
  const PRESETS = ["Unit Test 1", "Unit Test 2", "Half Yearly", "Pre-Final", "Final Examination", "Sessional"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...gs.row, justifyContent: "space-between" }}>
        <div style={gs.row}>
          <button onClick={onBack} style={gs.ghost}>← Back</button>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>Exam Setup</h2>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={gs.btn()}>+ New Exam</button>
      </div>

      {showForm && (
        <div style={{ ...gs.card, border: `1px solid ${T.accent}40` }}>
          <p style={{ margin: "0 0 14px", fontWeight: 700 }}>Create New Exam</p>
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: T.muted, fontWeight: 600 }}>Quick Presets</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PRESETS.map(p => (
                <button key={p} onClick={() => setForm(f => ({ ...f, name: p }))}
                  style={{ background: form.name === p ? T.accent : T.surface, color: form.name === p ? "#fff" : T.light, border: `1px solid ${form.name === p ? T.accent : T.border}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: T.muted }}>Exam Name *</p>
              <input style={gs.input} placeholder="e.g. Unit Test 1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: T.muted }}>Date / Month</p>
              <input style={gs.input} placeholder="e.g. July 2025" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: T.muted }}>Max Marks</p>
              <input style={gs.input} type="number" value={form.maxMarks} onChange={e => setForm(f => ({ ...f, maxMarks: e.target.value }))} />
            </div>
          </div>
          <div style={gs.row}>
            <button style={gs.btn()} onClick={addExam}>Create Exam</button>
            <button style={gs.ghost} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {exams.map(ex => (
          <div key={ex.id} style={{ ...gs.card, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ ...gs.row, justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{ex.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: T.muted, marginTop: 2 }}>Session {ex.session} · {ex.date}</p>
              </div>
              <Badge text={ex.status.toUpperCase()} color={statusColor[ex.status]} />
            </div>
            <div style={{ background: T.surface, borderRadius: 8, padding: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["Subjects", SUBJECTS.length], ["Max Marks", ex.maxMarks], ["Students", STUDENTS.length], ["Marks Entered", Object.keys(SEED_MARKS).filter(k => k.startsWith(ex.id)).length]].map(([l, v]) => (
                  <div key={l}>
                    <p style={{ margin: 0, fontSize: 11, color: T.muted }}>{l}</p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={gs.row}>
              <button onClick={() => cycleStatus(ex.id)} style={{ ...gs.btn(statusColor[ex.status]), flex: 1, fontSize: 12, padding: "8px" }}>
                {ex.status === "upcoming" ? "Open for Entry" : ex.status === "open" ? "Close Exam" : "Re-open"}
              </button>
              <button style={{ ...gs.ghost, fontSize: 12, padding: "8px 14px" }}>✏ Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SHARE MODAL ──────────────────────────────────────────────────────────────
function ShareModal({ students, onClose, onSend }) {
  const [selected, setSelected] = useState(students.map(s => s.id));
  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const [sent, setSent] = useState(false);

  const send = () => {
    setSent(true);
    setTimeout(() => { onSend(selected); onClose(); }, 1500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...gs.card, width: 480, maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ ...gs.row, justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>💬 Share via WhatsApp</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ background: T.surface, borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: T.light }}>
          <strong style={{ color: T.amber }}>Message Preview:</strong><br />
          "Dear [Parent Name], the report card for your child [Student Name] (Class [X], Roll [Y]) for [Exam Name] is ready. Overall: [X]% · Grade [Y]. Contact school for details."
        </div>

        <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: 13, color: T.muted }}>Select Students to Notify</p>
        <div style={{ ...gs.row, marginBottom: 12, gap: 8 }}>
          <button onClick={() => setSelected(students.map(s => s.id))} style={{ ...gs.btn(T.accent), padding: "6px 14px", fontSize: 12 }}>Select All</button>
          <button onClick={() => setSelected([])} style={{ ...gs.ghost, padding: "6px 14px", fontSize: 12 }}>Deselect All</button>
        </div>

        <div style={gs.col}>
          {students.map(s => (
            <div key={s.id} onClick={() => toggle(s.id)} style={{ ...gs.row, padding: "12px 14px", borderRadius: 10, cursor: "pointer", background: selected.includes(s.id) ? T.green + "15" : T.surface, border: `1px solid ${selected.includes(s.id) ? T.green + "40" : T.border}` }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${selected.includes(s.id) ? T.green : T.border}`, background: selected.includes(s.id) ? T.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {selected.includes(s.id) && <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{s.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: T.muted }}>Roll {s.roll} · {s.phone}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={send} style={{ ...gs.btn(sent ? T.green : T.green), padding: "13px", fontSize: 15, width: "100%" }}>
            {sent ? "✓ Sending..." : `Send to ${selected.length} Parent(s) · ${selected.length} Credit(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN REPORT CARD MODULE ──────────────────────────────────────────────────
export default function ReportCardModule() {
  const [view, setView] = useState("dashboard"); // dashboard | examSetup | marksEntry | reportView
  const [selExam, setSelExam] = useState(EXAMS[0]);
  const [selStudent, setSelStudent] = useState(null);
  const [shareModal, setShareModal] = useState(false);
  const [shareStudents, setShareStudents] = useState([]);
  const [role, setRole] = useState("principal"); // principal | teacher

  const openReport = (student) => { setSelStudent(student); setView("reportView"); };
  const openShare = (students) => { setShareStudents(students); setShareModal(true); };

  const stats = selStudent ? calcStudentStats(selExam.id, selStudent.id) : null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.text, padding: 32 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=Playfair+Display:wght@700&family=Source+Serif+4:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Role Toggle */}
      {view === "dashboard" && (
        <div style={{ ...gs.row, marginBottom: 24, justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: 26 }}>📋 Report Cards</h1>
            <p style={{ margin: 0, color: T.muted, fontSize: 14 }}>Academic Session {SCHOOL.session} · {SCHOOL.name}</p>
          </div>
          <div style={{ ...gs.row, background: T.surface, borderRadius: 10, padding: 4, border: `1px solid ${T.border}` }}>
            {[["principal", "🏫 Principal View"], ["teacher", "👩‍🏫 Teacher View"]].map(([r, l]) => (
              <button key={r} onClick={() => setRole(r)} style={{
                background: role === r ? T.accent : "transparent", color: role === r ? "#fff" : T.muted,
                border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: role === r ? 700 : 400, fontSize: 14,
              }}>{l}</button>
            ))}
          </div>
        </div>
      )}

      {/* Report View */}
      {view === "reportView" && selStudent && stats && (
        <ReportCardView
          student={selStudent} exam={selExam} stats={stats}
          onClose={() => setView("dashboard")}
          onShare={(s) => openShare([s])}
        />
      )}

      {/* Exam Setup */}
      {view === "examSetup" && <ExamSetup onBack={() => setView("dashboard")} />}

      {/* Marks Entry */}
      {view === "marksEntry" && <MarksEntry exam={selExam} onBack={() => setView("dashboard")} />}

      {/* Dashboard */}
      {view === "dashboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Principal Actions */}
          {role === "principal" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {[
                { icon: "⚙️", title: "Exam Setup", desc: "Create & manage exams", color: T.purple, action: () => setView("examSetup") },
                { icon: "📊", title: "Subject Config", desc: "Set subjects & max marks", color: T.teal, action: () => {} },
                { icon: "💬", title: "Bulk Share Reports", desc: "Send all reports via WhatsApp", color: T.green, action: () => openShare(STUDENTS) },
              ].map(item => (
                <button key={item.title} onClick={item.action} style={{ ...gs.card, border: `1px solid ${item.color}30`, cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 8, transition: "border-color .15s" }}>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{item.title}</p>
                  <p style={{ margin: 0, fontSize: 13, color: T.muted }}>{item.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Exam Selector */}
          <div style={gs.card}>
            <div style={{ ...gs.row, justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Select Examination</p>
              {role === "principal" && <button onClick={() => setView("examSetup")} style={{ ...gs.btn(T.purple), padding: "7px 14px", fontSize: 13 }}>+ Manage Exams</button>}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {EXAMS.map(ex => (
                <button key={ex.id} onClick={() => setSelExam(ex)} style={{
                  background: selExam.id === ex.id ? T.accent : T.surface,
                  color: selExam.id === ex.id ? "#fff" : T.light,
                  border: `1px solid ${selExam.id === ex.id ? T.accent : T.border}`,
                  borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: selExam.id === ex.id ? 700 : 400, fontSize: 14,
                  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3,
                }}>
                  <span>{ex.name}</span>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{ex.date}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Students Table */}
          <div style={gs.card}>
            <div style={{ ...gs.row, justifyContent: "space-between", marginBottom: 20 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>
                Students — {selExam.name}
                <Badge text={`${STUDENTS.length} students`} color={T.accent} />
              </p>
              <div style={gs.row}>
                {role === "teacher" && (
                  <button onClick={() => setView("marksEntry")} style={{ ...gs.btn(T.amber), fontSize: 13, padding: "8px 16px" }}>
                    ✏️ Enter Marks
                  </button>
                )}
                <button onClick={() => openShare(STUDENTS)} style={{ ...gs.btn(T.green), fontSize: 13, padding: "8px 16px" }}>
                  💬 Share All Reports
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {["Roll", "Student Name", "Total Marks", "Percentage", "Grade", "CGPA", "Attendance", "Result", "Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: T.muted, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STUDENTS.map((s, i) => {
                    const st = calcStudentStats(selExam.id, s.id);
                    return (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${T.border}15`, background: i % 2 === 0 ? T.surface + "40" : "transparent" }}>
                        <td style={{ padding: "12px" }}><strong>{s.roll}</strong></td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: T.muted }}>{s.class}</div>
                        </td>
                        <td style={{ padding: "12px" }}>{st ? <strong>{st.totalObtained}/{st.totalMax}</strong> : <span style={{ color: T.amber }}>Pending</span>}</td>
                        <td style={{ padding: "12px" }}>
                          {st ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 60, height: 5, background: T.border, borderRadius: 99, overflow: "hidden" }}>
                                <div style={{ width: `${st.overallPct}%`, background: st.overallPct >= 60 ? T.green : T.amber, height: "100%", borderRadius: 99 }} />
                              </div>
                              <span style={{ fontWeight: 700, color: st.overallPct >= 60 ? T.green : T.amber }}>{st.overallPct}%</span>
                            </div>
                          ) : "—"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {st ? <span style={{ ...gs.badge(getGrade(st.overallPct).color), fontWeight: 800, fontSize: 14 }}>{st.overallGrade}</span> : "—"}
                        </td>
                        <td style={{ padding: "12px", fontWeight: 700 }}>{st ? st.cgpa : "—"}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ color: s.attendance >= 75 ? T.green : T.red, fontWeight: 700 }}>{s.attendance}%</span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          {st ? <span style={{ color: st.passed ? T.green : T.red, fontWeight: 700, fontSize: 13 }}>{st.passed ? "PASS ✓" : "FAIL ✗"}</span> : "—"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div style={gs.row}>
                            {st && (
                              <>
                                <button onClick={() => openReport(s)} style={{ ...gs.btn(T.accent), padding: "6px 12px", fontSize: 12 }}>View</button>
                                <button onClick={() => openShare([s])} style={{ ...gs.btn(T.green), padding: "6px 12px", fontSize: 12 }}>💬</button>
                              </>
                            )}
                            {role === "teacher" && (
                              <button onClick={() => setView("marksEntry")} style={{ ...gs.btn(T.amber), padding: "6px 12px", fontSize: 12 }}>✏️</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grade Distribution */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={gs.card}>
              <p style={{ margin: "0 0 16px", fontWeight: 700 }}>Grade Distribution — {selExam.name}</p>
              {["A+", "A", "B+", "B", "C+", "C", "D", "F"].map(g => {
                const count = STUDENTS.filter(s => {
                  const st = calcStudentStats(selExam.id, s.id);
                  return st && st.overallGrade === g;
                }).length;
                const { color } = ["A+", "A"].includes(g) ? { color: T.green } : ["B+", "B"].includes(g) ? { color: T.accent } : ["C+", "C"].includes(g) ? { color: T.amber } : { color: T.red };
                return count > 0 ? (
                  <div key={g} style={{ ...gs.row, marginBottom: 10 }}>
                    <span style={{ width: 28, fontWeight: 800, color }}>{g}</span>
                    <div style={{ flex: 1, height: 8, background: T.border, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${(count / STUDENTS.length) * 100}%`, background: color, height: "100%", borderRadius: 99 }} />
                    </div>
                    <span style={{ color: T.muted, fontSize: 13, minWidth: 20 }}>{count}</span>
                  </div>
                ) : null;
              })}
            </div>

            <div style={gs.card}>
              <p style={{ margin: "0 0 16px", fontWeight: 700 }}>Subject-wise Average</p>
              {SUBJECTS.map(sub => {
                const avg = Math.round(
                  STUDENTS.reduce((a, s) => {
                    const k = `${selExam.id}-${s.id}`;
                    const m = SEED_MARKS[k]?.[sub.id];
                    if (!m) return a;
                    const max = sub.theoryMax + sub.practicalMax;
                    return a + ((m.theory + m.practical) / max) * 100;
                  }, 0) / STUDENTS.filter(s => SEED_MARKS[`${selExam.id}-${s.id}`]).length || 0
                );
                return (
                  <div key={sub.id} style={{ marginBottom: 12 }}>
                    <div style={{ ...gs.row, justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{sub.name}</span>
                      <span style={{ fontWeight: 700, color: avg >= 60 ? T.green : T.amber, fontSize: 13 }}>{avg || "—"}%</span>
                    </div>
                    <div style={{ height: 5, background: T.border, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${avg}%`, background: avg >= 60 ? T.green : T.amber, height: "100%", borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModal && (
        <ShareModal
          students={shareStudents}
          onClose={() => setShareModal(false)}
          onSend={(ids) => { console.log("Sending to:", ids); setShareModal(false); }}
        />
      )}
    </div>
  );
}
