import { motion } from 'framer-motion'
import {
  Radar, Store, ExternalLink, CheckCircle2, XCircle, AlertTriangle,
  Download, Star, Calendar, Building2,
} from 'lucide-react'

function formatNumber(n) {
  if (n == null) return '—'
  if (typeof n === 'string') return n
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

function formatDate(ts) {
  if (!ts) return null
  try {
    const d = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts)
    if (isNaN(d.getTime())) return null
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return null }
}

export default function ReputationCard({ reputation, packageName, appName, certOrg }) {
  if (!reputation) return null
  const store = reputation.play_store || {}
  const findings = reputation.findings || []
  const mismatches = reputation.mismatches || []
  const listed = store.listed
  const checked = store.checked

  const critical = findings.filter((f) => f.severity === 'critical').length
  const high = findings.filter((f) => f.severity === 'high').length
  const hasIssue = critical + high > 0

  let statusColor = 'var(--ds-green)'
  let statusLabel = 'Verified match'
  let StatusIcon = CheckCircle2

  if (!checked) {
    statusColor = 'var(--ds-text-soft)'
    statusLabel = 'Not checked'
    StatusIcon = AlertTriangle
  } else if (!listed) {
    statusColor = 'var(--ds-orange)'
    statusLabel = 'Not on Play Store'
    StatusIcon = XCircle
  } else if (hasIssue) {
    statusColor = 'var(--ds-red)'
    statusLabel = 'Identity mismatch'
    StatusIcon = AlertTriangle
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="ds-card p-6 h-full"
      style={{ borderRadius: '22px' }}
    >
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'var(--ds-accent-soft)',
            border: '1px solid color-mix(in srgb, var(--ds-accent) 22%, transparent)',
          }}
        >
          <Radar className="w-5 h-5 ds-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold ds-text">Play Store Reputation</h3>
            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ds-accent ds-mono" style={{ background: 'var(--ds-accent-soft)' }}>
              Live
            </span>
          </div>
          <p className="text-xs ds-text-muted mt-0.5 ds-mono truncate">
            {packageName || reputation.package_name}
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            color: statusColor,
            background: `color-mix(in srgb, ${statusColor} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${statusColor} 22%, transparent)`,
          }}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {statusLabel}
        </div>
      </div>

      {!checked ? (
        <div
          className="rounded-xl p-4 ds-surface-alt text-sm ds-text-muted"
          style={{ border: '1px solid var(--ds-border)' }}
        >
          {reputation.reason || 'Play Store lookup was not performed for this scan.'}
        </div>
      ) : !listed ? (
        <div
          className="rounded-xl p-4 sev-high"
        >
          <div className="flex items-start gap-3">
            <Store className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Package not published on Google Play</p>
              <p className="text-xs mt-1 leading-relaxed opacity-80">
                A package name of <span className="ds-mono">{packageName}</span> returns a
                404 from the live Google Play Store. Sideloaded apps claiming legitimate
                branding without a Play listing are a common malware delivery vector.
              </p>
              {store.url && (
                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium underline"
                >
                  Verify on Play Store <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            className="rounded-2xl p-4 mb-4 ds-surface-alt"
            style={{ border: '1px solid var(--ds-border)' }}
          >
            <div className="flex items-start gap-3">
              {store.icon ? (
                <img
                  src={store.icon}
                  alt=""
                  className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                  style={{ border: '1px solid var(--ds-border)' }}
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ds-surface-mute"
                  style={{ border: '1px solid var(--ds-border)' }}
                >
                  <Store className="w-7 h-7 ds-text-soft" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-base font-semibold ds-text truncate">
                      {store.title || '—'}
                    </p>
                    {store.developer && (
                      <p className="text-xs ds-text-muted mt-0.5 inline-flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {store.developer}
                      </p>
                    )}
                  </div>
                  {store.url && (
                    <a
                      href={store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs ds-accent inline-flex items-center gap-1 flex-shrink-0"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs ds-text-muted">
                  {store.score != null && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3 h-3" style={{ color: 'var(--ds-amber)' }} />
                      <span className="ds-text font-semibold">{Number(store.score).toFixed(1)}</span>
                      {store.ratings != null && <span>({formatNumber(store.ratings)})</span>}
                    </span>
                  )}
                  {store.installs && (
                    <span className="inline-flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span className="ds-text font-semibold">{store.installs}</span>
                    </span>
                  )}
                  {formatDate(store.updated) && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(store.updated)}
                    </span>
                  )}
                  {store.category && (
                    <span className="px-1.5 py-0.5 rounded-full ds-surface text-[10px] font-medium uppercase tracking-wider"
                      style={{ border: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)' }}>
                      {store.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {store.description_short && (
              <p className="text-xs ds-text-muted mt-3 leading-relaxed">
                {store.description_short}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <IdentityRow
              label="Publisher (Play Store)"
              value={store.developer || '—'}
              accent
            />
            <IdentityRow
              label="Signed by (APK certificate)"
              value={certOrg || 'Not extracted'}
              mismatch={mismatches.some((m) => m.field === 'developer_vs_certificate')}
            />
            <IdentityRow
              label="Title (Play Store)"
              value={store.title || '—'}
              accent
            />
            <IdentityRow
              label="Label (APK manifest)"
              value={appName || '—'}
              mismatch={mismatches.some((m) => m.field === 'title_vs_label')}
            />
          </div>
        </>
      )}

      {findings.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="ds-eyebrow">Reputation findings</p>
          {findings.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl p-3 sev-${f.severity}`}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-xs mt-0.5 leading-relaxed opacity-80">{f.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function IdentityRow({ label, value, mismatch, accent }) {
  return (
    <div
      className="rounded-xl p-3 ds-surface-alt"
      style={{
        border: `1px solid ${
          mismatch
            ? 'color-mix(in srgb, var(--ds-red) 30%, var(--ds-border))'
            : 'var(--ds-border)'
        }`,
      }}
    >
      <div className="flex items-center justify-between">
        <p className="ds-eyebrow" style={{ color: accent ? 'var(--ds-accent)' : undefined }}>
          {label}
        </p>
        {mismatch && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full sev-critical">
            Mismatch
          </span>
        )}
      </div>
      <p
        className="mt-1.5 text-sm font-semibold ds-text break-all"
        style={{ color: mismatch ? 'var(--ds-red)' : undefined }}
      >
        {value}
      </p>
    </div>
  )
}
