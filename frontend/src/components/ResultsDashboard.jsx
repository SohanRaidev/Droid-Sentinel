import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, FileText, Sparkles, AlertTriangle } from 'lucide-react'
import MetadataCard from './cards/MetadataCard'
import CertificateCard from './cards/CertificateCard'
import PermissionsCard from './cards/PermissionsCard'
import URLsCard from './cards/URLsCard'
import CodePatternsCard from './cards/CodePatternsCard'
import ReputationCard from './cards/ReputationCard'

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
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

const ResultsDashboard = forwardRef(function ResultsDashboard(
  { data, onReset, onExport },
  ref
) {
  if (!data) return null
  const certOrg = extractCertOrg(data.certificate)
  const verdict = data.verdict || {}
  const reputation = data.reputation
  const hasReputation =
    !!reputation && !!reputation.play_store

  return (
    <div ref={ref} className="max-w-7xl mx-auto px-5 sm:px-8 py-10 ds-report-root">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
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
        <div className="flex items-center gap-2 ds-no-print">
          {onExport && (
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExport}
              className="ds-btn-ghost text-sm h-10 px-4 inline-flex items-center gap-2"
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
            className="ds-btn-primary text-sm h-10 px-4 inline-flex items-center gap-2"
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
          animate="visible"
          variants={reveal}
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
          animate="visible"
          variants={reveal}
        >
          <MetadataCard metadata={data.metadata} />
        </motion.div>

        <motion.div
          className="lg:col-span-1"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={reveal}
        >
          <CertificateCard certificate={data.certificate} />
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={reveal}
        >
          <PermissionsCard manifest={data.manifest} />
        </motion.div>

        <motion.div
          className="lg:col-span-1"
          custom={4}
          initial="hidden"
          animate="visible"
          variants={reveal}
        >
          <URLsCard urls={data.urls} />
        </motion.div>

        <motion.div
          className="lg:col-span-3"
          custom={5}
          initial="hidden"
          animate="visible"
          variants={reveal}
        >
          <CodePatternsCard codePatterns={data.code_patterns} />
        </motion.div>
      </div>

      {verdict.key_findings?.length > 0 && (
        <motion.div
          custom={6}
          initial="hidden"
          animate="visible"
          variants={reveal}
          className="mt-6 ds-card p-6"
          style={{ borderRadius: '22px' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="ds-eyebrow">Consolidated findings</p>
              <h3 className="text-lg font-semibold ds-text mt-1">
                {verdict.key_findings.length} evidence points correlated
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {verdict.key_findings.map((f, i) => (
              <div
                key={i}
                className="p-4 rounded-xl ds-surface-alt"
                style={{
                  border: '1px solid var(--ds-border)',
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full sev-${f.severity}`}
                  >
                    {f.severity}
                  </span>
                  <span className="text-[11px] ds-text-soft uppercase tracking-wider">
                    {f.category}
                  </span>
                </div>
                <p className="text-sm font-semibold ds-text">{f.title}</p>
                <p className="text-xs ds-text-muted mt-1 leading-relaxed">
                  {f.description}
                </p>
              </div>
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
