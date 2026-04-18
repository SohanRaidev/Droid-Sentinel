import { useState, useRef, useCallback } from 'react'
import axios from 'axios'
import Navbar from './components/Navbar'
import UploadZone from './components/UploadZone'
import AnalysisProgress from './components/AnalysisProgress'
import VerdictBanner from './components/VerdictBanner'
import ResultsDashboard from './components/ResultsDashboard'

export default function App() {
  const [phase, setPhase] = useState('upload')
  const [analysisData, setAnalysisData] = useState(null)
  const [error, setError] = useState(null)
  const [currentFile, setCurrentFile] = useState(null)
  const reportRef = useRef(null)

  const handleUpload = async (file) => {
    setCurrentFile(file)
    setError(null)
    setPhase('analyzing')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 1800000,
      })

      setAnalysisData(response.data)
      setPhase('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      let msg = 'Analysis failed. Please try again.'
      if (err.response?.data?.detail) msg = err.response.data.detail
      else if (err.message) msg = err.message
      setError(msg)
      setPhase('upload')
    }
  }

  const handleDemo = async () => {
    setError(null)
    setCurrentFile({ name: 'WhatsApp_Clone_v2.22.apk', size: 58234112 })
    setPhase('analyzing')

    try {
      const response = await axios.get('/api/sample', { timeout: 30000 })
      await new Promise((r) => setTimeout(r, 2200))
      setAnalysisData(response.data)
      setPhase('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      let msg = 'Failed to load demo sample. Is the backend running?'
      if (err.response?.data?.detail) msg = err.response.data.detail
      setError(msg)
      setPhase('upload')
    }
  }

  const handleReset = () => {
    setPhase('upload')
    setAnalysisData(null)
    setError(null)
    setCurrentFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAnalyzeClick = () => {
    if (phase === 'results') {
      handleReset()
      setTimeout(() => {
        document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })
      }, 120)
      return
    }
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleExport = useCallback(() => {
    const pkg = analysisData?.metadata?.package_name || 'report'
    const safe = pkg.replace(/[^a-z0-9.\-_]/gi, '_')
    const prevTitle = document.title
    document.title = `Droid Sentinel Report — ${safe}`
    window.print()
    setTimeout(() => { document.title = prevTitle }, 500)
  }, [analysisData])

  return (
    <div className="min-h-screen ds-app-root">
      <Navbar
        onReset={handleReset}
        phase={phase}
        onAnalyze={handleAnalyzeClick}
        onExport={phase === 'results' ? handleExport : undefined}
      />

      {phase === 'upload' && (
        <UploadZone onUpload={handleUpload} onDemo={handleDemo} error={error} />
      )}

      {phase === 'analyzing' && <AnalysisProgress file={currentFile} />}

      {phase === 'results' && analysisData && (
        <div className="pt-4">
          <VerdictBanner
            verdict={analysisData.verdict}
            filename={analysisData.filename || currentFile?.name}
          />
          <ResultsDashboard
            ref={reportRef}
            data={analysisData}
            onReset={handleReset}
            onExport={handleExport}
          />
        </div>
      )}
    </div>
  )
}
