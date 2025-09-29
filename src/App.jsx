import { useEffect, useMemo, useState } from 'react'
import './App.css'

function useQueryParams() {
  return useMemo(() => new URLSearchParams(window.location.search), [])
}

function App() {
  const params = useQueryParams()
  const screenId = params.get('screenId') || ''
  const bmiId = params.get('bmiId') || ''
  const [serverBase, setServerBase] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    // Infer server origin from current location if same host; allow override via hash (#server=...)
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const fromHash = hash.get('server')
    const base = fromHash || `${window.location.origin.replace(/\/$/, '')}`.replace(/\/$/, '')
    setServerBase(base)
  }, [])

  useEffect(() => {
    async function run() {
      if (!serverBase || !bmiId) return
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${serverBase}/api/bmi/${encodeURIComponent(bmiId)}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to fetch BMI')
        setData(json)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [serverBase, bmiId])

  return (
    <div style={{ maxWidth: 600, margin: '24px auto', fontFamily: 'system-ui, Arial' }}>
      <h2>BMI Result</h2>
      <div style={{ fontSize: 12, color: '#666' }}>screenId: {screenId} · bmiId: {bmiId}</div>
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 12, color: '#555' }}>Server Base</label>
        <input
          value={serverBase}
          onChange={(e) => setServerBase(e.target.value)}
          placeholder="http://localhost:4000"
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: '#b00020' }}>{error}</p>}
      {data && (
        <div style={{ marginTop: 16, border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>BMI: {data.bmi?.toFixed?.(1) ?? data.bmi}</div>
          <div style={{ color: '#666', marginBottom: 12 }}>{data.category}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Height" value={`${data.height} cm`} />
            <Field label="Weight" value={`${data.weight} kg`} />
            <Field label="Screen ID" value={data.screenId} />
            <Field label="Timestamp" value={new Date(data.timestamp).toLocaleString()} />
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div style={{ padding: 8, background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}>
      <div style={{ fontSize: 12, color: '#777' }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  )
}

export default App
