import * as Dialog from '@radix-ui/react-dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
}

export default function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Confirm', onConfirm }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" onClick={() => onOpenChange(false)} />
        <Dialog.Content className="dialog-content">
          <Dialog.Close className="dialog-close-x">&times;</Dialog.Close>
          <Dialog.Title className="dialog-title">{title}</Dialog.Title>
          <Dialog.Description className="dialog-description">{description}</Dialog.Description>
          <div className="dialog-actions">
            <button className="btn btn-outline" onClick={() => onOpenChange(false)}>Cancel</button>
            <button className="btn-delete-confirm" onClick={() => { onConfirm(); onOpenChange(false) }}>{confirmLabel}</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
