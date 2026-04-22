'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import BatchInviteDialog from '@/components/batch-invite-dialog'
import CreateSessionDialog from '@/components/create-session-dialog'
import SessionAttendanceDialog from '@/components/session-attendance-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Batch {
  id: string
  name: string
  institutionId: string
  createdAt: string
}

interface Session {
  id: string
  batchId: string
  trainerId: string
  batchName: string
  date: string
  startTime: string
  endTime: string
  createdAt: string
}

const TrainerPage = () => {
  const [batches, setBatches] = useState<Batch[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionsLoading, setSessionsLoading] = useState(true)

  const fetchBatches = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/trainer/batches')
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

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true)
    try {
      const res = await fetch('/api/trainer/sessions')
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to fetch sessions')
        return
      }
      const { data } = await res.json()
      setSessions(data)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSessionsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBatches()
    fetchSessions()
  }, [fetchBatches, fetchSessions])

  return (
    <div className="px-2 space-y-4">
      <Tabs defaultValue="batches">
        <TabsList>
          <TabsTrigger value="batches">My Batches</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="batches">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : batches.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              You are not assigned to any batches yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Invite Link</TableHead>
                  <TableHead>Create Session</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>{batch.name}</TableCell>
                    <TableCell>
                      {new Date(batch.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <BatchInviteDialog batchId={batch.id} batchName={batch.name} />
                    </TableCell>
                    <TableCell>
                      <CreateSessionDialog
                        batchId={batch.id}
                        batchName={batch.name}
                        onCreated={fetchSessions}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
        <TabsContent value="sessions">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No sessions created yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.batchName}</TableCell>
                    <TableCell>
                      {new Date(session.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>{session.startTime}</TableCell>
                    <TableCell>{session.endTime}</TableCell>
                    <TableCell>
                      {new Date(session.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      {new Date(`${session.date}T${session.startTime}`) <= new Date() ? (
                        <SessionAttendanceDialog
                          sessionId={session.id}
                          batchName={session.batchName}
                          date={session.date}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TrainerPage
