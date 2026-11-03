
"use client";

import { useState } from "react";

export default function Home() {
  const [reviews, setReviews] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);

  async function handleAnalyze() {
    setError("");
    setAnalysis(null);

    const reviewList = reviews
      .split(/\n+/)
      .map((review) => review.trim())
      .filter(Boolean);

    if (reviewList.length === 0) {
      setError("Please enter at least one customer review.");
      return;
    }

    if (reviewList.length > 100) {
      setError("Please enter no more than 100 reviews at a time.");
      return;
    }

    if (reviewList.some((review) => review.length > 2000)) {
      setError("Each review must contain no more than 2,000 characters.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_REVIEWRADAR_API_URL;

    if (!apiUrl) {
      setError("API configuration is missing. Please check the Vercel environment variable.");
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
          "Analysis failed. Please try again."
        );
      }

      setAnalysis(data.analysis || data.result || data);
    } catch (err) {
      setError(
        err.message ||
        "Unable to connect to ReviewRadar AI. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  const report = analysis || {};
  const breakdown = report.sentiment_breakdown || {};
  const complaints = Array.isArray(report.themes?.complaints)
    ? report.themes.complaints
    : [];
  const praise = Array.isArray(report.themes?.praise)
    ? report.themes.praise
    : [];
  const featureRequests = Array.isArray(report.themes?.feature_requests)
    ? report.themes.feature_requests
    : [];
  const recommendations = Array.isArray(report.prioritized_recommendations)
    ? report.prioritized_recommendations
    : [];

  const positiveCount = Number(breakdown.positive) || 0;
  const totalReviews = Number(report.reviews_analyzed) || 0;
  const positivePercentage = totalReviews
    ? Math.round((positiveCount / totalReviews) * 100)
    : 0;

  function renderThemes(items) {
    if (items.length === 0) {
      return <p>No findings available.</p>;
    }

    return (
      <ul className="result-list">
        {items.map((item, index) => (
          <li key={index}>
            <strong>
              {typeof item === "string"
                ? item
                : item.title || item.theme || item.name || "Finding"}
            </strong>
            {item.description && <p>{item.description}</p>}
            {item.evidence && (
              <small>Evidence: {Array.isArray(item.evidence)
                ? item.evidence.join("; ")
                : item.evidence}</small>
            )}
          </li>
        ))}
      </ul>
    );
  }

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
          <a className="nav-item" href="#">Review analysis</a>
          <a className="nav-item" href="#">Insights</a>
          <a className="nav-item" href="#">Reports</a>
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
            All systems operational
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
              <p>Analyze feedback to discover what customers really think.</p>
            </div>
            <span className="notice-icon">↗</span>
          </div>

          <div className="section-heading">
            <div>
              <h2>Workspace overview</h2>
              <p>Your analysis metrics will appear here.</p>
            </div>
          </div>

          <div className="metrics-grid">
            <article className="metric-card">
              <span>Reviews analyzed</span>
              <strong>{totalReviews || "—"}</strong>
              <small>{analysis ? "Latest analysis" : "No analyses yet"}</small>
            </article>

            <article className="metric-card">
              <span>Positive sentiment</span>
              <strong>
                {analysis ? `${positivePercentage}%` : "—"}
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
                {analysis ? "Customer complaint themes" : "Awaiting feedback"}
              </small>
            </article>
          </div>

          <section className="analysis-card">
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
              onChange={(event) => setReviews(event.target.value)}
              placeholder={"Paste customer reviews here. Put each review on a separate line.\n\nExample:\nThe app is easy to use, but it loads very slowly.\nI love the design. Please add dark mode."}
            />

            <div className="input-footer">
              <span>{reviews.length} characters</span>
              <button
                className="analyze-button"
                disabled={!reviews.trim() || isAnalyzing}
                onClick={handleAnalyze}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze reviews →"}
              </button>
            </div>

            {isAnalyzing && (
              <p className="loading-text" aria-live="polite">
                ReviewRadar AI is analyzing your customer feedback. This may
                take a little while.
              </p>
            )}

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
          </section>

          {analysis && (
            <section className="results-card" aria-live="polite">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">AI-GENERATED REPORT</p>
                  <h2>Customer insights</h2>
                  <p>Your latest customer feedback analysis.</p>
                </div>
              </div>

              <div className="result-section">
                <h3>Executive summary</h3>
                <p>{report.summary || "No summary available."}</p>
              </div>

              <div className="result-section">
                <h3>Overall sentiment</h3>
                <p>{report.overall_sentiment || "Not available"}</p>
                <div className="results-grid">
                  <div>
                    <strong>{breakdown.positive ?? 0}</strong>
                    <span>Positive</span>
                  </div>
                  <div>
                    <strong>{breakdown.neutral ?? 0}</strong>
                    <span>Neutral</span>
                  </div>
                  <div>
                    <strong>{breakdown.negative ?? 0}</strong>
                    <span>Negative</span>
                  </div>
                </div>
              </div>

              <div className="result-section">
                <h3>Customer complaints</h3>
                {renderThemes(complaints)}
              </div>

              <div className="result-section">
                <h3>What customers appreciate</h3>
                {renderThemes(praise)}
              </div>

              <div className="result-section">
                <h3>Feature requests</h3>
                {renderThemes(featureRequests)}
              </div>

              <div className="result-section">
                <h3>Prioritized recommendations</h3>
                {recommendations.length === 0 ? (
                  <p>No recommendations available.</p>
                ) : (
                  <ul className="result-list">
                    {recommendations.map((item, index) => (
                      <li key={index}>
                        <strong>
                          {item.priority || "Recommendation"}: {item.title || "Suggested action"}
                        </strong>
                        {item.description && <p>{item.description}</p>}
                        {item.evidence && (
                          <small>
                            Evidence: {Array.isArray(item.evidence)
                              ? item.evidence.join("; ")
                              : item.evidence}
                          </small>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
