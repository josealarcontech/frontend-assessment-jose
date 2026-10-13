import _ from "lodash"

import { TransactionStatus } from "../models/transaction.js"
import type { CardBrand, Transaction } from "../models/transaction.js"
import { loadTransactions } from "../data/transactions.js"

export const TRANSACTION_PAGE_SIZES = [20, 50, 100] as const
export type TransactionPageSize = (typeof TRANSACTION_PAGE_SIZES)[number]
export const DEFAULT_TRANSACTION_PAGE_SIZE: TransactionPageSize = TRANSACTION_PAGE_SIZES[0]

export interface TransactionSummary {
  count: number
  totalVolume: number
  totalSurcharge: number
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

export interface TransactionSearchInput {
  page: number
  pageSize: TransactionPageSize
  search: string
}

export interface TransactionSearchResult {
  transactions: Transaction[]
  page: number
  pageSize: number
  total: number
}

export const createTransactionService = () => {
  const transactions = loadTransactions()

  const getAll = (): Transaction[] => transactions

  const findMatchingTransactions = (search: string): Transaction[] => {
    const term = search.trim().toLowerCase()
    return transactions.filter((t) => {
      return (
        t.merchantName.toLowerCase().includes(term) ||
        t.id.toLowerCase().includes(term) ||
        t.cardBrand.toLowerCase().includes(term) ||
        t.status.toLowerCase().includes(term)
      )
    })
  }

  const search = (input: TransactionSearchInput): TransactionSearchResult => {
    const matchingTransactions = findMatchingTransactions(input.search)

    const start = (input.page - 1) * input.pageSize

    return {
      transactions: matchingTransactions.slice(start, start + input.pageSize),
      page: input.page,
      pageSize: input.pageSize,
      total: matchingTransactions.length,
    }
  }

  const getById = (id: string): Transaction | undefined => transactions.find((t) => t.id === id)

  const getSummary = (search = ""): TransactionSummary => {
    const matchingTransactions = findMatchingTransactions(search)

    return {
      count: matchingTransactions.length,
      totalVolume: _.round(_.sumBy(matchingTransactions, "amount"), 2),
      totalSurcharge: _.round(_.sumBy(matchingTransactions, "surcharge"), 2),
    }
  }

  const create = (input: NewTransactionInput): Transaction => {
    const surchargeRate = input.amount > 0 ? _.round(input.surcharge / input.amount, 4) : 0
    const transaction: Transaction = {
      id: `txn_${String(transactions.length + 1).padStart(6, "0")}`,
      merchantName: input.merchantName,
      cardBrand: input.cardBrand,
      amount: input.amount,
      surchargeRate,
      surcharge: input.surcharge,
      total: _.round(input.amount + input.surcharge, 2),
      status: input.status,
      createdAt: new Date().toISOString(),
    }
    transactions.unshift(transaction)
    return transaction
  }

  const update = (id: string, input: UpdateTransactionInput): Transaction | undefined => {
    const index = transactions.findIndex((t) => t.id === id)
    if (index === -1) {
      return undefined
    }

    const existing = transactions[index]
    const surchargeRate = input.amount > 0 ? _.round(input.surcharge / input.amount, 4) : 0
    const transaction: Transaction = {
      ...existing,
      merchantName: input.merchantName,
      cardBrand: input.cardBrand,
      amount: input.amount,
      surchargeRate,
      surcharge: input.surcharge,
      total: _.round(input.amount + input.surcharge, 2),
      status: input.status,
    }

    transactions[index] = transaction
    return transaction
  }

  return { getAll, search, getById, getSummary, create, update }
}

export type TransactionService = ReturnType<typeof createTransactionService>
