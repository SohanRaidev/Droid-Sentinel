import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ThemeContext = createContext({ theme: 'light', toggle: () => {}, setTheme: () => {} })

const STORAGE_KEY = 'droid-sentinel-theme'

function readInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch (_) {}
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch (_) {}
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#070a13' : '#ffffff')
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next === 'dark' ? 'dark' : 'light')
  }, [])

  const toggle = useCallback(() => {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
