import { useCallback, useRef, useEffect } from "react"
import tippy from "tippy.js"
import "tippy.js/dist/tippy.css"
import "tippy.js/animations/scale.css" 

export function useTippy(content, options = {}) {
  const tippyInstance = useRef(null)
  const ref = useCallback((node) => {
    if (node) {
      // Elemento entrou na tela -> inicializa o Tippy
      tippyInstance.current = tippy(node, {
        content,
        animation: "scale",      // Animação de zoom
        delay: [300, 0], 
        arrow: true,
        theme: "light",
        ...options 
      })
    } else {
      // Elemento saiu da tela -> destrói a instância
      if (tippyInstance.current) {
        tippyInstance.current.destroy()
        tippyInstance.current = null
      }
    }
  }, []) 

  // Update content dynamically if the text changes
  useEffect(() => {
    if (tippyInstance.current) {
      tippyInstance.current.setContent(content)
    }
  }, [content])  

  return ref

}