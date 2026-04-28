import { useEffect, useState } from 'react'
import Papa from 'papaparse'

export function DebugDbFiles() {
  const [debugDb, setDebugDb] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const files = ['bd_civic2.csv', 'bd_civic3.csv']

    Promise.all(
      files.map(file =>
        fetch(`/${file}`)
          .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status} — ${file} not found`)
            return r.text()
          })
          .then(csvText => {
            const results = Papa.parse(csvText, {
              header: true,
              delimiter: ';',
            })

            const linhasValidas = results.data.filter(d => d.question && d.answer)
            const comIds = linhasValidas.map((item, i) => ({
              ...item,
              globalId: String(i + 1),
              _source: file,
            }))

            console.group(`CSV: ${file}`)
            console.log('raw results:', results)
            console.log('valid rows:', comIds.length)
            console.table(comIds.slice(0, 10))
            console.groupEnd()

            return { file, rows: comIds, count: comIds.length }
          })
      )
    )
      .then(all => {
        console.group('ALL DB FILES')
        console.table(
          all.map(x => ({
            file: x.file,
            rows: x.count,
            firstQuestion: x.rows[0]?.question ?? '',
            firstAnswer: x.rows[0]?.answer ?? '',
          }))
        )
        console.groupEnd()
        setDebugDb(all)
        setLoading(false)
      })
      .catch(err => {
        console.error('CSV load error:', err)
        setError(String(err))
        setLoading(false)
      })
  }, [])

  if (loading) return <pre>Loading DB files...</pre>
  if (error) return <pre>{error}</pre>

  return (
    <div style={{ padding: 12, fontSize: 12 }}>
      <h3>DB Debug</h3>
      <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
        {JSON.stringify(debugDb, null, 2)}
      </pre>
    </div>
  )
}