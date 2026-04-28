import { useState, useCallback } from "react"

const STORAGE_KEY = "civic_edits"

function loadEdits() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {} }
  catch { return {} }
}

export function useEdits() {
  const [edits, setEdits] = useState(loadEdits)

  const getEdit = useCallback((id) => edits[id] ?? null, [edits])

  const saveEdit = useCallback((id, newAnswer) => {
    setEdits(prev => {
      const updated = { ...prev, [id]: newAnswer }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearEdit = useCallback((id) => {
    setEdits(prev => {
      const updated = { ...prev }
      delete updated[id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return { getEdit, saveEdit, clearEdit }
}