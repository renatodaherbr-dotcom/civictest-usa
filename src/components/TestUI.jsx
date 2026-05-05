import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import "./test.css"

export function TestUI({
  testActive, testQuestions, testIndex,
  answerShown, scores, testFinished,
  correctCount, passed, pct,
  startTest, showAnswer, submitAnswer, exitTest,
  earlyApproved, continueTest, earlyFailed, continueTraining,
  speak, stop, speakingId, supported,
  selectedVoice, autoVoice, setAutoVoice
}) {
  const [testDados, setTestDados] = useState([])
  const q = testQuestions?.[testIndex]
  const [reviewIndex, setReviewIndex] = useState(null) // null = current question
  
  // Effect 1 — lê Q ao mudar de pergunta
  useEffect(() => {
    if (!testActive || testFinished || earlyApproved || earlyFailed) return
    if (autoVoice && q?.short_answer) {
      speak(q.question, "q")   // ← era q.answer
    }
  }, [testIndex, autoVoice, testActive])

  // Effect 2 — lê A quando resposta é revelada
  useEffect(() => {
    if (!answerShown) return
    if (!testActive || testFinished || earlyApproved || earlyFailed) return
    if (autoVoice && q?.short_answer) {
      speak(q.short_answer, "a")
    }
  }, [answerShown, autoVoice])

  // ── AGORA SIM os returns condicionais ──
  if (!testActive) return null

  // ── RESULTADO FINAL ──────────────────────────────
  if (testFinished) {
    return (
      <div className="test-overlay">
        <div className="test-modal">
          <div className={`test-result-badge ${passed ? "test-pass" : "test-fail"}`}>
            {passed ? "✓ APPROVED" : "✗ FAILED"}
          </div>
          <div className="test-score-big">{correctCount} / 20</div>
          <div className="test-pct">{pct}% correct</div>
          <div className="test-bar-bg">
            <div className={`test-bar-fill ${passed ? "test-pass" : "test-fail"}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="test-rule">Minimum to pass: 12 / 20 (60%)</div>
          <div className="test-summary">
            {scores.map((s, i) => (
              <span key={i} className={`test-dot ${s ? "dot-ok" : "dot-fail"}`}>
                {s ? "✓" : "✗"}
              </span>
            ))}
          </div>
          <button className="btn-test-exit" onClick={exitTest}>Back to Study</button>
        </div>
      </div>
    )
  }

  // ── APROVAÇÃO ANTECIPADA ─────────────────────────
  if (earlyApproved) {
    const remaining = testQuestions.length - (testIndex + 1)
    return (
      <div className="test-overlay">
        <div className="test-modal">
          <div className="test-result-badge test-pass">✓ APPROVED!</div>
          <div className="test-score-big">{correctCount} / {testIndex + 1}</div>
          <div className="test-pct">{pct}% correct — minimum reached!</div>
          <div className="test-bar-bg">
            <div className="test-bar-fill test-pass" style={{ width: `${pct}%` }} />
          </div>
          <div className="test-rule">
            You've reached 12 correct answers on question {testIndex + 1} of 20
          </div>
          <div className="test-summary">
            {scores.map((s, i) => (
              <span key={i} className={`test-dot ${s ? "dot-ok" : "dot-fail"}`}>
                {s ? "✓" : "✗"}
              </span>
            ))}
          </div>
          <div className="test-early-btns">
            {remaining > 0 && (
              <button className="btn-continue-test" onClick={continueTest}>
                Continue to {testQuestions.length} questions
              </button>
            )}
            <button className="btn-test-exit" onClick={exitTest}>Finish & Exit</button>
          </div>
        </div>
      </div>
    )
  }

  // ── REPROVAÇÃO ANTECIPADA ────────────────────────
  if (earlyFailed) {
    const wrongCount = scores.filter(v => !v).length
    return (
      <div className="test-overlay">
        <div className="test-modal">
          <div className="test-result-badge test-fail">✗ FAILED</div>
          <div className="test-score-big">{correctCount} / {testIndex + 1}</div>
          <div className="test-pct">{wrongCount} wrong — impossible to reach 12 correct</div>
          <div className="test-bar-bg">
            <div className="test-bar-fill test-fail" style={{ width: `${pct}%` }} />
          </div>
          <div className="test-rule">
            {wrongCount} wrong answers on question {testIndex + 1} of 20
          </div>
          <div className="test-summary">
            {scores.map((s, i) => (
              <span key={i} className={`test-dot ${s ? "dot-ok" : "dot-fail"}`}>
                {s ? "✓" : "✗"}
              </span>
            ))}
          </div>
          <div className="test-early-btns">
            <button className="btn-continue-test" onClick={continueTraining}>
              Continue for training
            </button>
            <button className="btn-test-exit" onClick={exitTest}>Finish & Exit</button>
          </div>
        </div>
      </div>
    )
  }


  // Pergunta exibida: review ou atual
  const isReviewing = reviewIndex !== null
  const displayQ = isReviewing ? testQuestions[reviewIndex] : q
  const displayScore = isReviewing ? scores[reviewIndex] : null

  return (
    <div className="test-overlay">
      <div className="test-modal">

        <div className="test-header">
          <span className="test-counter">Question {testIndex + 1} / {testQuestions.length}</span>
          <button className="btn-test-close" onClick={exitTest}>✕</button>
        </div>

        <div className="test-progress-bg">
          <div className="test-progress-fill" style={{ width: `${(testIndex / testQuestions.length) * 100}%` }} />
        </div>

        {/* ── REVIEW NAV — só aparece se já há respostas ── */}
        {scores.length > 0 && (
          <div className="test-review-nav">
            <button
              className="btn-test-rev"
              disabled={reviewIndex === 0 || (reviewIndex === null && scores.length === 0)}
              onClick={() => setReviewIndex(prev =>
                prev === null ? scores.length - 1 : Math.max(0, prev - 1)
              )}
            >←</button>

            <span className="test-rev-label">
              {isReviewing
                ? <>
                    Review {reviewIndex + 1}/{scores.length}
                    {" "}<span className={scores[reviewIndex] ? "rev-ok" : "rev-fail"}>
                      {scores[reviewIndex] ? "✓" : "✗"}
                    </span>
                  </>
                : `${scores.length} answered`
              }
            </span>

            <button
              className="btn-test-rev"
              disabled={!isReviewing}
              onClick={() => setReviewIndex(prev =>
                prev >= scores.length - 1 ? null : prev + 1
              )}
            >→</button>

            {isReviewing && (
              <button className="btn-test-rev-back" onClick={() => setReviewIndex(null)}>
                ✕ current
              </button>
            )}
          </div>
        )}

        {/* ── TEXTAREAS ── */}
        <div className={`test-ta-wrapper ${(answerShown || isReviewing) ? "test-show-answer" : ""} ${isReviewing ? "test-reviewing" : ""}`}>
          <textarea className="test-ta-q"     value={displayQ?.question ?? ""}      readOnly />
          <textarea className="test-ta-short" value={displayQ?.short_answer ?? ""}  readOnly />
          {!isReviewing && (
            <textarea className="test-ta-full" value={displayQ?.answer ?? ""} readOnly />
          )}
        </div>

        {/* ── VOICE ROW — só na pergunta atual ── */}
        {supported && !isReviewing && (
          <div className="test-voice-row">
            <button className="btn-test-voice"
              onClick={() => speakingId === "q" ? stop() : speak(displayQ?.question ?? "", "q")}>
              {speakingId === "q" ? "⏹ Q" : "🔊 Q"}
            </button>
            {answerShown && (
              <button className="btn-test-voice"
                onClick={() => speakingId === "a" ? stop() : speak(displayQ?.short_answer ?? "", "a")}>
                {speakingId === "a" ? "⏹ A" : "🔊 A"}
              </button>
            )}
            <label className="test-auto-label">
              <input type="checkbox" checked={autoVoice}
                onChange={e => { setAutoVoice(e.target.checked); if (!e.target.checked) stop() }} />
              {" "}🔊 Auto
            </label>
          </div>
        )}

        {/* ── ACTIONS — bloqueadas durante review ── */}
        {!isReviewing && (
          <div className="test-actions">
            {!answerShown ? (
              <button className="btn-show-ans" onClick={showAnswer}>Show Answer ↓</button>
            ) : (
              <>
                <button className="btn-incorrect" onClick={() => { submitAnswer(false); setReviewIndex(null) }}>✗ Incorrect</button>
                <button className="btn-correct"   onClick={() => { submitAnswer(true);  setReviewIndex(null) }}>✓ Correct</button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}