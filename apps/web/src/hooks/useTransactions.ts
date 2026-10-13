import { useEffect, useState } from "react"

import { fetchTransactions } from "../services/transaction-service"
import type { FetchTransactionsResult, TransactionPageSize } from "../services/transaction-service"

interface UseTransactionsInput {
  page: number
  pageSize: TransactionPageSize
  search: string
}

export const useTransactions = (input: UseTransactionsInput) => {
  const [data, setData] = useState<FetchTransactionsResult>({
    transactions: [],
    page: input.page,
    pageSize: input.pageSize,
    total: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchTransactions(input)
      .then((data) => {
        if (!cancelled) {
          setData(data)
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
  }, [input.page, input.pageSize, input.search])

  return { ...data, loading }
}
