const events = [
  {
    icon: '\u{1F48D}',
    title: 'Holy Matrimony',
    time: '11:00 AM',
    date: 'Sunday, 20 September 2026',
    venue: 'M Resort & Hotel\nKuala Lumpur',
  },
  {
    icon: '\u{1F378}',
    title: 'Wedding Reception',
    time: '7:00 PM',
    date: 'Sunday, 20 September 2026',
    venue: 'M Resort & Hotel\nKuala Lumpur',
  },
]

export default function Events() {
  return (
    <section className="section event-section">
      <div className="container">
        <h3 className="section-title">Wedding Details</h3>
        <div className="event-cards">
          {events.map((evt) => (
            <div className="event-card" key={evt.title}>
              <div className="event-icon">{evt.icon}</div>
              <h4>{evt.title}</h4>
              <p className="event-time">{evt.time}</p>
              <p className="event-date">{evt.date}</p>
              <p className="event-venue">
                {evt.venue.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
