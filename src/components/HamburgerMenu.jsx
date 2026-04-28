import { useState, useRef, useEffect } from "react"
import "./hamburger.css"

function IconFile() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="hm-svg">
      <path
        d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="hm-svg">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconDatabase() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="hm-svg">
      <ellipse
        cx="12"
        cy="5"
        rx="7"
        ry="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function HamburgerMenu({
  dbFile, onDbChange,
  onExportEdits, onImportEdits,
  levelFilter, onLevelChange, voices, selectedVoice, onVoiceChange
}) {

  const fileInputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const levelColor = {
    easy:   "#16a34a",  // verde
    medium: "#ca8a04",  // amarelo
    hard:   "#dc2626",  // vermelho
  }
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="hamburger-wrap" ref={menuRef}>
      <button
        className={`hamburger-btn ${open ? "hamburger-btn--open" : ""}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Open menu"
        title="Menu"
      >
        <span />
        <span />
        <span />
        {/* ✅ ponto indicador quando filtro ativo */}
        {levelFilter !== "all" && (
          <span style={{
            position: "absolute", top: 6, right: 6,
            width: 7, height: 7, borderRadius: "50%",
            background: levelColor[levelFilter]
          }} />
        )}        
      </button>

      {open && (
        <div className="hamburger-dropdown">
          {/* ── LEVEL FILTER — acima do Database ── */}
          <div className="hm-item hm-item--select">
            <span className="hm-label">Level filter</span>
            <select
              className="hm-select"
              value={levelFilter}
              onChange={(e) => {
                onLevelChange(e.target.value)
                setOpen(false)
              }
            }
            >
              <option value="all">⭐ All levels</option>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          </div>

          {/* ── VOICE — só renderiza se houver vozes disponíveis ── */}
          {voices?.length > 0 && (
            <>
              <div className="hm-item hm-item--select">
                <span className="hm-label">Voice</span>
                <select
                  className="hm-select"
                  value={selectedVoice}
                  onChange={(e) => onVoiceChange(e.target.value)}
                >
                  <option value="">Default voice</option>
                  {voices.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}


          <div className="hm-item hm-item--select">
            <div className="hm-item-head">
              <IconDatabase />
              <span className="hm-label">Database</span>
            </div>

            <select
              value={dbFile}
              onChange={(e) => {
                onDbChange(e.target.value)
                setOpen(false)
              }}
              className="hm-select"
            >
              <option value="bd_civic2.csv">📖 Civic 2026 — Full answers</option>
              <option value="bd_civic3.csv">⚡ Civic 2026 — Short answers</option>
            </select>
          </div>

          <div className="hm-divider" />

          <a
            className="hm-item hm-item--link"
            href="/USCIS-2025-Civics-Test-Study-Guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <span className="hm-icon"><IconFile /></span>
            <span>Study Guide PDF</span>
          </a>

          <div className="hm-divider" />

          <a
            className="hm-item hm-item--link"
            href="https://www.uscis.gov/citizenship"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <span className="hm-icon"><IconGlobe /></span>
            <span>USCIS Citizenship</span>
          </a>

          <div className="hm-divider" />

          {/* Edits backup/restore */}
          <div className="hm-item hm-item--select">
            <span className="hm-label">Editions</span>
            <select
              className="hm-select"
              value=""
              onChange={(e) => {
                const val = e.target.value
                if (val === "export") { onExportEdits(); setOpen(false) }
                if (val === "import") { fileInputRef.current?.click() }
                e.target.value = ""  // reset visual do select
              }}
            >
              <option value="" disabled>Backup / Restore…</option>
              <option value="export">💾 Export edits</option>
              <option value="import">📂 Import edits</option>
            </select>

            {/* Input oculto — só disparado pelo select */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={(e) => { onImportEdits(e.target.files[0]); setOpen(false) }}
            />
          </div>

        </div>
      )}
    </div>
  )
}