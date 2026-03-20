import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { RsvpData } from '../App'

interface Props {
  onSubmit: (data: RsvpData) => void
}

export default function Rsvp({ onSubmit }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<RsvpData>({
    name: '',
    email: '',
    attendance: '',
    guests: '2',
    wishes: '',
  })

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(form)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="section rsvp-section">
        <div className="container">
          <h3 className="section-title">RSVP</h3>
          <div className="rsvp-success">
            <p>Thank you for your response!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section rsvp-section">
      <div className="container">
        <h3 className="section-title">RSVP</h3>
        <p className="rsvp-subtitle">Kindly confirm your attendance</p>
        <form className="rsvp-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Your Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <select
              name="attendance"
              value={form.attendance}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Will you attend?
              </option>
              <option value="yes">Joyfully Accept</option>
              <option value="no">Regretfully Decline</option>
            </select>
          </div>
          <div className="form-group">
            <select name="guests" value={form.guests} onChange={handleChange}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} Guest{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <textarea
              name="wishes"
              placeholder="Send your wishes to the couple..."
              rows={3}
              value={form.wishes}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Send RSVP
          </button>
        </form>
      </div>
    </section>
  )
}
