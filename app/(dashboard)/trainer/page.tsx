'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import BatchInviteDialog from '@/components/batch-invite-dialog'
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

const TrainerPage = () => {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
        <TabsContent value="sessions">Todo</TabsContent>
      </Tabs>
    </div>
  )
}

export default TrainerPage
