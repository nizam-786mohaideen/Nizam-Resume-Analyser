import { useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "sparkle") {
    return (
      <svg {...common}>
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      </svg>
    );
  }
  if (name === "upload") {
    return (
      <svg {...common}>
        <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
        <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
      </svg>
    );
  }
  if (name === "file") {
    return (
      <svg {...common}>
        <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" />
        <path d="M13 3v7h7M8 14h8M8 17h6" />
      </svg>
    );
  }
  if (name === "close") {
    return (
      <svg {...common}>
        <path d="m18 6-12 12M6 6l12 12" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }
  if (name === "arrow") {
    return (
      <svg {...common}>
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
    );
  }
  return null;
}

function formatFileSize(bytes) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  function setResume(nextFile) {
    setError("");
    setResult(null);

    if (!nextFile) {
      setFile(null);
      return;
    }
    if (nextFile.type !== "application/pdf") {
      setFile(null);
      setError("Please choose a PDF file.");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("Your PDF must be 5 MB or smaller.");
      return;
    }
    setFile(nextFile);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setError("Upload your resume to get started.");
      return;
    }
    if (!jd.trim()) {
      setError("Add the job description you want to match against.");
      return;
    }

    setBusy(true);
    setError("");
    setResult(null);
    try {
      const body = new FormData();
      body.append("resume", file);
      body.append("jd", jd);

      const response = await fetch("/api/analyse", {
        method: "POST",
        body,
      });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          response.ok
            ? "The analysis service returned an invalid response."
            : "The analysis service is unavailable. Make sure the backend is running and try again."
        );
      }
      if (!response.ok) {
        throw new Error(data.error || "We couldn't analyse that resume.");
      }
      if (
        typeof data.score !== "number" ||
        !Array.isArray(data.present) ||
        !Array.isArray(data.missing)
      ) {
        throw new Error("The analysis service returned an unexpected response.");
      }
      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reach the analysis service. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  const matchedCount = result ? result.present.length + result.missing.length : 0;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Nizam Resume Analyser home">
          <span className="brand-mark"><Icon name="sparkle" size={21} /></span>
          <span>Nizam <strong>Resume Analyser</strong></span>
        </a>
        <div className="topbar-note">
          <span className="status-dot" />
          Your next opportunity, a little closer
        </div>
      </header>

      <main className="main-content">
        <section className="intro">
          <div className="eyebrow"><Icon name="sparkle" size={15} /> A smarter way to prepare</div>
          <h1>Make your resume<br className="desktop-break" /> <span>work for you.</span></h1>
          <p>
            See how your experience lines up with the role. Get a clear match
            score and the skills to highlight next.
          </p>
        </section>

        <div className="workspace">
          <section className="form-panel">
            <div className="panel-heading">
              <div>
                <span className="step-label">YOUR ANALYSIS</span>
                <h2>Let's get you matched</h2>
              </div>
              <span className="step-count">01 <i>/ 01</i></span>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field-group">
                <div className="field-title">
                  <label htmlFor="resume-upload">Your resume</label>
                  <span>PDF · up to 5 MB</span>
                </div>

                {file ? (
                  <div className="selected-file">
                    <span className="file-icon"><Icon name="file" size={21} /></span>
                    <span className="file-meta">
                      <strong>{file.name}</strong>
                      <small>{formatFileSize(file.size)} · PDF document</small>
                    </span>
                    <button
                      className="remove-file"
                      type="button"
                      aria-label="Remove resume"
                      onClick={() => setResume(null)}
                    >
                      <Icon name="close" size={18} />
                    </button>
                  </div>
                ) : (
                  <label
                    className={`upload-zone${dragging ? " is-dragging" : ""}`}
                    htmlFor="resume-upload"
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      setResume(event.dataTransfer.files[0]);
                    }}
                  >
                    <span className="upload-icon"><Icon name="upload" size={22} /></span>
                    <span className="upload-copy">
                      <strong>Drop your resume here</strong>
                      <span>or <em>browse files</em> on your device</span>
                    </span>
                    <input
                      id="resume-upload"
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(event) => {
                        setResume(event.target.files?.[0] ?? null);
                        event.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="field-group jd-group">
                <div className="field-title">
                  <label htmlFor="job-description">Job description</label>
                  <span>Paste the role details</span>
                </div>
                <textarea
                  id="job-description"
                  value={jd}
                  onChange={(event) => {
                    setJd(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder={"Paste the job description here...\n\nInclude the responsibilities and skills the employer is looking for."}
                  rows={7}
                />
                <div className="textarea-footer">
                  <span>We’ll compare your resume with the skills in this role.</span>
                  <span>{jd.length} characters</span>
                </div>
              </div>

              {error && <p className="error-message" role="alert">{error}</p>}

              <button className="submit-button" type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <span className="spinner" />
                    Reviewing your resume…
                  </>
                ) : (
                  <>
                    Analyse my resume
                    <Icon name="arrow" size={19} />
                  </>
                )}
              </button>
              <p className="privacy-note">
                <Icon name="check" size={14} />
                Your resume is only used for this analysis.
              </p>
            </form>
          </section>

          <aside className={`insight-panel${result ? " has-result" : ""}`} aria-live="polite">
            {result ? (
              <>
                <div className="result-topline">
                  <span className="result-kicker"><span className="status-dot" /> ANALYSIS COMPLETE</span>
                  <span className="result-file">{file?.name}</span>
                </div>
                <div className="score-block">
                  <div className="score-ring" style={{ "--score": `${result.score}%` }}>
                    <div className="score-ring-inner">
                      <strong>{result.score}<small>%</small></strong>
                      <span>MATCH</span>
                    </div>
                  </div>
                  <div className="score-caption">
                    <h2>{result.score >= 75 ? "Looking strong." : result.score >= 45 ? "Good foundation." : "Room to grow."}</h2>
                    <p>
                      {result.basis === "jd"
                        ? "Your resume matches these job requirements."
                        : "No tracked skills were listed in the job description, so we checked against our full skills list."}
                    </p>
                  </div>
                </div>
                <div className="result-summary">
                  <div><span className="summary-dot is-present" /><strong>{result.present.length}</strong><span>skills found</span></div>
                  <div><span className="summary-dot is-missing" /><strong>{result.missing.length}</strong><span>to build on</span></div>
                </div>
                <div className="skill-section">
                  <div className="skill-title">
                    <h3>Skills found</h3><span>{result.present.length}</span>
                  </div>
                  {result.present.length ? (
                    <ul className="skill-list">
                      {result.present.map((skill) => <li className="skill-tag present-tag" key={skill}><Icon name="check" size={13} />{skill}</li>)}
                    </ul>
                  ) : <p className="empty-skills">No matching skills found yet.</p>}
                </div>
                <div className="skill-section missing-section">
                  <div className="skill-title">
                    <h3>Skills to highlight</h3><span>{result.missing.length}</span>
                  </div>
                  {result.missing.length ? (
                    <ul className="skill-list">
                      {result.missing.map((skill) => <li className="skill-tag missing-tag" key={skill}>{skill}</li>)}
                    </ul>
                  ) : <p className="empty-skills">You covered every target skill. Nice work!</p>}
                </div>
                <p className="result-footnote">Based on {matchedCount} tracked skills · Use this as a guide, not a guarantee.</p>
              </>
            ) : (
              <>
                <div className="preview-label"><span className="preview-sparkle"><Icon name="sparkle" size={17} /></span> YOUR RESULTS, AT A GLANCE</div>
                <div className="preview-score">
                  <div className="preview-ring"><span>--<small>%</small></span></div>
                  <div>
                    <h2>Your match score</h2>
                    <p>See where your experience meets the role.</p>
                  </div>
                </div>
                <div className="preview-divider" />
                <div className="preview-skill-row">
                  <span className="preview-check"><Icon name="check" size={13} /></span>
                  <span className="preview-lines"><i /><i /></span>
                  <span className="preview-label-text">Skills found</span>
                </div>
                <div className="preview-skill-row">
                  <span className="preview-minus">+</span>
                  <span className="preview-lines"><i /><i /></span>
                  <span className="preview-label-text">Skills to highlight</span>
                </div>
                <div className="tip-card">
                  <span className="tip-icon"><Icon name="sparkle" size={17} /></span>
                  <p><strong>A little preparation goes a long way.</strong><br />Tailor your resume to the skills that matter for the role.</p>
                </div>
                <div className="preview-footer"><span>01</span><i />Upload your resume to begin</div>
              </>
            )}
          </aside>
        </div>

        <footer className="page-footer">
          <span>Thoughtful preparation makes a difference.</span>
          <span>© {new Date().getFullYear()} Nizam Resume Analyser</span>
        </footer>
      </main>
    </div>
  );
}
