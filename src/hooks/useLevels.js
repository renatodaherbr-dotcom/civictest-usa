import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "civic_levels"

const normalizeKey = (value) => String(value ?? "").trim()

export function useLevels() {
  const [levels, setLevels] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = stored ? JSON.parse(stored) : {}

      return Object.fromEntries(
        Object.entries(parsed).filter(([k]) => {
          const key = normalizeKey(k)
          return key && key !== "undefined" && key !== "null"
        })
      )
    } catch (e) {
      console.error("Erro ao ler localStorage", e)
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(levels))
    } catch (e) {
      console.error("Erro ao salvar no localStorage", e)
    }
  }, [levels])

  const updateLevel = useCallback((questionNumber, newLevel) => {
    const key = normalizeKey(questionNumber)
    if (!key) return

    setLevels(prev => {
      const updated = { ...prev }

      if (newLevel === "easy") {
        delete updated[key]
      } else {
        updated[key] = newLevel
      }

      return updated
    })
  }, [])

  const getLevel = useCallback((questionNumber) => {
    const key = normalizeKey(questionNumber)
    if (!key) return "easy"
    return levels[key] || "easy"
  }, [levels])

  return { levels, updateLevel, getLevel }
}