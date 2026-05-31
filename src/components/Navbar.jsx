import { useState, useEffect } from 'react'
import '../styles/Navbar.css'

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'safety-tips', label: 'Safety Tips' },
  { id: 'travel-tips', label: 'Travel Tips' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'ai-planner', label: 'AI Planner' },
  { id: 'checklist', label: 'Checklist' }
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      const sectionId = window.location.hash.replace('#', '')
      if (sectionId) {
        setActiveSection(sectionId)
      }
      setOpen(false)
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visibleEntry?.target.id) {
          setActiveSection(visibleEntry.target.id)
        }
      },
      {
        rootMargin: '-100px 0px -55% 0px',
        threshold: [0.15, 0.35, 0.6]
      }
    )

    sections.forEach((section) => observer.observe(section))

    const initialSection = window.location.hash.replace('#', '')
    if (initialSection) {
      setActiveSection(initialSection)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-logo">
            <span className="logo-icon">💎</span>
            <span>WanderHer</span>
          </div>
        </div>

        <button
          className={`nav-toggle ${open ? 'open' : ''}`}
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label="Toggle navigation"
          type="button"
        >
          <span className={`hamburger ${open ? 'open' : ''}`}></span>
        </button>

        <ul id="primary-navigation" className={`nav-tabs ${open ? 'open' : ''}`}>
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                className={`nav-tab ${activeSection === item.id ? 'active' : ''}`}
                href={`#${item.id}`}
                onClick={() => {
                  setActiveSection(item.id)
                  setOpen(false)
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {open && <div className="mobile-backdrop" onClick={() => setOpen(false)} />}
    </nav>
  )
}
