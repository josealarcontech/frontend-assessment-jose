import express from "express"
import type { NextFunction, Request, Response } from "express"
import cors from "cors"

import { PORT } from "./config.js"
import { createTransactionService } from "./services/transaction-service.js"
import {
  DEFAULT_TRANSACTION_PAGE_SIZE,
  TRANSACTION_PAGE_SIZES,
  type TransactionPageSize,
} from "./services/transaction-service.js"

const app = express()
const DEFAULT_PAGE = 1

app.use(cors({ origin: "*", credentials: true }))
app.use(express.json())

const transactionService = createTransactionService()

const parsePositiveInteger = (value: unknown, fallback: number): number | null => {
  if (value === undefined) {
    return fallback
  }

  if (Array.isArray(value) || typeof value !== "string" || !/^\d+$/.test(value)) {
    return null
  }

  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

const parsePageSize = (value: unknown): TransactionPageSize | null => {
  if (value === undefined) {
    return DEFAULT_TRANSACTION_PAGE_SIZE
  }

  if (Array.isArray(value) || typeof value !== "string") {
    return null
  }

  const pageSize = TRANSACTION_PAGE_SIZES.find((allowedPageSize) => String(allowedPageSize) === value)
  return pageSize ?? null
}

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" })
})

app.get("/api/transactions", (req: Request, res: Response) => {
  console.log("GET /api/transactions", req.query)

  const page = parsePositiveInteger(req.query.page, DEFAULT_PAGE)
  const pageSize = parsePageSize(req.query.pageSize)

  if (page === null) {
    return res.status(400).json({ error: "page must be a positive integer" })
  }

  if (pageSize === null) {
    return res.status(400).json({ error: `pageSize must be one of ${TRANSACTION_PAGE_SIZES.join(", ")}` })
  }

  if (Array.isArray(req.query.search) || (req.query.search !== undefined && typeof req.query.search !== "string")) {
    return res.status(400).json({ error: "search must be a string" })
  }

  const search = req.query.search ?? ""

  res.json(transactionService.search({ page, pageSize, search }))
})

app.get("/api/transactions/summary", (req: Request, res: Response) => {
  if (Array.isArray(req.query.search) || (req.query.search !== undefined && typeof req.query.search !== "string")) {
    return res.status(400).json({ error: "search must be a string" })
  }

  res.json(transactionService.getSummary(req.query.search ?? ""))
})

app.post("/api/transactions", (req: Request, res: Response) => {
  const { merchantName, cardBrand, amount, surcharge, status } = req.body
  const transaction = transactionService.create({ merchantName, cardBrand, amount, surcharge, status })
  res.status(201).json(transaction)
})

app.put("/api/transactions/:id", (req: Request, res: Response) => {
  const { merchantName, cardBrand, amount, surcharge, status } = req.body
  const transaction = transactionService.update(req.params.id, { merchantName, cardBrand, amount, surcharge, status })
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" })
  }
  res.json(transaction)
})

app.get("/api/transactions/:id", (req: Request, res: Response) => {
  const transaction = transactionService.getById(req.params.id)
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" })
  }
  res.json(transaction)
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: err.message, stack: err.stack })
})

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT} (${transactionService.getAll().length} transactions)`)
})
