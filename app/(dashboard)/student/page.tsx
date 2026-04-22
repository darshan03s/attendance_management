'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

interface Batch {
  id: string
  name: string
  institutionId: string
  createdAt: string
}

const StudentPage = () => {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

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
          {batches.map((batch) => (
            <Card key={batch.id} size="sm">
              <CardHeader>
                <CardTitle>{batch.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentPage
