import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Key, List, Globe, Search, Shield, CheckCircle2, Radar,
} from 'lucide-react'

const STEPS = [
  { icon: Package, label: 'Extracting archive',  detail: 'Parsing ZIP structure, DEX files, and native libraries' },
  { icon: Key,     label: 'Validating signature', detail: 'Inspecting v1/v2/v3 signing blocks and X.509 chain' },
  { icon: List,    label: 'Auditing manifest',    detail: 'Mapping permissions, components, and exported services' },
  { icon: Globe,   label: 'Extracting endpoints', detail: 'Scanning bytecode and resources for URLs and IPs' },
  { icon: Search,  label: 'Scanning code',        detail: 'Matching against malware and evasion signatures' },
  { icon: Radar,   label: 'Cross-checking Play Store', detail: 'Live verification against official publisher' },
  { icon: Shield,  label: 'Computing verdict',    detail: 'Aggregating weighted evidence into a risk score' },
]

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AnalysisProgress({ file }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(new Set())
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const total = 10500
    const stepDur = total / STEPS.length
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1
        setCompleted((done) => new Set([...done, prev]))
        if (next >= STEPS.length) {
          clearInterval(stepTimer)
          return prev
        }
        return next
      })
    }, stepDur)

    const progTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / (total / 60), 97))
    }, 60)

    return () => {
      clearInterval(stepTimer)
      clearInterval(progTimer)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-5"
      style={{
        background: 'color-mix(in srgb, var(--ds-bg) 80%, transparent)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg ds-card overflow-hidden"
        style={{ borderRadius: '26px' }}
      >
        <div className="p-7">
          <div
            className="flex items-center gap-3 pb-5 mb-6 border-b"
            style={{ borderColor: 'var(--ds-border)' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--ds-accent-soft)',
                border: '1px solid color-mix(in srgb, var(--ds-accent) 20%, transparent)',
              }}
            >
              <Package className="w-5 h-5 ds-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold ds-text truncate">
                {file?.name || 'Analyzing APK'}
              </p>
              <p className="text-xs ds-text-muted mt-0.5">
                {formatBytes(file?.size)} · secure sandbox
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--ds-accent)', boxShadow: '0 0 6px var(--ds-accent)' }}
              />
              <span className="text-xs font-medium ds-accent">Scanning</span>
            </div>
          </div>

          <div className="flex justify-center mb-7">
            <div className="relative w-28 h-28">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-full ds-pulse-ring"
                  style={{
                    inset: `${i * 10}px`,
                    border: '1px solid color-mix(in srgb, var(--ds-accent) 22%, transparent)',
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'var(--ds-accent-soft)',
                    border: '1px solid color-mix(in srgb, var(--ds-accent) 22%, transparent)',
                  }}
                >
                  <Shield className="w-7 h-7 ds-accent" />
                </div>
              </div>
              <div className="absolute inset-0 ds-orbit pointer-events-none">
                <div
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    top: '2px', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--ds-accent)',
                    boxShadow: '0 0 10px var(--ds-accent)',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2.5 mb-6">
            {STEPS.map((step, idx) => {
              const isDone = completed.has(idx)
              const isActive = currentStep === idx && !isDone
              const Icon = step.icon
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{
                    opacity: isDone || isActive ? 1 : 0.45,
                    x: 0,
                  }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      background: isDone
                        ? 'color-mix(in srgb, var(--ds-green) 12%, transparent)'
                        : isActive
                          ? 'var(--ds-accent-soft)'
                          : 'var(--ds-surface-alt)',
                      border: `1px solid ${
                        isDone
                          ? 'color-mix(in srgb, var(--ds-green) 25%, transparent)'
                          : isActive
                            ? 'color-mix(in srgb, var(--ds-accent) 22%, transparent)'
                            : 'var(--ds-border)'
                      }`,
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {isDone ? (
                        <motion.span
                          key="done"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--ds-green)' }} />
                        </motion.span>
                      ) : (
                        <Icon
                          className="w-3.5 h-3.5"
                          style={{
                            color: isActive ? 'var(--ds-accent)' : 'var(--ds-text-soft)',
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium transition-colors"
                      style={{
                        color: isDone
                          ? 'var(--ds-green)'
                          : isActive
                            ? 'var(--ds-text)'
                            : 'var(--ds-text-soft)',
                      }}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs ds-text-muted mt-0.5"
                      >
                        {step.detail}
                      </motion.p>
                    )}
                  </div>
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: 'var(--ds-accent)',
                        boxShadow: '0 0 6px var(--ds-accent)',
                      }}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs ds-text-muted">
              <span>Processing</span>
              <span className="ds-mono">{Math.round(progress)}%</span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--ds-surface-alt)' }}
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25 }}
                className="h-full rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, var(--ds-accent), var(--ds-purple))',
                  boxShadow: '0 0 12px color-mix(in srgb, var(--ds-accent) 40%, transparent)',
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
