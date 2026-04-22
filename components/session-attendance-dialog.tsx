'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CalendarDays, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface StudentAttendance {
  studentId: string
  name: string
  status: 'present' | 'late' | 'absent'
}

interface SessionAttendanceDialogProps {
  sessionId: string
  batchName: string
  date: string
}

const statusConfig = {
  present: {
    label: 'Present',
    variant: 'default' as const,
    className: 'bg-green-600 hover:bg-green-600'
  },
  late: {
    label: 'Late',
    variant: 'default' as const,
    className: 'bg-yellow-500 hover:bg-yellow-500'
  },
  absent: { label: 'Absent', variant: 'destructive' as const, className: '' }
}

export default function SessionAttendanceDialog({
  sessionId,
  batchName,
  date
}: SessionAttendanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<StudentAttendance[]>([])
  const [fetched, setFetched] = useState(false)

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/attendance`)
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to fetch attendance')
        return
      }
      const { data } = await res.json()
      setStudents(data.students)
      setFetched(true)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && !fetched) {
      fetchAttendance()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <CalendarDays className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Attendance - {batchName} ({formattedDate})
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : students.length === 0 && fetched ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No students in this batch
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const config = statusConfig[student.status]
                return (
                  <TableRow key={student.studentId}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className={config.className}>
                        {config.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  )
}
