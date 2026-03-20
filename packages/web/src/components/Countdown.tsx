import { useState, useEffect } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

const LABELS: [keyof TimeLeft, string][] = [
  ['days', 'Days'],
  ['hours', 'Hours'],
  ['minutes', 'Minutes'],
  ['seconds', 'Seconds'],
]

interface Props {
  targetDate: string
}

export default function Countdown({ targetDate }: Props) {
  const [time, setTime] = useState(() => calcTimeLeft(targetDate))

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <section className="section countdown-section">
      <div className="container">
        <h3 className="section-title">Counting Down</h3>
        <div className="countdown">
          {LABELS.map(([key, label]) => (
            <div className="countdown-item" key={key}>
              <span className="countdown-number">
                {key === 'days' ? time[key] : String(time[key]).padStart(2, '0')}
              </span>
              <span className="countdown-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
