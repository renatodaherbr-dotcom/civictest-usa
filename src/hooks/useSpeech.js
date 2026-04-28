import { useState, useEffect, useRef, useCallback } from 'react'

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [speakingId, setSpeakingId] = useState(null)
  const [supported, setSupported] = useState(false)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const synthRef = useRef(null)
  const selectedVoiceRef = useRef('')       // ← começa vazio
  const voicesRef = useRef([])              // ← ref para voices também

  // ✅ Mantém os refs sempre atualizados
  useEffect(() => {
    selectedVoiceRef.current = selectedVoice
  }, [selectedVoice])

  useEffect(() => {
    voicesRef.current = voices
  }, [voices])

  useEffect(() => {
    synthRef.current = window.speechSynthesis
    setSupported('speechSynthesis' in window)

    const loadVoices = () => {
      const availableVoices = synthRef.current.getVoices()
      setVoices(availableVoices)
      voicesRef.current = availableVoices         // ← atualiza ref direto também
      if (availableVoices.length > 0 && !selectedVoiceRef.current) {
        const name = availableVoices[0]?.name || ''
        setSelectedVoice(name)
        selectedVoiceRef.current = name           // ← sincroniza ref
      }
    }

    loadVoices()
    synthRef.current.onvoiceschanged = loadVoices
  }, [])

  // ✅ buildUtterance usa REFS — nunca fica stale, nunca recria
  const buildUtterance = useCallback((text, id) => {
    const utterance = new SpeechSynthesisUtterance(text)
    if (selectedVoiceRef.current && voicesRef.current.length > 0) {
      const voice = voicesRef.current.find(v => v.name === selectedVoiceRef.current)
      if (voice) utterance.voice = voice
    }
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 0.9
    utterance.onstart = () => { setSpeaking(true);  setSpeakingId(id) }
    utterance.onend   = () => { setSpeaking(false); setSpeakingId(null) }
    utterance.onerror = () => { setSpeaking(false); setSpeakingId(null) }
    return utterance
  }, [])  // ✅ deps vazios — nunca recria, sempre pega valor atual via ref

  const speak = useCallback((text, id) => {
    if (!synthRef.current || !text) return
    synthRef.current.cancel()
    synthRef.current.speak(buildUtterance(text, id))
  }, [buildUtterance])

  const speakQueued = useCallback((text, id) => {
    if (!synthRef.current || !text) return
    synthRef.current.speak(buildUtterance(text, id))
  }, [buildUtterance])

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setSpeaking(false)
      setSpeakingId(null)
    }
  }, [])

  return {
    speak, speakQueued, stop, speaking, speakingId,
    supported, voices, selectedVoice, setSelectedVoice
  }
}