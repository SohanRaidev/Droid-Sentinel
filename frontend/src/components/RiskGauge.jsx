import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const RADIUS = 70
const STROKE = 10
const CENTER = 90
const START = 210
const ARC = 300

function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, r, a0, a1) {
  const s = polar(cx, cy, r, a1)
  const e = polar(cx, cy, r, a0)
  const large = a1 - a0 <= 180 ? '0' : '1'
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`
}

function colorFor(score) {
  if (score > 55) return '#ef3b3b'
  if (score > 25) return '#f59e0b'
  return '#16a34a'
}

export default function RiskGauge({ score = 0 }) {
  const [display, setDisplay] = useState(0)
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    const duration = 1400
    const t0 = Date.now()
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * score))
      setAnimated(eased * score)
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [score])

  const color = colorFor(score)
  const endAngle = START + ARC * (animated / 100)
  const bg = arcPath(CENTER, CENTER, RADIUS, START, START + ARC)
  const fg = animated > 0 ? arcPath(CENTER, CENTER, RADIUS, START, endAngle) : null

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 180, height: 160 }}>
        <svg width="180" height="160" viewBox="0 0 180 160">
          <path
            d={bg}
            fill="none"
            stroke="var(--ds-border-strong)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          {fg && (
            <motion.path
              d={fg}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${color}55)` }}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
            />
          )}
          {[0, 25, 50, 75, 100].map((t) => {
            const a = START + (ARC * t) / 100
            const i = polar(CENTER, CENTER, RADIUS - 14, a)
            const o = polar(CENTER, CENTER, RADIUS - 8, a)
            return (
              <line
                key={t}
                x1={i.x} y1={i.y} x2={o.x} y2={o.y}
                stroke="var(--ds-border-strong)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )
          })}
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ paddingBottom: '10px' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 220 }}
            className="text-5xl font-bold leading-none"
            style={{ color, letterSpacing: '-0.02em' }}
          >
            {display}
          </motion.div>
          <div className="text-[11px] ds-text-muted mt-1 font-medium">/ 100</div>
        </div>
      </div>
      <div className="text-[10px] font-semibold tracking-[0.18em] uppercase ds-text-soft mt-1">
        Risk Score
      </div>
    </div>
  )
}
