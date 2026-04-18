import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react'
import RiskGauge from './RiskGauge'
import errorImage from '../../../error.png'

const VERDICT = {
  MALICIOUS: {
    icon: AlertTriangle,
    color: 'var(--ds-red)',
    label: 'Malicious',
    badge: 'sev-critical',
    glow: 'rgba(239,59,59,0.18)',
  },
  SUSPICIOUS: {
    icon: ShieldAlert,
    color: 'var(--ds-orange)',
    label: 'Suspicious',
    badge: 'sev-high',
    glow: 'rgba(245,158,11,0.15)',
  },
  CLEAN: {
    icon: ShieldCheck,
    color: 'var(--ds-green)',
    label: 'Clean',
    badge: 'sev-low',
    glow: 'rgba(22,163,74,0.15)',
  },
}

function ScanSweep({ color }) {
  return (
    <motion.div
      aria-hidden
      className="absolute left-0 right-0 h-[2px] pointer-events-none z-10"
      style={{
        background: `linear-gradient(90deg, transparent 0%, ${color} 40%, ${color} 60%, transparent 100%)`,
        boxShadow: `0 0 14px ${color}`,
        opacity: 0.9,
      }}
      initial={{ top: '0%', opacity: 0 }}
      animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.2, times: [0, 0.05, 0.9, 1] }}
    />
  )
}

function CleanParticles() {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 0.8,
  }))
  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: 'var(--ds-green)',
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.4, 0.3],
            y: [0, -20, -40],
          }}
          transition={{
            duration: 1.8,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  )
}

export default function VerdictBanner({ verdict, filename }) {
  const [showScan, setShowScan] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShowScan(false), 2000)
    return () => clearTimeout(t)
  }, [])

  if (!verdict) return null
  const level = verdict.level || 'SUSPICIOUS'
  const cfg = VERDICT[level] || VERDICT.SUSPICIOUS
  const Icon = cfg.icon
  const evidence = verdict.evidence_count || {}
  const isClean = level === 'CLEAN'
  const isMalicious = level === 'MALICIOUS'

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative pt-20 sm:pt-24 pb-8 sm:pb-10"
      style={{
        background: `radial-gradient(ellipse 900px 400px at 50% 0%, ${cfg.glow}, transparent 70%)`,
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          className="ds-card p-7 sm:p-9 overflow-hidden relative"
          style={{
            borderRadius: '28px',
            boxShadow: `0 30px 80px ${cfg.glow}`,
            borderColor: `color-mix(in srgb, ${cfg.color} 22%, var(--ds-border))`,
          }}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Scan sweep animation on mount */}
          <AnimatePresence>{showScan && <ScanSweep color={cfg.color} />}</AnimatePresence>

          {/* Ambient glow blob */}
          <motion.div
            aria-hidden
            className="absolute -top-10 -right-10 w-72 h-72 rounded-full blur-3xl pointer-events-none"
            style={{ background: `color-mix(in srgb, ${cfg.color} 20%, transparent)` }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Clean state sparkle particles */}
          {isClean && <CleanParticles />}

          <div className="flex flex-col lg:flex-row items-start gap-8 relative">
            <div className="flex flex-col items-start gap-4 lg:min-w-[260px]">
              <div className="relative">
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${cfg.color} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${cfg.color} 30%, transparent)`,
                  }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
                >
                  <Icon className="w-7 h-7" style={{ color: cfg.color }} />
                </motion.div>
                {/* Pulse ring for clean/malicious */}
                {(isClean || isMalicious) && (
                  <motion.div
                    aria-hidden
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ border: `2px solid ${cfg.color}` }}
                    animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
                  />
                )}
              </div>
              <div>
                <motion.div
                  className="text-3xl font-bold tracking-tightest"
                  style={{ color: cfg.color }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {cfg.label}
                </motion.div>
                <div className="text-sm ds-text-muted mt-0.5 break-all">
                  {filename || 'Analysis complete'}
                </div>
                {isMalicious && (
                    <motion.img
                      src={errorImage}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                      className="mt-3 w-44 h-44 object-contain pointer-events-none select-none"
                    style={{ opacity: 0.5 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                {isClean && (
                  <motion.div
                    className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: 'color-mix(in srgb, var(--ds-green) 10%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--ds-green) 25%, transparent)',
                      color: 'var(--ds-green)',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.55, type: 'spring', stiffness: 220, damping: 14 }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Play Store verified
                  </motion.div>
                )}
              </div>
            </div>

            <div className="lg:mx-6 flex-shrink-0">
              <RiskGauge score={verdict.risk_score || 0} />
            </div>

            <div className="flex-1 min-w-0">
              <motion.p
                className="text-sm sm:text-[15px] leading-relaxed ds-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {verdict.summary}
              </motion.p>

              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(evidence).map(([sev, count], i) => {
                  if (!count) return null
                  return (
                    <motion.span
                      key={sev}
                      initial={{ opacity: 0, scale: 0.8, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.06, type: 'spring', stiffness: 260, damping: 16 }}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full sev-${sev}`}
                    >
                      {count} {sev}
                    </motion.span>
                  )
                })}
              </div>

              <motion.div
                className="mt-5 p-3.5 rounded-2xl text-sm"
                style={{
                  background: 'var(--ds-surface-alt)',
                  border: '1px solid var(--ds-border)',
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
              >
                <span className="font-semibold ds-text">Recommendation. </span>
                <span className="ds-text-muted">{verdict.recommendation}</span>
              </motion.div>
            </div>
          </div>

          {verdict.key_findings?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-7 pt-6 border-t"
              style={{ borderColor: 'var(--ds-border)' }}
            >
              <div className="ds-eyebrow mb-3">Key findings</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {verdict.key_findings.slice(0, 6).map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-2.5 p-3 rounded-xl ds-surface-alt"
                    style={{
                      borderRadius: '14px',
                      border: f.severity === 'info'
                        ? '1px solid color-mix(in srgb, var(--ds-green) 20%, var(--ds-border))'
                        : '1px solid var(--ds-border)',
                    }}
                  >
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5 sev-${f.severity}`}
                    >
                      {f.severity}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold ds-text truncate">{f.title}</div>
                      <div className="text-xs ds-text-muted mt-0.5 leading-relaxed line-clamp-2">
                        {f.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.section>
  )
}
