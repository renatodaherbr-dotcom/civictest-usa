import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "civic_levels"

export function useLevels() {
  // Inicialização lazy (roda só uma vez ao carregar o componente)
  const [levels, setLevels] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error("Erro ao ler localStorage", e)
    }
    return {}   // ← empty, easy is the default via getLevel fallback
  })

  // Sempre que 'levels' mudar, salva no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(levels))
    } catch (e) {
      console.error("Erro ao salvar no localStorage", e)
    }
  }, [levels])

  // Função para atualizar uma pergunta específica
  const updateLevel = (questionNumber, newLevel) => {
    setLevels(prev => {
      const updated = { ...prev }
      if (newLevel === "easy") {
        delete updated[questionNumber]   // ← don't store the default
      } else {
        updated[questionNumber] = newLevel
      }
      return updated
    })
  }

  // Função para obter o nível de uma pergunta (default "easy" se não existir)
  const getLevel = useCallback((questionNumber) => {
    return levels[questionNumber] || "easy"
  }, [levels])  // só muda quando levels muda de fato

  return { levels, updateLevel, getLevel }
}