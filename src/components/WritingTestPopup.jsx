import React, { useEffect, useRef, useState } from 'react';
import Papa from "papaparse";
import './writingTestPopup.css';

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

export default function WritingTestPopup({
  voices,
  selectedVoice,
  isOpenExternally,
  onCloseExternal,
  writingMode = "sentences",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isWordMode, setIsWordMode] = useState(false);
  const [activeSentences, setActiveSentences] = useState(sentences);

  const textareaRef = useRef(null);
  const audioTimeoutRef = useRef(null);
  const nextBtnRef = useRef(null);
  const writeAgainBtnRef = useRef(null);  

  useEffect(() => {
    if (!isOpenExternally) return

    setIsOpen(true)
    setUserInput('')
    setShowResult(false)
    setIsCorrect(false)
    setIsWordMode(writingMode === "words")

    if (writingMode === "words") {
      fetch("/bd_writing_vocab.csv")
        .then(r => r.text())
        .then(csvText => {
          const results = Papa.parse(csvText, { header: true, delimiter: ";" })
          const loadedWords = results.data
            .filter(row => row.answer)
            .map(row => row.answer.trim())

          if (loadedWords.length > 0) {
            const rnd = getRandomIndex(loadedWords.length, -1)
            setActiveSentences(loadedWords)
            setCurrentIndex(rnd)
            setHistory([rnd])
          }
        })
        .catch(e => console.error("Erro carregando vocab", e))
    } else {
      const rnd = getRandomIndex(sentences.length, -1)
      setActiveSentences(sentences)
      setCurrentIndex(rnd)
      setHistory([rnd])
    }
  }, [isOpenExternally, writingMode])
  // ==========================================================

  const playAudio = () => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(activeSentences[currentIndex]);
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
    const randomIndex = getRandomIndex(sentences.length, -1);
    setIsWordMode(false);
    setActiveSentences(sentences);
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
    setIsWordMode(false);
    setActiveSentences(sentences);
    if (onCloseExternal) onCloseExternal();  // sempre reseta o App
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
    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closePopup();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      if (!showResult) {
        handleCheck();
      } else {
        handleNext();
      }

      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleBack();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();

      if (!showResult) {
        playAudio();
      } else {
        handleWriteAgain();
      }

      return;
    }
  };

  if (isOpen) {
    window.addEventListener('keydown', handleKeyDown);
  }

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [isOpen, showResult, currentIndex, userInput, activeSentences, history, selectedVoice, voices]);

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
    const expected = normalize(activeSentences[currentIndex]);
    const actual = normalize(userInput);
    const alternativeActual = actual
      .replace(/\b50\b/g, 'fifty')
      .replace(/\b100\b/g, 'one hundred');

    setIsCorrect(expected === actual || expected === alternativeActual);
    setShowResult(true);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % activeSentences.length;

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
  const currentSentence = activeSentences[currentIndex] ?? '';
  const expWords = currentSentence.split(' ');
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
  const popupTitle = isWordMode ? "Writing Test (WORDS only)" : "Writing Test (SENTENCES)";
  const correctLabel = isWordMode ? "Correct word" : "Correct sentence";
  const nextLabel = isWordMode ? "Next Word" : "Next Sentence";
  const counterLabel = isWordMode ? "Word" : "Sentence";
  const placeholderText = isWordMode
    ? "Type the word you heard..."
    : "Type the sentence you heard...";  
  // --- FIM DA LÓGICA DE CORREÇÃO ---

  return (
    <>
      {onCloseExternal == null && (
        <button
          type="button"
          onClick={openPopup}
          className="btn-start-test" 
        >
          📝 Writing Test
        </button>
      )}

      {isOpen && (
        <div className="writing-test-overlay" onClick={closePopup}>
          <div
            className="writing-test-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* WINDOW TITLE HEADER */}
            <div className="writing-test-header">
              <h2 className="writing-test-title">{popupTitle}</h2>
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
                {counterLabel} {currentIndex + 1} of {activeSentences.length}
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
              placeholder={placeholderText}
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

                    <p className="writing-test-label">{correctLabel}</p>

                    <div className="writing-test-correct-box">
                      {activeSentences[currentIndex]}
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
                    {nextLabel} ➜
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