interface Props {
  attending: number
  declined: number
}

export default function AttendanceCounter({ attending, declined }: Props) {
  return (
    <section className="section attendance-section">
      <div className="container">
        <h3 className="section-title">Attendance</h3>
        <div className="attendance-counters">
          <div className="attendance-item">
            <span className="attendance-number">{attending}</span>
            <span className="attendance-label">Attending</span>
          </div>
          <div className="attendance-item">
            <span className="attendance-number">{declined}</span>
            <span className="attendance-label">Not Attending</span>
          </div>
        </div>
      </div>
    </section>
  )
}
