import { useEffect, useState } from "react"

import { fetchTransactionSummary } from "../services/transaction-service"
import type { TransactionSummary } from "../services/transaction-service"

export const useTransactionSummary = (search: string) => {
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchTransactionSummary(search)
      .then((data) => {
        if (!cancelled) {
          setSummary(data)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [search])

  return { summary, loading }
}
