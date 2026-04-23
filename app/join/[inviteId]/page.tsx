'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface InviteData {
  inviteId: string
  batchId: string
  batchName: string
}

const JoinPage = () => {
  const { inviteId } = useParams<{ inviteId: string }>()
  const router = useRouter()
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInvite = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/invite/${inviteId}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Invalid invite link')
        return
      }
      const { data } = await res.json()

      // Check user role via a simple API call
      const userRes = await fetch('/api/user')
      if (!userRes.ok) {
        setError('Failed to verify your account')
        return
      }
      const userData = await userRes.json()

      if (userData.role !== 'student') {
        toast.error('Invite link only for students')
        router.replace('/')
        return
      }

      setInviteData(data)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [inviteId, router])

  useEffect(() => {
    fetchInvite()
  }, [fetchInvite])

  const handleJoin = async () => {
    if (!inviteData) return
    setJoining(true)
    try {
      const res = await fetch(`/api/batches/${inviteData.batchId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: inviteData.inviteId })
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to join batch')
        return
      }
      toast.success('Successfully joined the batch!')
      router.replace('/student')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.replace('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!inviteData) return null

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Join {inviteData.batchName}</CardTitle>
          <CardDescription>
            You have been invited to join this batch. Click the button below to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleJoin} disabled={joining}>
            {joining && <Loader2 className="animate-spin" />}
            Join
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default JoinPage
