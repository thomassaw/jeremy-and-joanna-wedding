import { useState, useRef } from 'react'
import Cover from './components/Cover'
import Hero from './components/Hero'
import Countdown from './components/Countdown'
import Events from './components/Events'
import Venue from './components/Venue'
import Gallery from './components/Gallery'
import Rsvp from './components/Rsvp'
import Wishes from './components/Wishes'
import Footer from './components/Footer'
import MusicToggle from './components/MusicToggle'
import AnimateOnScroll from './components/AnimateOnScroll'

const WEDDING_DATE = '2026-09-20T11:00:00+08:00'

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
  const [playing, setPlaying] = useState(false)
  const [wishes, setWishes] = useState<Wish[]>(() => {
    const saved: RsvpData[] = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]')
    return saved
      .filter((r) => r.wishes?.trim())
      .map((r) => ({ name: r.name, text: r.wishes }))
  })

  function handleOpen() {
    setOpened(true)
    document.body.style.overflow = 'auto'
    try {
      const audio = new Audio('/music/background.mp3')
      audio.loop = true
      audio.volume = 0.4
      audioRef.current = audio
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } catch {
      // No audio file — music is optional
    }
  }

  function toggleMusic() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().then(() => setPlaying(true))
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  function handleRsvp(data: RsvpData) {
    const rsvps: RsvpData[] = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]')
    rsvps.push({ ...data })
    localStorage.setItem('wedding_rsvps', JSON.stringify(rsvps))
    if (data.wishes?.trim()) {
      setWishes((prev) => [{ name: data.name, text: data.wishes }, ...prev])
    }
  }

  return (
    <>
      <Cover opened={opened} onOpen={handleOpen} />

      {opened && (
        <main className="main-content">
          <AnimateOnScroll>
            <Hero />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <Countdown targetDate={WEDDING_DATE} />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <Events />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <Venue />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <Gallery />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <Rsvp onSubmit={handleRsvp} />
          </AnimateOnScroll>

          <AnimateOnScroll>
            <Wishes wishes={wishes} />
          </AnimateOnScroll>

          <Footer />
          <MusicToggle playing={playing} onToggle={toggleMusic} />
        </main>
      )}
    </>
  )
}
