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
    "Washington was the first President and Adams was the second President",
    "Washington is the Father of Our Country and is on the one dollar bill",
    "Lincoln was President during the Civil War and we have Memorial Day in May",
    "Congress meets in Washington D.C. and we elect one hundred Senators to Congress",
    "Citizens have the right to vote for the President in November",
    "American Indians lived here first and people come to the United States to be free",
    "People want freedom of speech and we pay taxes in the United States",
    "The flag of the United States is red, white, and blue",
    "The United States has fifty states and Alaska is the largest state",
    "California has the most people and Delaware was the first state",
    "Canada is north of the United States and Mexico is south of the United States",
    "New York City was the first capital and the President lives in the White House",
    "Independence Day is in July and we have Labor Day in September",
    "Columbus Day is in October and Thanksgiving is in November",
    "Flag Day is in June and Presidents' Day is in February",
    "The United States can elect the President and the President lives in Washington"
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

  const expWords = sentences[currentIndex].split(' ');
  const actWords = userInput.trim() ? userInput.trim().split(/\s+/) : [];

  return (
    <>
      <button
        type="button"
        onClick={openPopup}
        // Coloque aqui a exata mesma classe que o seu botão "Search" ou "Test Simulation" usa.
        // Pelo seu app.css, o botão Simulation usa "btn-start-test".
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
                      {actWords.map((word, i) => {
                        const expMatch = expWords[i] || '';

                        const isAlt =
                          (normalizeWord(word) === '50' &&
                            normalizeWord(expMatch) === 'fifty') ||
                          (normalizeWord(word) === '100' &&
                            normalizeWord(expMatch) === 'onehundred');

                        const match =
                          expMatch &&
                          (normalizeWord(word) === normalizeWord(expMatch) ||
                            isAlt);

                        return (
                          <span
                            key={`${word}-${i}`}
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

                      {actWords.length < expWords.length && (
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