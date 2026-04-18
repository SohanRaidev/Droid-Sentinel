import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, FileText, Sparkles, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react'
import MetadataCard from './cards/MetadataCard'
import CertificateCard from './cards/CertificateCard'
import PermissionsCard from './cards/PermissionsCard'
import URLsCard from './cards/URLsCard'
import CodePatternsCard from './cards/CodePatternsCard'
import ReputationCard from './cards/ReputationCard'

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
}

const cardHover = {
  y: -3,
  transition: { type: 'spring', stiffness: 300, damping: 22 },
}

function extractCertOrg(certificate) {
  const subject = certificate?.certificates?.[0]?.subject
  if (!subject) return null
  const org = /Organization:\s*([^,]+)/i.exec(subject)
  if (org) return org[1].trim()
  const o = /\bO=([^,]+)/.exec(subject)
  if (o) return o[1].trim()
  const cnFriendly = /Common Name:\s*([^,]+)/i.exec(subject)
  if (cnFriendly) return cnFriendly[1].trim()
  const cn = /\bCN=([^,]+)/.exec(subject)
  if (cn) return cn[1].trim()
  return null
}

function PrintHeader({ data, verdict }) {
  const level = verdict?.level || 'SUSPICIOUS'
  const color = level === 'MALICIOUS' ? '#ef3b3b' : level === 'CLEAN' ? '#16a34a' : '#f59e0b'
  const VerdictIcon = level === 'CLEAN' ? ShieldCheck : level === 'MALICIOUS' ? AlertTriangle : ShieldAlert
  return (
    <div
      className="ds-print-header"
      style={{
        display: 'none',
        padding: '0 0 20px 0',
        marginBottom: '24px',
        borderBottom: '2px solid #d1d5db',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: '#0a0f1c' }}>
            Droid Sentinel
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Android Security Intelligence Report
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
          <div style={{ fontWeight: 600, color: '#0a0f1c' }}>
            {data?.metadata?.app_name || data?.filename || 'APK Report'}
          </div>
          <div style={{ fontFamily: 'monospace', marginTop: '2px' }}>
            {data?.metadata?.package_name || ''}
          </div>
          <div style={{ marginTop: '4px' }}>
            {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '12px', background: '#f7f8fa', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontWeight: 800, fontSize: '22px', color }}>
          {verdict?.risk_score ?? 0}<span style={{ fontSize: '12px', fontWeight: 400, color: '#64748b' }}>/100</span>
        </div>
        <div style={{ width: '1px', height: '32px', background: '#d1d5db' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px', color }}>{level}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{verdict?.summary?.slice(0, 120)}…</div>
        </div>
      </div>
    </div>
  )
}

const ResultsDashboard = forwardRef(function ResultsDashboard(
  { data, onReset, onExport },
  ref
) {
  if (!data) return null
  const certOrg = extractCertOrg(data.certificate)
  const verdict = data.verdict || {}
  const reputation = data.reputation
  const hasReputation = !!reputation && !!reputation.play_store

  return (
    <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 ds-report-root ds-perf-contain">
      {/* Print-only header */}
      <PrintHeader data={data} verdict={verdict} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 ds-no-print"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="ds-eyebrow">Analysis Report</span>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ds-accent ds-mono"
              style={{ background: 'var(--ds-accent-soft)' }}
            >
              <Sparkles className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" />
              Forensic grade
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold ds-text tracking-tight">
            {data.metadata?.app_name || data.filename || 'Unnamed APK'}
          </h2>
          <p className="text-sm ds-text-muted mt-1 ds-mono">
            {data.metadata?.package_name || '—'} · {new Date().toLocaleString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onExport && (
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExport}
              className="ds-btn-ghost text-sm h-10 px-4 inline-flex items-center gap-2 flex-1 sm:flex-none justify-center"
              title="Export detailed report"
            >
              <FileText className="w-4 h-4" />
              Export report
            </motion.button>
          )}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="ds-btn-primary text-sm h-10 px-4 inline-flex items-center gap-2 flex-1 sm:flex-none justify-center"
          >
            <RefreshCw className="w-4 h-4" />
            Scan another APK
          </motion.button>
        </div>
      </motion.div>

      {Array.isArray(data.warnings) && data.warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-5 p-4 rounded-2xl flex gap-3"
          style={{
            background: 'color-mix(in srgb, var(--ds-orange) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ds-orange) 30%, var(--ds-border))',
          }}
        >
          <AlertTriangle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: 'var(--ds-orange)' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold ds-text">
              {data.warnings.length === 1
                ? '1 analyzer returned a partial result'
                : `${data.warnings.length} analyzers returned partial results`}
            </p>
            <p className="text-xs ds-text-muted mt-1 leading-relaxed">
              Other evidence below is still accurate. The verdict reflects only what was
              successfully parsed.
            </p>
            <details className="mt-2 text-xs ds-text-soft ds-mono">
              <summary className="cursor-pointer hover:ds-text-muted">
                Show analyzer diagnostics
              </summary>
              <ul className="mt-2 space-y-1 pl-1">
                {data.warnings.map((w, i) => (
                  <li key={i} className="break-words">• {w}</li>
                ))}
              </ul>
            </details>
          </div>
        </motion.div>
      )}

      {hasReputation && (
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={reveal}
          whileHover={cardHover}
          className="mb-5"
        >
          <ReputationCard
            reputation={reputation}
            packageName={data.metadata?.package_name}
            appName={data.metadata?.app_name}
            certOrg={certOrg}
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          className="lg:col-span-2"
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={reveal}
          whileHover={cardHover}
        >
          <MetadataCard metadata={data.metadata} />
        </motion.div>

        <motion.div
          className="lg:col-span-1"
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={reveal}
          whileHover={cardHover}
        >
          <CertificateCard certificate={data.certificate} />
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          custom={3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={reveal}
          whileHover={cardHover}
        >
          <PermissionsCard manifest={data.manifest} />
        </motion.div>

        <motion.div
          className="lg:col-span-1"
          custom={4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={reveal}
          whileHover={cardHover}
        >
          <URLsCard urls={data.urls} />
        </motion.div>

        <motion.div
          className="lg:col-span-3"
          custom={5}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={reveal}
          whileHover={cardHover}
        >
          <CodePatternsCard codePatterns={data.code_patterns} />
        </motion.div>
      </div>

      {verdict.key_findings?.length > 0 && (
        <motion.div
          custom={6}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={reveal}
          className="mt-5 ds-card p-6"
          style={{ borderRadius: '22px' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="ds-eyebrow">Consolidated findings</p>
              <h3 className="text-lg font-semibold ds-text mt-1">
                {verdict.key_findings.length} evidence point{verdict.key_findings.length !== 1 ? 's' : ''} correlated
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {verdict.key_findings.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="p-4 rounded-xl ds-surface-alt"
                style={{
                  border: `1px solid ${
                    f.severity === 'critical'
                      ? 'color-mix(in srgb, var(--ds-red) 22%, var(--ds-border))'
                      : f.severity === 'high'
                      ? 'color-mix(in srgb, var(--ds-orange) 22%, var(--ds-border))'
                      : f.severity === 'info'
                      ? 'color-mix(in srgb, var(--ds-green) 22%, var(--ds-border))'
                      : 'var(--ds-border)'
                  }`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full sev-${f.severity}`}
                  >
                    {f.severity}
                  </span>
                </div>
                <p className="text-sm font-semibold ds-text">{f.title}</p>
                <p className="text-xs ds-text-muted mt-1 leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div
        className="mt-10 pt-6 text-center text-[11px] ds-text-soft"
        style={{ borderTop: '1px solid var(--ds-border)' }}
      >
        Droid Sentinel · Android threat intelligence · Generated{' '}
        {new Date().toLocaleString('en-US')}
      </div>
    </div>
  )
})

export default ResultsDashboard
