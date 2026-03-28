interface Props {
  groomName: string
  brideName: string
  weddingDate: string
}

export default function Footer({ groomName, brideName, weddingDate }: Props) {
  const date = new Date(weddingDate)
  const formatted = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const groomFirst = groomName.split(' ')[0] ?? groomName
  const brideFirst = brideName.split(' ')[0] ?? brideName

  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-names">{groomFirst} &amp; {brideFirst}</p>
        <p className="footer-date">{formatted}</p>
        <p className="footer-note">We look forward to celebrating with you</p>
      </div>
    </footer>
  )
}
