
"use client";

import { useState } from "react";

const COLORS = {
  blue: "#6658E8",
  green: "#159B72",
  red: "#E05260",
  orange: "#D99532",
  text: "#182033",
  muted: "#7B8498",
  border: "#E8EAF2",
  surface: "#FFFFFF",
  background: "#F6F7FB"
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
    return (
      <p style={{ color: COLORS.muted }}>
        No findings identified.
      </p>
    );
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
              padding: 18,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
              background: COLORS.surface
            }}
          >
            <strong style={{ color: COLORS.text }}>
              {title}
            </strong>

            {description && (
              <p style={{ color: COLORS.muted, margin: "8px 0 0", lineHeight: 1.7 }}>
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
    <article className="sentiment-card">
      <span className="sentiment-label">{label}</span>

      <div className="sentiment-percentage" style={{ color }}>
        {percentage}%
      </div>

      <p className="sentiment-count">
        {count} of {total} reviews
      </p>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            background: color
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
        "Unable to connect to RevZeno AI. Please try again."
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

  const resultCard = {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 24,
    marginTop: 18,
    boxShadow: "0 4px 18px rgba(25, 35, 70, 0.035)"
  };

  const resultHeading = {
    color: COLORS.text,
    fontSize: 17,
    margin: "0 0 16px"
  };

  return (
    <main className="app-shell">

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-mark">Z</div>
          <span>RevZeno</span>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          <a className="nav-item active" href="#">
            <span>◫</span> Overview
          </a>

          <a className="nav-item" href="#analysis">
            <span>⌕</span> Review analysis
          </a>

          <a className="nav-item" href="#insights">
            <span>✧</span> Insights
          </a>

          <a className="nav-item" href="#recommendations">
            <span>▤</span> Reports
          </a>
        </nav>

        <div className="sidebar-bottom">

          <div className="workspace-label">PREFERENCES</div>

          <a className="nav-item" href="#">
            <span>⚙</span> Settings
          </a>

          <div className="profile">
            <div className="avatar">D</div>

            <div className="profile-details">
              <strong>My workspace</strong>
              <small>Free plan</small>
            </div>

            <span className="profile-menu">···</span>
          </div>

        </div>
      </aside>

      <section className="main-content">

        <header className="topbar">

          <div className="breadcrumb">
            Workspace <span>/</span> Overview
          </div>

          <div className="topbar-right">
            <span className="status-dot"></span>
            <span>AI service connected</span>
            <div className="topbar-avatar">D</div>
          </div>

        </header>

        <div className="dashboard">

          <div className="welcome-row">

            <div>
              <p className="eyebrow">
                CUSTOMER INTELLIGENCE PLATFORM
              </p>

              <h1>Good insights start here.</h1>

              <p className="subtitle">
                Turn customer voices into smarter business decisions.
              </p>
            </div>

            <span className="date-label">
              <span>✧</span> Your workspace
            </span>

          </div>

          <div className="notice">

            <div className="notice-content">
              <div className="notice-icon">✦</div>

              <div>
                <strong>Your customers are telling you what matters.</strong>

                <p>
                  Discover patterns, uncover problems and find opportunities
                  hidden in customer feedback.
                </p>
              </div>
            </div>

            <div className="notice-decoration">✧</div>

          </div>

          <div className="section-heading">

            <div>
              <h2>Workspace overview</h2>
              <p>Your latest customer intelligence metrics.</p>
            </div>

            <span className="live-label">
              <span className="status-dot"></span> LIVE WORKSPACE
            </span>

          </div>

          <div className="metrics-grid">

            <article className="metric-card">
              <div className="metric-top">
                <span>Reviews analyzed</span>
                <div className="metric-icon purple">▤</div>
              </div>

              <strong>{analysis ? totalReviews : "—"}</strong>

              <small>
                {analysis ? "Latest analysis" : "Awaiting feedback"}
              </small>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Positive sentiment</span>
                <div className="metric-icon green">↗</div>
              </div>

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
              <div className="metric-top">
                <span>Issues identified</span>
                <div className="metric-icon orange">⚑</div>
              </div>

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
                <div className="card-title-row">
                  <div className="section-icon">✧</div>
                  <h2>New review analysis</h2>
                </div>

                <p>
                  Transform raw customer feedback into actionable intelligence.
                </p>
              </div>

              <span className="input-tag">AI POWERED</span>

            </div>

            <label htmlFor="reviews">
              Customer feedback
            </label>

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
                {" "}reviews · Maximum 100
              </span>

              <button
                className="analyze-button"
                disabled={!reviews.trim() || isAnalyzing}
                onClick={handleAnalyze}
              >
                {isAnalyzing
                  ? "Analyzing..."
                  : "Analyze reviews →"}
              </button>

            </div>

            {isAnalyzing && (
              <div className="loading-panel" role="status">
                <div className="loading-spinner"></div>

                <div>
                  <strong>RevZeno AI is working...</strong>
                  <p>
                    Analyzing sentiment, customer themes and recommendations.
                    Please wait.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="error-panel" role="alert">
                <strong>Analysis unsuccessful</strong>
                <p>{error}</p>
              </div>
            )}

          </section>

          {analysis && (
            <section id="insights" className="results-section">

              <div className="section-heading">
                <div>
                  <p className="eyebrow">AI-GENERATED REPORT</p>
                  <h2>Your customer intelligence report</h2>
                  <p>
                    Analysis of {totalReviews} customer reviews.
                  </p>
                </div>

                <span className="report-label">
                  <span className="status-dot"></span> Analysis complete
                </span>
              </div>

              <article style={resultCard}>
                <h3 style={resultHeading}>Executive summary</h3>

                <p style={{ color: COLORS.muted, lineHeight: 1.9, margin: 0 }}>
                  {summary || "No summary was provided."}
                </p>
              </article>

              <article style={resultCard}>

                <h3 style={resultHeading}>Sentiment analysis</h3>

                <p style={{ color: COLORS.muted, marginBottom: 20 }}>
                  Overall sentiment:{" "}
                  <strong style={{ color: COLORS.text }}>
                    {overallSentiment || "Not available"}
                  </strong>
                </p>

                <div className="sentiment-grid">

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
                  <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 14 }}>
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
                          className="recommendation-item"
                        >

                          <div className="recommendation-header">

                            <strong>
                              {getText(item?.title) || "Suggested action"}
                            </strong>

                            <span
                              style={{
                                color: priorityColor,
                                background: `${priorityColor}14`
                              }}
                              className="priority-badge"
                            >
                              {priority} priority
                            </span>

                          </div>

                          {item?.description && (
                            <p className="recommendation-description">
                              {getText(item.description)}
                            </p>
                          )}

                          {getEvidence(item?.evidence) && (
                            <p className="recommendation-evidence">
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
            <div className="footer-brand">
              <span className="footer-mark">Z</span>
              RevZeno
            </div>

            <span>Turn Customer Voices Into Intelligence.</span>

            <span>© 2026 RevZeno</span>
          </footer>

        </div>
      </section>
    </main>
  );
}
