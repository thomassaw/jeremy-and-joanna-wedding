import { useState, useRef, useEffect } from 'react'
import Cover from './components/Cover'
import Hero from './components/Hero'
import Countdown from './components/Countdown'
import Events from './components/Events'
import Venue from './components/Venue'
import Gallery from './components/Gallery'
import Rsvp from './components/Rsvp'
import AttendanceCounter from './components/AttendanceCounter'
import Wishes from './components/Wishes'
import Contact from './components/Contact'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'
import AnimateOnScroll from './components/AnimateOnScroll'
import { submitRsvp, fetchWishes, fetchStats, fetchSettings, type SiteSettings } from './api'

export interface RsvpData {
  name: string
  email: string
  attendance: string
  guests: string
  wishes: string
}

export interface Wish {
  name: string
  text: string
}

export default function App() {
  const [opened, setOpened] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playingRef = useRef(false)
  const [wishes, setWishes] = useState<Wish[]>([])
  const [stats, setStats] = useState({ attending: 0, declined: 0 })
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {})
    fetchWishes()
      .then((data) => setWishes(data.map((w) => ({ name: w.name, text: w.text }))))
      .catch(() => {})
    fetchStats()
      .then((data) => setStats({ attending: data.totalGuests, declined: data.declined }))
      .catch(() => {})
  }, [])

  function handleOpen() {
    setOpened(true)
    document.body.style.overflow = 'auto'
    try {
      const audio = new Audio('/music/background.mp3')
      audio.loop = true
      audio.volume = 0.4
      audioRef.current = audio
      audio.play().then(() => playingRef.current = true).catch(() => playingRef.current = false)
    } catch {
      // No audio file — music is optional
    }
  }

  function toggleMusic() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().then(() => playingRef.current = true)
    } else {
      audio.pause()
      playingRef.current = false
    }
  }

  async function handleRsvp(data: RsvpData) {
    if (data.wishes?.trim()) {
      setWishes((prev) => [{ name: data.name, text: data.wishes }, ...prev])
    }
    if (data.attendance === 'yes') {
      setStats((prev) => ({ ...prev, attending: prev.attending + Number(data.guests || 1) }))
    } else if (data.attendance === 'no') {
      setStats((prev) => ({ ...prev, declined: prev.declined + 1 }))
    }

    await submitRsvp({
      name: data.name,
      email: data.email,
      attendance: data.attendance,
      guests: Number(data.guests || 1),
      wishes: data.wishes,
    })
  }

  return (
    <>
      <Cover opened={opened} onOpen={handleOpen} />

      {opened && (
        <main className="main-content">
          <AnimateOnScroll>
            <Hero
              groomName={settings?.groomName ?? 'Jeremy Chee'}
              brideName={settings?.brideName ?? 'Joanna Tong'}
            />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <Countdown targetDate={settings?.weddingDate ?? '2026-09-20T11:00:00+08:00'} />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <Events events={settings?.events} />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <Venue venue={settings?.venue} />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <Gallery />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <Rsvp onSubmit={handleRsvp} />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <AttendanceCounter attending={stats.attending} declined={stats.declined} />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <Wishes wishes={wishes} />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <Contact contacts={settings?.contacts} />
          </AnimateOnScroll>

          <Footer
            groomName={settings?.groomName ?? 'Jeremy'}
            brideName={settings?.brideName ?? 'Joanna'}
            weddingDate={settings?.weddingDate ?? '2026-09-20T11:00:00+08:00'}
          />
          <BottomNav onMusicToggle={toggleMusic} />
        </main>
      )}
    </>
  )
}
