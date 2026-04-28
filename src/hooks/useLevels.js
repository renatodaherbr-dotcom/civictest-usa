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

    // Se não existir, cria o array inicial de 1 a 128 com "easy"
    // Usamos um objeto para facilitar acesso direto: { "1": "easy", "2": "easy" ... }
    const initialLevels = {}
    for (let i = 1; i <= 128; i++) {
      initialLevels[i] = "easy"
    }
    return initialLevels
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
    setLevels(prev => ({
      ...prev,
      [questionNumber]: newLevel
    }))
  }

  // Função para obter o nível de uma pergunta (default "easy" se não existir)
  const getLevel = useCallback((questionNumber) => {
    return levels[questionNumber] || "easy"
  }, [levels])  // só muda quando levels muda de fato

  return { levels, updateLevel, getLevel }
}