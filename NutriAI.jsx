const { useState } = React;

const DARK = "#0D3B2E";
const SAGE = "#52796F";
const LIME = "#B5D43C";
const CREAM = "#F8FAF7";

function MacroBar({ label, value, max, accent }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: SAGE, fontWeight: 600 }}>{label}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={{ fontSize: 14, color: DARK, fontWeight: 700 }}>{value}g</span>
          <span style={{ fontSize: 11, color: "#AAB5AA" }}>{pct}% DV</span>
        </div>
      </div>
      <div style={{ height: 6, background: "#E4EDE4", borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: accent,
            borderRadius: 3,
            transition: "width 1.1s cubic-bezier(.4,0,.2,1)"
          }}
        />
      </div>
    </div>
  );
}

function ScoreRing({ score }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const filled = (score / 10) * circ;
  const color = score >= 7 ? LIME : score >= 5 ? "#F5A623" : "#FF6B6B";
  const label = score >= 7 ? "Excellent" : score >= 5 ? "Average" : "Poor";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 92, height: 92 }}>
        <svg viewBox="0 0 90 90" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
          <circle cx="45" cy="45" r={r} fill="none" stroke="#D8E8D8" strokeWidth="7" />
          <circle
            cx="45" cy="45" r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeDasharray={`${filled} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: DARK, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 9, color: "#AABFAA", marginTop: 1 }}>/ 10</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, marginTop: 5, letterSpacing: "0.3px" }}>{label}</span>
    </div>
  );
}

const EXAMPLES = [
  { icon: "🍳", label: "Eggs & toast", meal: "Two fried eggs with buttered whole wheat toast and a glass of orange juice" },
  { icon: "🍝", label: "Pasta bolognese", meal: "Large plate of pasta bolognese with grated parmesan and glass of red wine" },
  { icon: "🥗", label: "Caesar salad", meal: "Large Caesar salad with grilled chicken breast, croutons and Caesar dressing" },
  { icon: "🫐", label: "Acai bowl", meal: "Acai bowl with granola, banana, blueberries, honey and almond butter" },
];

const card = {
  background: "#fff",
  borderRadius: 18,
  border: "1px solid #E4EDE4",
  padding: "18px 20px",
  marginBottom: 12,
};

function NutriAI() {
  const [meal, setMeal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async (text) => {
    const mealText = text || meal;
    if (!mealText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Replace with your deployed Cloudflare Worker URL
      const WORKER_URL = "https://nutriai-worker.YOUR-SUBDOMAIN.workers.dev";

      const resp = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal: mealText })
      });

      const data = await resp.json();
      const raw = (data.content || []).map(i => i.text || "").join("");
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Bad response");
      setResult(JSON.parse(match[0]));
    } catch (e) {
      setError("Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  const Logo = () => (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: LIME, fontWeight: 900, fontSize: 17, letterSpacing: "-0.3px" }}>NutriAI</span>
      <span style={{
        background: LIME, color: DARK,
        fontSize: 8, fontWeight: 900,
        padding: "2px 6px", borderRadius: 4, letterSpacing: "1px"
      }}>BETA</span>
    </div>
  );

  if (result) {
    return (
      <div style={{ background: CREAM, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div style={{ background: DARK, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo />
          <button
            onClick={() => { setResult(null); setMeal(""); }}
            style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600,
              padding: "6px 12px", borderRadius: 8, cursor: "pointer"
            }}
          >
            ← New analysis
          </button>
        </div>

        <div style={{ maxWidth: 540, margin: "0 auto", padding: "16px 16px 48px" }}>
          <div style={{ ...card, padding: "12px 16px", background: "#F0F5F0" }}>
            <div style={{ fontSize: 10, color: SAGE, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Analyzed meal</div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>{meal}</div>
          </div>

          <div style={card}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: SAGE, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
                  {result.meal_type}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 54, fontWeight: 900, color: DARK, lineHeight: 1 }}>{result.calories}</span>
                  <span style={{ fontSize: 14, color: "#BCC8BC", marginLeft: 2 }}>kcal</span>
                </div>
              </div>
              <ScoreRing score={result.health_score} />
            </div>
            <MacroBar label="Protein" value={result.protein_g} max={50} accent="#5B9BD5" />
            <MacroBar label="Carbohydrates" value={result.carbs_g} max={130} accent="#F5A623" />
            <MacroBar label="Fat" value={result.fat_g} max={65} accent="#E07070" />
            <MacroBar label="Fiber" value={result.fiber_g} max={25} accent={LIME} />
          </div>

          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 12, letterSpacing: "-0.2px" }}>Nutritional highlights</div>
            {result.highlights.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9, alignItems: "flex-start" }}>
                <span style={{ color: LIME, fontWeight: 900, fontSize: 15, lineHeight: "20px", flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: "#555", lineHeight: 1.55 }}>{h}</span>
              </div>
            ))}
          </div>

          <div style={{ background: DARK, borderRadius: 18, padding: "18px 20px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: LIME, marginBottom: 12 }}>How to improve this meal</div>
            {result.tips.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9, alignItems: "flex-start" }}>
                <span style={{ color: LIME, fontWeight: 900, fontSize: 13, flexShrink: 0, lineHeight: "20px" }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.55 }}>{t}</span>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "#C0CFBC", marginTop: 20 }}>
            Powered by Claude AI · Open source on GitHub
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: CREAM, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background: DARK, padding: "32px 20px 48px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.09)",
          borderRadius: 100, padding: "6px 16px", marginBottom: 18
        }}>
          <Logo />
        </div>
        <h1 style={{
          color: "#fff", fontSize: 28, fontWeight: 900,
          margin: "0 0 10px", letterSpacing: "-1px", lineHeight: 1.15
        }}>
          What did you eat?
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0 }}>
          Instant calories, macros & health score — powered by AI
        </p>
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "0 16px 48px" }}>
        <div style={{
          background: "#fff", borderRadius: 20,
          padding: 20,
          boxShadow: "0 10px 40px rgba(13,59,46,0.10)",
          marginTop: -22,
          marginBottom: 16,
          border: "1px solid #E4EDE4"
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: SAGE, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
            Describe your meal
          </div>
          <textarea
            value={meal}
            onChange={e => setMeal(e.target.value)}
            placeholder="e.g. Two scrambled eggs with whole wheat toast, a banana, and black coffee..."
            style={{
              width: "100%", height: 90,
              padding: "12px 14px",
              border: `1.5px solid ${meal ? SAGE + "66" : "#E4EDE4"}`,
              borderRadius: 12,
              fontSize: 14, color: DARK,
              resize: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              outline: "none",
              background: CREAM,
              lineHeight: 1.6,
              transition: "border-color 0.2s"
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                analyze(meal);
              }
            }}
          />

          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => { setMeal(ex.meal); analyze(ex.meal); }}
                style={{
                  fontSize: 11, fontWeight: 600,
                  padding: "5px 11px", borderRadius: 100,
                  border: "1.5px solid #D8E8D0",
                  background: "#F2F8F2",
                  color: SAGE,
                  cursor: "pointer"
                }}
              >
                {ex.icon} {ex.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => analyze(meal)}
            disabled={loading || !meal.trim()}
            style={{
              marginTop: 14, width: "100%",
              background: loading || !meal.trim() ? "#E4EDE4" : LIME,
              color: loading || !meal.trim() ? "#AABFAA" : DARK,
              border: "none", borderRadius: 12,
              padding: "14px 0", fontSize: 14,
              fontWeight: 800,
              cursor: loading || !meal.trim() ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              letterSpacing: "-0.2px"
            }}
          >
            {loading ? "Analyzing..." : "Analyze nutrition →"}
          </button>

          {error && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "#FFF0F0", borderRadius: 10, color: "#C0392B", fontSize: 12 }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>🤖</div>
            <div style={{ fontSize: 14, color: SAGE, fontWeight: 600 }}>AI is analyzing your meal...</div>
            <div style={{ fontSize: 12, color: "#AABFAA", marginTop: 4 }}>Calculating calories, macros & health score</div>
          </div>
        )}

        {!loading && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#C0CFBC", textTransform: "uppercase", letterSpacing: "1px", textAlign: "center", marginBottom: 14 }}>
              How it works
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { n: "1", text: "Describe your meal in natural language" },
                { n: "2", text: "AI analyzes nutritional content instantly" },
                { n: "3", text: "Get calories, macros & health tips" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "#fff", borderRadius: 14,
                  padding: "14px 10px", textAlign: "center",
                  border: "1px solid #E4EDE4"
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: DARK, color: LIME,
                    fontSize: 12, fontWeight: 900,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 8px"
                  }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: "#667", lineHeight: 1.55 }}>{s.text}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "#C0CFBC", marginTop: 24 }}>
          Powered by Claude AI · Open source on GitHub
        </p>
      </div>
    </div>
  );
}
