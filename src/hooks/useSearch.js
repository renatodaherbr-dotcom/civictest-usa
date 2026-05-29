import { useState, useEffect, useMemo } from "react"

function stripHtml(text = "") {
  return String(text).replace(/<[^>]*>/g, " ")
}

function normalize(text = "") {
  return stripHtml(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function getQuestionKey(d) {
  return String(d?.id_number ?? d?.idnumber ?? d?.globalId ?? "").trim()
}

export function useSearch(perguntasFiltradas, setIndex, getEdit, editVersion) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchHits, setSearchHits] = useState([])
  const [searchNavIdx, setSearchNavIdx] = useState(0)
  const [searchInQ, setSearchInQ] = useState(true)
  const [searchInA, setSearchInA] = useState(true)

  const searchHitsCalc = useMemo(() => {
    const term = normalize(searchTerm)
    if (!term) return []

    return perguntasFiltradas
      .map((d, i) => {
        const key = String(d.id_number ?? d.idnumber ?? d.globalId ?? "").trim()
        const db = d.dbFile ?? ""

        const shortEdit = getEdit?.(`${db}__${key}__short`) ?? ""
        const fullEdit = getEdit?.(`${db}__${key}__full`) ?? ""

        const originalQ = d.question ?? ""
        const originalShort = d.answer_short ?? d.short_answer ?? d.answer ?? ""
        const originalFull = d.answer_full ?? d.full_answer ?? d.answer_long ?? ""

        const q = normalize(originalQ)
        const aShort = normalize(shortEdit || originalShort)
        const aFull = normalize(fullEdit || originalFull)

        const searchable = [
          searchInQ ? q : "",
          searchInA ? aShort : "",
          searchInA ? aFull : "",
        ]
          .filter(Boolean)
          .join(" ")

        return { i, searchable }
      })
      .filter(x => x.searchable.includes(term))
      .map(x => x.i)
  }, [searchTerm, searchInQ, searchInA, perguntasFiltradas, getEdit, editVersion])

  useEffect(() => {
    setSearchHits(searchHitsCalc)
    if (searchHitsCalc.length > 0) {
      setSearchNavIdx(0)
      setIndex(searchHitsCalc[0])
    } else {
      setSearchNavIdx(0)
    }
  }, [searchHitsCalc, setIndex])

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
    if (!searchHits.length) return
    setSearchNavIdx(0)
    setIndex(searchHits[0])
  }

  const searchLast = () => {
    if (!searchHits.length) return
    const last = searchHits.length - 1
    setSearchNavIdx(last)
    setIndex(searchHits[last])
  }

  const searchNext = () => {
    if (!searchHits.length) return
    const next = Math.min(searchNavIdx + 1, searchHits.length - 1)
    setSearchNavIdx(next)
    setIndex(searchHits[next])
  }

  const searchPrev = () => {
    if (!searchHits.length) return
    const prev = Math.max(searchNavIdx - 1, 0)
    setSearchNavIdx(prev)
    setIndex(searchHits[prev])
  }

  const toggleSearchInQ = () => {
    if (searchInQ && !searchInA) {
      setSearchInA(true)
    }
    setSearchInQ(v => !v)
  }

  const toggleSearchInA = () => {
    if (!searchInQ && searchInA) {
      setSearchInQ(true)
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