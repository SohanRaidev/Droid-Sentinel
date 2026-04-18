import { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, AlertTriangle, CheckCircle2, XCircle, Copy, Check } from 'lucide-react'

function Copyable({ value, label }) {
  const [copied, setCopied] = useState(false)
  if (!value || value === 'N/A') return null

  const onCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    })
  }

  return (
    <div
      className="group flex items-start gap-2 py-1.5 border-b last:border-0"
      style={{ borderColor: 'var(--ds-border)' }}
    >
      <span className="text-[10px] ds-text-soft w-14 flex-shrink-0 pt-0.5 uppercase tracking-wider">
        {label}
      </span>
      <span className="ds-mono text-xs ds-text-muted flex-1 break-all leading-relaxed">
        {value}
      </span>
      <button
        onClick={onCopy}
        className="flex-shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Copy ${label}`}
      >
        {copied
          ? <Check className="w-3 h-3" style={{ color: 'var(--ds-green)' }} />
          : <Copy className="w-3 h-3 ds-text-soft" />}
      </button>
    </div>
  )
}

function formatDate(d) {
  if (!d || d === 'Unknown' || d === 'N/A') return d
  try {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return d }
}

export default function CertificateCard({ certificate }) {
  if (!certificate) return null
  const cert = certificate.certificates?.[0]
  const found = certificate.found
  const selfSigned = certificate.is_self_signed
  const expired = certificate.is_expired

  const statusColor = !found || expired
    ? 'var(--ds-red)'
    : selfSigned
      ? 'var(--ds-orange)'
      : 'var(--ds-green)'
  const StatusIcon = !found || expired ? XCircle : selfSigned ? AlertTriangle : CheckCircle2
  const statusLabel = !found ? 'Unsigned' : expired ? 'Expired' : selfSigned ? 'Self-signed' : 'Valid'

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
            background: 'color-mix(in srgb, var(--ds-purple) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ds-purple) 22%, transparent)',
          }}
        >
          <Key className="w-5 h-5" style={{ color: 'var(--ds-purple)' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold ds-text">Certificate</h3>
          <p className="text-xs ds-text-muted">{certificate.certificate_count || 0} certificate(s)</p>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: statusColor }}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-xs font-semibold">{statusLabel}</span>
        </div>
      </div>

      {!found ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 sev-critical"
          >
            <XCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--ds-red)' }}>
            APK is unsigned
          </p>
          <p className="text-xs ds-text-muted mt-1 max-w-[200px]">
            No signing certificate found in META-INF
          </p>
        </div>
      ) : cert ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {selfSigned && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium sev-high">
                Self-signed
              </span>
            )}
            {expired && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium sev-critical">
                Expired
              </span>
            )}
            {!selfSigned && !expired && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium sev-low">
                Trusted CA
              </span>
            )}
            {cert.signature_algorithm && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium sev-info ds-mono">
                {cert.signature_algorithm}
              </span>
            )}
          </div>

          <div className="ds-surface-mute rounded-xl p-3">
            <Copyable label="Subject" value={cert.subject} />
            <Copyable label="Issuer" value={cert.issuer} />
            <Copyable label="SHA256" value={cert.sha256_fingerprint} />
            <Copyable label="SHA1" value={cert.sha1_fingerprint} />
            <Copyable label="Serial" value={cert.serial_number} />
          </div>

          <div className="flex gap-3">
            <div
              className="flex-1 p-2.5 rounded-xl ds-surface-alt"
              style={{ border: '1px solid var(--ds-border)' }}
            >
              <p className="ds-eyebrow">Valid from</p>
              <p className="text-xs ds-text mt-1 font-medium">{formatDate(cert.valid_from)}</p>
            </div>
            <div
              className="flex-1 p-2.5 rounded-xl ds-surface-alt"
              style={{ border: '1px solid var(--ds-border)' }}
            >
              <p className="ds-eyebrow">Valid to</p>
              <p
                className="text-xs mt-1 font-medium"
                style={{
                  color: expired ? 'var(--ds-red)' : 'var(--ds-text)',
                }}
              >
                {formatDate(cert.valid_to)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {certificate.warnings?.length > 0 && (
        <div className="mt-4 space-y-2">
          {certificate.warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2.5 rounded-xl sev-critical"
            >
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{w}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
