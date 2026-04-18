import { motion } from 'framer-motion'
import { ShieldCheck, Radar, Zap, ArrowRight } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:  { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  show:  { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

export default function Hero({ onPrimaryClick, onSecondaryClick }) {
  return (
    <section
      id="overview"
      className="relative pt-28 sm:pt-36 pb-16 overflow-hidden ds-hero-bg"
    >
      <div
        aria-hidden
        className="absolute inset-0 ds-grid-bg pointer-events-none opacity-60"
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div variants={stagger} initial="hidden" animate="show" className="text-center">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ds-surface text-xs font-medium ds-text-muted"
            style={{ boxShadow: 'var(--ds-shadow-sm)' }}
          >
            <span className="inline-flex w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ds-green)' }} />
            Live Play Store cross-verification now generally available
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="ds-title mt-8 font-semibold mx-auto max-w-4xl"
            style={{ fontSize: 'clamp(44px, 7.5vw, 92px)' }}
          >
            Forensic-grade security
            <br />
            for <span className="ds-accent-gradient-text">every Android app.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 mx-auto max-w-2xl text-lg sm:text-xl ds-text-muted leading-relaxed"
          >
            Droid Sentinel dissects any APK in seconds — mapping permissions, signing
            certificates, embedded endpoints, and malicious code patterns, then cross-
            verifies the result against the live Google Play Store.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={onPrimaryClick}
              className="ds-btn-primary group inline-flex items-center gap-2 h-12 px-6 text-sm sm:text-base"
              style={{ boxShadow: 'var(--ds-shadow-accent)' }}
            >
              Analyze an APK
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={onSecondaryClick}
              className="ds-btn-ghost inline-flex items-center gap-2 h-12 px-6 text-sm sm:text-base"
            >
              <Zap className="w-4 h-4" /> Try live demo
            </button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-10 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs ds-text-soft"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Static analysis only — nothing executed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Radar className="w-3.5 h-3.5" /> Signed-by validation against Play Store
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Results in under 30 seconds
            </span>
          </motion.div>
        </motion.div>

        <HeroPreview />
      </div>
    </section>
  )
}

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mt-20 mx-auto max-w-5xl"
    >
      <div className="ds-card p-5 sm:p-7 relative" style={{ borderRadius: '28px' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
          </div>
          <div className="flex-1 text-center text-xs ds-text-soft ds-mono truncate">
            droidsentinel.report · WhatsApp_Fake_v2.22.apk
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 sm:col-span-5 rounded-2xl p-5 ds-surface-alt">
            <div className="ds-eyebrow">Verdict</div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-5xl font-bold" style={{ color: 'var(--ds-red)' }}>98</span>
              <span className="text-sm ds-text-muted">/ 100 risk</span>
            </div>
            <div
              className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-[11px] font-semibold sev-critical"
            >
              Malicious clone
            </div>
            <p className="mt-4 text-sm ds-text-muted leading-relaxed">
              Signed by <span className="ds-mono">MobileSoft Solutions Ltd</span> — Play Store
              lists publisher as <span className="ds-mono">WhatsApp LLC</span>.
            </p>
          </div>

          <div className="col-span-12 sm:col-span-7 rounded-2xl p-5 ds-surface-alt">
            <div className="ds-eyebrow">Findings</div>
            <ul className="mt-3 space-y-2">
              {[
                { label: 'Developer mismatch vs. Play Store', sev: 'critical' },
                { label: 'Active keylogging via Accessibility', sev: 'critical' },
                { label: 'SMS interception routines', sev: 'critical' },
                { label: 'C2 server communication', sev: 'high' },
                { label: 'Anti-analysis evasion', sev: 'high' },
              ].map((f) => (
                <li
                  key={f.label}
                  className="flex items-center justify-between px-3 py-2 rounded-xl ds-surface"
                  style={{ borderRadius: '12px' }}
                >
                  <span className="text-sm ds-text">{f.label}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full sev-${f.sev}`}>
                    {f.sev}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="absolute -inset-x-10 -bottom-10 h-40 blur-3xl opacity-50 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(10,102,255,0.35), transparent 60%)',
        }}
      />
    </motion.div>
  )
}
