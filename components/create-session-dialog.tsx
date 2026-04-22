'use client'

import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface CreateSessionDialogProps {
  batchId: string
  batchName: string
  onCreated: () => void
}

const CreateSessionDialog = ({ batchId, batchName, onCreated }: CreateSessionDialogProps) => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => {
    setDate('')
    setStartTime('')
    setEndTime('')
  }

  const handleCreate = async () => {
    if (!date || !startTime || !endTime) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, date, startTime, endTime })
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to create session')
        return
      }

      toast.success('Session created successfully')
      resetForm()
      setOpen(false)
      onCreated()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Plus className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Session - {batchName}</DialogTitle>
          <DialogDescription>
            Create a new session for this batch by providing the date, start time, and end time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-date">Date</Label>
            <Input
              id="session-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-start">Start Time</Label>
            <Input
              id="session-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-end">End Time</Label>
            <Input
              id="session-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate} disabled={submitting} className="w-full">
            {submitting && <Loader2 className="animate-spin" />}
            Create Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSessionDialog
