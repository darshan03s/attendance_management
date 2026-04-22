'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CalendarDays, CheckCircle2, Clock, Loader2, Radio } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Session {
  id: string
  batchId: string
  trainerId: string
  title: string
  date: string
  startTime: string
  endTime: string
  createdAt: string
  attended: boolean
}

interface Batch {
  id: string
  name: string
  institutionId: string
  createdAt: string
  sessions: Session[]
}

type SessionStatus = 'live' | 'upcoming' | 'completed'

function getSessionStatus(session: Session, now: Date): SessionStatus {
  const sessionStart = new Date(`${session.date}T${session.startTime}`)
  const sessionEnd = new Date(`${session.date}T${session.endTime}`)

  if (now >= sessionStart && now <= sessionEnd) return 'live'
  if (now < sessionStart) return 'upcoming'
  return 'completed'
}

function getNextOrCurrentSession(
  sessions: Session[],
  now: Date
): { session: Session; status: SessionStatus } | null {
  if (sessions.length === 0) return null

  // Sort sessions by date and start time
  const sorted = [...sessions].sort((a, b) => {
    const aTime = new Date(`${a.date}T${a.startTime}`).getTime()
    const bTime = new Date(`${b.date}T${b.startTime}`).getTime()
    return aTime - bTime
  })

  // First check if any session is currently live
  for (const s of sorted) {
    const status = getSessionStatus(s, now)
    if (status === 'live') return { session: s, status: 'live' }
  }

  // Then find the next upcoming session
  for (const s of sorted) {
    const status = getSessionStatus(s, now)
    if (status === 'upcoming') return { session: s, status: 'upcoming' }
  }

  // All sessions are completed
  return null
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

const StudentPage = () => {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [markingSession, setMarkingSession] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())

  // Update current time every 30 seconds to keep live status accurate
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchBatches = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/student/batches')
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to fetch batches')
        return
      }
      const { data } = await res.json()
      setBatches(data)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  const handleMarkAttendance = async (sessionId: string, batchId: string) => {
    setMarkingSession(sessionId)
    try {
      const res = await fetch('/api/student/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to mark attendance')
        return
      }
      toast.success('Attendance marked successfully!')
      // Update local state to reflect attendance
      setBatches((prev) =>
        prev.map((b) =>
          b.id === batchId
            ? {
                ...b,
                sessions: b.sessions.map((s) => (s.id === sessionId ? { ...s, attended: true } : s))
              }
            : b
        )
      )
    } catch {
      toast.error('Something went wrong')
    } finally {
      setMarkingSession(null)
    }
  }

  return (
    <div className="px-2 space-y-4">
      <h2 className="text-lg font-semibold">My Batches</h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : batches.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          You haven&apos;t joined any batches yet. Use an invite link from your trainer to join.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => {
            const result = getNextOrCurrentSession(batch.sessions, now)

            return (
              <Card key={batch.id} size="sm">
                <CardHeader>
                  <CardTitle>{batch.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result ? (
                    <>
                      {result.status === 'live' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Radio className="size-4 text-green-500 animate-pulse" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              Live Now
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Clock className="size-3.5" />
                            <span>
                              {formatTime(result.session.startTime)} -{' '}
                              {formatTime(result.session.endTime)}
                            </span>
                          </div>
                          {result.session.attended ? (
                            <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/30 px-3 py-2">
                              <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
                              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                Attendance Marked
                              </span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleMarkAttendance(result.session.id, batch.id)}
                              disabled={markingSession === result.session.id}
                            >
                              {markingSession === result.session.id ? (
                                <Loader2 className="size-4 animate-spin mr-2" />
                              ) : null}
                              Mark Attendance
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Next Session
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarDays className="size-3.5 text-muted-foreground" />
                            <span>{formatDate(result.session.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="size-3.5" />
                            <span>
                              {formatTime(result.session.startTime)} -{' '}
                              {formatTime(result.session.endTime)}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {batch.sessions.length === 0
                            ? 'No sessions scheduled'
                            : 'All sessions completed'}
                        </span>
                      </div>
                      {batch.sessions.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Attended {batch.sessions.filter((s) => s.attended).length} of{' '}
                          {batch.sessions.length} sessions
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StudentPage
