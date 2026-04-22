'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import CreateBatch from '@/components/create-batch'
import ManageTrainers from '@/components/manage-trainers'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface Batch {
  id: string
  name: string
  institutionId: string
  createdAt: string
}

const InstitutionPage = () => {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBatches = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/batches')
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Batches</h2>
        <div className="flex items-center gap-2">
          <ManageTrainers />
          <CreateBatch onBatchCreated={fetchBatches} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : batches.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No batches yet. Create one to get started.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default InstitutionPage
