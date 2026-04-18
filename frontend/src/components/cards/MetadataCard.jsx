import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Copy, Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

function HashRow({ label, value }) {
  const [copied, setCopied] = useState(false)
  if (!value || value === 'error') return null

  const onCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <div
      className="flex items-center gap-3 py-2 border-b last:border-0"
      style={{ borderColor: 'var(--ds-border)' }}
    >
      <span className="text-[11px] font-medium ds-text-soft w-12 flex-shrink-0 uppercase tracking-wider">
        {label}
      </span>
      <span className="ds-mono text-xs ds-text-muted flex-1 truncate" title={value}>
        {value}
      </span>
      <button
        onClick={onCopy}
        className="flex-shrink-0 p-1 rounded-md transition-colors hover:ds-surface-mute"
        aria-label={`Copy ${label}`}
      >
        {copied
          ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--ds-green)' }} />
          : <Copy className="w-3.5 h-3.5 ds-text-soft" />}
      </button>
    </div>
  )
}

function InfoRow({ label, value, mono }) {
  if (value === undefined || value === null || value === '' || value === 'Unknown') return null
  return (
    <div
      className="flex items-center justify-between py-1.5 border-b last:border-0"
      style={{ borderColor: 'var(--ds-border)' }}
    >
      <span className="text-xs ds-text-muted">{label}</span>
      <span className={`text-xs ds-text font-medium ${mono ? 'ds-mono' : ''}`}>
        {String(value)}
      </span>
    </div>
  )
}

export default function MetadataCard({ metadata }) {
  const [showLibs, setShowLibs] = useState(false)
  if (!metadata) return null
  const hashes = metadata.hashes || {}
  const libs = metadata.native_libs || []

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
            background: 'var(--ds-accent-soft)',
            border: '1px solid color-mix(in srgb, var(--ds-accent) 18%, transparent)',
          }}
        >
          <Package className="w-5 h-5 ds-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold ds-text">APK Metadata</h3>
          <p className="text-xs ds-text-muted truncate">{metadata.filename}</p>
        </div>
        {metadata.dex_count > 1 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg sev-medium">
            <AlertCircle className="w-3 h-3" />
            <span className="text-xs font-semibold">{metadata.dex_count} DEX</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center ds-surface-alt"
              style={{ border: '1px solid var(--ds-border)' }}
            >
              <Package className="w-6 h-6 ds-text-soft" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold ds-text truncate">
                {metadata.app_name || 'Unknown App'}
              </p>
              <p className="text-xs ds-text-muted ds-mono truncate">
                {metadata.package_name}
              </p>
            </div>
          </div>

          <InfoRow label="Version" value={`${metadata.version_name || '?'} (${metadata.version_code || '?'})`} />
          <InfoRow label="Min SDK" value={metadata.min_sdk} />
          <InfoRow label="Target SDK" value={metadata.target_sdk} />
          <InfoRow label="File size" value={metadata.file_size_human} />
          <InfoRow label="Total files" value={metadata.total_files} />
          <InfoRow label="Assets" value={metadata.assets_count} />
          {metadata.compilation_timestamp && (
            <InfoRow label="DEX" value={metadata.compilation_timestamp} mono />
          )}
        </div>

        <div>
          <p className="ds-eyebrow mb-2">File hashes</p>
          <div className="ds-surface-mute rounded-xl p-3 mb-4">
            <HashRow label="MD5" value={hashes.md5} />
            <HashRow label="SHA1" value={hashes.sha1} />
            <HashRow label="SHA256" value={hashes.sha256} />
          </div>

          {libs.length > 0 && (
            <div>
              <button
                onClick={() => setShowLibs(!showLibs)}
                className="flex items-center justify-between w-full text-xs ds-text-muted hover:ds-text transition-colors mb-2"
              >
                <span className="ds-eyebrow">Native libs ({libs.length})</span>
                {showLibs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showLibs && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1 max-h-32 overflow-y-auto"
                >
                  {libs.map((lib, i) => (
                    <div
                      key={i}
                      className="ds-mono text-[11px] ds-text-muted ds-surface-mute px-2 py-1 rounded truncate"
                    >
                      {lib}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            {[
              { v: metadata.dex_count || 0, l: 'DEX files' },
              { v: libs.length, l: 'Native libs' },
              { v: metadata.is_valid_zip ? 'OK' : 'ERR', l: 'ZIP', c: metadata.is_valid_zip ? 'var(--ds-green)' : 'var(--ds-red)' },
            ].map((s, i) => (
              <div
                key={i}
                className="flex-1 text-center py-2 rounded-xl ds-surface-alt"
                style={{ border: '1px solid var(--ds-border)' }}
              >
                <div className="text-base font-bold" style={{ color: s.c || 'var(--ds-text)' }}>
                  {s.v}
                </div>
                <div className="text-[10px] ds-text-soft">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
