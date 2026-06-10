const footerLinks = [
  { href: '#home', label: 'Home' },
  { href: '#ai-planner', label: 'AI Planner' },
  { href: '#itinerary', label: 'Itinerary' },
  { href: '#checklist', label: 'Checklist' },
  { href: '#tips', label: 'Tips' },
  { href: '#emergency', label: 'Emergency' },
]

const socialLinks = [
  { href: 'https://instagram.com', label: 'Instagram', icon: 'IG' },
  { href: 'https://twitter.com', label: 'Twitter', icon: 'X' },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: 'in' },
  { href: 'https://youtube.com', label: 'YouTube', icon: 'YT' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-panel">
        <div className="footer-main-row">
          <nav className="site-footer-links" aria-label="Footer navigation">
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="site-footer-socials" aria-label="Social links">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} aria-label={link.label}>
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-bottom-row">
          <p>© 2026 WanderHer. All rights reserved.</p>
          <p>Travel Smarter. Travel Safer</p>
        </div>
      </div>
    </footer>
  )
}
