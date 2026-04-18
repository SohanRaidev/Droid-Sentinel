import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ShieldCheck, Radar, Zap, ArrowRight } from 'lucide-react'
import { useTheme } from '../theme.jsx'
import androidGuyBlack from '../../../androidguyblack.png'
import androidGuyWhite from '../../../androidguywhite.png'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:  { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  show:  { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

export default function Hero({ onPrimaryClick, onSecondaryClick }) {
  const { theme } = useTheme()
  const heroArt = theme === 'dark' ? androidGuyWhite : androidGuyBlack

  // Mouse parallax for the hero art
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 50, damping: 18, mass: 0.8 })
  const sy = useSpring(my, { stiffness: 50, damping: 18, mass: 0.8 })
  const artX = useTransform(sx, (v) => v * 18)
  const artY = useTransform(sy, (v) => v * 18)
  const blobX = useTransform(sx, (v) => v * -28)
  const blobY = useTransform(sy, (v) => v * -28)

  const sectionRef = useRef(null)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      mx.set(((e.clientX - r.left) / r.width) * 2 - 1)
      my.set(((e.clientY - r.top) / r.height) * 2 - 1)
    }
    const onLeave = () => { mx.set(0); my.set(0) }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [mx, my])

  return (
    <section
      ref={sectionRef}
      id="overview"
      className="relative pt-28 sm:pt-36 pb-16 overflow-hidden ds-hero-bg"
    >
      <div
        aria-hidden
        className="absolute inset-0 ds-grid-bg pointer-events-none opacity-60"
      />

      {/* Ambient orbital glow — reacts to mouse */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/3 pointer-events-none"
        style={{
          x: blobX,
          y: blobY,
          translateX: '-50%',
          translateY: '-50%',
          width: '60rem',
          height: '60rem',
          background:
            'radial-gradient(circle at center, color-mix(in srgb, var(--ds-accent) 22%, transparent), transparent 60%)',
          filter: 'blur(60px)',
          opacity: 0.55,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.img
        src={heroArt}
        alt=""
        aria-hidden
        className="absolute right-[-8rem] top-1/2 w-[min(62vw,900px)] max-w-none pointer-events-none select-none"
        style={{ opacity: 0.08, x: artX, y: artY, translateY: '-50%' }}
        animate={{ rotate: [0, 1.2, 0, -1.2, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div variants={stagger} initial="hidden" animate="show" className="text-center">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ds-surface text-xs font-medium ds-text-muted"
            style={{ boxShadow: 'var(--ds-shadow-sm)' }}
          >
            <span className="relative inline-flex w-1.5 h-1.5">
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--ds-green)' }}
                animate={{ scale: [1, 2.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
              />
              <span
                className="relative inline-flex w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--ds-green)' }}
              />
            </span>
            Live Play Store cross-verification now generally available
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="ds-title mt-8 font-semibold mx-auto max-w-4xl relative"
            style={{ fontSize: 'clamp(44px, 7.5vw, 92px)' }}
          >
            Forensic-grade security
            <br />
            for{' '}
            <span className="relative inline-block">
              <span className="ds-accent-gradient-text">every Android app.</span>
              <motion.span
                aria-hidden
                className="absolute left-0 right-0 bottom-1 h-[3px] origin-left rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, var(--ds-accent), transparent)',
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
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
            <motion.button
              onClick={onPrimaryClick}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="ds-btn-primary group inline-flex items-center gap-2 h-12 px-6 text-sm sm:text-base"
              style={{ boxShadow: 'var(--ds-shadow-accent)' }}
            >
              Analyze an APK
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
            <motion.button
              onClick={onSecondaryClick}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="ds-btn-ghost inline-flex items-center gap-2 h-12 px-6 text-sm sm:text-base"
            >
              <Zap className="w-4 h-4" /> Try live demo
            </motion.button>
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

        <HeroPreview parallaxX={sx} parallaxY={sy} />
      </div>
    </section>
  )
}

function HeroPreview({ parallaxX, parallaxY }) {
  const tiltX = useTransform(parallaxY, (v) => v * -3)
  const tiltY = useTransform(parallaxX, (v) => v * 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mt-20 mx-auto max-w-5xl"
      style={{
        perspective: 1200,
      }}
    >
      <motion.div
        className="ds-card p-5 sm:p-7 relative"
        style={{
          borderRadius: '28px',
          rotateX: tiltX,
          rotateY: tiltY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.008 }}
        transition={{ type: 'spring', stiffness: 80, damping: 16 }}
      >
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
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 sm:col-span-5 rounded-2xl p-5 ds-surface-alt"
          >
            <div className="ds-eyebrow">Verdict</div>
            <div className="mt-3 flex items-baseline gap-3">
              <motion.span
                className="text-5xl font-bold"
                style={{ color: 'var(--ds-red)' }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, type: 'spring', stiffness: 140, damping: 12 }}
              >
                98
              </motion.span>
              <span className="text-sm ds-text-muted">/ 100 risk</span>
            </div>
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.25, duration: 0.4 }}
              className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-[11px] font-semibold sev-critical"
            >
              Malicious clone
            </motion.div>
            <p className="mt-4 text-sm ds-text-muted leading-relaxed">
              Signed by <span className="ds-mono">MobileSoft Solutions Ltd</span> — Play Store
              lists publisher as <span className="ds-mono">WhatsApp LLC</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 sm:col-span-7 rounded-2xl p-5 ds-surface-alt"
          >
            <div className="ds-eyebrow">Findings</div>
            <ul className="mt-3 space-y-2">
              {[
                { label: 'Developer mismatch vs. Play Store', sev: 'critical' },
                { label: 'Active keylogging via Accessibility', sev: 'critical' },
                { label: 'SMS interception routines', sev: 'critical' },
                { label: 'C2 server communication', sev: 'high' },
                { label: 'Anti-analysis evasion', sev: 'high' },
              ].map((f, i) => (
                <motion.li
                  key={f.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.08, duration: 0.4 }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl ds-surface"
                  style={{ borderRadius: '12px' }}
                >
                  <span className="text-sm ds-text">{f.label}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full sev-${f.sev}`}>
                    {f.sev}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        className="absolute -inset-x-10 -bottom-10 h-40 blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(10,102,255,0.35), transparent 60%)',
        }}
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
