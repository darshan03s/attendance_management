'use client'

import { Loader2, Pencil } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'

interface Trainer {
  id: string
  name: string
  email: string
}

interface BatchTrainersDialogProps {
  batchId: string
  batchName: string
  onAssigned?: () => void
}

const BatchTrainersDialog = ({ batchId, batchName, onAssigned }: BatchTrainersDialogProps) => {
  const [open, setOpen] = useState(false)
  const [assignedTrainers, setAssignedTrainers] = useState<Trainer[]>([])
  const [institutionTrainers, setInstitutionTrainers] = useState<Trainer[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [batchRes, instRes] = await Promise.all([
        fetch(`/api/batches/${batchId}/trainers`),
        fetch('/api/institution/trainers')
      ])

      if (!batchRes.ok) {
        const data = await batchRes.json()
        toast.error(data.error || 'Failed to fetch batch trainers')
        return
      }

      if (!instRes.ok) {
        const data = await instRes.json()
        toast.error(data.error || 'Failed to fetch institution trainers')
        return
      }

      const batchData = await batchRes.json()
      const instData = await instRes.json()

      setAssignedTrainers(batchData.data.trainers)
      setInstitutionTrainers(instData.data.trainers)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [batchId])

  useEffect(() => {
    if (open) {
      fetchData()
      setSelectedIds(new Set())
    }
  }, [open, fetchData])

  const assignedIds = new Set(assignedTrainers.map((t) => t.id))
  const availableTrainers = institutionTrainers.filter((t) => !assignedIds.has(t.id))

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleAssign = async () => {
    if (selectedIds.size === 0) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/batches/${batchId}/trainers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainerIds: Array.from(selectedIds) })
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to assign trainers')
        return
      }

      toast.success('Trainers assigned successfully')
      setSelectedIds(new Set())
      await fetchData()
      onAssigned?.()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Pencil className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Trainers - {batchName}</DialogTitle>
          <DialogDescription>
            Assign trainers from your institution to this batch.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Assigned Trainers</h3>
              {assignedTrainers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No trainers assigned to this batch.</p>
              ) : (
                <ul className="space-y-1">
                  {assignedTrainers.map((trainer) => (
                    <li
                      key={trainer.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span>{trainer.name}</span>
                      <span className="text-muted-foreground">{trainer.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {availableTrainers.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Available Trainers</h3>
                <ul className="space-y-1">
                  {availableTrainers.map((trainer) => (
                    <li
                      key={trainer.id}
                      className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                    >
                      <Checkbox
                        id={`batch-trainer-${batchId}-${trainer.id}`}
                        checked={selectedIds.has(trainer.id)}
                        onCheckedChange={() => toggleSelection(trainer.id)}
                        disabled={submitting}
                      />
                      <label
                        htmlFor={`batch-trainer-${batchId}-${trainer.id}`}
                        className="flex flex-1 cursor-pointer items-center justify-between"
                      >
                        <span>{trainer.name}</span>
                        <span className="text-muted-foreground">{trainer.email}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleAssign} disabled={selectedIds.size === 0 || submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BatchTrainersDialog
