const DEFAULT_CONTACTS = [
  { name: 'Jeremy', phone: '+60123456789', role: 'Groom' },
  { name: 'Joanna', phone: '+60123456789', role: 'Bride' },
]

interface Props {
  contacts?: Array<{ name: string; phone: string; role: string }>
}

export default function Contact({ contacts }: Props) {
  const items = contacts ?? DEFAULT_CONTACTS

  return (
    <section className="section contact-section">
      <div className="container">
        <h3 className="section-title">Contact</h3>
        <p className="contact-subtitle">
          For any enquiries, feel free to reach out
        </p>
        <div className="contact-cards">
          {items.map((c) => (
            <div className="contact-card" key={c.name}>
              <p className="contact-name">{c.name}</p>
              <p className="contact-role">{c.role}</p>
              <div className="contact-buttons">
                <a href={`tel:${c.phone}`} className="btn btn-outline btn-sm">
                  Call
                </a>
                <a
                  href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
