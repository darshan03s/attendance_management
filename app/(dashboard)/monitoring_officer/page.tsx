'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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

interface OverallSummary {
  totalInstitutions: number
  totalBatches: number
  totalSessions: number
  presentPercent: number
  latePercent: number
  absentPercent: number
}

interface InstitutionRow {
  institutionId: string
  name: string
  totalBatches: number
  totalSessions: number
  presentPercent: number
  latePercent: number
  absentPercent: number
}

type SortKey = 'name' | 'presentPercent' | 'absentPercent'

const MonitoringOfficerPage = () => {
  const [overall, setOverall] = useState<OverallSummary | null>(null)
  const [institutions, setInstitutions] = useState<InstitutionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortKey>('presentPercent')

  const fetchSummary = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/programme/summary')
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to fetch programme summary')
        return
      }
      const { data } = await res.json()
      setOverall(data.overall)
      setInstitutions(data.institutions)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const sortedInstitutions = useMemo(() => {
    const sorted = [...institutions]
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'presentPercent') {
      sorted.sort((a, b) => a.presentPercent - b.presentPercent)
    } else if (sortBy === 'absentPercent') {
      sorted.sort((a, b) => b.absentPercent - a.absentPercent)
    }
    return sorted
  }, [institutions, sortBy])

  return (
    <div className="px-2 space-y-6">
      <h2 className="text-lg font-semibold">Programme Attendance Summary</h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Global Summary Cards */}
          {overall && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <SummaryCard label="Institutions" value={overall.totalInstitutions} />
              <SummaryCard label="Batches" value={overall.totalBatches} />
              <SummaryCard label="Sessions" value={overall.totalSessions} />
              <SummaryCard
                label="Present"
                value={`${overall.presentPercent}%`}
                className="text-green-600"
              />
              <SummaryCard
                label="Late"
                value={`${overall.latePercent}%`}
                className="text-yellow-500"
              />
              <SummaryCard
                label="Absent"
                value={`${overall.absentPercent}%`}
                className="text-red-500"
              />
            </div>
          )}

          {/* Sort Controls */}
          {institutions.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Sort by:</span>
              <button
                onClick={() => setSortBy('presentPercent')}
                className={`px-2 py-1 rounded ${sortBy === 'presentPercent' ? 'bg-muted font-medium text-foreground' : ''}`}
              >
                Lowest Present %
              </button>
              <button
                onClick={() => setSortBy('absentPercent')}
                className={`px-2 py-1 rounded ${sortBy === 'absentPercent' ? 'bg-muted font-medium text-foreground' : ''}`}
              >
                Highest Absent %
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-2 py-1 rounded ${sortBy === 'name' ? 'bg-muted font-medium text-foreground' : ''}`}
              >
                Name
              </button>
            </div>
          )}

          {/* Institution Table */}
          {institutions.length === 0 ? (
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
                {sortedInstitutions.map((inst) => (
                  <TableRow key={inst.institutionId}>
                    <TableCell>{inst.name}</TableCell>
                    <TableCell>{inst.totalBatches}</TableCell>
                    <TableCell>{inst.totalSessions}</TableCell>
                    <TableCell>
                      {inst.totalSessions === 0 ? (
                        <span className="text-muted-foreground text-xs">No sessions</span>
                      ) : (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-600">{inst.presentPercent}% present</span>
                          <span className="text-yellow-500">{inst.latePercent}% late</span>
                          <span className="text-red-500">{inst.absentPercent}% absent</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  )
}

const SummaryCard = ({
  label,
  value,
  className
}: {
  label: string
  value: string | number
  className?: string
}) => (
  <div className="rounded-lg border p-3 space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`text-xl font-semibold ${className ?? ''}`}>{value}</p>
  </div>
)

export default MonitoringOfficerPage
