import { motion } from 'framer-motion'
import { Globe, AlertTriangle, CheckCircle2 } from 'lucide-react'

function short(url, max = 50) {
  if (!url || url.length <= max) return url
  return url.slice(0, max) + '…'
}

function shortFile(file) {
  if (!file) return file
  const parts = file.split('/')
  return parts[parts.length - 1] || file
}

export default function URLsCard({ urls }) {
  if (!urls) return null
  const list = urls.urls || []
  const suspicious = urls.suspicious_count || 0
  const ips = urls.ip_addresses || []

  const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
  const sorted = [...list].sort((a, b) => (order[a.risk_level] ?? 5) - (order[b.risk_level] ?? 5))

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="ds-card p-5 h-full"
      style={{ borderRadius: '22px' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--ds-green) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ds-green) 22%, transparent)',
          }}
        >
          <Globe className="w-5 h-5" style={{ color: 'var(--ds-green)' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold ds-text">Embedded URLs</h3>
          <p className="text-xs ds-text-muted">{urls.total_count || 0} discovered</p>
        </div>
        {suspicious > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg sev-critical">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-xs font-semibold">{suspicious} suspicious</span>
          </div>
        )}
      </div>

      {ips.length > 0 && (
        <div className="mb-4 p-3 rounded-xl sev-critical">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Raw IP endpoints ({ips.length})</span>
          </div>
          {ips.slice(0, 3).map((ip, i) => (
            <div
              key={i}
              className="ds-mono text-[11px] ds-surface-mute ds-text px-2 py-1 rounded mb-1 last:mb-0 truncate"
              title={ip}
            >
              {ip}
            </div>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 sev-low"
          >
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--ds-green)' }}>
            No URLs found
          </p>
          <p className="text-xs ds-text-muted mt-1">No embedded network endpoints detected</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {sorted.slice(0, 25).map((u, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.025 }}
              className={`p-2.5 rounded-xl sev-${u.risk_level || 'info'}`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="ds-mono text-xs truncate max-w-[220px]" title={u.url}>
                      {short(u.url)}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium capitalize">
                      {u.risk_level}
                    </span>
                  </div>
                  {u.source_file && (
                    <span className="text-[10px] ds-mono opacity-70 mt-0.5 block">
                      {shortFile(u.source_file)}
                    </span>
                  )}
                  {u.description && (
                    <p className="text-[11px] mt-0.5 leading-relaxed opacity-80">
                      {u.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {sorted.length > 25 && (
            <p className="text-xs ds-text-soft text-center py-2">
              +{sorted.length - 25} more URLs not shown
            </p>
          )}
        </div>
      )}

      {urls.unique_domains?.length > 0 && (
        <div
          className="mt-4 pt-3 border-t text-xs ds-text-muted"
          style={{ borderColor: 'var(--ds-border)' }}
        >
          <span className="ds-text font-semibold">{urls.unique_domains.length}</span> unique domains
        </div>
      )}

      {urls.warnings?.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {urls.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg sev-critical">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <p className="text-xs">{w}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
