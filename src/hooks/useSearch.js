import { useState, useEffect, useMemo } from "react"

export function useSearch(perguntasFiltradas, setIndex, getEdit) {
  const [searchOpen, setSearchOpen]     = useState(false)
  const [searchInput, setSearchInput]   = useState("")
  const [searchTerm, setSearchTerm]     = useState("")
  const [searchHits, setSearchHits]     = useState([])
  const [searchNavIdx, setSearchNavIdx] = useState(0)
  const [searchInQ, setSearchInQ] = useState(true)   // buscar em perguntas
  const [searchInA, setSearchInA] = useState(true)   // buscar em respostas

  // useMemo — usa searchInQ e searchInA no filtro
  const searchHitsCalc = useMemo(() => {
    if (!searchTerm.trim()) return []
    const t = searchTerm.toLowerCase()
    return perguntasFiltradas
      .map((d, i) => ({
        i,
        q: d.question?.toLowerCase(),
        a: (getEdit?.(d.id_number) ?? d.answer)?.toLowerCase()   // ← uses edit if exists
      }))
      .filter(x =>
        (searchInQ && x.q?.includes(t)) ||
        (searchInA && x.a?.includes(t))
      )
      .map(x => x.i)
  }, [searchTerm, searchInQ, searchInA, perguntasFiltradas])

  useEffect(() => {
    setSearchHits(searchHitsCalc)
    if (searchHitsCalc.length > 0) {
      setSearchNavIdx(0)
      setIndex(searchHitsCalc[0])
    }
  }, [searchHitsCalc])

  const handleSearchOk = () => {
    setSearchTerm(searchInput)
    setSearchOpen(false)
  }

  const handleSearchClear = () => {
    setSearchTerm("")
    setSearchInput("")
    setSearchHits([])
    setSearchNavIdx(0)
  }

  const searchFirst = () => {
    setSearchNavIdx(0)
    setIndex(searchHits[0])
  }

  const searchLast = () => {
    const last = searchHits.length - 1
    setSearchNavIdx(last)
    setIndex(searchHits[last])
  }

  const searchNext = () => {
    const next = Math.min(searchNavIdx + 1, searchHits.length - 1)
    setSearchNavIdx(next)
    setIndex(searchHits[next])
  }

  const searchPrev = () => {
    const prev = Math.max(searchNavIdx - 1, 0)
    setSearchNavIdx(prev)
    setIndex(searchHits[prev])
  }

  // Lógica anti-neither: não deixa desmarcar os dois
  const toggleSearchInQ = () => {
    if (searchInQ && !searchInA) {
      setSearchInA(true)   // ✅ transfere para A antes de desmarcar Q
    }
    setSearchInQ(v => !v)
  }

  const toggleSearchInA = () => {
    if (!searchInQ && searchInA) {
      setSearchInQ(true)   // ✅ transfere para Q antes de desmarcar A
    }
    setSearchInA(v => !v)
  }


  return {
    searchOpen, setSearchOpen,
    searchInput, setSearchInput,
    searchTerm,
    searchHits,
    searchNavIdx,
    handleSearchOk,
    handleSearchClear,
    searchFirst, searchLast,
    searchNext, searchPrev,
    searchInQ, searchInA,
    toggleSearchInQ, toggleSearchInA,
  }
}
