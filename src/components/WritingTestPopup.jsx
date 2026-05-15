import React, { useEffect, useRef, useState } from 'react';
import './writingTestPopup.css';

// const sentences = [
//   'Washington was the first President',
//   'Adams was the second President',
//   'Lincoln was President during the Civil War',
//   'Washington is the Father of Our Country',
//   'The capital of the United States is Washington D.C.',
//   'Congress meets in Washington D.C.',
//   'We elect Senators to Congress',
//   'Citizens have the right to vote',
//   'We vote for President in November',
//   'American Indians lived here first',
//   'People want to be free and have freedom of speech',
//   'The flag is red white and blue',
//   'The United States has fifty states',
//   'Alaska is the largest state',
//   'California has the most people',
//   'Canada is north of the United States',
//   'Mexico is south of the United States',
//   'Delaware was the first state',
//   'New York City was the first capital',
//   'We pay taxes',
//   'Washington is on the one dollar bill',
//   "Presidents' Day is in February",
//   'Memorial Day is in May',
//   'Flag Day is in June',
//   'Independence Day is in July',
//   'Labor Day is in September',
//   'Columbus Day is in October',
//   'Thanksgiving is in November',
//   'The President lives in the White House',
//   'Congress has one hundred Senators',
//   'People come to the United States',
//   'The United States can elect the President',
// ];

  const sentences = [
    "American Indians lived here first.",
    "Washington was the first President and is the Father of Our Country.",
    "Adams was the second President, and Lincoln was President during the Civil War.",
    "Washington is on the one dollar bill.",
    "New York City was the first capital of the United States.",
    "The capital of the United States is Washington D.C., and the President lives in the White House.",
    "Congress meets in Washington D.C., and has one hundred Senators.",
    "Citizens have the right to vote for the President.",
    "We pay taxes, and we can elect Senators to Congress.",
    "People want to be free and come to the United States for freedom of speech.",
    "The flag of the United States is red, white, and blue.",
    "The United States has fifty states, and Delaware was the first state.",
    "California has the most people, and Alaska is the largest state.",
    "Canada is north of the United States, and Mexico is south of the United States.",
    "Presidents' Day is in February, and Memorial Day is in May.",
    "Flag Day is in June, and Independence Day is in July.",
    "Labor Day is in September, and Columbus Day is in October.",
    "Thanksgiving is in November, and we vote in November."
  ];

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()']/g, '')
    .trim();
}

function normalizeWord(word) {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getRandomIndex(max, exclude = -1) {
  if (max <= 1) return 0;

  let next = 0;
  do {
    next = Math.floor(Math.random() * max);
  } while (next === exclude);

  return next;
}

export default function WritingTestPopup({ voices, selectedVoice }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const textareaRef = useRef(null);
  const audioTimeoutRef = useRef(null);
  const nextBtnRef = useRef(null);
  const writeAgainBtnRef = useRef(null);  

  const playAudio = () => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(sentences[currentIndex]);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;

    // Procura a voz correta e aplica
    if (selectedVoice && voices && voices.length > 0) {
      const voiceToUse = voices.find(
        (v) => v.voiceURI === selectedVoice || v.name === selectedVoice
      );
      if (voiceToUse) {
        utterance.voice = voiceToUse;
      }
    }

    window.speechSynthesis.speak(utterance);
  };

  const resetRound = () => {
    setUserInput('');
    setShowResult(false);
    setIsCorrect(false);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const openPopup = () => {
    const randomIndex = getRandomIndex(sentences.length, currentIndex);

    setCurrentIndex(randomIndex);
    setHistory([randomIndex]);
    setUserInput('');
    setShowResult(false);
    setIsCorrect(false);
    setIsOpen(true);
  };

  const closePopup = () => {
    clearTimeout(audioTimeoutRef.current);
    window.speechSynthesis.cancel();
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen || showResult) return;

    clearTimeout(audioTimeoutRef.current);
    audioTimeoutRef.current = setTimeout(() => {
      playAudio();
      
      // Foco automático e garantido no textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 300);

    return () => clearTimeout(audioTimeoutRef.current);
  }, [currentIndex, isOpen, showResult]);

  useEffect(() => {
    return () => {
      clearTimeout(audioTimeoutRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Fechar o popup ao pressionar a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closePopup();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);  

    // Assim que mostrar o resultado, foca no botão correto
  useEffect(() => {
    if (showResult) {
      if (isCorrect) {
        nextBtnRef.current?.focus();
      } else {
        writeAgainBtnRef.current?.focus();
      }
    }
  }, [showResult, isCorrect]);

  const handleCheck = () => {
    const expected = normalize(sentences[currentIndex]);
    const actual = normalize(userInput);
    const alternativeActual = actual
      .replace(/\b50\b/g, 'fifty')
      .replace(/\b100\b/g, 'one hundred');

    setIsCorrect(expected === actual || expected === alternativeActual);
    setShowResult(true);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % sentences.length;

    setHistory((prev) => [...prev, nextIndex]);
    setCurrentIndex(nextIndex);
    resetRound();
  };

  const handleBack = () => {
    if (history.length <= 1) return;

    const previousHistory = history.slice(0, -1);
    const previousIndex = previousHistory[previousHistory.length - 1];

    setHistory(previousHistory);
    setCurrentIndex(previousIndex);
    resetRound();
  };

  const handleWriteAgain = () => {
    resetRound();
  };

    // --- INÍCIO DA LÓGICA DE CORREÇÃO INTELIGENTE (LCS) ---
  const expWords = sentences[currentIndex].split(' ');
  const actWords = userInput.trim() ? userInput.trim().split(/\s+/).filter(w => w.length > 0) : [];

  const isMatch = (actWord, expWord) => {
    if (!actWord || !expWord) return false;
    const a = normalizeWord(actWord);
    const e = normalizeWord(expWord);
    if (a === e) return true;
    if (a === "50" && e === "fifty") return true;
    if (a === "100" && e === "onehundred") return true;
    return false;
  };

  // Matriz para o algoritmo de Subsequência Comum
  const dp = Array(actWords.length + 1).fill(0).map(() => Array(expWords.length + 1).fill(0));
  
  for (let i = 1; i <= actWords.length; i++) {
    for (let j = 1; j <= expWords.length; j++) {
      if (isMatch(actWords[i - 1], expWords[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Caminho de volta (Backtracking) para descobrir quais palavras bateram
  const matchedActIndices = new Set();
  let i = actWords.length;
  let j = expWords.length;
  
  while (i > 0 && j > 0) {
    if (isMatch(actWords[i - 1], expWords[j - 1])) {
      matchedActIndices.add(i - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  const matchesCount = dp[actWords.length][expWords.length];
  // --- FIM DA LÓGICA DE CORREÇÃO ---

  return (
    <>
      <button
        type="button"
        onClick={openPopup}
        className="btn-start-test" 
      >
        📝 Writing Test
      </button>

      {isOpen && (
        <div className="writing-test-overlay" onClick={closePopup}>
          <div
            className="writing-test-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* WINDOW TITLE HEADER */}
            <div className="writing-test-header">
              <h2 className="writing-test-title" >
                📝 Writing Test
              </h2>
              <button
                type="button"
                onClick={closePopup}
                className="writing-test-close"
                aria-label="Close popup"
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#363535', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <div className="writing-test-toolbar">
              <span className="writing-test-counter">
                Sentence {currentIndex + 1} of {sentences.length}
              </span>

              <div className="writing-test-toolbar-actions">
                <button
                  type="button"
                  onClick={handleBack}
                  className="writing-test-mini-btn"
                  disabled={history.length <= 1}
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={playAudio}
                  className="writing-test-mini-btn"
                >
                  🔊 Listen Again
                </button>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the sentence you heard..."
              className="writing-test-textarea"
              disabled={showResult}
            />

            {!showResult ? (
              <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    flex: '1',
                    padding: '15px',
                    backgroundColor: '#e5e7eb',
                    color: '#4b5563',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Skip ⏭️
                </button>

                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={!userInput.trim()}
                  className="writing-test-check-btn"
                  style={{ flex: '2' }}
                >
                  Check
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`writing-test-result ${
                    isCorrect
                      ? 'writing-test-result--correct'
                      : 'writing-test-result--wrong'
                  }`}
                >
                  {isCorrect
                    ? '✅ Correct answer!'
                    : '❌ Something is different.'}
                </div>

                {!isCorrect && (
                  <div className="writing-test-feedback">
                    <p className="writing-test-label">Your typing:</p>

                    <div className="writing-test-word-list">
                      {actWords.map((word, index) => {
                        // USA O ALGORITMO NOVO AQUI
                        const match = matchedActIndices.has(index);

                        return (
                          <span
                            key={`${word}-${index}`}
                            className={`writing-test-word ${
                              match
                                ? 'writing-test-word--ok'
                                : 'writing-test-word--bad'
                            }`}
                          >
                            {word}
                          </span>
                        );
                      })}

                      {matchesCount < expWords.length && (
                        <span className="writing-test-incomplete">
                          (...incomplete)
                        </span>
                      )}
                    </div>

                    <p className="writing-test-label">Correct sentence:</p>

                    <div className="writing-test-correct-box">
                      {sentences[currentIndex]}
                    </div>
                  </div>
                )}

                <div className="writing-test-actions">
                  <button
                    ref={writeAgainBtnRef}
                    type="button"
                    onClick={handleWriteAgain}
                    className="writing-test-secondary-btn"
                  >
                    ↺ Write Again
                  </button>

                  <button
                    ref={nextBtnRef}
                    type="button"
                    onClick={handleNext}
                    className="writing-test-next-btn"
                  >
                    Next Sentence ➜
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}