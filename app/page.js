
"use client";

import { useState } from "react";

const COLORS = {
  blue: "#315efb",
  green: "#16865b",
  red: "#d64b4b",
  orange: "#c47a20",
  text: "#202938",
  muted: "#758094",
  border: "#e8ebf1",
  surface: "#ffffff",
  background: "#f7f8fa"
};

function getText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return "";
}

function getEvidence(value) {
  if (Array.isArray(value)) {
    return value.map(getText).filter(Boolean).join(" · ");
  }
  return getText(value);
}

function getFindingTitle(item, fallback) {
  if (typeof item === "string") return item;

  return (
    getText(item?.title) ||
    getText(item?.theme) ||
    getText(item?.name) ||
    fallback
  );
}

function FindingList({ items, fallback }) {
  if (!items.length) {
    return <p style={{ color: COLORS.muted }}>No findings identified.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((item, index) => {
        const title = getFindingTitle(item, fallback);
        const description = getText(item?.description);
        const evidence = getEvidence(item?.evidence);

        return (
          <article
            key={index}
            style={{
              padding: 16,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              background: COLORS.surface
            }}
          >
            <strong style={{ color: COLORS.text }}>{title}</strong>

            {description && (
              <p style={{ color: COLORS.muted, margin: "8px 0 0" }}>
                {description}
              </p>
            )}

            {evidence && (
              <p
                style={{
                  color: COLORS.muted,
                  fontSize: 13,
                  margin: "10px 0 0",
                  lineHeight: 1.6
                }}
              >
                <strong>Evidence:</strong> “{evidence}”
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}

function SentimentCard({ label, count, total, color }) {
  const percentage = total
    ? Math.round((count / total) * 100)
    : 0;

  return (
    <article
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 18,
        minWidth: 0
      }}
    >
      <span style={{ color: COLORS.muted, fontSize: 13 }}>{label}</span>

      <div
        style={{
          fontSize: 27,
          fontWeight: 700,
          color,
          marginTop: 8
        }}
      >
        {percentage}%
      </div>

      <p style={{ color: COLORS.muted, fontSize: 13, margin: "4px 0 12px" }}>
        {count} of {total} reviews
      </p>

      <div
        style={{
          height: 7,
          borderRadius: 20,
          background: "#edf0f4",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: color,
            borderRadius: 20
          }}
        />
      </div>
    </article>
  );
}

export default function Home() {
  const [reviews, setReviews] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyzedReviewCount, setAnalyzedReviewCount] = useState(0);

  async function handleAnalyze() {
    setError("");
    setAnalysis(null);
    setAnalyzedReviewCount(0);

    const reviewList = reviews
      .split(/\n+/)
      .map((review) => review.trim())
      .filter(Boolean);

    if (!reviewList.length) {
      setError("Please enter at least one customer review.");
      return;
    }

    if (reviewList.length > 100) {
      setError("You can analyze up to 100 reviews at a time.");
      return;
    }

    if (reviewList.some((review) => review.length > 2000)) {
      setError("Each review must be 2,000 characters or fewer.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_REVIEWRADAR_API_URL;

    if (!apiUrl) {
      setError("API configuration is missing. Please check Vercel settings.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `${apiUrl.replace(/\/+$/, "")}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            reviews: reviewList
          })
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.error ||
          data.message ||
          "The analysis could not be completed."
        );
      }

      const report = data.analysis || data.result || data;

      setAnalysis(report);
      setAnalyzedReviewCount(reviewList.length);

    } catch (err) {
      setError(
        err.message ||
        "Unable to connect to ReviewRadar AI. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleReviewChange(event) {
    setReviews(event.target.value);
    setAnalysis(null);
    setAnalyzedReviewCount(0);
    setError("");
  }

  const report = analysis || {};
  const breakdown = report.sentiment_breakdown || {};
  const themes = report.themes || {};

  const positiveCount = Number(breakdown.positive) || 0;
  const neutralCount = Number(breakdown.neutral) || 0;
  const negativeCount = Number(breakdown.negative) || 0;

  const totalReviews = analyzedReviewCount;

  const complaints = Array.isArray(themes.complaints)
    ? themes.complaints
    : [];

  const praise = Array.isArray(themes.praise)
    ? themes.praise
    : [];

  const featureRequests = Array.isArray(themes.feature_requests)
    ? themes.feature_requests
    : [];

  const recommendations = Array.isArray(report.prioritized_recommendations)
    ? report.prioritized_recommendations
    : [];

  const totalClassified =
    positiveCount + neutralCount + negativeCount;

  const sentimentIsComplete =
    analysis && totalClassified === totalReviews;

  const summary = getText(report.summary);
  const overallSentiment = getText(report.overall_sentiment);

  const resultHeading = {
    color: COLORS.text,
    fontSize: 18,
    margin: "0 0 14px"
  };

  const resultCard = {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: 22,
    marginTop: 18
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">R</div>
          <span>ReviewRadar</span>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav className="navigation">
          <a className="nav-item active" href="#">Overview</a>
          <a className="nav-item" href="#analysis">Review analysis</a>
          <a className="nav-item" href="#insights">Insights</a>
          <a className="nav-item" href="#recommendations">Reports</a>
        </nav>

        <div className="sidebar-bottom">
          <p className="nav-label">PREFERENCES</p>
          <a className="nav-item" href="#">Settings</a>

          <div className="profile">
            <div className="avatar">D</div>
            <div>
              <strong>My workspace</strong>
              <small>Free plan</small>
            </div>
          </div>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <span>Workspace / Overview</span>

          <div className="topbar-right">
            <span className="status-dot"></span>
            AI service connected
          </div>
        </header>

        <div className="dashboard">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">CUSTOMER INTELLIGENCE</p>
              <h1>Overview</h1>
              <p className="subtitle">
                Understand your customers. Make better decisions.
              </p>
            </div>

            <span className="date-label">Your workspace</span>
          </div>

          <div className="notice">
            <div>
              <strong>Your customer insights start here.</strong>
              <p>
                Analyze feedback to discover what customers really think.
              </p>
            </div>
            <span className="notice-icon">↗</span>
          </div>

          <div className="section-heading">
            <div>
              <h2>Workspace overview</h2>
              <p>Your latest analysis metrics.</p>
            </div>
          </div>

          <div className="metrics-grid">
            <article className="metric-card">
              <span>Reviews analyzed</span>
              <strong>{analysis ? totalReviews : "—"}</strong>
              <small>
                {analysis ? "Latest analysis" : "Awaiting feedback"}
              </small>
            </article>

            <article className="metric-card">
              <span>Positive sentiment</span>
              <strong>
                {analysis && totalReviews
                  ? `${Math.round((positiveCount / totalReviews) * 100)}%`
                  : "—"}
              </strong>
              <small>
                {analysis
                  ? `${positiveCount} positive reviews`
                  : "Awaiting feedback"}
              </small>
            </article>

            <article className="metric-card">
              <span>Issues identified</span>
              <strong>{analysis ? complaints.length : "—"}</strong>
              <small>
                {analysis
                  ? "Customer complaint themes"
                  : "Awaiting feedback"}
              </small>
            </article>
          </div>

          <section className="analysis-card" id="analysis">
            <div className="card-heading">
              <div>
                <h2>New review analysis</h2>
                <p>
                  Paste customer reviews below to discover actionable insights.
                </p>
              </div>

              <span className="input-tag">TEXT INPUT</span>
            </div>

            <label htmlFor="reviews">Customer feedback</label>

            <textarea
              id="reviews"
              value={reviews}
              onChange={handleReviewChange}
              placeholder={"Paste customer reviews here. Put each review on a separate line.\n\nExample:\nThe app is easy to use, but it loads very slowly.\nI love the design. Please add dark mode."}
            />

            <div className="input-footer">
              <span>
                {reviews.length} characters ·{" "}
                {reviews.split(/\n+/).filter((line) => line.trim()).length}
                {" "}reviews
              </span>

              <button
                className="analyze-button"
                disabled={!reviews.trim() || isAnalyzing}
                onClick={handleAnalyze}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze reviews →"}
              </button>
            </div>

            {isAnalyzing && (
              <div
                role="status"
                style={{
                  marginTop: 18,
                  padding: 16,
                  background: "#eef3ff",
                  borderRadius: 10,
                  color: COLORS.blue
                }}
              >
                <strong>ReviewRadar AI is working...</strong>
                <p style={{ margin: "6px 0 0", fontSize: 13 }}>
                  Analyzing sentiment, customer themes and recommendations.
                  Please wait.
                </p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 10,
                  color: COLORS.red,
                  background: "#fff0f0",
                  border: "1px solid #f5d2d2"
                }}
              >
                {error}
              </div>
            )}
          </section>

          {analysis && (
            <section id="insights" style={{ marginTop: 30 }}>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">AI-GENERATED REPORT</p>
                  <h2>Customer insights</h2>
                  <p>
                    Analysis of {totalReviews} customer reviews.
                  </p>
                </div>
              </div>

              <article style={resultCard}>
                <h3 style={resultHeading}>Executive summary</h3>
                <p style={{ color: COLORS.muted, lineHeight: 1.8 }}>
                  {summary || "No summary was provided."}
                </p>
              </article>

              <article style={resultCard}>
                <h3 style={resultHeading}>Sentiment analysis</h3>

                <p style={{ color: COLORS.muted, marginBottom: 18 }}>
                  Overall sentiment:{" "}
                  <strong style={{ color: COLORS.text }}>
                    {overallSentiment || "Not available"}
                  </strong>
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
                    gap: 12
                  }}
                >
                  <SentimentCard
                    label="Positive"
                    count={positiveCount}
                    total={totalReviews}
                    color={COLORS.green}
                  />

                  <SentimentCard
                    label="Neutral"
                    count={neutralCount}
                    total={totalReviews}
                    color={COLORS.orange}
                  />

                  <SentimentCard
                    label="Negative"
                    count={negativeCount}
                    total={totalReviews}
                    color={COLORS.red}
                  />
                </div>

                {!sentimentIsComplete && (
                  <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 12 }}>
                    The AI classified {totalClassified} of {totalReviews} reviews.
                    Percentages are based on the submitted review count.
                  </p>
                )}
              </article>

              <article style={resultCard}>
                <h3 style={resultHeading}>Customer complaints</h3>
                <FindingList
                  items={complaints}
                  fallback="Customer complaint"
                />
              </article>

              <article style={resultCard}>
                <h3 style={resultHeading}>What customers appreciate</h3>
                <FindingList
                  items={praise}
                  fallback="Positive feedback"
                />
              </article>

              <article style={resultCard}>
                <h3 style={resultHeading}>Feature requests</h3>
                <FindingList
                  items={featureRequests}
                  fallback="Feature request"
                />
              </article>

              <article id="recommendations" style={resultCard}>
                <h3 style={resultHeading}>
                  Prioritized recommendations
                </h3>

                {recommendations.length === 0 ? (
                  <p style={{ color: COLORS.muted }}>
                    No recommendations available.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 14 }}>
                    {recommendations.map((item, index) => {
                      const priority = getText(item?.priority) || "Normal";
                      const priorityColor =
                        priority.toLowerCase() === "high"
                          ? COLORS.red
                          : priority.toLowerCase() === "medium"
                            ? COLORS.orange
                            : COLORS.green;

                      return (
                        <article
                          key={index}
                          style={{
                            padding: 18,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 12,
                            background: COLORS.surface
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: 10
                            }}
                          >
                            <strong style={{ color: COLORS.text }}>
                              {getText(item?.title) || "Suggested action"}
                            </strong>

                            <span
                              style={{
                                color: priorityColor,
                                background: `${priorityColor}14`,
                                borderRadius: 20,
                                padding: "5px 10px",
                                fontSize: 12,
                                fontWeight: 700,
                                textTransform: "uppercase"
                              }}
                            >
                              {priority} priority
                            </span>
                          </div>

                          {item?.description && (
                            <p
                              style={{
                                color: COLORS.muted,
                                lineHeight: 1.7,
                                margin: "12px 0"
                              }}
                            >
                              {getText(item.description)}
                            </p>
                          )}

                          {getEvidence(item?.evidence) && (
                            <p
                              style={{
                                color: COLORS.muted,
                                fontSize: 13,
                                lineHeight: 1.6,
                                margin: 0
                              }}
                            >
                              <strong>Evidence:</strong>{" "}
                              “{getEvidence(item.evidence)}”
                            </p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </article>
            </section>
          )}

          <footer className="footer">
            ReviewRadar · Customer feedback intelligence
          </footer>
        </div>
      </section>
    </main>
  );
}
