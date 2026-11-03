
"use client";

import { useState } from "react";

export default function Home() {
  const [reviews, setReviews] = useState("");

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
              <strong>—</strong>
              <small>No analyses yet</small>
            </article>
            <article className="metric-card">
              <span>Positive sentiment</span>
              <strong>—</strong>
              <small>Awaiting feedback</small>
            </article>
            <article className="metric-card">
              <span>Issues identified</span>
              <strong>—</strong>
              <small>Awaiting feedback</small>
            </article>
          </div>

          <section className="analysis-card">
            <div className="card-heading">
              <div>
                <h2>New review analysis</h2>
                <p>Paste customer reviews below to discover actionable insights.</p>
              </div>
              <span className="input-tag">TEXT INPUT</span>
            </div>

            <label htmlFor="reviews">Customer feedback</label>
            <textarea
              id="reviews"
              value={reviews}
              onChange={(event) => setReviews(event.target.value)}
              placeholder={"Paste customer reviews here...\n\nExample:\nThe app is easy to use, but it loads very slowly.\nI love the design. Please add dark mode."}
            />

            <div className="input-footer">
              <span>{reviews.length} characters</span>
              <button
                className="analyze-button"
                disabled={!reviews.trim()}
                onClick={() => alert("Review analysis connection coming next.")}
              >
                Analyze reviews →
              </button>
            </div>
          </section>

          <footer className="footer">
            ReviewRadar · Customer feedback intelligence
          </footer>
        </div>
      </section>
    </main>
  );
}
