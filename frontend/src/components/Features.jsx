import { motion } from 'framer-motion'
import {
  Fingerprint, Radar, Binary, Globe2, ShieldAlert, Layers,
  KeyRound, ScanLine, BadgeCheck, TrendingUp, Activity,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Radar,
    color: 'var(--ds-accent)',
    title: 'Live Play Store verification',
    tag: 'Unique',
    description:
      'Every package name is cross-referenced against the live Google Play Store. The signing certificate organization is matched against the listed publisher — mismatches are flagged as clones in real time.',
    highlight: 'WhatsApp LLC ≠ MobileSoft Solutions Ltd',
  },
  {
    icon: Fingerprint,
    color: 'var(--ds-purple)',
    title: 'Certificate forensics',
    tag: 'Core',
    description:
      'Parses v1/v2/v3 signing blocks, extracts the full X.509 chain, and surfaces subject, issuer, algorithm, SHA-256 fingerprint, and validity window.',
    highlight: 'SHA256withRSA · expires 2028-01-14',
  },
  {
    icon: ShieldAlert,
    color: 'var(--ds-orange)',
    title: 'Permission risk scoring',
    tag: 'Core',
    description:
      'Every permission is weighted by exploit potential. Combinations like SMS + Accessibility + Install-Packages trigger spyware-class classifications automatically.',
    highlight: '5 critical · 2 high · 7 medium',
  },
  {
    icon: Binary,
    color: 'var(--ds-green)',
    title: 'DEX code pattern scanner',
    tag: 'Core',
    description:
      'Signatures for keyloggers, SMS interceptors, dynamic code loaders, root detectors, and C2 beacons — scanned across every DEX file and native library.',
    highlight: '6 patterns · evasion + data_theft',
  },
  {
    icon: Globe2,
    color: 'var(--ds-accent)',
    title: 'Network exfiltration map',
    tag: 'Core',
    description:
      'Every URL, hostname, and IP embedded in bytecode and resources is enriched with reputation, TLD risk, and classified against known C2 patterns.',
    highlight: '45.33.32.156:8080 flagged as C2',
  },
  {
    icon: Layers,
    color: 'var(--ds-amber)',
    title: 'Manifest & component audit',
    tag: 'Core',
    description:
      'Exported activities, services, receivers, and providers are audited for intent hijacking, backup exposure, cleartext traffic, and debuggable flags.',
    highlight: 'debuggable=true · cleartext allowed',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="ds-eyebrow"
          >
            What Droid Sentinel sees
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="ds-title mt-4 font-semibold"
            style={{ fontSize: 'clamp(34px, 5vw, 56px)' }}
          >
            Six analysis lanes.
            <br />
            One definitive verdict.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-lg ds-text-muted leading-relaxed max-w-2xl"
          >
            Each lane runs independently and contributes weighted evidence
            to the final risk score. Every finding links back to the exact
            bytecode location or manifest attribute that produced it.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              whileHover={{ y: -4 }}
              className="ds-card p-6 flex flex-col"
              style={{ borderRadius: '22px' }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: `color-mix(in srgb, ${f.color} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${f.color} 20%, transparent)`,
                  }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                {f.tag && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      color: f.color,
                      background: `color-mix(in srgb, ${f.color} 8%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${f.color} 18%, transparent)`,
                    }}
                  >
                    {f.tag}
                  </span>
                )}
              </div>

              <h3 className="mt-5 text-lg font-semibold ds-text">{f.title}</h3>
              <p className="mt-2 text-sm ds-text-muted leading-relaxed flex-1">
                {f.description}
              </p>

              <div
                className="mt-5 pt-4 border-t text-xs ds-mono ds-text-soft truncate"
                style={{ borderColor: 'var(--ds-border)' }}
                title={f.highlight}
              >
                {f.highlight}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function IntelStrip() {
  const items = [
    { icon: ScanLine, label: '300+ code patterns' },
    { icon: KeyRound, label: 'X.509 chain inspection' },
    { icon: BadgeCheck, label: 'Play Store cross-check' },
    { icon: TrendingUp, label: 'Weighted risk scoring' },
    { icon: Activity, label: '30-second analysis' },
    { icon: ScanLine, label: '300+ code patterns' },
    { icon: KeyRound, label: 'X.509 chain inspection' },
    { icon: BadgeCheck, label: 'Play Store cross-check' },
    { icon: TrendingUp, label: 'Weighted risk scoring' },
    { icon: Activity, label: '30-second analysis' },
  ]
  return (
    <div
      className="relative overflow-hidden border-y"
      style={{ borderColor: 'var(--ds-border)', background: 'var(--ds-surface)' }}
    >
      <div
        className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, var(--ds-surface), transparent)' }}
      />
      <div
        className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(270deg, var(--ds-surface), transparent)' }}
      />
      <div className="flex animate-marquee whitespace-nowrap py-4">
        {items.concat(items).map((it, i) => (
          <div key={i} className="mx-8 inline-flex items-center gap-2 ds-text-muted text-sm">
            <it.icon className="w-4 h-4 ds-accent" />
            <span>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
