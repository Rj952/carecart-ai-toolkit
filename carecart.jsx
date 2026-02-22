"use client";
import { useState, useCallback, useRef, useEffect } from "react";

/* --- CONSTANTS --- */
const CARE_STEPS = [
  { key: "consider", label: "Consider", icon: "🔍", color: "#60a5fa", description: "What is the task? Who is the audience? What tools are available?" },
  { key: "analyze", label: "Analyze", icon: "📊", color: "#a78bfa", description: "What information do you need? What are the constraints? What format works best?" },
  { key: "reflect", label: "Reflect", icon: "💭", color: "#fbbf24", description: "Is this the right approach? What could go wrong? What assumptions am I making?" },
  { key: "evaluate", label: "Evaluate", icon: "✅", color: "#34d399", description: "Does the output meet the need? What would I improve? How can I verify accuracy?" },
];

const CRAFT_FIELDS = [
  { key: "context", label: "Context", icon: "🌍", placeholder: "Set the scene — What's the background? Who is involved? What's the situation?", hint: "e.g., 'I am a university lecturer preparing a 200-level course on Caribbean History for 35 undergraduates at UWI Mona.'" },
  { key: "role", label: "Role", icon: "🎭", placeholder: "Who should the AI act as? What expertise should it bring?", hint: "e.g., 'Act as an experienced instructional designer with expertise in Bloom's Taxonomy and backward design.'" },
  { key: "action", label: "Action", icon: "⚡", placeholder: "What specifically should the AI do? Be precise about the task.", hint: "e.g., 'Create 5 discussion prompts that move students from remembering facts to analyzing historical patterns.'" },
  { key: "format", label: "Format", icon: "📋", placeholder: "How should the output be structured? What format do you need?", hint: "e.g., 'Present each prompt with: the question, Bloom's level targeted, estimated discussion time, and a model response outline.'" },
  { key: "threshold", label: "Threshold", icon: "📏", placeholder: "What quality standards must be met? What constraints apply?", hint: "e.g., 'Each prompt must be culturally relevant to the Caribbean context, avoid Eurocentric framing, and be achievable in a 15-minute discussion.'" },
];

const PROMPT_CATEGORIES = [
  { id: "education", label: "Education & Teaching", icon: "🎓", examples: ["Create a lesson plan", "Design an assessment rubric", "Write discussion prompts"] },
  { id: "research", label: "Research & Analysis", icon: "🔬", examples: ["Literature review", "Data analysis plan", "Research methodology"] },
  { id: "business", label: "Business & Strategy", icon: "💼", examples: ["Strategic plan", "Market analysis", "Project proposal"] },
  { id: "content", label: "Content Creation", icon: "✍️", examples: ["Blog post", "Social media campaign", "Newsletter draft"] },
  { id: "health", label: "Health & Wellness", icon: "🏥", examples: ["Patient communication", "Health education material", "Wellness program design"] },
  { id: "technology", label: "Technology & IT", icon: "💻", examples: ["Technical documentation", "User guide", "Implementation plan"] },
];
const ASSESSMENT_DIMENSIONS = [
  {
    key: "leadership",
    label: "Leadership & Vision",
    icon: "👑",
    color: "#60a5fa",
    questions: [
      "Does your institution have a formal AI strategy or roadmap?",
      "Is there executive-level sponsorship for AI initiatives?",
      "Are AI goals aligned with your institution's strategic plan?",
      "Is there a designated AI champion or committee?",
    ],
  },
  {
    key: "infrastructure",
    label: "Technology Infrastructure",
    icon: "🖥️",
    color: "#a78bfa",
    questions: [
      "Do you have reliable high-speed internet across the institution?",
      "Are your core systems (LMS, HRIS, CRM) cloud-based and API-enabled?",
      "Do you have data storage and processing capacity for AI workloads?",
      "Is there a centralized IT support team capable of managing AI tools?",
    ],
  },
  {
    key: "data",
    label: "Data Readiness",
    icon: "📊",
    color: "#22d3ee",
    questions: [
      "Is your institutional data organized, clean, and accessible?",
      "Do you have data governance policies in place?",
      "Are there data privacy and security protocols aligned with regulations?",
      "Can your systems share data across departments effectively?",
    ],
  },
  {
    key: "people",
    label: "People & Skills",
    icon: "👥",
    color: "#34d399",
    questions: [
      "Do staff and faculty have basic digital literacy skills?",
      "Have any staff received AI-specific training?",
      "Is there a culture of innovation and willingness to adopt new tools?",
      "Are there mechanisms for ongoing professional development?",
    ],
  },
  {
    key: "ethics",
    label: "Ethics & Governance",
    icon: "⚖️",
    color: "#fbbf24",
    questions: [
      "Does your institution have an AI ethics policy or guidelines?",
      "Are there processes to evaluate AI bias and fairness?",
      "Is there transparency about how AI tools use institutional data?",
      "Do you have an AI acceptable use policy for staff and students?",
    ],
  },
  {
    key: "budget",
    label: "Budget & Resources",
    icon: "💰",
    color: "#fb7185",
    questions: [
      "Is there a dedicated budget for AI tools and implementation?",
      "Are there funds allocated for AI-related training?",
      "Has a cost-benefit analysis been done for AI adoption?",
      "Are there plans for sustainable long-term AI investment?",
    ],
  },
  {
    key: "processes",
    label: "Processes & Workflows",
    icon: "⚙️",
    color: "#f472b6",
    questions: [
      "Have you identified processes that could benefit from AI automation?",
      "Are current workflows documented and standardized?",
      "Is there a pilot or testing framework for new technologies?",
      "Do you have change management processes for technology adoption?",
    ],
  },
  {
    key: "ecosystem",
    label: "Partnerships & Ecosystem",
    icon: "🤝",
    color: "#2dd4bf",
    questions: [
      "Do you have partnerships with AI vendors or consultants?",
      "Are there collaborations with other institutions on AI initiatives?",
      "Do you engage with industry for AI best practices?",
      "Are there connections to regional or national AI strategies?",
    ],
  },
];

const SCORE_OPTIONS = [
  { value: 1, label: "Not at all", color: "#fb7185" },
  { value: 2, label: "Beginning", color: "#fb923c" },
  { value: 3, label: "Developing", color: "#fbbf24" },
  { value: 4, label: "Established", color: "#a3e635" },
  { value: 5, label: "Advanced", color: "#34d399" },
];

function getReadinessLevel(score) {
  if (score >= 4.5) return { level: "AI Ready", color: "#34d399", emoji: "🚀", desc: "Your institution is well-positioned for AI adoption. Focus on optimization and innovation." };
  if (score >= 3.5) return { level: "Progressing", color: "#a3e635", emoji: "📈", desc: "Strong foundation with room to grow. Prioritize your weakest dimensions." };
  if (score >= 2.5) return { level: "Developing", color: "#fbbf24", emoji: "🔨", desc: "Building blocks are forming. Focus on infrastructure, skills, and governance." };
  if (score >= 1.5) return { level: "Emerging", color: "#fb923c", emoji: "🌱", desc: "Early stages of AI readiness. Start with leadership buy-in and foundational infrastructure." };
  return { level: "Beginning", color: "#fb7185", emoji: "🏁", desc: "Just starting the journey. Begin with awareness-building and strategic planning." };
}

/* --- STYLES --- */ const s = {
  app: { minHeight: "100vh", background: "#0f172a" },
  skipLink: { position: "absolute", top: -40, left: 0, background: "#3b82f6", color: "white", padding: "8px 16px", zIndex: 200, fontSize: 14, fontWeight: 600, textDecoration: "none", borderRadius: "0 0 8px 0", transition: "top 0.2s" },
  skipLinkFocus: { top: 0 },
  header: { background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", borderBottom: "1px solid #475569", padding: "20px 24px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" },
  headerInner: { maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 },
  logo: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: { width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "white" },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#f8fafc" },
  logoSub: { fontSize: 12, color: "#cbd5e1", letterSpacing: 1.5, textTransform: "uppercase", marginTop: -2 },
  nav: { display: "flex", gap: 4, background: "#0f172a", borderRadius: 12, padding: 4, border: "1px solid #475569" },
  navBtn: (active) => ({ padding: "10px 20px", borderRadius: 10, border: "none", background: active ? "#3b82f6" : "transparent", color: active ? "white" : "#cbd5e1", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s", fontFamily: "Inter, sans-serif" }),
  main: { maxWidth: 1200, margin: "0 auto", padding: "32px 24px 100px" },
  hero: { textAlign: "center", marginBottom: 48 },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 700, color: "#f8fafc", marginBottom: 12, lineHeight: 1.2 },
  heroSub: { fontSize: 18, color: "#cbd5e1", maxWidth: 600, margin: "0 auto" },
  card: { background: "#1e293b", borderRadius: 16, border: "1px solid #475569", padding: 24, marginBottom: 20, transition: "all 0.2s" },
  cardTitle: { fontSize: 20, fontWeight: 700, color: "#f8fafc", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 },
  cardDesc: { fontSize: 14, color: "#cbd5e1", lineHeight: 1.6 },
  label: { display: "block", fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 },
  input: { width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #475569", background: "#0f172a", color: "#f1f5f9", fontSize: 15, fontFamily: "Inter, sans-serif", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", lineHeight: 1.5 },
  textarea: { width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #475569", background: "#0f172a", color: "#f1f5f9", fontSize: 15, fontFamily: "Inter, sans-serif", outline: "none", resize: "vertical", minHeight: 100, lineHeight: 1.5, transition: "border-color 0.2s, box-shadow 0.2s" },
  hint: { fontSize: 13, color: "#94a3b8", marginTop: 4, fontStyle: "italic" },
  btnPrimary: { padding: "14px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" },
  btnSecondary: { padding: "12px 24px", borderRadius: 10, border: "2px solid #475569", background: "transparent", color: "#cbd5e1", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.2s" },
  btnSuccess: { padding: "14px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #10b981, #059669)", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.2s" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 },
  tag: (color) => ({ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: `${color}25`, color: color, fontSize: 12, fontWeight: 700, border: `1px solid ` + color + `40` }),
  progressBar: () => ({ height: 10, borderRadius: 5, background: "#1e293b", overflow: "hidden", position: "relative", border: "1px solid #475569" }),
  progressFill: (pct, color) => ({ height: "100%", width: `${pct}%`, borderRadius: 5, background: color, transition: "width 0.5s ease" }),
  badge: (color) => ({ width: 48, height: 48, borderRadius: 12, background: `${color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, border: `1px solid ` + color + `40` }),
  outputBox: { background: "#0f172a", borderRadius: 12, border: "2px solid #475569", padding: 20, fontFamily: "monospace", fontSize: 14, lineHeight: 1.8, color: "#e2e8f0", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 500, overflowY: "auto" },
  copyBtn: { position: "absolute", top: 12, right: 12, padding: "8px 16px", borderRadius: 8, border: "2px solid #475569", background: "#1e293b", color: "#cbd5e1", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" },
};

/* --- FOCUS STYLES CSS (injected) --- */
const ACCESSIBILITY_CSS = `
  /* Skip link */
  .skip-link:focus { top: 0 !important; }

  /* Focus visible for all interactive elements */
  *:focus-visible {
    outline: 3px solid #60a5fa !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 0 6px rgba(96, 165, 250, 0.25) !important;
  }

  /* Remove default outline only when not focus-visible */
  *:focus:not(:focus-visible) {
    outline: none !important;
    box-shadow: none !important;
  }

  /* Input/textarea focus */
  input:focus-visible, textarea:focus-visible, select:focus-visible {
    border-color: #60a5fa !important;
    outline: 3px solid #60a5fa !important;
    outline-offset: -1px !important;
  }

  /* Button hover enhancement */
  button:hover:not(:disabled) {
    filter: brightness(1.15);
  }

  /* Disabled button styling */
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed !important;
    filter: grayscale(0.3);
  }

  /* Placeholder contrast */
  ::placeholder {
    color: #94a3b8 !important;
    opacity: 1 !important;
  }

  /* Selection styling */
  ::selection {
    background: rgba(96, 165, 250, 0.35);
    color: #f8fafc;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* High contrast mode support */
  @media (forced-colors: active) {
    button, input, textarea, select {
      border: 2px solid ButtonText !important;
    }
    button:focus-visible {
      outline: 3px solid Highlight !important;
    }
  }

  /* Print */
  @media print {
    body { background: white !important; color: black !important; }
    button, nav, .skip-link { display: none !important; }
  }

  @media (max-width: 640px) {
    .nav-text { display: none; }
  }

  /* Scrollbar for progress track */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

/* --- PROMPT BUILDER --- */
function PromptBuilder() {
  const [category, setCategory] = useState(null);
  const [craftInputs, setCraftInputs] = useState({ context: "", role: "", action: "", format: "", threshold: "" });
  const [careNotes, setCareNotes] = useState({ consider: "", analyze: "", reflect: "", evaluate: "" });
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);
  const [showCare, setShowCare] = useState(false);
  const outputRef = useRef(null);

  const updateCraft = (key, val) => setCraftInputs((p) => ({ ...p, [key]: val }));
  const updateCare = (key, val) => setCareNotes((p) => ({ ...p, [key]: val }));

  const generatePrompt = () => {
    const parts = [];
    if (craftInputs.context) parts.push(`**Context:** ${craftInputs.context}`);
    if (craftInputs.role) parts.push(`**Role:** ${craftInputs.role}`);
    if (craftInputs.action) parts.push(`**Task:** ${craftInputs.action}`);
    if (craftInputs.format) parts.push(`**Format:** ${craftInputs.format}`);
    if (craftInputs.threshold) parts.push(`**Quality Standards:** ${craftInputs.threshold}`);

    let prompt = parts.join("

");

    if (careNotes.consider || careNotes.analyze || careNotes.reflect) {
      prompt += "

---
**Additional Notes:**";
      if (careNotes.consider) prompt += `
- Considerations: ${careNotes.consider}`;
      if (careNotes.analyze) prompt += `
- Analysis: ${careNotes.analyze}`;
      if (careNotes.reflect) prompt += `
- Reflections: ${careNotes.reflect}`;
    }

    setGenerated(prompt);
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const resetAll = () => {
    setCategory(null);
    setCraftInputs({ context: "", role: "", action: "", format: "", threshold: "" });
    setCareNotes({ consider: "", analyze: "", reflect: "", evaluate: "" });
    setGenerated("");
  };

  const filledCount = CRAFT_FIELDS.filter((f) => craftInputs[f.key].trim()).length;

  const handleCategoryKeyDown = (e, catId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setCategory(catId);
    }
  };

  return (
    <div>
      <div style={s.hero}>
        <h2 style={s.heroTitle}>🛒 CareCart Prompt Builder</h2>
        <p style={s.heroSub}>Build powerful AI prompts using the CRAFT framework, guided by CARE thinking principles.</p>
      </div>

      {/* Category Selection */}
      <section style={s.card} aria-labelledby="category-heading">
        <h3 id="category-heading" style={s.cardTitle}>📂 Choose Your Category</h3>
        <p style={{ ...s.cardDesc, marginBottom: 16 }}>Select the domain for your prompt to get contextual guidance.</p>
        <div style={s.grid3} role="radiogroup" aria-label="Prompt category">
          {PROMPT_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              role="radio"
              aria-checked={category === cat.id}
              tabIndex={0}
              onClick={() => setCategory(cat.id)}
              onKeyDown={(e) => handleCategoryKeyDown(e, cat.id)}
              style={{
                padding: 16,
                borderRadius: 12,
                border: `2px solid ${category === cat.id ? "#60a5fa" : "#475569"}`,
                background: `${category === cat.id ? "rgba(59,130,246,0.15)" : "#0f172a"}`,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden="true">{cat.icon}</div>
              <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: 14, marginBottom: 4 }}>{cat.label}</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>{cat.examples.join(" • ")}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CRAFT Builder */}
      <section style={s.card} aria-labelledby="craft-heading">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <h3 id="craft-heading" style={s.cardTitle}>
            ✨ CRAFT Your Prompt
            <span style={s.tag("#60a5fa")} aria-label=`${filledCount} of 5 fields filled`}>{filledCount}/5 fields</span>
          </h3>
          <button onClick={resetAll} style={s.btnSecondary} aria-label="Reset all prompt fields">Reset All</button>
        </div>

        {CRAFT_FIELDS.map((field, i) => {
          const fieldId = `craft-${field.key}`;
          const hintId = `craft-${field.key}-hint`;
          return (
            <div key={field.key} style={{ marginBottom: 20 }}>
              <label htmlFor={fieldId} style={s.label}>
                <span aria-hidden="true">{field.icon}</span> {field.label}
                <span style={{ color: "#94a3b8", fontWeight: 400 }}> — {["Set the scene", "Define the expert", "Specify the task", "Structure the output", "Set quality bars"][i]}</span>
              </label>
              <textarea
                id={fieldId}
                style={s.textarea}
                placeholder={field.placeholder}
                value={craftInputs[field.key]}
                onChange={(e) => updateCraft(field.key, e.target.value)}
                rows={3}
                aria-describedby={hintId}
              />
              <p id={hintId} style={s.hint}>💡 {field.hint}</p>
            </div>
          );
        })}
      </section>

      {/* CARE Thinking (collapsible) */}
      <section style={s.card} aria-labelledby="care-heading">
        <button
          onClick={() => setShowCare(!showCare)}
          aria-expanded={showCare}
          aria-controls="care-panel"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", width: "100%", background: "none", border: "none", padding: 0, textAlign: "left" }}
        >
          <h3 id="care-heading" style={s.cardTitle}>🧠 CARE Thinking Notes <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 400 }}>(Optional)</span></h3>
          <span style={{ fontSize: 20, color: "#94a3b8", transition: "transform 0.2s", transform: showCare ? "rotate(180deg)" : "rotate(0deg)" }} aria-hidden="true">▼</span>
        </button>
        <p style={{ ...s.cardDesc, marginTop: 4 }}>Use CARE to think critically before, during, and after prompt creation.</p>

        {showCare && (
          <div id="care-panel" style={{ marginTop: 20 }}>
            <div style={s.grid2}>
              {CARE_STEPS.map((step) => {
                const noteId = `care-${step.key}`;
                return (
                  <div key={step.key} style={{ padding: 16, borderRadius: 12, border: `1px solid ${step.color}40`, background: `${step.color}10` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={s.badge(step.color)} aria-hidden="true">{step.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: step.color, fontSize: 14 }}>{step.label}</div>
                        <div style={{ fontSize: 13, color: "#cbd5e1" }}>{step.description}</div>
                      </div>
                    </div>
                    <label htmlFor={noteId} className="sr-only">{step.label} notes</label>
                    <textarea
                      id={noteId}
                      style={{ ...s.textarea, minHeight: 70, borderColor: `${step.color}40` }}
                      placeholder=`Your ${step.label.toLowerCase()} notes...`
                      value={careNotes[step.key]}
                      onChange={(e) => updateCare(step.key, e.target.value)}
                      rows={2}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Generate */}
      <div style={{ textAlign: "center", margin: "32px 0" }}>
        <button
          onClick={generatePrompt}
          style={{ ...s.btnPrimary, fontSize: 18, padding: "16px 48px", opacity: filledCount === 0 ? 0.5 : 1 }}
          disabled={filledCount === 0}
          aria-label={filledCount === 0 ? "Fill at least one CRAFT field to generate a prompt" : "Generate your CRAFT prompt"}
        >
          🚀 Generate Prompt
        </button>
      </div>

      {/* Output */}
      {generated && (
        <div ref={outputRef} style={{ ...s.card, position: "relative", borderColor: "#60a5fa" }} aria-live="polite" role="region" aria-label="Generated prompt output">
          <h3 style={{ ...s.cardTitle, marginBottom: 16 }}>📝 Your Generated Prompt</h3>
          <button onClick={copyToClipboard} style={s.copyBtn} aria-label={copied ? "Prompt copied to clipboard" : "Copy prompt to clipboard"}>
            {copied ? "✅ Copied!" : "📋 Copy"}
          </button>
          <div style={s.outputBox} role="textbox" aria-readonly="true" aria-label="Generated prompt text" tabIndex={0}>{generated}</div>
          <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <p style={{ fontSize: 14, color: "#34d399", fontWeight: 600 }}>✅ CARE Evaluation Checklist</p>
            <p style={{ fontSize: 14, color: "#cbd5e1", marginTop: 4 }}>After getting your AI response, evaluate it: Is it accurate? Does it meet your needs? What would you change? Does it reflect any biases?</p>
          </div>
        </div>
      )}
    </div>
  );
      }

/* --- AI READINESS ASSESSMENT --- */
function ReadinessAssessment() {
  const [institutionName, setInstitutionName] = useState("");
  const [sector, setSector] = useState("");
  const [scores, setScores] = useState({});
  const [currentDim, setCurrentDim] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [viewMode, setViewMode] = useState("assessment"); // assessment | results

  const setScore = (dimKey, qIdx, value) => {
    setScores((p) => ({
      ...p,
      [`${dimKey}_${qIdx}`]: value,
    }));
  };

  const getDimScore = (dimKey) => {
    const dim = ASSESSMENT_DIMENSIONS.find((d) => d.key === dimKey);
    const vals = dim.questions.map((_, i) => scores[`${dimKey}_${i}`] || 0);
    const filled = vals.filter((v) => v > 0);
    return filled.length > 0 ? filled.reduce((a, b) => a + b, 0) / filled.length : 0;
  };

  const getOverallScore = () => {
    const dimScores = ASSESSMENT_DIMENSIONS.map((d) => getDimScore(d.key));
    const filled = dimScores.filter((v) => v > 0);
    return filled.length > 0 ? filled.reduce((a, b) => a + b, 0) / filled.length : 0;
  };

  const totalQuestions = ASSESSMENT_DIMENSIONS.reduce((a, d) => a + d.questions.length, 0);
  const answeredQuestions = Object.keys(scores).filter((k) => scores[k] > 0).length;
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);

  const getRecommendations = () => {
    const dimScores = ASSESSMENT_DIMENSIONS.map((d) => ({ ...d, score: getDimScore(d.key) }));
    const sorted = [...dimScores].sort((a, b) => a.score - b.score);
    const weakest = sorted.filter((d) => d.score > 0 && d.score < 3.5).slice(0, 3);
    const strongest = sorted.filter((d) => d.score >= 3.5).reverse().slice(0, 3);
    return { weakest, strongest };
  };

  const generateReport = () => {
    setShowResults(true);
    setViewMode("results");
  };

  const resetAssessment = () => {
    setScores({});
    setCurrentDim(0);
    setShowResults(false);
    setViewMode("assessment");
  };

  const overall = getOverallScore();
  const readiness = getReadinessLevel(overall);
  const { weakest, strongest } = getRecommendations();

  if (viewMode === "results" && showResults) {
    return (
      <div role="region" aria-label="AI Readiness Assessment Results">
        <div style={s.hero}>
          <h2 style={s.heroTitle}>📊 AI Readiness Report</h2>
          <p style={s.heroSub}>{institutionName || "Your Institution"} {sector ? `• ${sector}` : ""}</p>
        </div>

        {/* Overall Score */}
        <section style={{ ...s.card, textAlign: "center", borderColor: readiness.color, background: `linear-gradient(135deg, ${readiness.color}10, ${readiness.color}05)` }} aria-label="Overall readiness score">
          <div style={{ fontSize: 64, marginBottom: 8 }} aria-hidden="true">{readiness.emoji}</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: readiness.color }} aria-label=`Overall score: ${overall.toFixed(1)} out of 5`}>
            {overall.toFixed(1)}<span style={{ fontSize: 24, color: "#94a3b8" }}>/5.0</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: readiness.color, marginBottom: 8 }}>{readiness.level}</div>
          <p style={{ fontSize: 16, color: "#cbd5e1", maxWidth: 500, margin: "0 auto" }}>{readiness.desc}</p>
        </section>

        {/* Dimension Scores */}
        <section style={s.card} aria-labelledby="dim-scores-heading">
          <h3 id="dim-scores-heading" style={s.cardTitle}>📈 Dimension Scores</h3>
          <div style={{ marginTop: 16 }}>{ASSESSMENT_DIMENSIONS.map((dim) => {
              const dimScore = getDimScore(dim.key);
              const dimLevel = getReadinessLevel(dimScore);
              return (
                <div key={dim.key} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span aria-hidden="true">{dim.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>{dim.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={s.tag(dimLevel.color)}>{dimLevel.level}</span>
                      <span style={{ fontWeight: 700, color: dimLevel.color }}>{dimScore.toFixed(1)}</span>
                    </div>
                  </div>
                  <div style={s.progressBar()} role="progressbar" aria-valuenow={Math.round(dimScore * 20)} aria-valuemin={0} aria-valuemax={100} aria-label=`${dim.label}: ${dimScore.toFixed(1)} out of 5`}>
                    <div style={s.progressFill((dimScore / 5) * 100, dim.color)} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recommendations */}
        <div style={s.grid2}>
          <section style={{ ...s.card, borderColor: "rgba(251,113,133,0.25)" }} aria-labelledby="priority-heading">
            <h3 id="priority-heading" style={{ ...s.cardTitle, color: "#fb7185" }}>🎯 Priority Areas</h3>
            <p style={{ ...s.cardDesc, marginBottom: 12 }}>Focus your efforts here for maximum impact.</p>
            {weakest.length > 0 ? weakest.map((d) => (
              <div key={d.key} style={{ padding: 12, borderRadius: 10, background: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={s.badge(d.color)} aria-hidden="true">{d.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>{d.label}</div>
                  <div style={{ fontSize: 13, color: "#fb7185" }}>Score: {d.score.toFixed(1)} — Needs attention</div>
                </div>
              </div>
            )) : <p style={{ color: "#cbd5e1", fontSize: 14 }}>All dimensions scoring above 3.5 — great work!</p>}
          </section>

          <section style={{ ...s.card, borderColor: "rgba(52,211,153,0.25)" }} aria-labelledby="strengths-heading">
            <h3 id="strengths-heading" style={{ ...s.cardTitle, color: "#34d399" }}>💪 Strengths</h3>
            <p style={{ ...s.cardDesc, marginBottom: 12 }}>Build on these existing capabilities.</p>
            {strongest.length > 0 ? strongest.map((d) => (
              <div key={d.key} style={{ padding: 12, borderRadius: 10, background: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={s.badge(d.color)} aria-hidden="true">{d.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>{d.label}</div>
                  <div style={{ fontSize: 13, color: "#34d399" }}>Score: {d.score.toFixed(1)} — Strong</div>
                </div>
              </div>
            )) : <p style={{ color: "#cbd5e1", fontSize: 14 }}>Complete more of the assessment to see strengths.</p>}
          </section>
        </div>

        {/* Action Plan */}
        <section style={s.card} aria-labelledby="action-heading">
          <h3 id="action-heading" style={s.cardTitle}>🗺️ Recommended Next Steps</h3>
          <div style={{ marginTop: 12 }}>
            {[
              { phase: "Quick Wins (0-3 months)", items: ["Establish an AI governance committee", "Create an AI acceptable use policy", "Audit current tool ecosystem for AI capabilities"] },
              { phase: "Foundation Building (3-6 months)", items: ["Launch AI literacy training for all staff", "Identify 2-3 pilot AI projects", "Develop data governance framework"] },
              { phase: "Scale & Optimize (6-12 months)", items: ["Expand successful pilots institution-wide", "Build strategic vendor partnerships", "Create ongoing AI skills development program"] },
            ].map((phase, i) => (
              <div key={i} style={{ padding: 16, borderRadius: 12, background: "#0f172a", marginBottom: 12, borderLeft: `4px solid ${["#60a5fa", "#a78bfa", "#34d399"][i]}` }}>
                <div style={{ fontWeight: 700, color: `${["#60a5fa", "#a78bfa", "#34d399"][i]}`, marginBottom: 8, fontSize: 15 }}>{phase.phase}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {phase.items.map((item, j) => (
                    <li key={j} style={{ fontSize: 14, color: "#cbd5e1", padding: "4px 0", paddingLeft: 16, borderLeft: "2px solid #475569", marginLeft: 8, marginBottom: 4 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div style={{ textAlign: "center", margin: "32px 0", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setViewMode("assessment")} style={s.btnSecondary}>← Back to Assessment</button>
          <button onClick={resetAssessment} style={s.btnSecondary}>🔄 Start Over</button>
          <button onClick={() => window.print()} style={s.btnPrimary}>🖨️ Print Report</button>
        </div>
      </div>
    );
      }

  return (
    <div>
      <div style={s.hero}>
        <h2 style={s.heroTitle}>🏛️ AI Readiness Assessment</h2>
        <p style={s.heroSub}>Evaluate your institution's preparedness for AI adoption across 8 key dimensions.</p>
      </div>

      {/* Institution Info */}
      <section style={s.card} aria-labelledby="profile-heading">
        <h3 id="profile-heading" style={s.cardTitle}>📋 Institution Profile</h3>
        <div style={s.grid2}>
          <div>
            <label htmlFor="inst-name" style={s.label}>Institution Name</label>
            <input id="inst-name" style={s.input} placeholder="e.g., University of the West Indies" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="inst-sector" style={s.label}>Sector</label>
            <select id="inst-sector" style={s.input} value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="">Select sector...</option>
              <option value="Higher Education">Higher Education</option>
              <option value="K-12 Education">K-12 Education</option>
              <option value="Government">Government</option>
              <option value="Corporate / Business">Corporate / Business</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Nonprofit">Nonprofit</option>
              <option value="Vocational Training">Vocational Training</option>
            </select>
          </div>
        </div>
      </section>

      {/* Progress */}
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>Progress: {answeredQuestions}/{totalQuestions} questions</span>
          <span style={{ fontWeight: 700, color: "#60a5fa" }}>{progress}%</span>
        </div>
        <div style={s.progressBar()} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label=`Assessment progress: ${progress}% complete, ${answeredQuestions} of ${totalQuestions} questions answered`}>
          <div style={s.progressFill(progress, "#60a5fa")} />
        </div>
      </div>

      {/* Dimension Navigation */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, padding: "4px 0" }} role="tablist" aria-label="Assessment dimensions">
        {ASSESSMENT_DIMENSIONS.map((dim, i) => {
          const answered = dim.questions.filter((_, j) => scores[`${dim.key}_${j}`] > 0).length;
          return (
            <button
              key={dim.key}
              role="tab"
              aria-selected={currentDim === i}
              aria-controls={`dim-panel-${dim.key}`}
              id={`dim-tab-${dim.key}`}
              onClick={() => setCurrentDim(i)}
              style={{
                flexShrink: 0,
                padding: "10px 16px",
                borderRadius: 10,
                border: `2px solid ${currentDim === i ? dim.color : "#475569"}`,
                background: `${currentDim === i ? `${dim.color}20` : "transparent"}`,
                color: `${currentDim === i ? dim.color : "#cbd5e1"}`,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span aria-hidden="true">{dim.icon}</span> {dim.label}
              {answered === dim.questions.length && <span style={{ color: "#34d399" }} aria-label="(complete)">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Current Dimension Questions */}
      {(() => {
        const dim = ASSESSMENT_DIMENSIONS[currentDim];
        return (
          <section
            id={`dim-panel-${dim.key}`}
            role="tabpanel"
            aria-labelledby={`dim-tab-${dim.key}`}
            style={{ ...s.card, borderColor: `${dim.color}50` }}
          >
            <h3 style={{ ...s.cardTitle, color: dim.color }}>
              <span aria-hidden="true">{dim.icon}</span> {dim.label}
            </h3>
            <div style={{ marginTop: 16 }}>
              {dim.questions.map((q, qi) => {
                const currentScore = scores[`${dim.key}_${qi}`];
                return (
                  <fieldset key={qi} style={{ marginBottom: 24, padding: 16, borderRadius: 12, background: "#0f172a", border: "none" }}>
                    <legend style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 15, marginBottom: 12 }}>{qi + 1}. {q}</legend>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="radiogroup" aria-label={q}>
                      {SCORE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          role="radio"
                          aria-checked={currentScore === opt.value}
                          onClick={() => setScore(dim.key, qi, opt.value)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: `2px solid ${currentScore === opt.value ? opt.color : "#475569"}`,
                            background: `${currentScore === opt.value ? `${opt.color}25` : "transparent"}`,
                            color: `${currentScore === opt.value ? opt.color : "#cbd5e1"}`,
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                            transition: "all 0.15s",
                          }}
                        >
                          {opt.value}. {opt.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button
                onClick={() => setCurrentDim(Math.max(0, currentDim - 1))}
                disabled={currentDim === 0}
                style={{ ...s.btnSecondary, opacity: currentDim === 0 ? 0.4 : 1 }}
                aria-label="Go to previous dimension"
              >
                ← Previous
              </button>
              {currentDim < ASSESSMENT_DIMENSIONS.length - 1 ? (
                <button onClick={() => setCurrentDim(currentDim + 1)} style={s.btnPrimary} aria-label="Go to next dimension">
                  Next →
                </button>
              ) : (
                <button onClick={generateReport} style={{ ...s.btnSuccess, opacity: answeredQuestions === 0 ? 0.5 : 1 }} disabled={answeredQuestions === 0} aria-label="Generate your AI readiness report">
                  📊 Generate Report
                </button>
              )}
            </div>
          </section>
        );
      })()}
    </div>
  );
}

/* --- MAIN APP --- */
export default function CareCartApp() {
  const [activeTab, setActiveTab] = useState("prompt");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = ACCESSIBILITY_CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <div style={s.app}>
      {/* Skip Navigation */}
      <a href="#main-content" className="skip-link" style={s.skipLink}>Skip to main content</a>

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <div style={s.logoIcon} aria-hidden="true">CC</div>
            <div>
              <div style={s.logoText}>CareCart</div>
              <div style={s.logoSub}>AI Toolkit</div>
            </div>
          </div>
          <nav style={s.nav} role="tablist" aria-label="Main navigation">
            <button
              role="tab"
              aria-selected={activeTab === "prompt"}
              aria-controls="tab-prompt"
              style={s.navBtn(activeTab === "prompt")}
              onClick={() => setActiveTab("prompt")}
            >
              🛒 Prompt Builder
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "assess"}
              aria-controls="tab-assess"
              style={s.navBtn(activeTab === "assess")}
              onClick={() => setActiveTab("assess")}
            >
              🏛️ AI Readiness
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" style={s.main} role="tabpanel">
        {activeTab === "prompt" && <div id="tab-prompt"><PromptBuilder /></div>}
        {activeTab === "assess" && <div id="tab-assess"><ReadinessAssessment /></div>}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "24px", borderTop: "1px solid #475569", color: "#94a3b8", fontSize: 14 }}>
        <p>CareCart AI Toolkit — Powered by CARE & CRAFT Frameworks</p>
        <p style={{ marginTop: 4 }}>Built for educators, institutions, and change-makers across the Caribbean and beyond.</p>
        <p style={{ marginTop: 8, fontSize: 13, color: "#cbd5e1" }}>Designed by <strong style={{ color: "#f8fafc" }}>Dr. Rohan Jowallah</strong></p>
      </footer>
    </div>
  );
}
