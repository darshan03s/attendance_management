'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface Institution {
  id: string
  name: string
  email: string
}

interface InstitutionSummary {
  totalBatches: number
  totalSessions: number
  presentPercent: number
  latePercent: number
  absentPercent: number
}

const ProgrammeManagerPage = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [summaryMap, setSummaryMap] = useState<Record<string, InstitutionSummary>>({})
  const [loading, setLoading] = useState(true)

  const fetchSummaries = useCallback(async (institutionList: Institution[]) => {
    const results = await Promise.all(
      institutionList.map(async (inst) => {
        try {
          const res = await fetch(`/api/institutions/${inst.id}/summary`)
          if (res.ok) {
            const { data } = await res.json()
            return { institutionId: inst.id, summary: data as InstitutionSummary }
          }
        } catch {
          // ignore per-institution errors
        }
        return {
          institutionId: inst.id,
          summary: {
            totalBatches: 0,
            totalSessions: 0,
            presentPercent: 0,
            latePercent: 0,
            absentPercent: 0
          }
        }
      })
    )

    const map: Record<string, InstitutionSummary> = {}
    for (const r of results) {
      map[r.institutionId] = r.summary
    }
    setSummaryMap(map)
  }, [])

  const fetchInstitutions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/institutions')
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to fetch institutions')
        return
      }
      const { data } = await res.json()
      setInstitutions(data)
      await fetchSummaries(data)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [fetchSummaries])

  useEffect(() => {
    fetchInstitutions()
  }, [fetchInstitutions])

  return (
    <div className="px-2 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Institution Attendance Summary</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : institutions.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">No institutions found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Institution Name</TableHead>
              <TableHead>Total Batches</TableHead>
              <TableHead>Total Sessions</TableHead>
              <TableHead>Attendance Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {institutions.map((inst) => {
              const summary = summaryMap[inst.id]
              return (
                <TableRow key={inst.id}>
                  <TableCell>{inst.name}</TableCell>
                  <TableCell>{summary?.totalBatches ?? 0}</TableCell>
                  <TableCell>{summary?.totalSessions ?? 0}</TableCell>
                  <TableCell>
                    {!summary || summary.totalSessions === 0 ? (
                      <span className="text-muted-foreground text-xs">No sessions</span>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-600">{summary.presentPercent}% present</span>
                        <span className="text-yellow-500">{summary.latePercent}% late</span>
                        <span className="text-red-500">{summary.absentPercent}% absent</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default ProgrammeManagerPage
