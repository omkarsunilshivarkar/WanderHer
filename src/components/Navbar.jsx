import { useEffect, useState } from 'react'
import '../styles/Navbar.css'
import logo from '../wanderHer_logo.png'
import LoginSignup from './LoginSignup'
import { useAuth } from '../auth/AuthContext'
import '../styles/Modal.css'


const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'ai-planner', label: 'AI Planner' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'checklist', label: 'Essentials' },
  { id: 'emergency', label: 'Emergency' },
]

export default function Navbar() {
  const { isAuthenticated, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [prevAuth, setPrevAuth] = useState(isAuthenticated)
  const [toast, setToast] = useState({ message: '', visible: false })

  const triggerToast = (msg) => {
    setToast({ message: msg, visible: true })
  }

  // Auto-close modal and trigger toast on successful login/signup or logout
  useEffect(() => {
    if (isAuthenticated && isLoginModalOpen) {
      setIsLoginModalOpen(false)
      setOpen(false) // Close mobile hamburger menu
      triggerToast('Logged in successfully! Welcome to WanderHer.')
    } else if (!isAuthenticated && prevAuth) {
      setIsLoginModalOpen(false) // Close login modal on logout
      setOpen(false) // Close mobile hamburger menu on logout
      triggerToast('Logged out successfully. See you next time!')
    }
    setPrevAuth(isAuthenticated)
  }, [isAuthenticated])

  // Handle toast auto-dismiss
  useEffect(() => {
    if (!toast.visible) return
    const timer = setTimeout(() => {
      setToast({ message: '', visible: false })
    }, 3500)
    return () => clearTimeout(timer)
  }, [toast.visible, toast.message])


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
            <img src={logo} alt="WanderHer Logo" className="logo-icon" />
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

          <li>
            <button
              type="button"
              className="nav-cta-btn"
              onClick={() => setIsLoginModalOpen(true)}
            >
              {isAuthenticated && user?.email ? `Logout` : 'Login / Signup'}
            </button>
          </li>
        </ul>
      </div>

      {open && <div className="mobile-backdrop" onClick={() => setOpen(false)} />}

      {isLoginModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setIsLoginModalOpen(false)}
              aria-label="Close"
              type="button"
            >
              x
            </button>
            <LoginSignup />
          </div>
        </div>
      )}

      {toast.visible && (
        <div className="toast-container">
          <div className="toast">
            <span className="toast-icon"></span>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      )}
    </nav>
  )
}

