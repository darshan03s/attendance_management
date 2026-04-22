'use client'

import { Check, Copy, Link, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
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

interface BatchInviteDialogProps {
  batchId: string
  batchName: string
}

const BatchInviteDialog = ({ batchId, batchName }: BatchInviteDialogProps) => {
  const [open, setOpen] = useState(false)
  const [inviteId, setInviteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const inviteUrl = inviteId ? `${window.location.origin}/join/${inviteId}` : null

  const fetchInvite = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/batches/${batchId}/invite`)
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to fetch invite')
        return
      }
      const { data } = await res.json()
      setInviteId(data.inviteId)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [batchId])

  useEffect(() => {
    if (open) {
      setInviteId(null)
      setCopied(false)
      fetchInvite()
    }
  }, [open, fetchInvite])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`/api/batches/${batchId}/invite`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to generate invite')
        return
      }
      const { data } = await res.json()
      setInviteId(data.inviteId)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success('Invite link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Link className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Link - {batchName}</DialogTitle>
          <DialogDescription>
            Generate an invite link for students to join this batch.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : inviteId && inviteUrl ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm break-all select-all">
                {inviteUrl}
              </div>
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link with students. Generating a new link will deactivate the previous one.
            </p>
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
              {generating && <Loader2 className="animate-spin" />}
              Regenerate Link
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-sm text-muted-foreground">No active invite link for this batch.</p>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating && <Loader2 className="animate-spin" />}
              Generate Link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default BatchInviteDialog
