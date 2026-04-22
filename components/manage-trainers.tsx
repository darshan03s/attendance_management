'use client'

import { Loader2, Users } from 'lucide-react'
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

const ManageTrainers = () => {
  const [open, setOpen] = useState(false)
  const [assignedTrainers, setAssignedTrainers] = useState<Trainer[]>([])
  const [availableTrainers, setAvailableTrainers] = useState<Trainer[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchTrainers = useCallback(async () => {
    setLoading(true)
    try {
      const [assignedRes, availableRes] = await Promise.all([
        fetch('/api/institution/trainers'),
        fetch('/api/trainers')
      ])

      if (!assignedRes.ok) {
        const data = await assignedRes.json()
        toast.error(data.error || 'Failed to fetch assigned trainers')
        return
      }

      if (!availableRes.ok) {
        const data = await availableRes.json()
        toast.error(data.error || 'Failed to fetch available trainers')
        return
      }

      const assigned = await assignedRes.json()
      const available = await availableRes.json()

      setAssignedTrainers(assigned.data.trainers)
      setAvailableTrainers(available.data.trainers)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchTrainers()
      setSelectedIds(new Set())
    }
  }, [open, fetchTrainers])

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

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return

    setSubmitting(true)
    try {
      const results = await Promise.all(
        Array.from(selectedIds).map((trainerId) =>
          fetch('/api/institution/trainers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trainerId })
          })
        )
      )

      const errors: string[] = []
      for (const res of results) {
        if (!res.ok) {
          const data = await res.json()
          errors.push(data.error || 'Failed to assign trainer')
        }
      }

      if (errors.length > 0) {
        toast.error(errors[0])
      }

      const successCount = results.filter((r) => r.ok).length
      if (successCount > 0) {
        toast.success(`${successCount} trainer${successCount > 1 ? 's' : ''} assigned`)
      }

      setSelectedIds(new Set())
      await fetchTrainers()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users /> Manage Trainers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Trainers</DialogTitle>
          <DialogDescription>Assign available trainers to your institution.</DialogDescription>
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
                <p className="text-sm text-muted-foreground">No trainers assigned yet.</p>
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

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Available Trainers</h3>
              {availableTrainers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No unassigned trainers available.</p>
              ) : (
                <ul className="space-y-1">
                  {availableTrainers.map((trainer) => (
                    <li
                      key={trainer.id}
                      className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                    >
                      <Checkbox
                        id={`trainer-${trainer.id}`}
                        checked={selectedIds.has(trainer.id)}
                        onCheckedChange={() => toggleSelection(trainer.id)}
                        disabled={submitting}
                      />
                      <label
                        htmlFor={`trainer-${trainer.id}`}
                        className="flex flex-1 cursor-pointer items-center justify-between"
                      >
                        <span>{trainer.name}</span>
                        <span className="text-muted-foreground">{trainer.email}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={selectedIds.size === 0 || submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ManageTrainers
