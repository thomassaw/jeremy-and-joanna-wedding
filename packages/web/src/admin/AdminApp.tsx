import { useState, useEffect, useCallback, forwardRef } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import * as Tabs from '@radix-ui/react-tabs'
import * as Dialog from '@radix-ui/react-dialog'
import * as Label from '@radix-ui/react-label'
import { fetchRsvps, deleteRsvp, submitRsvp, fetchStats, fetchSettings, saveSettings, type SiteSettings } from '../api'
import DatePicker from './DatePicker'
import TimePicker from './TimePicker'
import UnsavedChangesBar from './UnsavedChangesBar'
import ConfirmDialog from './ConfirmDialog'
import { NotificationProvider, useNotification } from './Notification'
import '../styles/admin.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

interface RsvpRecord {
  id: string
  name: string
  email: string
  attendance: string
  guests: number
  wishes: string
  createdAt: string
}

interface Stats {
  attending: number
  declined: number
  totalGuests: number
  total: number
}

// ── Reusable form fields ──
function Field({ label, value, onChange, placeholder }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="field">
      <Label.Root className="field-label">{label}</Label.Root>
      <input
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

const RHFField = forwardRef<HTMLInputElement, { label: string } & React.InputHTMLAttributes<HTMLInputElement>>(
  ({ label, ...props }, ref) => (
    <div className="field">
      <Label.Root className="field-label">{label}</Label.Root>
      <input className="field-input" ref={ref} {...props} />
    </div>
  ),
)
RHFField.displayName = 'RHFField'

// ── Login ──
function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  return (
    <div className="admin-login">
      <h1 className="admin-login-title">Wedding Admin</h1>
      <p className="admin-login-subtitle">Sign in with your Google account</p>
      {GOOGLE_CLIENT_ID ? (
        <GoogleLogin
          onSuccess={(response: CredentialResponse) => {
            if (response.credential) onLogin(response.credential)
          }}
          onError={() => {}}
        />
      ) : (
        <p className="admin-error">Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID.</p>
      )}
    </div>
  )
}

// ── Dashboard ──
function Dashboard({ token, onAuthError }: { token: string; onAuthError: () => void }) {
  const { notify } = useNotification()
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewingWish, setViewingWish] = useState<{ name: string; text: string } | null>(null)
  const [showAddRsvp, setShowAddRsvp] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', email: '', attendance: 'yes', guests: '1', wishes: '' })
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [rsvpData, statsData] = await Promise.all([
        fetchRsvps(token),
        fetchStats(),
      ])
      setRsvps(rsvpData)
      setStats(statsData)
      setError('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load data'
      if (msg.includes('expired') || msg.includes('Unauthorized') || msg.includes('Missing auth')) {
        onAuthError()
        return
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadData() }, [loadData])

  async function handleDelete(id: string) {
    try {
      await deleteRsvp(token, id)
      await loadData()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  async function handleAddRsvp() {
    setAddSubmitting(true)
    try {
      await submitRsvp({
        name: addForm.name,
        email: addForm.email,
        attendance: addForm.attendance,
        guests: Number(addForm.guests),
        wishes: addForm.wishes,
      })
      setShowAddRsvp(false)
      setAddForm({ name: '', email: '', attendance: 'yes', guests: '1', wishes: '' })
      await loadData()
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to add RSVP')
    } finally {
      setAddSubmitting(false)
    }
  }

  if (loading) return <div className="admin-loading">Loading...</div>
  if (error) return <div className="admin-error">{error}</div>

  return (
    <>
      {stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.totalGuests}</span>
            <span className="stat-label">Total Guests</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.attending}</span>
            <span className="stat-label">Attending</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.declined}</span>
            <span className="stat-label">Declined</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Responses</span>
          </div>
        </div>
      )}

      <div className="settings-group-header">
        <h2 className="admin-section-title">RSVPs ({rsvps.length})</h2>
        <button className="btn-add" onClick={() => setShowAddRsvp(true)}>+ Add RSVP</button>
      </div>
      {rsvps.length === 0 ? (
        <p className="admin-empty">No RSVPs yet</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th className="th-mono">Guests</th>
                <th className="th-mono">Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.email || '-'}</td>
                  <td>
                    <span className={`badge ${r.attendance === 'yes' ? 'badge-yes' : 'badge-no'}`}>
                      {r.attendance === 'yes' ? 'Attending' : 'Declined'}
                    </span>
                  </td>
                  <td className="td-mono">{r.guests}</td>
                  <td className="td-mono">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="td-actions">
                    {r.wishes && (
                      <button className="btn-wish" onClick={() => setViewingWish({ name: r.name, text: r.wishes })}>
                        View Wish
                      </button>
                    )}
                    <button className="btn-delete" onClick={() => setDeleteTarget({ id: r.id, name: r.name })}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete RSVP"
        description={`Are you sure you want to delete the RSVP from "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget.id) }}
      />

      <Dialog.Root open={showAddRsvp} onOpenChange={setShowAddRsvp} modal={false}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" onClick={() => setShowAddRsvp(false)} />
          <Dialog.Content className="dialog-content dialog-content-form">
            <Dialog.Close className="dialog-close-x">&times;</Dialog.Close>
            <Dialog.Title className="dialog-title">Add RSVP</Dialog.Title>
            <div className="dialog-form">
              <Field label="Name" value={addForm.name} onChange={(v) => setAddForm((f) => ({ ...f, name: v }))} />
              <Field label="Email" value={addForm.email} onChange={(v) => setAddForm((f) => ({ ...f, email: v }))} />
              <div className="form-row">
                <div className="field">
                  <Label.Root className="field-label">Attendance</Label.Root>
                  <select className="field-input" value={addForm.attendance} onChange={(e) => setAddForm((f) => ({ ...f, attendance: e.target.value }))}>
                    <option value="yes">Attending</option>
                    <option value="no">Declined</option>
                  </select>
                </div>
                <div className="field">
                  <Label.Root className="field-label">Guests</Label.Root>
                  <select className="field-input" value={addForm.guests} onChange={(e) => setAddForm((f) => ({ ...f, guests: e.target.value }))}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Field label="Wishes (optional)" value={addForm.wishes} onChange={(v) => setAddForm((f) => ({ ...f, wishes: v }))} />
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleAddRsvp} disabled={addSubmitting || !addForm.name}>
                {addSubmitting ? 'Adding...' : 'Add RSVP'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={!!viewingWish} onOpenChange={() => setViewingWish(null)} modal={false}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" onClick={() => setViewingWish(null)} />
          <Dialog.Content className="dialog-content">
            <Dialog.Close className="dialog-close-x">&times;</Dialog.Close>
            <Dialog.Title className="dialog-title">Wish from {viewingWish?.name}</Dialog.Title>
            <p className="dialog-wish">"{viewingWish?.text}"</p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

// ── Settings loader ──
function Settings({ token, onAuthError }: { token: string; onAuthError: () => void }) {
  const [defaults, setDefaults] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
      .then(setDefaults)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="admin-loading">Loading...</div>
  if (!defaults) return <div className="admin-error">Failed to load settings</div>

  return <SettingsForm defaults={defaults} token={token} onAuthError={onAuthError} />
}

// ── Settings form (react-hook-form) ──
function SettingsForm({ defaults, token, onAuthError }: {
  defaults: SiteSettings
  token: string
  onAuthError: () => void
}) {
  const { notify } = useNotification()
  const { register, control, handleSubmit, reset, formState: { isDirty } } = useForm<SiteSettings>({ defaultValues: defaults })
  const { fields: eventFields, append: appendEvent, remove: removeEvent } = useFieldArray({ control, name: 'events' })
  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({ control, name: 'contacts' })
  const [saving, setSaving] = useState(false)

  async function onSubmit(data: SiteSettings) {
    setSaving(true)
    try {
      await saveSettings(token, data)
      reset(data)
      notify('Settings saved!', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      if (msg.includes('expired') || msg.includes('Unauthorized') || msg.includes('Missing auth')) {
        onAuthError()
        return
      }
      notify(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit(onSubmit)}>
      <section className="settings-group">
        <h2 className="admin-section-title">Couple</h2>
        <div className="form-row">
          <RHFField label="Groom Name" {...register('groomName')} />
          <RHFField label="Bride Name" {...register('brideName')} />
        </div>
        <div className="form-row">
          <Controller
            control={control}
            name="weddingDate"
            render={({ field }) => (
              <DatePicker
                label="Wedding Date"
                value={field.value.slice(0, 10)}
                onChange={(v) => field.onChange(v + field.value.slice(10))}
              />
            )}
          />
          <Controller
            control={control}
            name="weddingDate"
            render={({ field }) => (
              <TimePicker
                label="Time"
                value={field.value.slice(11, 16)}
                onChange={(v) => field.onChange(field.value.slice(0, 11) + v + ':00+08:00')}
              />
            )}
          />
        </div>
      </section>

      <section className="settings-group">
        <div className="settings-group-header">
          <h2 className="admin-section-title">Events</h2>
          <button type="button" className="btn-add" onClick={() => appendEvent({ title: '', time: '', date: '', venue: '' })}>+ Add Event</button>
        </div>
        {eventFields.map((field, i) => (
          <div className="settings-card" key={field.id}>
            <div className="settings-card-header">
              <strong>Event {i + 1}</strong>
              {eventFields.length > 1 && (
                <button type="button" className="btn-delete" onClick={() => removeEvent(i)}>Remove</button>
              )}
            </div>
            <div className="form-row">
              <RHFField label="Title" {...register(`events.${i}.title`)} />
              <RHFField label="Time" {...register(`events.${i}.time`)} />
            </div>
            <div className="form-row">
              <RHFField label="Date" {...register(`events.${i}.date`)} />
              <RHFField label="Venue" {...register(`events.${i}.venue`)} />
            </div>
          </div>
        ))}
      </section>

      <section className="settings-group">
        <h2 className="admin-section-title">Venue</h2>
        <RHFField label="Venue Name" {...register('venue.name')} />
        <RHFField label="Address" {...register('venue.address')} />
        <div className="form-row">
          <RHFField label="Google Maps URL" {...register('venue.googleMapsUrl')} />
          <RHFField label="Waze URL" {...register('venue.wazeUrl')} />
        </div>
        <RHFField label="Map Embed URL" {...register('venue.embedUrl')} />
      </section>

      <section className="settings-group">
        <div className="settings-group-header">
          <h2 className="admin-section-title">Contacts</h2>
          <button type="button" className="btn-add" onClick={() => appendContact({ name: '', phone: '', role: '' })}>+ Add Contact</button>
        </div>
        {contactFields.map((field, i) => (
          <div className="settings-card" key={field.id}>
            <div className="settings-card-header">
              <strong>Contact {i + 1}</strong>
              {contactFields.length > 1 && (
                <button type="button" className="btn-delete" onClick={() => removeContact(i)}>Remove</button>
              )}
            </div>
            <div className="form-row form-row-3">
              <RHFField label="Name" {...register(`contacts.${i}.name`)} />
              <RHFField label="Role" {...register(`contacts.${i}.role`)} />
              <RHFField label="Phone" {...register(`contacts.${i}.phone`)} />
            </div>
          </div>
        ))}
      </section>

      <UnsavedChangesBar
        visible={isDirty}
        saving={saving}
        onSave={handleSubmit(onSubmit)}
        onDiscard={() => reset()}
      />
    </form>
  )
}

// ── Shell ──
function AdminShell({ token, onAuthError }: { token: string; onAuthError: () => void }) {
  const params = new URLSearchParams(window.location.search)
  const initialTab = params.get('tab') === 'settings' ? 'settings' : 'dashboard'

  function handleTabChange(value: string) {
    const url = new URL(window.location.href)
    url.searchParams.set('tab', value)
    window.history.replaceState(null, '', url.toString())
  }

  return (
    <Tabs.Root defaultValue={initialTab} onValueChange={handleTabChange} className="admin-page">
      <header className="admin-header">
        <div className="admin-container admin-header-inner">
          <h1 className="admin-title">Wedding Admin</h1>
          <Tabs.List className="admin-tabs-list">
            <Tabs.Trigger className="admin-tab" value="dashboard">Dashboard</Tabs.Trigger>
            <Tabs.Trigger className="admin-tab" value="settings">Settings</Tabs.Trigger>
          </Tabs.List>
        </div>
      </header>
      <Tabs.Content forceMount value="dashboard" className="admin-tab-content admin-container admin-container-wide">
        <Dashboard token={token} onAuthError={onAuthError} />
      </Tabs.Content>
      <Tabs.Content forceMount value="settings" className="admin-tab-content admin-container">
        <Settings token={token} onAuthError={onAuthError} />
      </Tabs.Content>
    </Tabs.Root>
  )
}

export default function AdminApp() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('admin_token'))

  function handleLogin(t: string) {
    sessionStorage.setItem('admin_token', t)
    setToken(t)
  }

  function handleAuthError() {
    sessionStorage.removeItem('admin_token')
    setToken(null)
  }

  useEffect(() => {
    document.body.style.overflow = 'visible'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!token) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AdminLogin onLogin={handleLogin} />
      </GoogleOAuthProvider>
    )
  }

  return (
    <NotificationProvider>
      <AdminShell token={token} onAuthError={handleAuthError} />
    </NotificationProvider>
  )
}
