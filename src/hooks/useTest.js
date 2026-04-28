import { useState, useEffect } from 'react'
import Papa from 'papaparse'

export function useTest() {   // ← sem parâmetro
  const [testDados, setTestDados] = useState([])   // ← estado interno

  const [testActive, setTestActive] = useState(false)
  const [testQuestions, setTestQuestions] = useState([])
  const [testIndex, setTestIndex] = useState(0)
  const [answerShown, setAnswerShown] = useState(false)
  const [scores, setScores] = useState([])
  const [testFinished, setTestFinished] = useState(false)
  const [earlyApproved, setEarlyApproved] = useState(false)
  const [earlyFailed, setEarlyFailed] = useState(false)
  const [continueMode, setContinueMode] = useState(false)
  const [trainingMode, setTrainingMode] = useState(false)

  // ✅ Carrega civic1 (full) + civic3 (short) só para o test
  useEffect(() => {
    Promise.all([
      fetch('/bd_civic2.csv').then(r => r.text()),
      fetch('/bd_civic3.csv').then(r => r.text()),
    ]).then(([fullCsv, shortCsv]) => {
      const full  = Papa.parse(fullCsv,  { header: true, delimiter: ';' }).data
      const short = Papa.parse(shortCsv, { header: true, delimiter: ';' }).data
      const merged = full
        .map((item, i) => ({           // ← map ANTES do filter
          ...item,
          short_answer: short[i]?.answer ?? item.answer,
        }))
        .filter(d => d.question && d.answer)   // ← filter DEPOIS
        .map((item, i) => ({
          ...item,
          globalId: String(i + 1)
        }))
      setTestDados(merged)
      //console.log("merged[0]:", merged[0])  // ← vê question, answer, short_answer      
    })
  }, [])

  const startTest = () => {
    const pool = testDados.filter(d => d.question && d.answer)  // ← testDados
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    setTestQuestions(shuffled.slice(0, 20))
    setTestIndex(0)
    setScores([])
    setAnswerShown(false)
    setTestFinished(false)
    setTestActive(true)
    setContinueMode(false)
    setEarlyApproved(false)
    setEarlyFailed(false)
    setTrainingMode(false)
  }

  const submitAnswer = (correct) => {
    const newScores = [...scores, correct]
    setScores(newScores)
    const correctSoFar = newScores.filter(Boolean).length
    const wrongSoFar = newScores.filter(v => !v).length
    const isLast = testIndex + 1 >= testQuestions.length
    if (correctSoFar >= 12 && !continueMode && !isLast) { setEarlyApproved(true); return }
    if (wrongSoFar >= 9 && !trainingMode && !isLast) { setEarlyFailed(true); return }
    if (isLast) { setTestFinished(true) }
    else { setTestIndex(i => i + 1); setAnswerShown(false) }
  }

  const continueTest = () => {
    setContinueMode(true)
    setEarlyApproved(false)
    setTestIndex(i => i + 1)
    setAnswerShown(false)
  }

  const continueTraining = () => {
    setTrainingMode(true)
    setEarlyFailed(false)
    setTestIndex(i => i + 1)
    setAnswerShown(false)
  }

  const showAnswer = () => setAnswerShown(true)

  const exitTest = () => {
    setTestActive(false)
    setTestFinished(false)
  }

  const correctCount = scores.filter(Boolean).length
  const passed = correctCount >= 12
  const pct = testQuestions.length > 0
    ? Math.round((correctCount / testQuestions.length) * 100)
    : 0

  return {
    testActive, testQuestions, testIndex,
    answerShown, scores, testFinished,
    correctCount, passed, pct,
    startTest, showAnswer, submitAnswer, exitTest,
    earlyApproved, continueTest, continueMode,
    earlyFailed, trainingMode, continueTraining,
  }
}