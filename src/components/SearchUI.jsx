import "./search.css"
import { useTippy } from  "../hooks/useTips"

export function SearchUI({
  searchOpen, setSearchOpen,
  searchInput, setSearchInput,
  searchTerm, searchHits,
  searchNavIdx,
  handleSearchOk, handleSearchClear,
  searchFirst, searchLast,
  searchNext, searchPrev,
  searchInQ, searchInA,
  toggleSearchInQ, toggleSearchInA,
  onStartTest, levelFilter, setLevelFilter,
}) {
  const tipTest = useTippy("Test your knowlodge with random questions.")
  const tipLevel = useTippy("Filter question by difficulty level.")  
  const tipSearch = useTippy("Search for any term (CTRL+F).")
  return (
    <>
      {/* ROW 1 — action buttons */}
      {/* Envolvemos os botões e os resultados dentro de UM container cinza */}
      <div className="search-container">

        {/* LINHA 1: botões lado a lado */}
        <div className="search-buttons-row">
          <button className="btn-bottom-action btn-search" 
            onClick={onStartTest}
            ref={tipTest}
          >
            📝 Start Test
          </button>

          <button className="btn-bottom-action btn-search" 
            onClick={() => setSearchOpen(true)}
            ref={tipSearch}
          >
            🔎 Search
          </button>
        </div>

        {/* LINHA 2: só aparece quando há busca ativa */}
        {searchTerm && (
          <div className="search-hits-row">
            <span className="search-term-label">"{searchTerm}"</span>

            {searchHits.length > 0 ? (
              <div className="search-nav-group">
                <button className="btn-search-nav" onClick={searchFirst} disabled={searchNavIdx === 0}>«</button>
                <button className="btn-search-nav" onClick={searchPrev}  disabled={searchNavIdx === 0}>‹</button>
                <span className="search-count">{searchNavIdx + 1}/{searchHits.length}</span>
                <button className="btn-search-nav" onClick={searchNext}  disabled={searchNavIdx === searchHits.length - 1}>›</button>
                <button className="btn-search-nav" onClick={searchLast}  disabled={searchNavIdx === searchHits.length - 1}>»</button>
              </div>
            ) : (
              <span className="search-empty">No hits</span>
            )}

            <button className="btn-search-clear" onClick={handleSearchClear}>✕</button>
          </div>
        )}

      </div>

      {/* SEARCH POPUP */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Search</h3>
            <input
              className="search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchOk()
                if (e.key === "Escape") {
                  setSearchOpen(false)
                  handleSearchClear()
                }
              }}
              autoFocus
              placeholder="Search..."
            />
            <div className="search-scope">
              <label className="scope-option">
                <input type="checkbox" checked={searchInQ} onChange={toggleSearchInQ} />
                Question
              </label>
              <label className="scope-option">
                <input type="checkbox" checked={searchInA} onChange={toggleSearchInA} />
                Answer
              </label>
            </div>
            <div className="search-popup-btns">
              <button className="btn-canc" onClick={() => setSearchOpen(false)}>Cancel</button>
              <button className="btn-ok" onClick={handleSearchOk}>OK</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}