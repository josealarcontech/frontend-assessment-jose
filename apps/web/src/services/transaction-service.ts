import type { CardBrand, Transaction, TransactionStatus } from "../models/transaction"

const API_BASE = "/api"
export const TRANSACTION_PAGE_SIZES = [20, 50, 100] as const
export type TransactionPageSize = (typeof TRANSACTION_PAGE_SIZES)[number]
export const DEFAULT_TRANSACTION_PAGE_SIZE: TransactionPageSize = TRANSACTION_PAGE_SIZES[0]

export interface FetchTransactionsInput {
  page: number
  pageSize: TransactionPageSize
  search: string
}

export interface FetchTransactionsResult {
  transactions: Transaction[]
  page: number
  pageSize: TransactionPageSize
  total: number
}

export interface TransactionSummary {
  count: number
  totalVolume: number
  totalSurcharge: number
}

export const fetchTransactions = async (input: FetchTransactionsInput): Promise<FetchTransactionsResult> => {
  const params = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
    search: input.search,
  })
  const rsp = await fetch(`${API_BASE}/transactions?${params.toString()}`)

  if (!rsp.ok) {
    throw new Error("Failed to fetch transactions")
  }

  const data = await rsp.json()
  return data
}

export const fetchTransactionSummary = async (search: string): Promise<TransactionSummary> => {
  const params = new URLSearchParams({ search })
  const rsp = await fetch(`${API_BASE}/transactions/summary?${params.toString()}`)

  if (!rsp.ok) {
    throw new Error("Failed to fetch transaction summary")
  }

  return rsp.json()
}

export interface NewTransactionInput {
  merchantName: string
  cardBrand: CardBrand
  amount: number
  surcharge: number
  status: TransactionStatus
}

export interface UpdateTransactionInput {
  merchantName: string
  cardBrand: CardBrand
  amount: number
  surcharge: number
  status: TransactionStatus
}

export const fetchTransaction = async (id: string): Promise<Transaction> => {
  const rsp = await fetch(`${API_BASE}/transactions/${id}`)

  if (!rsp.ok) {
    throw new Error("Failed to fetch transaction")
  }

  return rsp.json()
}

export const createTransaction = async (input: NewTransactionInput): Promise<Transaction> => {
  const rsp = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  })
  return rsp.json()
}

export const updateTransaction = async (id: string, input: UpdateTransactionInput): Promise<Transaction> => {
  const rsp = await fetch(`${API_BASE}/transactions/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!rsp.ok) {
    throw new Error("Failed to update transaction")
  }

  return rsp.json()
}
