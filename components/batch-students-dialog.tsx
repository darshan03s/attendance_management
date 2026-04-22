'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface Student {
  id: string
  name: string
  email: string
}

interface BatchStudentsDialogProps {
  batchId: string
  batchName: string
}

export default function BatchStudentsDialog({ batchId, batchName }: BatchStudentsDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [fetched, setFetched] = useState(false)

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/trainer/batches/${batchId}/students`)
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to fetch students')
        return
      }
      const { data } = await res.json()
      setStudents(data)
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
      fetchStudents()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Users className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Students - {batchName}</DialogTitle>
          <DialogDescription>Students enrolled in this batch.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : students.length === 0 && fetched ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No students have joined this batch yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell className="text-muted-foreground">{student.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  )
}
