const DEFAULT_EVENTS = [
  {
    title: 'Holy Matrimony',
    time: '11:00 AM',
    date: 'Sunday, 20 September 2026',
    venue: 'M Resort & Hotel\nKuala Lumpur',
  },
  {
    title: 'Wedding Reception',
    time: '7:00 PM',
    date: 'Sunday, 20 September 2026',
    venue: 'M Resort & Hotel\nKuala Lumpur',
  },
]

const VENUE_FULL = 'M Resort & Hotel Kuala Lumpur, Jalan Damai, Off Jalan Ampang, 55000 Kuala Lumpur'

const ICONS: Record<string, string> = {
  'Holy Matrimony': '\u{1F48D}',
  'Wedding Reception': '\u{1F378}',
}

interface EventItem {
  title: string
  time: string
  date: string
  venue: string
  start?: string
  end?: string
}

function googleCalUrl(evt: EventItem) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: evt.title,
    details: 'Wedding of Joanna Tong & Jeremy Chee',
    location: VENUE_FULL,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

function icsBlob(evt: EventItem) {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${evt.title}`,
    `LOCATION:${VENUE_FULL}`,
    'DESCRIPTION:Wedding of Joanna Tong & Jeremy Chee',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
}

interface Props {
  events?: EventItem[]
}

export default function Events({ events }: Props) {
  const items = events ?? DEFAULT_EVENTS

  return (
    <section className="section event-section">
      <div className="container">
        <h3 className="section-title">Wedding Details</h3>
        <div className="event-cards">
          {items.map((evt) => (
            <div className="event-card" key={evt.title}>
              <div className="event-icon">{ICONS[evt.title] ?? '\u{1F48D}'}</div>
              <h4>{evt.title}</h4>
              <p className="event-time">{evt.time}</p>
              <p className="event-date">{evt.date}</p>
              <p className="event-venue">
                {evt.venue.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && evt.venue.includes('\n') && <br />}
                  </span>
                ))}
              </p>
              <div className="save-the-date">
                <a
                  href={googleCalUrl(evt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  Google Calendar
                </a>
                <a
                  href={icsBlob(evt)}
                  download={`${evt.title.replace(/\s+/g, '-').toLowerCase()}.ics`}
                  className="btn btn-outline btn-sm"
                >
                  iCal / Outlook
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
