import { useState, useEffect } from 'react'
import { Moon, Sun, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../theme.jsx'

const NAV_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Intelligence', href: '#intel' },
]

export default function Navbar({ onReset, phase, onAnalyze, onExport }) {
  const { theme, toggle } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href) => (e) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl' : ''
      }`}
      style={{
        background: scrolled
          ? 'color-mix(in srgb, var(--ds-bg) 80%, transparent)'
          : 'transparent',
        borderBottom: scrolled ? '1px solid var(--ds-border)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-2.5 group"
          aria-label="Droid Sentinel home"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
            style={{
              background: 'var(--ds-surface)',
              border: '1px solid var(--ds-border)',
              boxShadow: 'var(--ds-shadow-sm)',
            }}
          >
            <img src="/logo.png" alt="Droid Sentinel" className="w-7 h-7 object-contain" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight ds-text">Droid Sentinel</span>
            <span className="text-[10px] uppercase tracking-[0.18em] ds-text-soft mt-0.5">
              Threat Intelligence
            </span>
          </div>
        </button>

        {phase === 'upload' && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={scrollTo(link.href)}
                className="px-3 py-2 text-sm ds-text-muted hover:opacity-80 transition-opacity"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {phase === 'results' && onExport && (
            <button
              onClick={onExport}
              className="hidden sm:flex items-center gap-1.5 px-3.5 h-9 rounded-full text-sm font-medium ds-btn-ghost"
              title="Export detailed report"
            >
              <FileText className="w-3.5 h-3.5" />
              Export Report
            </button>
          )}

          <button
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-full flex items-center justify-center ds-btn-ghost"
            style={{ padding: 0 }}
          >
            <AnimatePresence mode="wait">
              {theme === 'dark' ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Sun className="w-4 h-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -45, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Moon className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={onAnalyze || onReset}
            className="ds-btn-primary text-sm h-9 px-5 flex items-center"
          >
            {phase === 'results' ? 'Analyze another' : 'Analyze APK'}
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
