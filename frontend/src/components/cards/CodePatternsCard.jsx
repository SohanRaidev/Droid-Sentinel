import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bug, ChevronDown, CheckCircle2, AlertTriangle, Shield } from 'lucide-react'

const SEV = {
  critical: { label: 'Critical', color: 'var(--ds-red)' },
  high:     { label: 'High',     color: 'var(--ds-orange)' },
  medium:   { label: 'Medium',   color: 'var(--ds-amber)' },
  low:      { label: 'Low',      color: 'var(--ds-green)' },
}

function Pattern({ pattern, index }) {
  const [open, setOpen] = useState(false)
  const sev = pattern.severity || 'medium'
  const meta = SEV[sev] || SEV.medium

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-xl overflow-hidden self-start h-fit"
      style={{
        border: `1px solid color-mix(in srgb, ${meta.color} 22%, var(--ds-border))`,
        borderLeft: `3px solid ${meta.color}`,
        background: 'var(--ds-surface)',
        boxShadow: 'var(--ds-shadow-sm)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:ds-surface-alt"
        style={{ background: `color-mix(in srgb, ${meta.color} 5%, transparent)` }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider flex-shrink-0 sev-${sev}`}>
            {meta.label}
          </span>
          {pattern.category && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize sev-unknown flex-shrink-0">
              {pattern.category.replace(/_/g, ' ')}
            </span>
          )}
          <span className="text-sm font-semibold ds-text truncate">{pattern.name}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 ds-text-soft flex-shrink-0 ml-2 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 py-4 ds-surface-alt space-y-3"
              style={{ borderTop: '1px solid var(--ds-border)' }}
            >
              <p className="text-sm ds-text-muted leading-relaxed">{pattern.description}</p>

              {pattern.evidence?.length > 0 && (
                <div>
                  <p className="ds-eyebrow mb-2">
                    Evidence ({pattern.evidence.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {pattern.evidence.map((ev, i) => (
                      <span
                        key={i}
                        className="ds-mono text-[11px] px-2 py-1 rounded-lg ds-surface-mute"
                        style={{ border: '1px solid var(--ds-border)' }}
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pattern.locations?.length > 0 && (
                <div>
                  <p className="ds-eyebrow mb-2">Found in</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pattern.locations.map((loc, i) => (
                      <span
                        key={i}
                        className={`ds-mono text-[11px] px-2 py-1 rounded-lg sev-${sev}`}
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function CodePatternsCard({ codePatterns }) {
  if (!codePatterns) return null

  const patterns = codePatterns.patterns || []
  const criticalCount = codePatterns.critical_severity_count || 0
  const highCount = codePatterns.high_severity_count || 0
  const total = codePatterns.total_findings || 0
  const categories = codePatterns.categories || []

  const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  const sorted = [...patterns].sort((a, b) => (sevOrder[a.severity] ?? 4) - (sevOrder[b.severity] ?? 4))

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      className="ds-card p-5"
      style={{ borderRadius: '22px' }}
    >
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--ds-purple) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ds-purple) 22%, transparent)',
          }}
        >
          <Bug className="w-5 h-5" style={{ color: 'var(--ds-purple)' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold ds-text">Code Pattern Analysis</h3>
          <p className="text-xs ds-text-muted">
            {total === 0 ? 'No suspicious patterns detected' : `${total} finding${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <div className="sev-critical px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs font-semibold">{criticalCount} critical</span>
            </div>
          )}
          {highCount > 0 && (
            <div className="sev-high px-2.5 py-1 rounded-lg">
              <span className="text-xs font-semibold">{highCount} high</span>
            </div>
          )}
          {total === 0 && (
            <div className="sev-low px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              <span className="text-xs font-semibold">Clean</span>
            </div>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5 items-center">
          <span className="text-xs ds-text-muted mr-1">Categories:</span>
          {categories.map((c) => (
            <span
              key={c}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize sev-unknown"
            >
              {c.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 sev-low">
            <Shield className="w-8 h-8" />
          </div>
          <p className="text-base font-semibold" style={{ color: 'var(--ds-green)' }}>
            No suspicious patterns found
          </p>
          <p className="text-sm ds-text-muted mt-1 max-w-sm">
            Static analysis detected no known malware signatures, dangerous API patterns, or evasion techniques.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
          {sorted.map((p, i) => <Pattern key={i} pattern={p} index={i} />)}
        </div>
      )}

      {codePatterns.warnings?.length > 0 && (
        <div className="mt-5 space-y-2">
          {codePatterns.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl sev-critical">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">{w}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
