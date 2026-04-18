import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, CheckCircle2, AlertCircle, Zap, Lock, PlayCircle, FileArchive,
} from 'lucide-react'
import Hero from './Hero.jsx'
import Features, { IntelStrip } from './Features.jsx'
import HowItWorks, { IntelSection, Footer } from './HowItWorks.jsx'

function formatBytes(bytes) {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadZone({ onUpload, onDemo, error }) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)

  const handleFile = useCallback((file) => {
    if (file && file.name.toLowerCase().endsWith('.apk')) {
      setSelectedFile(file)
    }
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = (e) => {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false)
  }
  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const focusUploader = () => {
    dropRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="relative">
      <Hero onPrimaryClick={focusUploader} onSecondaryClick={onDemo} />

      <section id="upload" ref={dropRef} className="relative py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10">
            <div className="ds-eyebrow">Start a scan</div>
            <h2
              className="ds-title mt-3 font-semibold"
              style={{ fontSize: 'clamp(30px, 4vw, 44px)' }}
            >
              Drop in your APK to begin.
            </h2>
            <p className="mt-3 ds-text-muted">
              Files never leave the analysis sandbox and are purged after the report is returned.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative ds-card overflow-hidden"
            style={{ borderRadius: '26px', padding: '2px' }}
          >
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              className={`relative rounded-[24px] transition-colors cursor-pointer overflow-hidden ${
                selectedFile ? 'cursor-default' : ''
              }`}
              style={{
                background: isDragging
                  ? 'var(--ds-accent-soft)'
                  : 'var(--ds-surface)',
                borderRadius: '24px',
              }}
            >
              {isDragging && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div
                    className="absolute left-0 right-0 h-px ds-scan-line"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, var(--ds-accent), transparent)',
                      boxShadow: '0 0 12px var(--ds-accent)',
                    }}
                  />
                </div>
              )}

              <div className="p-10 sm:p-14 flex flex-col items-center text-center">
                <motion.div
                  animate={{ scale: isDragging ? 1.06 : 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                  className="relative"
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                      background: selectedFile
                        ? 'color-mix(in srgb, var(--ds-green) 12%, transparent)'
                        : 'var(--ds-accent-soft)',
                      border: `1px solid ${
                        selectedFile
                          ? 'color-mix(in srgb, var(--ds-green) 25%, transparent)'
                          : 'color-mix(in srgb, var(--ds-accent) 20%, transparent)'
                      }`,
                    }}
                  >
                    {selectedFile ? (
                      <CheckCircle2 className="w-9 h-9" style={{ color: 'var(--ds-green)' }} />
                    ) : isDragging ? (
                      <Upload className="w-9 h-9" style={{ color: 'var(--ds-accent)' }} />
                    ) : (
                      <FileArchive className="w-9 h-9" style={{ color: 'var(--ds-accent)' }} />
                    )}
                  </div>
                  {!selectedFile && (
                    <div
                      aria-hidden
                      className="absolute -inset-3 rounded-3xl ds-pulse-ring"
                      style={{
                        border: '1px solid color-mix(in srgb, var(--ds-accent) 30%, transparent)',
                      }}
                    />
                  )}
                </motion.div>

                <AnimatePresence mode="wait">
                  {selectedFile ? (
                    <motion.div
                      key="selected"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mt-6"
                    >
                      <p className="text-lg font-semibold ds-text break-all">
                        {selectedFile.name}
                      </p>
                      <p className="mt-1 text-sm ds-text-muted">
                        {formatBytes(selectedFile.size)}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                        className="mt-2 text-xs underline ds-text-soft hover:ds-text"
                      >
                        Change file
                      </button>
                    </motion.div>
                  ) : isDragging ? (
                    <motion.div key="drag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                      <p className="text-xl font-semibold" style={{ color: 'var(--ds-accent)' }}>
                        Release to start analysis
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                      <p className="text-xl font-semibold ds-text">Drop your APK here</p>
                      <p className="mt-1 text-sm ds-text-muted">
                        or <span className="ds-accent font-medium">click to browse</span> · up to 2 GB
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".apk"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />

                {selectedFile && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); onUpload(selectedFile) }}
                    className="mt-8 ds-btn-primary inline-flex items-center gap-2 h-12 px-7 text-sm"
                    style={{ boxShadow: 'var(--ds-shadow-accent)' }}
                  >
                    <Zap className="w-4 h-4" />
                    Analyze APK
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onDemo}
              className="ds-btn-ghost inline-flex items-center gap-2 h-11 px-5 text-sm"
            >
              <PlayCircle className="w-4 h-4" />
              Run interactive demo
              <span
                className="ml-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{
                  color: 'var(--ds-accent)',
                  background: 'var(--ds-accent-soft)',
                }}
              >
                Fake WhatsApp
              </span>
            </button>

            <span className="inline-flex items-center gap-1.5 text-xs ds-text-soft">
              <Lock className="w-3 h-3" />
              Analyzed in-process · purged after scan
            </span>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 flex items-start gap-3 p-4 rounded-2xl"
                style={{
                  background: 'color-mix(in srgb, var(--ds-red) 8%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--ds-red) 22%, transparent)',
                }}
              >
                <AlertCircle
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: 'var(--ds-red)' }}
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ds-red)' }}>
                    Analysis failed
                  </p>
                  <p className="mt-0.5 text-sm ds-text-muted">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <IntelStrip />
      <Features />
      <HowItWorks />
      <IntelSection />
      <Footer />
    </div>
  )
}
