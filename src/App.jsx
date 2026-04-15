import { useState } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const SUBS = {
  "Lower Primary (B1–B3)": [
    "Language & Literacy (English)", "Language & Literacy (Ghanaian Language)",
    "Mathematics", "Natural Science", "ICT",
    "Creative Arts", "Religious & Moral Education", "Physical Education",
  ],
  "Upper Primary (B4–B6)": [
    "English Language", "Mathematics", "Our World & Our People",
    "Creative Arts & Design", "Ghanaian Language", "Religious & Moral Education",
    "French", "ICT",
  ],
  "JHS (B7–B9)": [
    "English Language", "Mathematics", "Integrated Science", "Social Studies",
    "Ghanaian Language", "ICT", "French", "Religious & Moral Education",
    "Design & Technology", "Creative Arts",
  ],
};

const YEARS   = ["2023/2024", "2024/2025", "2025/2026", "2026/2027"];
const G       = "#006B3F";
const GOLD    = "#FCD116";
const RED     = "#CE1126";
const uid     = () => Math.random().toString(36).slice(2, 9);
const ord     = (n) => n + (n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th");

// ── Grade helpers ─────────────────────────────────────────────────────────────
function gradeInfo(t) {
  t = parseFloat(t) || 0;
  if (t >= 80) return { lv: "L1", gr: "A", ds: "Advance",            c: "#166534", bg: "#dcfce7" };
  if (t >= 75) return { lv: "L2", gr: "P", ds: "Proficient",         c: "#1d4ed8", bg: "#dbeafe" };
  if (t >= 70) return { lv: "L3", gr: "AP",ds: "Approaching Prof.",  c: "#6b21a8", bg: "#ede9fe" };
  if (t >= 65) return { lv: "L4", gr: "D", ds: "Developing",         c: "#c2410c", bg: "#ffedd5" };
  if (t >= 50) return { lv: "L5", gr: "B", ds: "Beginning",          c: "#b91c1c", bg: "#fee2e2" };
  return          { lv: "L6", gr: "BS",ds: "Below Standard",     c: "#374151", bg: "#f3f4f6" };
}
const scaleSBA = (r) => Math.round(Math.min(Math.max(parseFloat(r) || 0, 0), 60)  / 60  * 50 * 10) / 10;
const scaleEx  = (r) => Math.round(Math.min(Math.max(parseFloat(r) || 0, 0), 100) / 100 * 50 * 10) / 10;

// ── Shared style helpers ──────────────────────────────────────────────────────
const IS = {
  width: "100%", padding: "8px 11px", borderRadius: 7,
  border: "1.5px solid #d1d5db", fontSize: 13, outline: "none",
  background: "#fff", color: "#111827", boxSizing: "border-box",
};
const BtnG = ({ children, onClick, disabled, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "9px 20px", borderRadius: 8, border: "none",
      background: disabled ? "#9ca3af" : G, color: "#fff",
      fontWeight: 700, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.7 : 1, ...style,
    }}
  >
    {children}
  </button>
);
const BtnW = ({ children, onClick, style = {} }) => (
  <button
    onClick={onClick}
    style={{
      padding: "9px 18px", borderRadius: 8, border: "1.5px solid #d1d5db",
      background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13,
      cursor: "pointer", ...style,
    }}
  >
    {children}
  </button>
);
const Lbl = ({ label, req }) => (
  <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: 0.5, color: "#6b7280", marginBottom: 4, display: "block" }}>
    {label}{req && <span style={{ color: RED, marginLeft: 2 }}>*</span>}
  </label>
);
const Field = ({ label, req, children }) => (
  <div style={{ marginBottom: 11 }}>
    <Lbl label={label} req={req} />
    {children}
  </div>
);

// ── Step Bar ──────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const labels = ["School", "Students", "Subjects", "Scores", "Attendance", "Reports"];
  return (
    <div className="no-print" style={{ display: "flex", alignItems: "center",
      padding: "12px 16px", background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
      {labels.map((l, i) => {
        const done = i < step, active = i === step;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              {i > 0 && <div style={{ flex: 1, height: 2, background: done ? G : "#e5e7eb" }} />}
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                background: done ? G : active ? GOLD : "#f3f4f6",
                color: done ? "#fff" : active ? "#111" : "#9ca3af",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700,
              }}>
                {done ? "✓" : i + 1}
              </div>
              {i < 5 && <div style={{ flex: 1, height: 2, background: i < step ? G : "#e5e7eb" }} />}
            </div>
            <span style={{ fontSize: 9, marginTop: 3, fontWeight: active ? 700 : 400,
              color: active ? G : done ? "#374151" : "#9ca3af" }}>
              {l}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Feedback Modal ────────────────────────────────────────────────────────────
function FeedbackModal({ onClose, onSubmit }) {
  const [stars, setStars]     = useState(0);
  const [name, setName]       = useState("");
  const [school, setSchool]   = useState("");
  const [liked, setLiked]     = useState("");
  const [improve, setImprove] = useState("");
  const [other, setOther]     = useState("");
  const [err, setErr]         = useState(false);

  const submit = () => {
    if (!stars) { setErr(true); return; }
    onSubmit({ name: name || "Anonymous", school: school || "—",
      stars, liked, improve, other, ts: new Date().toISOString() });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 24,
        maxWidth: 440, width: "90%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Teacher Feedback</h3>
          <button onClick={onClose} style={{ background: "none", border: "none",
            fontSize: 18, cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
          Your feedback helps improve this tool for Ghanaian teachers. Takes 1 minute.
        </p>
        <Field label="Your Name (optional)">
          <input style={IS} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Teacher Akosua" />
        </Field>
        <Field label="School & District (optional)">
          <input style={IS} value={school} onChange={e => setSchool(e.target.value)} placeholder="e.g. Accra Model, Ayawaso" />
        </Field>
        <Field label="Rate this tool *">
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map(v => (
              <span key={v} onClick={() => { setStars(v); setErr(false); }}
                style={{ fontSize: 26, cursor: "pointer", color: v <= stars ? GOLD : "#d1d5db" }}>★</span>
            ))}
          </div>
          {err && <p style={{ fontSize: 11, color: RED, marginTop: 4 }}>Please select a star rating.</p>}
        </Field>
        <Field label="What did you like most?">
          <select style={IS} value={liked} onChange={e => setLiked(e.target.value)}>
            <option value="">Choose…</option>
            {["Auto-grading & scaling", "Official GES report format", "AI-generated remarks",
              "Ease of use", "Speed — saves lots of time", "Everything works well"].map(o => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="What needs improvement?">
          <select style={IS} value={improve} onChange={e => setImprove(e.target.value)}>
            <option value="">Choose…</option>
            {["Report card layout", "More subjects needed", "Better AI remarks",
              "Add Term 1–3 cumulative view", "Offline / mobile app version",
              "Export to Excel or PDF", "Nothing — it is perfect"].map(o => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="Any other comments?">
          <textarea style={{ ...IS, minHeight: 58, resize: "vertical" }}
            value={other} onChange={e => setOther(e.target.value)}
            placeholder="Share your thoughts…" />
        </Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <BtnW onClick={onClose}>Cancel</BtnW>
          <BtnG onClick={submit}>Submit Feedback →</BtnG>
        </div>
      </div>
    </div>
  );
}

function ThanksModal({ entry, onClose }) {
  const stars = "★".repeat(entry.stars) + "☆".repeat(5 - entry.stars);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 28,
        maxWidth: 400, width: "90%", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🙏</div>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Thank you!</h3>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
          Your feedback is recorded. It will help improve EduReport GH for teachers across Ghana.
        </p>
        <div style={{ background: "#f9fafb", borderRadius: 8, padding: 12,
          fontSize: 12, textAlign: "left", marginBottom: 14, border: "1px solid #e5e7eb" }}>
          <strong>{entry.name}</strong>{entry.school !== "—" ? " · " + entry.school : ""}<br />
          <span style={{ color: "#d97706", fontSize: 16 }}>{stars}</span><br />
          {entry.liked && <span>✅ Liked: {entry.liked}<br /></span>}
          {entry.improve && <span>🔧 Improve: {entry.improve}<br /></span>}
          {entry.other && <em>"{entry.other}"</em>}
        </div>
        <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 12,
          fontSize: 12, color: "#166534", marginBottom: 14, textAlign: "left",
          border: "1px solid #86efac" }}>
          <strong>📲 Share with teachers:</strong><br />
          Send your Vercel link via WhatsApp to your teacher colleagues!
        </div>
        <BtnG onClick={onClose} style={{ width: "100%" }}>Done</BtnG>
      </div>
    </div>
  );
}

// ── Official GES Report Card ──────────────────────────────────────────────────
function GESReportCard({ r, sc, remark, subRemarks, onEditRemark, onEditSubRemark }) {
  const og       = gradeInfo(r.avg);
  const promoted = r.avg >= 50;

  return (
    <div className="rc" style={{ background: "#fff", border: "2px solid #111",
      fontFamily: "Arial, sans-serif", marginBottom: 24, maxWidth: 800 }}>

      {/* ── Official GES Header ── */}
      <div style={{ borderBottom: "2px solid #111", padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 52, height: 52, border: "2px solid #006B3F",
          borderRadius: "50%", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🏛️</div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 1, color: "#000" }}>
            GHANA EDUCATION SERVICE
          </div>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#000", marginTop: 1 }}>
            PUPIL'S TERMINAL REPORT CARD
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: G,
            textTransform: "uppercase", marginTop: 1 }}>{sc.level}</div>
        </div>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ background: G, color: GOLD, fontWeight: 700,
            fontSize: 10, padding: "4px 8px", borderRadius: 4 }}>
            {sc.term.toUpperCase()}
          </div>
          <div style={{ fontSize: 9, color: "#6b7280", marginTop: 3 }}>{sc.year}</div>
        </div>
      </div>

      {/* ── Student & School Info ── */}
      <div style={{ padding: "8px 14px", borderBottom: "1.5px solid #111" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 16px" }}>
          {[
            ["Name", r.name, true], ["Class", sc.cls, false],
            ["School", sc.name, false], ["Circuit", sc.circuit || "___", false],
            ["District", sc.district || "___", false], ["Region", sc.region || "___", false],
            ["Date", new Date().toLocaleDateString("en-GB"), false],
            ["Next Term Begins", sc.reopen || "___", false],
          ].map(([k, v, bold]) => (
            <div key={k} style={{ fontSize: 10, borderBottom: "1px solid #ccc",
              paddingBottom: 2, marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 9, color: "#555",
                textTransform: "uppercase" }}>{k}: </span>
              <span style={{ fontWeight: bold ? 700 : 400, fontSize: 11 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Subject Score Table — Official GES columns ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ background: G }}>
            {[
              ["SUBJECT", "left", 130],
              ["SBA SCORE /50", "center", 52],
              ["EXAM SCORE /50", "center", 52],
              ["TOTAL SCORE /100", "center", 56],
              ["GRADE", "center", 46],
              ["POSITION", "center", 52],
              ["REMARKS ON STRENGTHS & WEAKNESSES", "left", 160],
            ].map(([h, a, w]) => (
              <th key={h} style={{
                padding: "7px 7px", textAlign: a,
                color: h.includes("SCORE") || h.includes("TOTAL") ? GOLD : "#fff",
                fontSize: 9, fontWeight: 700, minWidth: w,
                borderRight: "1px solid rgba(255,255,255,.2)", lineHeight: 1.3,
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {r.subs.map((s, i) => {
            const g  = gradeInfo(s.total);
            const sr = (subRemarks && subRemarks[s.name]) || "";
            return (
              <tr key={s.name} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb",
                borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "6px 8px", fontWeight: 500,
                  borderRight: "1px solid #e5e7eb" }}>{s.name}</td>
                <td style={{ textAlign: "center", padding: "6px 6px", fontWeight: 600,
                  borderRight: "1px solid #e5e7eb" }}>{s.sbaSc}</td>
                <td style={{ textAlign: "center", padding: "6px 6px", fontWeight: 600,
                  borderRight: "1px solid #e5e7eb" }}>{s.exSc}</td>
                <td style={{ textAlign: "center", fontWeight: 800, color: g.c,
                  padding: "6px 6px", borderRight: "1px solid #e5e7eb" }}>{s.total}</td>
                <td style={{ textAlign: "center", padding: "6px 6px",
                  borderRight: "1px solid #e5e7eb" }}>
                  <span style={{ background: g.bg, color: g.c, borderRadius: 3,
                    padding: "1px 5px", fontSize: 9, fontWeight: 700 }}>{g.lv}</span>
                </td>
                <td style={{ textAlign: "center", padding: "6px 6px",
                  borderRight: "1px solid #e5e7eb" }}>{ord(s.rank)}</td>
                <td style={{ padding: "6px 8px", fontSize: 10, color: "#4b5563" }}>
                  <span style={{ fontStyle: "italic" }}>{sr}</span>
                  <button className="no-print" onClick={() => onEditSubRemark(r.id, s.name)}
                    style={{ fontSize: 9, color: G, background: "none", border: "none",
                      cursor: "pointer", float: "right", fontWeight: 600, marginLeft: 4 }}>
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: "#1e293b", borderTop: "2px solid #111" }}>
            <td style={{ padding: "7px 8px", fontWeight: 700, color: "#fff", fontSize: 11,
              borderRight: "1px solid rgba(255,255,255,.15)" }}>OVERALL AVERAGE</td>
            <td colSpan={2} style={{ textAlign: "center", color: "#94a3b8", fontSize: 9,
              borderRight: "1px solid rgba(255,255,255,.15)" }}>
              {r.subs.length} subjects
            </td>
            <td style={{ textAlign: "center", fontWeight: 900, color: GOLD, fontSize: 15,
              borderRight: "1px solid rgba(255,255,255,.15)" }}>{r.avg}</td>
            <td style={{ textAlign: "center", borderRight: "1px solid rgba(255,255,255,.15)" }}>
              <span style={{ background: og.bg, color: og.c, borderRadius: 3,
                padding: "2px 6px", fontSize: 9, fontWeight: 700 }}>{og.lv}</span>
            </td>
            <td style={{ textAlign: "center", fontWeight: 700, color: "#fff", fontSize: 12,
              borderRight: "1px solid rgba(255,255,255,.15)" }}>{ord(r.rank)}</td>
            <td style={{ padding: "7px 8px" }}>
              <span style={{
                background: promoted ? "#dcfce7" : "#fee2e2",
                color: promoted ? "#166534" : "#991b1b",
                borderRadius: 3, padding: "2px 7px", fontSize: 9, fontWeight: 700,
              }}>
                {promoted ? "PROMOTED ✓" : "REVIEW REQUIRED"}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>

      {/* ── Attendance, Talent, Conduct ── */}
      <div style={{ padding: "8px 14px", borderTop: "1.5px solid #111", fontSize: 11 }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 5 }}>
          <div>
            <strong style={{ fontSize: 9, textTransform: "uppercase" }}>Attendance: </strong>
            <strong>{r.att.present}</strong> out of total of <strong>{r.att.days}</strong>
          </div>
          <div>
            <strong style={{ fontSize: 9, textTransform: "uppercase" }}>Number on Roll: </strong>
            {sc.roll || "___"}
          </div>
        </div>
        <div style={{ marginBottom: 5 }}>
          <strong style={{ fontSize: 9, textTransform: "uppercase" }}>Talent and Interests: </strong>
          <span style={{ borderBottom: "1px solid #aaa", display: "inline-block",
            minWidth: 280, marginLeft: 4 }}>{r.att.interest || " "}</span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", marginBottom: 3 }}>
            Conduct — (Pupil's Courtesy, Emotional Control, Initiative,
            Dependability and Sense of Cooperation):
          </div>
          <div style={{ border: "1px solid #ccc", borderRadius: 3,
            padding: "5px 8px", minHeight: 32, fontSize: 11,
            fontStyle: "italic", background: "#fafafa" }}>
            {r.att.conduct || "\u00a0"}
          </div>
        </div>
      </div>

      {/* ── Class Teacher's Remarks ── */}
      <div style={{ padding: "8px 14px", borderTop: "1px solid #ccc" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 4 }}>
          <strong style={{ fontSize: 9, textTransform: "uppercase" }}>
            Class Teacher's Remarks and Signature:
          </strong>
          <button className="no-print" onClick={() => onEditRemark(r.id)}
            style={{ fontSize: 10, color: G, background: "none", border: "none",
              cursor: "pointer", fontWeight: 600 }}>✏️ Edit</button>
        </div>
        <div style={{ border: "1px solid #ccc", borderRadius: 3,
          padding: "6px 8px", minHeight: 36, background: "#fafafa",
          fontSize: 11, fontStyle: "italic", color: "#374151" }}>
          {remark || "\u00a0"}
        </div>
        <div style={{ marginTop: 5, display: "flex", gap: 20, fontSize: 10 }}>
          <div>Signature:
            <span style={{ borderBottom: "1px solid #aaa", display: "inline-block",
              minWidth: 120, marginLeft: 4 }}> </span>
          </div>
          <div>Date:
            <span style={{ borderBottom: "1px solid #aaa", display: "inline-block",
              minWidth: 80, marginLeft: 4 }}> </span>
          </div>
        </div>
      </div>

      {/* ── Headteacher's Remarks ── */}
      <div style={{ padding: "8px 14px", borderTop: "1px solid #ccc", background: "#f9f9f9" }}>
        <strong style={{ fontSize: 9, textTransform: "uppercase",
          display: "block", marginBottom: 4 }}>
          Head Teacher's Remarks and Signature:
        </strong>
        <div style={{ border: "1px solid #ccc", borderRadius: 3,
          padding: "6px 8px", minHeight: 36, background: "#fff",
          fontSize: 11, fontStyle: "italic", color: "#9ca3af" }}>
          {sc.head} — [Signature on printed copy]
        </div>
        <div style={{ marginTop: 5, display: "flex", gap: 20, fontSize: 10 }}>
          <div>Signature:
            <span style={{ borderBottom: "1px solid #aaa", display: "inline-block",
              minWidth: 120, marginLeft: 4 }}> </span>
          </div>
          {sc.vac && <div>Vacation Date: <strong>{sc.vac}</strong></div>}
        </div>
      </div>

    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [step,       setStep]       = useState(0);
  const [school,     setSchool]     = useState({
    name: "", circuit: "", district: "", region: "",
    year: "2024/2025", term: "Term 1", level: "Upper Primary (B4–B6)",
    cls: "", teacher: "", head: "", roll: "", days: 60, vac: "", reopen: "",
  });
  const [students,   setStudents]   = useState([]);
  const [subjects,   setSubjects]   = useState([...SUBS["Upper Primary (B4–B6)"]]);
  const [scores,     setScores]     = useState({});
  const [attData,    setAtt]        = useState({});
  const [results,    setResults]    = useState([]);
  const [remarks,    setRemarks]    = useState({});
  const [subRem,     setSubRem]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [view,       setView]       = useState("single");
  const [selIdx,     setSelIdx]     = useState(0);
  const [activeSub,  setActiveSub]  = useState(0);
  const [bulkInput,  setBulk]       = useState("");
  const [customSub,  setCustomSub]  = useState("");
  const [fbOpen,     setFbOpen]     = useState(false);
  const [tyEntry,    setTyEntry]    = useState(null);

  const u = (k, v) => setSchool(p => ({ ...p, [k]: v }));

  // ── score helpers ────────────────────────────────────────────────────────────
  const getScore = (id, sub, f) => scores[id]?.[sub]?.[f] ?? "";
  const setScore = (id, sub, f, val, max) => {
    const n = parseFloat(val);
    if (val !== "" && (isNaN(n) || n < 0 || n > max)) return;
    setScores(p => ({ ...p, [id]: { ...p[id], [sub]: { ...p[id]?.[sub], [f]: val } } }));
  };
  const sbaRaw = (id, sub) => {
    const x = scores[id]?.[sub] || {};
    return (parseFloat(x.t1) || 0) + (parseFloat(x.t2) || 0)
         + (parseFloat(x.t3) || 0) + (parseFloat(x.t4) || 0);
  };
  const isDone  = (sub) => students.every(st => {
    const x = scores[st.id]?.[sub];
    return x && x.exam !== "" && x.exam !== undefined;
  });
  const doneCnt = () => subjects.filter(isDone).length;

  // ── attendance helpers ────────────────────────────────────────────────────────
  const getAtt = (id, k, def) => attData[id]?.[k] ?? def;
  const setA   = (id, k, v)   => setAtt(p => ({ ...p, [id]: { ...p[id], [k]: v } }));

  // ── compute results ────────────────────────────────────────────────────────────
  const compute = () => {
    const sRanks = {};
    subjects.forEach(sub => {
      const vals = students.map(st => {
        const raw = sbaRaw(st.id, sub);
        const sc  = scaleSBA(raw);
        const ex  = scaleEx((scores[st.id]?.[sub] || {}).exam || 0);
        return { id: st.id, sbaSc: sc, exSc: ex, total: Math.round((sc + ex) * 10) / 10 };
      }).sort((a, b) => b.total - a.total);
      vals.forEach((v, i) => (v.rank = i + 1));
      sRanks[sub] = vals;
    });
    const res = students.map(st => {
      const subs = subjects.map(sub => {
        const e = sRanks[sub].find(x => x.id === st.id);
        return { name: sub, ...e };
      });
      const avg = subs.length
        ? Math.round(subs.reduce((a, b) => a + b.total, 0) / subs.length * 10) / 10
        : 0;
      const a = attData[st.id] || {};
      return {
        id: st.id, name: st.name, subs, avg, rank: 0,
        att: { present: a.present || "—", days: school.days,
               conduct: a.conduct || "", interest: a.interest || "" },
      };
    });
    res.slice().sort((a, b) => b.avg - a.avg).forEach((r, i) => (r.rank = i + 1));
    return res;
  };

  const fallbackRem = (r, tot) => {
    const fn   = r.name.split(" ")[0];
    const best = r.subs.slice().sort((a, b) => b.total - a.total)[0];
    if (r.avg >= 80) return `${fn} delivered an outstanding performance, ranking ${ord(r.rank)} out of ${tot}. Excellent dedication — keep it up!`;
    if (r.avg >= 65) return `${fn} showed commendable effort, placing ${ord(r.rank)} in class. Strong in ${best?.name || "core subjects"} — sustained focus will yield even better results.`;
    if (r.avg >= 50) return `${fn} performed satisfactorily, ranking ${ord(r.rank)} this term. Consistent practice in weaker areas will bring great improvement.`;
    return `${fn} needs additional support this term. Regular practice, teacher guidance, and parental involvement will make a significant difference.`;
  };
  const fallbackSub = (tot) => {
    if (tot >= 80) return "Excellent grasp of concepts. Keep it up.";
    if (tot >= 70) return "Good understanding. Review challenging areas.";
    if (tot >= 60) return "Satisfactory. More practice exercises needed.";
    if (tot >= 50) return "Fair. Needs to revise key topics regularly.";
    return "Needs significant improvement. Seek extra support.";
  };

  // ── GENERATE ── calls /api/generate (Vercel serverless proxy) ─────────────────
  const generate = async () => {
    setLoading(true);
    const computed = compute();
    setResults(computed);

    // Set fallback remarks first (instant)
    const rm = {}, sr = {};
    computed.forEach(r => {
      rm[r.id] = fallbackRem(r, computed.length);
      sr[r.id] = {};
      r.subs.forEach(s => (sr[r.id][s.name] = fallbackSub(s.total)));
    });
    setRemarks(rm);
    setSubRem(sr);

    // Call the secure backend proxy
    try {
      const payload = computed.map(r => ({
        name: r.name, avg: r.avg, rank: r.rank, total: computed.length,
        best: r.subs.slice().sort((a, b) => b.total - a.total)[0]?.name,
        weak: r.subs.slice().sort((a, b) => a.total - b.total)[0]?.name,
        subjects: r.subs.map(s => ({ name: s.name, total: s.total })),
      }));

      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          messages: [{
            role: "user",
            content: `You are a Ghanaian basic school class teacher writing official GES terminal report card content.
For each student generate:
1. "remark": Warm personalised class teacher remark (2 sentences, max 40 words). Mention rank, a strength, growth tip if below 80%.
2. "subRemarks": For each subject, a brief 8–12 word "Strengths & Weaknesses" remark for that subject.

Return ONLY valid JSON — no markdown, no preamble.
Format: {"StudentName":{"remark":"...","subRemarks":{"SubjectName":"brief remark",...}},...}

Data: ${JSON.stringify(payload)}`,
          }],
        }),
      });

      const data = await resp.json();
      const raw  = (data.content?.find(c => c.type === "text")?.text || "{}")
        .replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(raw);

      computed.forEach(r => {
        if (parsed[r.name]) {
          if (parsed[r.name].remark)      rm[r.id] = parsed[r.name].remark;
          if (parsed[r.name].subRemarks)  r.subs.forEach(s => {
            sr[r.id][s.name] = parsed[r.name].subRemarks[s.name] || sr[r.id][s.name];
          });
        }
      });
      setRemarks({ ...rm });
      setSubRem({ ...sr });
    } catch (e) {
      console.warn("AI remarks unavailable, using fallback.", e);
    }

    setLoading(false);
    setSelIdx(0);
    setStep(5);
  };

  const submitFeedback = async entry => {
    try {
      const resp = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error("Feedback API error:", resp.status, errorText);
        let message = errorText;
        try {
          const json = JSON.parse(errorText);
          message = json.detail || json.error || errorText;
        } catch {
          message = errorText;
        }
        alert("Unable to save feedback. " + message);
        return;
      }

      const saved = await resp.json();
      setFbOpen(false);
      setTyEntry(saved);
    } catch (error) {
      console.error("Feedback submission failed:", error);
      alert("Unable to save feedback. Please try again later.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "sans-serif", background: "#f8f7f4", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: G, padding: "12px 16px", display: "flex",
        alignItems: "center", gap: 11 }}>
        <div style={{ background: GOLD, borderRadius: 8, padding: "5px 8px",
          fontSize: 18, lineHeight: 1 }}>🎓</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: GOLD, fontWeight: 900, fontSize: 16 }}>EduReport GH</div>
          <div style={{ color: "#bbf7d0", fontSize: 10 }}>
            Ghana SBA & Terminal Report System · Official GES Format
          </div>
        </div>
        {step === 5 && (
          <button onClick={() => setFbOpen(true)} className="no-print"
            style={{ background: "rgba(255,255,255,.15)", color: GOLD,
              border: "1px solid rgba(255,255,255,.25)", borderRadius: 16,
              padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            ⭐ Give Feedback
          </button>
        )}
      </div>
      <div style={{ height: 3, background:
        `linear-gradient(to right,${RED} 33%,${GOLD} 33%,${GOLD} 66%,${G} 66%)` }} />

      <StepBar step={step} />

      <div style={{ padding: "18px 16px", maxWidth: 920, margin: "0 auto" }}>

        {/* ── STEP 0: SCHOOL SETUP ─────────────────────────────────────────── */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>School Setup</h2>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
              These details appear on every official GES report card.
            </p>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb",
              padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <Field label="School Name" req>
                    <input style={IS} value={school.name}
                      onChange={e => u("name", e.target.value)}
                      placeholder="e.g. Accra Model Primary School" />
                  </Field>
                </div>
                <Field label="Circuit">
                  <input style={IS} value={school.circuit}
                    onChange={e => u("circuit", e.target.value)} placeholder="e.g. Osu Circuit" />
                </Field>
                <Field label="District">
                  <input style={IS} value={school.district}
                    onChange={e => u("district", e.target.value)} placeholder="e.g. Ayawaso East" />
                </Field>
                <Field label="Region">
                  <input style={IS} value={school.region}
                    onChange={e => u("region", e.target.value)} placeholder="e.g. Greater Accra" />
                </Field>
                <Field label="Academic Year" req>
                  <select style={IS} value={school.year} onChange={e => u("year", e.target.value)}>
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </Field>
                <Field label="Term" req>
                  <select style={IS} value={school.term} onChange={e => u("term", e.target.value)}>
                    <option>Term 1</option>
                    <option>Term 2</option>
                    <option>Term 3</option>
                  </select>
                </Field>
                <Field label="School Level" req>
                  <select style={IS} value={school.level}
                    onChange={e => { u("level", e.target.value); setSubjects([...SUBS[e.target.value]]); }}>
                    {Object.keys(SUBS).map(l => <option key={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Class Name" req>
                  <input style={IS} value={school.cls}
                    onChange={e => u("cls", e.target.value)} placeholder="e.g. Basic 4A" />
                </Field>
                <Field label="Class Teacher" req>
                  <input style={IS} value={school.teacher}
                    onChange={e => u("teacher", e.target.value)} placeholder="Full name" />
                </Field>
                <Field label="Headteacher" req>
                  <input style={IS} value={school.head}
                    onChange={e => u("head", e.target.value)} placeholder="Full name" />
                </Field>
                <Field label="Number on Roll">
                  <input style={IS} type="number" value={school.roll}
                    onChange={e => u("roll", e.target.value)} />
                </Field>
                <Field label="Total School Days">
                  <input style={IS} type="number" value={school.days}
                    onChange={e => u("days", parseInt(e.target.value) || 60)} />
                </Field>
                <Field label="Vacation Date">
                  <input style={IS} type="date" value={school.vac}
                    onChange={e => u("vac", e.target.value)} />
                </Field>
                <Field label="Next Term Begins">
                  <input style={IS} type="date" value={school.reopen}
                    onChange={e => u("reopen", e.target.value)} />
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <BtnG
                disabled={!school.name || !school.cls || !school.teacher || !school.head}
                onClick={() => setStep(1)}>
                Next: Add Students →
              </BtnG>
            </div>
          </div>
        )}

        {/* ── STEP 1: STUDENTS ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>Add Students</h2>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
              Paste names one per line and click Add. Edit names inline.
            </p>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb",
              padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <textarea value={bulkInput} onChange={e => setBulk(e.target.value)}
                  placeholder={"Ama Owusu\nKofi Mensah\nAbena Asante\n..."}
                  style={{ ...IS, flex: 1, minHeight: 75, resize: "vertical" }} />
                <BtnG style={{ alignSelf: "flex-start", whiteSpace: "nowrap" }}
                  onClick={() => {
                    const names = bulkInput.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
                    if (names.length) {
                      setStudents(p => [...p, ...names.map(name => ({ id: uid(), name }))]);
                      setBulk("");
                    }
                  }}>+ Add</BtnG>
              </div>
              {students.length > 0 && (
                <div style={{ borderRadius: 7, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                  {students.map((s, i) => (
                    <div key={s.id} style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "7px 12px",
                      background: i % 2 === 0 ? "#fff" : "#f9fafb",
                      borderBottom: "1px solid #f3f4f6",
                    }}>
                      <span style={{ fontSize: 10, color: "#9ca3af", minWidth: 22,
                        fontFamily: "monospace" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <input value={s.name}
                        onChange={e => setStudents(p =>
                          p.map(x => x.id === s.id ? { ...x, name: e.target.value } : x))}
                        style={{ flex: 1, border: "none", background: "transparent",
                          fontSize: 13, fontWeight: 600, outline: "none", color: "#111827" }} />
                      <button onClick={() => setStudents(p => p.filter(x => x.id !== s.id))}
                        style={{ background: "#fee2e2", border: "none", borderRadius: 4,
                          padding: "2px 7px", color: "#b91c1c", fontWeight: 700,
                          fontSize: 11, cursor: "pointer" }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>
                {students.length > 0 ? `${students.length} student${students.length > 1 ? "s" : ""} added` : ""}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <BtnW onClick={() => setStep(0)}>← Back</BtnW>
              <BtnG disabled={!students.length} onClick={() => setStep(2)}>
                Next: Choose Subjects →
              </BtnG>
            </div>
          </div>
        )}

        {/* ── STEP 2: SUBJECTS ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>Select Subjects</h2>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
              Default GES subjects pre-ticked for your level. Uncheck unused, add extras.
            </p>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb",
              padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                gap: 8, marginBottom: 12 }}>
                {[...new Set([
                  ...(SUBS[school.level] || []),
                  ...subjects.filter(s => !(SUBS[school.level] || []).includes(s)),
                ])].map(s => {
                  const on     = subjects.includes(s);
                  const custom = !(SUBS[school.level] || []).includes(s);
                  return (
                    <label key={s} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: on ? "#f0fdf4" : "#f9fafb",
                      border: `1.5px solid ${on ? G : "#e5e7eb"}`,
                      borderRadius: 7, padding: "9px 12px", cursor: "pointer",
                    }}>
                      <input type="checkbox" checked={on}
                        onChange={() => setSubjects(p => on ? p.filter(x => x !== s) : [...p, s])}
                        style={{ accentColor: G, width: 14, height: 14, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: on ? 600 : 400,
                        color: on ? "#166534" : "#374151" }}>
                        {s}{custom && <em style={{ fontSize: 9, color: "#c2410c" }}> (custom)</em>}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={customSub} onChange={e => setCustomSub(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && customSub.trim()) {
                      setSubjects(p => [...p, customSub.trim()]);
                      setCustomSub("");
                    }
                  }}
                  placeholder="Add custom subject…" style={{ ...IS, flex: 1 }} />
                <BtnW onClick={() => {
                  if (customSub.trim()) {
                    setSubjects(p => [...p, customSub.trim()]);
                    setCustomSub("");
                  }
                }}>+ Add</BtnW>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <BtnW onClick={() => setStep(1)}>← Back</BtnW>
              <BtnG disabled={!subjects.length}
                onClick={() => { setActiveSub(0); setStep(3); }}>
                Next: Enter Scores →
              </BtnG>
            </div>
          </div>
        )}

        {/* ── STEP 3: SCORES ───────────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>Enter Scores</h2>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 11 }}>
              SBA = 4 tasks × 15 marks (/60). Exam = /100. Both auto-scaled to /50.
            </p>
            {/* Subject tabs */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 11 }}>
              {subjects.map((s, i) => {
                const done   = isDone(s);
                const active = i === activeSub;
                return (
                  <button key={s} onClick={() => setActiveSub(i)} style={{
                    padding: "5px 11px", borderRadius: 14, fontSize: 11,
                    fontWeight: active ? 700 : 500, cursor: "pointer",
                    border: `1.5px solid ${active ? G : done ? "#16a34a" : "#e5e7eb"}`,
                    background: active ? G : done ? "#f0fdf4" : "#fff",
                    color: active ? "#fff" : done ? "#166534" : "#374151",
                  }}>
                    {done && !active ? "✓ " : ""}
                    {s.length > 14 ? s.slice(0, 13) + "…" : s}
                  </button>
                );
              })}
            </div>
            {/* Score table */}
            <div style={{ overflowX: "auto", borderRadius: 8,
              border: "1px solid #e5e7eb", marginBottom: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: G }}>
                    {[["Student","left",130],["T1/15","center",50],["T2/15","center",50],
                      ["T3/15","center",50],["T4/15","center",50],
                      ["SBA/60","center",58],["Exam/100","center",68],["Total","center",90]
                    ].map(([h, a, w]) => (
                      <th key={h} style={{
                        padding: "8px 8px", textAlign: a, minWidth: w, fontSize: 10,
                        fontWeight: 700, color: (h === "SBA/60" || h === "Total") ? GOLD : "#fff",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((st, i) => {
                    const sub = subjects[activeSub];
                    const raw = sbaRaw(st.id, sub);
                    const x   = scores[st.id]?.[sub] || {};
                    let totEl = <span style={{ color: "#d1d5db", fontSize: 11 }}>—</span>;
                    if (x.exam !== undefined && x.exam !== "") {
                      const sc  = scaleSBA(raw);
                      const ex  = scaleEx(x.exam);
                      const tot = Math.round((sc + ex) * 10) / 10;
                      const g   = gradeInfo(tot);
                      totEl = (
                        <span style={{ background: g.bg, color: g.c, borderRadius: 4,
                          padding: "2px 6px", fontSize: 10, fontWeight: 700 }}>
                          {tot} {g.gr}
                        </span>
                      );
                    }
                    const Inp = ({ f, mx }) => (
                      <input type="number" min={0} max={mx}
                        value={getScore(st.id, sub, f)}
                        onChange={e => setScore(st.id, sub, f, e.target.value, mx)}
                        style={{ width: 48, padding: "5px 3px", textAlign: "center",
                          fontSize: 12, borderRadius: 5, border: "1.5px solid #d1d5db",
                          outline: "none" }}
                        placeholder="—" />
                    );
                    return (
                      <tr key={st.id} style={{
                        background: i % 2 === 0 ? "#fff" : "#f9fafb",
                        borderBottom: "1px solid #f3f4f6",
                      }}>
                        <td style={{ padding: "7px 10px", fontWeight: 600 }}>{st.name}</td>
                        {["t1","t2","t3","t4"].map(f => (
                          <td key={f} style={{ textAlign: "center", padding: "5px 4px" }}>
                            <Inp f={f} mx={15} />
                          </td>
                        ))}
                        <td style={{ textAlign: "center", fontWeight: 700, padding: "5px 8px",
                          color: raw > 60 ? "#dc2626" : raw > 0 ? "#166534" : "#9ca3af" }}>
                          {raw || "—"}
                        </td>
                        <td style={{ textAlign: "center", padding: "5px 4px" }}>
                          <Inp f="exam" mx={100} />
                        </td>
                        <td style={{ textAlign: "center", padding: "5px 8px" }}>{totEl}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ background: "#fef9c3", borderRadius: 6, padding: "7px 12px",
              fontSize: 11, color: "#713f12", marginBottom: 10, border: "1px solid #fde68a" }}>
              SBA scaled = (SBA raw /60) × 50 · Exam scaled = (Exam /100) × 50 · Total = both (out of 100)
            </div>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <BtnW onClick={() => setStep(2)}>← Back</BtnW>
              <span style={{ fontSize: 11, color: "#6b7280" }}>
                {doneCnt()}/{subjects.length} subjects complete
              </span>
              <BtnG disabled={doneCnt() < subjects.length} onClick={() => setStep(4)}>
                Next: Attendance →
              </BtnG>
            </div>
          </div>
        )}

        {/* ── STEP 4: ATTENDANCE ───────────────────────────────────────────── */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>
              Attendance & Conduct
            </h2>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 11 }}>
              Days present (out of {school.days}). Write the conduct comment — it prints
              on the official report card.
            </p>
            <div style={{ overflowX: "auto", borderRadius: 8,
              border: "1px solid #e5e7eb", marginBottom: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#1e293b" }}>
                    {[
                      "Student",
                      "Days Present",
                      "Conduct Comment (Courtesy, Initiative, Cooperation…)",
                      "Talent & Interest",
                    ].map(h => (
                      <th key={h} style={{ padding: "9px 10px", textAlign: "left",
                        color: "#cbd5e1", fontSize: 10, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((st, i) => (
                    <tr key={st.id} style={{
                      background: i % 2 === 0 ? "#fff" : "#f9fafb",
                      borderBottom: "1px solid #f3f4f6",
                    }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600,
                        whiteSpace: "nowrap" }}>{st.name}</td>
                      <td style={{ padding: "6px 8px", textAlign: "center" }}>
                        <input type="number" min={0} max={school.days}
                          value={getAtt(st.id, "present", "")}
                          onChange={e => setA(st.id, "present", e.target.value)}
                          style={{ width: 60, textAlign: "center", padding: "5px 6px",
                            borderRadius: 5, border: "1.5px solid #d1d5db",
                            fontSize: 12, outline: "none" }} />
                      </td>
                      <td style={{ padding: "6px 8px" }}>
                        <textarea
                          value={getAtt(st.id, "conduct", "")}
                          onChange={e => setA(st.id, "conduct", e.target.value)}
                          placeholder="e.g. Respectful and well-behaved. Shows initiative and cooperates well with peers."
                          style={{ ...IS, minHeight: 50, resize: "vertical", fontSize: 11 }} />
                      </td>
                      <td style={{ padding: "6px 8px" }}>
                        <input value={getAtt(st.id, "interest", "")}
                          onChange={e => setA(st.id, "interest", e.target.value)}
                          placeholder="e.g. Art, Football…"
                          style={{ ...IS, fontSize: 12 }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", gap: 8 }}>
              <BtnW onClick={() => setStep(3)}>← Back</BtnW>
              <BtnG disabled={loading} onClick={generate}>
                {loading ? "⏳ Generating AI Remarks…" : "🤖 Generate All Reports →"}
              </BtnG>
            </div>
          </div>
        )}

        {/* ── STEP 5: REPORTS ──────────────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <div className="no-print" style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 12,
            }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>
                  Terminal Reports
                </h2>
                <div style={{ fontSize: 11, color: "#6b7280" }}>
                  {results.length} students · {school.cls} · {school.term} {school.year}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[["single","Single View"],["all","All Reports"]].map(([v, l]) => (
                  <button key={v} onClick={() => setView(v)} style={{
                    padding: "7px 13px", borderRadius: 14,
                    border: `1.5px solid ${view === v ? G : "#d1d5db"}`,
                    background: view === v ? G : "#fff",
                    color: view === v ? "#fff" : "#374151",
                    fontSize: 11, fontWeight: view === v ? 700 : 500, cursor: "pointer",
                  }}>{l}</button>
                ))}
                <button onClick={() => setFbOpen(true)} style={{
                  padding: "7px 13px", borderRadius: 14,
                  border: "1px solid #fde68a", background: "#fef9c3",
                  color: "#92400e", fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}>⭐ Rate This Tool</button>
                <BtnG onClick={() => window.print()}>🖨️ Print All</BtnG>
              </div>
            </div>

            {/* Class stats */}
            <div className="no-print" style={{ display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
              gap: 8, marginBottom: 12 }}>
              {[
                ["Class Average", (results.reduce((a,r)=>a+r.avg,0)/results.length).toFixed(1)+"%"],
                ["Highest",       Math.max(...results.map(r=>r.avg))+"%"],
                ["Passed (≥50%)", `${results.filter(r=>r.avg>=50).length}/${results.length}`],
                ["Advance (L1)",  results.filter(r=>r.avg>=80).length],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "#fff", borderRadius: 8, padding: 10,
                  textAlign: "center", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: 9, color: "#6b7280", textTransform: "uppercase",
                    letterSpacing: 0.4, marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: G }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Student selector */}
            {view === "single" && (
              <div className="no-print" style={{ display: "flex", gap: 5,
                flexWrap: "wrap", marginBottom: 12 }}>
                {results.map((r, i) => {
                  const g  = gradeInfo(r.avg);
                  const ac = i === selIdx;
                  return (
                    <button key={r.id} onClick={() => setSelIdx(i)} style={{
                      padding: "5px 12px", borderRadius: 14,
                      border: `1.5px solid ${ac ? G : "#e5e7eb"}`,
                      background: ac ? G : "#fff",
                      color: ac ? "#fff" : "#374151",
                      fontSize: 11, fontWeight: ac ? 700 : 400, cursor: "pointer",
                    }}>
                      {r.name.split(" ")[0]}
                      <span style={{ fontSize: 9, color: ac ? "#bbf7d0" : g.c }}>
                        {" "}({r.avg}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Report cards */}
            {(view === "single" ? [results[selIdx]] : results).map(r => (
              <GESReportCard
                key={r.id}
                r={r}
                sc={school}
                remark={remarks[r.id] || ""}
                subRemarks={subRem[r.id] || {}}
                onEditRemark={id => {
                  const txt = window.prompt("Edit class teacher's remark:", remarks[id] || "");
                  if (txt !== null) setRemarks(p => ({ ...p, [id]: txt }));
                }}
                onEditSubRemark={(id, subName) => {
                  const txt = window.prompt(`Edit remark for "${subName}":`,
                    subRem[id]?.[subName] || "");
                  if (txt !== null) setSubRem(p =>
                    ({ ...p, [id]: { ...p[id], [subName]: txt } }));
                }}
              />
            ))}

            <div className="no-print" style={{ marginTop: 12 }}>
              <BtnW onClick={() => setStep(4)}>← Back to Attendance</BtnW>
            </div>
          </div>
        )}

      </div>

      {fbOpen  && <FeedbackModal onClose={() => setFbOpen(false)} onSubmit={submitFeedback} />}
      {tyEntry && <ThanksModal entry={tyEntry} onClose={() => setTyEntry(null)} />}
    </div>
  );
}
