'use client'

import { Plus, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

const CreateBatch = ({ onBatchCreated }: { onBatchCreated?: () => void }) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const trimmedName = name.trim()

  const handleCreate = async () => {
    if (!trimmedName) return

    setLoading(true)
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName })
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to create batch')
        return
      }

      toast.success('Batch created successfully')
      setName('')
      setOpen(false)
      onBatchCreated?.()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Create batch
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Batch</DialogTitle>
          <DialogDescription>Enter a name for the new batch.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="batch-name">Batch Name</Label>
          <Input
            id="batch-name"
            placeholder="e.g. Batch 2025 - A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && trimmedName && !loading) {
                handleCreate()
              }
            }}
            disabled={loading}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={!trimmedName || loading}>
            {loading && <Loader2 className="animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateBatch
