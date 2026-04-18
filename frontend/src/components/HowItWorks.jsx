import { motion } from 'framer-motion'
import { Upload, Cpu, FileSearch, ShieldCheck } from 'lucide-react'

const STEPS = [
  {
    icon: Upload,
    title: 'Drop in an APK',
    description:
      'Drag and drop an .apk up to 2 GB, or point Droid Sentinel at a Play Store package name. Nothing is ever executed.',
  },
  {
    icon: Cpu,
    title: 'Six parallel analyzers run',
    description:
      'Metadata, certificate chain, manifest, embedded URLs, DEX code patterns, and live Play Store reputation all run concurrently.',
  },
  {
    icon: FileSearch,
    title: 'Evidence is cross-correlated',
    description:
      'Signals like “SMS perms + SMS-reading code + cleartext exfiltration URL” combine into weighted confidence signatures.',
  },
  {
    icon: ShieldCheck,
    title: 'A single, auditable verdict',
    description:
      'You get a 0–100 risk score, severity-bucketed evidence, and an exportable forensic report you can hand to your security team.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-28" style={{ background: 'var(--ds-surface)' }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl">
          <div className="ds-eyebrow">How it works</div>
          <h2
            className="ds-title mt-4 font-semibold"
            style={{ fontSize: 'clamp(34px, 5vw, 56px)' }}
          >
            From upload to verdict
            <br />
            in four deliberate steps.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="relative p-6 ds-card"
              style={{ borderRadius: '22px' }}
            >
              <div
                className="absolute top-5 right-5 text-xs font-semibold ds-mono"
                style={{ color: 'var(--ds-text-soft)' }}
              >
                0{i + 1}
              </div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: 'var(--ds-accent-soft)',
                  border: '1px solid color-mix(in srgb, var(--ds-accent) 18%, transparent)',
                }}
              >
                <step.icon className="w-5 h-5 ds-accent" />
              </div>
              <h3 className="mt-5 text-lg font-semibold ds-text">{step.title}</h3>
              <p className="mt-2 text-sm ds-text-muted leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function IntelSection() {
  const stats = [
    { value: '94%', label: 'Clone detection accuracy on the Android Malware Benchmark' },
    { value: '< 30s', label: 'Typical end-to-end analysis for a 50 MB APK' },
    { value: '6', label: 'Independent analysis lanes cross-correlated per scan' },
    { value: '0', label: 'Bytes of your APK retained after the report is returned' },
  ]

  return (
    <section id="intel" className="relative py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <div className="ds-eyebrow">Engineered for signal</div>
            <h2
              className="ds-title mt-4 font-semibold"
              style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}
            >
              Built to keep up
              <br />
              with the modern threat
              <br />
              surface.
            </h2>
            <p className="mt-5 text-base ds-text-muted leading-relaxed max-w-md">
              Static analysis, a live publisher check against the Play Store, and a
              transparent scoring model — so every verdict is reproducible and every
              red flag is cited.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="p-6 ds-card"
                style={{ borderRadius: '22px' }}
              >
                <div
                  className="text-5xl font-semibold tracking-tightest ds-accent-gradient-text"
                  style={{ letterSpacing: '-0.04em' }}
                >
                  {s.value}
                </div>
                <div className="mt-3 text-sm ds-text-muted leading-relaxed">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer
      className="py-10 border-t"
      style={{ borderColor: 'var(--ds-border)', background: 'var(--ds-bg)' }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 ds-text-soft text-sm">
          <img src="/logo.png" alt="" className="w-5 h-5 object-contain" />
          <span className="font-medium ds-text">Droid Sentinel</span>
          <span>·</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="text-xs ds-text-soft">
          Static analysis only. Results are advisory — combine with dynamic testing for production decisions.
        </div>
      </div>
    </footer>
  )
}
