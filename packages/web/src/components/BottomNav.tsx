const navItems = [
  { label: 'Contact', icon: '📞', href: '.contact-section' },
  // { label: 'Song', icon: '🎵', action: 'music' },
  { label: 'Venue', icon: '📍', href: '.venue-section' },
  { label: 'RSVP', icon: '💌', href: '.rsvp-section' },
]

interface Props {
  onMusicToggle: () => void
}

export default function BottomNav({ onMusicToggle }: Props) {
  function handleClick(item: typeof navItems[number]) {
    if (item.action === 'music') {
      onMusicToggle()
      return
    }
    if (item.href) {
      const el = document.querySelector(item.href)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.label}
          className="bottom-nav-item"
          onClick={() => handleClick(item)}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
