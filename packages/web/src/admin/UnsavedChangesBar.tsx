interface Props {
  visible: boolean
  saving: boolean
  onSave: () => void
  onDiscard: () => void
}

export default function UnsavedChangesBar({ visible, saving, onSave, onDiscard }: Props) {
  return (
    <div className={`unsaved-bar ${visible ? 'unsaved-bar-visible' : ''}`}>
      <div className="admin-container unsaved-bar-inner">
        <span className="unsaved-bar-message">You have unsaved changes</span>
        <div className="unsaved-bar-actions">
          <button type="button" className="btn-discard" onClick={onDiscard} disabled={saving}>
            Discard
          </button>
          <button type="button" className="btn-save" onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
