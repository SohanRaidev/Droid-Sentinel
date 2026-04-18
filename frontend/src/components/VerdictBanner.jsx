import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'
import RiskGauge from './RiskGauge'

const VERDICT = {
  MALICIOUS: {
    icon: AlertTriangle,
    color: 'var(--ds-red)',
    label: 'Malicious',
    badge: 'sev-critical',
  },
  SUSPICIOUS: {
    icon: ShieldAlert,
    color: 'var(--ds-orange)',
    label: 'Suspicious',
    badge: 'sev-high',
  },
  CLEAN: {
    icon: CheckCircle2,
    color: 'var(--ds-green)',
    label: 'Clean',
    badge: 'sev-low',
  },
}

export default function VerdictBanner({ verdict, filename }) {
  if (!verdict) return null
  const level = verdict.level || 'SUSPICIOUS'
  const cfg = VERDICT[level] || VERDICT.SUSPICIOUS
  const Icon = cfg.icon
  const evidence = verdict.evidence_count || {}

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative pt-24 pb-10"
      style={{
        background:
          `radial-gradient(ellipse 900px 400px at 50% 0%, color-mix(in srgb, ${cfg.color} 10%, transparent), transparent 70%)`,
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div
          className="ds-card p-7 sm:p-9 overflow-hidden relative"
          style={{
            borderRadius: '28px',
            boxShadow: `0 30px 80px color-mix(in srgb, ${cfg.color} 12%, transparent)`,
            borderColor: `color-mix(in srgb, ${cfg.color} 22%, var(--ds-border))`,
          }}
        >
          <div
            aria-hidden
            className="absolute -top-10 -right-10 w-72 h-72 rounded-full blur-3xl opacity-60 pointer-events-none"
            style={{ background: `color-mix(in srgb, ${cfg.color} 18%, transparent)` }}
          />

          <div className="flex flex-col lg:flex-row items-start gap-8 relative">
            <div className="flex items-center gap-5 lg:min-w-[260px]">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `color-mix(in srgb, ${cfg.color} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${cfg.color} 30%, transparent)`,
                }}
              >
                <Icon className="w-7 h-7" style={{ color: cfg.color }} />
              </div>
              <div>
                <div
                  className="text-3xl font-bold tracking-tightest"
                  style={{ color: cfg.color }}
                >
                  {cfg.label}
                </div>
                <div className="text-sm ds-text-muted mt-0.5 break-all">
                  {filename || 'Analysis complete'}
                </div>
              </div>
            </div>

            <div className="lg:mx-6 flex-shrink-0">
              <RiskGauge score={verdict.risk_score || 0} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-[15px] leading-relaxed ds-text">
                {verdict.summary}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(evidence).map(([sev, count], i) => {
                  if (!count) return null
                  return (
                    <motion.span
                      key={sev}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full sev-${sev}`}
                    >
                      {count} {sev}
                    </motion.span>
                  )
                })}
              </div>

              <div
                className="mt-5 p-3.5 rounded-2xl text-sm"
                style={{
                  background: 'var(--ds-surface-alt)',
                  border: '1px solid var(--ds-border)',
                }}
              >
                <span className="font-semibold ds-text">Recommendation. </span>
                <span className="ds-text-muted">{verdict.recommendation}</span>
              </div>
            </div>
          </div>

          {verdict.key_findings?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-7 pt-6 border-t"
              style={{ borderColor: 'var(--ds-border)' }}
            >
              <div className="ds-eyebrow mb-3">Key findings</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {verdict.key_findings.slice(0, 6).map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.05 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl ds-surface-alt"
                    style={{ borderRadius: '14px' }}
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
        </div>
      </div>
    </motion.section>
  )
}
