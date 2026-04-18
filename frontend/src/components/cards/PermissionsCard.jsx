import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ChevronDown, ChevronUp, AlertTriangle, Shield } from 'lucide-react'

const RISK_ORDER = ['critical', 'high', 'medium', 'low', 'info', 'unknown']

const RISK_META = {
  critical: { label: 'Critical', color: 'var(--ds-red)', defaultOpen: true },
  high:     { label: 'High',     color: 'var(--ds-orange)', defaultOpen: true },
  medium:   { label: 'Medium',   color: 'var(--ds-amber)', defaultOpen: false },
  low:      { label: 'Low',      color: 'var(--ds-green)', defaultOpen: false },
  info:     { label: 'Info',     color: 'var(--ds-text-soft)', defaultOpen: false },
  unknown:  { label: 'Unknown',  color: 'var(--ds-purple)', defaultOpen: false },
}

function Item({ perm }) {
  const shortName = perm.name?.split('.').pop() || perm.name
  const sev = perm.risk_level || 'unknown'
  return (
    <div
      className="flex items-start gap-2.5 py-2 border-b last:border-0"
      style={{ borderColor: 'var(--ds-border)' }}
    >
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 sev-${sev}`}>
        {RISK_META[sev]?.label || sev}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium ds-text ds-mono truncate">{shortName}</p>
        <p className="text-[11px] ds-text-muted mt-0.5 leading-relaxed">{perm.description}</p>
      </div>
    </div>
  )
}

function Group({ level, perms }) {
  const meta = RISK_META[level]
  const [open, setOpen] = useState(!!meta?.defaultOpen)
  if (!perms.length) return null

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: `1px solid color-mix(in srgb, ${meta.color} 20%, var(--ds-border))`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 transition-colors hover:opacity-90"
        style={{
          background: `color-mix(in srgb, ${meta.color} 8%, transparent)`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
          <span className="text-xs font-semibold" style={{ color: meta.color }}>
            {meta.label}
          </span>
          <span
            className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full ds-surface-mute ds-text"
            style={{ border: '1px solid var(--ds-border)' }}
          >
            {perms.length}
          </span>
        </div>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 ds-text-soft" />
          : <ChevronDown className="w-3.5 h-3.5 ds-text-soft" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3">
              {perms.map((p, i) => <Item key={i} perm={p} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PermissionsCard({ manifest }) {
  if (!manifest) return null
  const perms = manifest.permissions || []
  const flags = manifest.flags || {}

  const grouped = {}
  RISK_ORDER.forEach((l) => { grouped[l] = perms.filter((p) => p.risk_level === l) })
  const dangerous = (grouped.critical?.length || 0) + (grouped.high?.length || 0)

  const total = perms.length || 1
  const bars = RISK_ORDER
    .map((l) => ({ level: l, count: grouped[l]?.length || 0, pct: ((grouped[l]?.length || 0) / total) * 100, color: RISK_META[l]?.color }))
    .filter((b) => b.count > 0)

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
            background: 'color-mix(in srgb, var(--ds-orange) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ds-orange) 22%, transparent)',
          }}
        >
          <Lock className="w-5 h-5" style={{ color: 'var(--ds-orange)' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold ds-text">Permissions</h3>
          <p className="text-xs ds-text-muted">{perms.length} total requested</p>
        </div>
        {dangerous > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg sev-critical">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-xs font-semibold">{dangerous} dangerous</span>
          </div>
        )}
      </div>

      {bars.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden mb-2 ds-surface-mute">
            {bars.map((b) => (
              <motion.div
                key={b.level}
                initial={{ width: 0 }}
                animate={{ width: `${b.pct}%` }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="h-full"
                style={{ background: b.color, minWidth: b.pct > 0 ? '4px' : 0 }}
                title={`${RISK_META[b.level]?.label}: ${Math.round(b.pct)}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {bars.map((b) => (
              <div key={b.level} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: b.color }} />
                <span className="text-[11px] ds-text-muted">
                  {RISK_META[b.level]?.label} · {b.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-5">
        {flags.is_debuggable && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium sev-high inline-flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" /> Debuggable
          </span>
        )}
        {flags.allows_backup && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium sev-medium">
            ADB backup allowed
          </span>
        )}
        {flags.uses_cleartext_traffic && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium sev-high">
            Cleartext HTTP
          </span>
        )}
        {flags.network_security_config && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium sev-low inline-flex items-center gap-1">
            <Shield className="w-2.5 h-2.5" /> NSC present
          </span>
        )}
      </div>

      {perms.length === 0 ? (
        <div className="text-center py-8">
          <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--ds-green)' }} />
          <p className="text-sm ds-text-muted">No permissions detected</p>
        </div>
      ) : (
        <div className="space-y-2">
          {RISK_ORDER.map((l) => (
            <Group key={l} level={l} perms={grouped[l] || []} />
          ))}
        </div>
      )}

      {manifest.warnings?.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {manifest.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg sev-high">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <p className="text-xs">{w}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
