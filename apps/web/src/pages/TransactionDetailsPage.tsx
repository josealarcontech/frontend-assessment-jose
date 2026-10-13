import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Descriptions, Spin } from "antd"

import { TransactionForm } from "../components/TransactionForm"
import type { TransactionFormValues } from "../components/TransactionForm"
import type { Transaction } from "../models/transaction"
import { fetchTransaction, updateTransaction } from "../services/transaction-service"
import { formatDate } from "../utils/format"

const toFormValues = (transaction: Transaction): TransactionFormValues => ({
  merchantName: transaction.merchantName,
  cardBrand: transaction.cardBrand,
  amount: transaction.amount,
  surcharge: transaction.surcharge,
  status: transaction.status,
})

export const TransactionDetailsPage = () => {
  const { id } = useParams()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initialValues = useMemo(() => (transaction ? toFormValues(transaction) : null), [transaction])

  useEffect(() => {
    if (!id) {
      setError("Transaction id is missing.")
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    fetchTransaction(id)
      .then((data) => {
        if (!cancelled) {
          setTransaction(data)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Transaction not found.")
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
  }, [id])

  if (loading) {
    return (
      <div className="app-loading">
        <Spin size="large" />
      </div>
    )
  }

  if (error || !transaction || !id || !initialValues) {
    return (
      <div className="transaction-form">
        <Link to="/">Back to transactions</Link>
        <h2>{error ?? "Transaction not found."}</h2>
      </div>
    )
  }

  return (
    <TransactionForm
      title="Edit Transaction"
      submitLabel="Save changes"
      initialValues={initialValues}
      requireChanges
      successMessage="Changes saved."
      metadata={
        <Descriptions
          className="transaction-metadata"
          column={1}
          size="small"
          bordered
          items={[
            { key: "id", label: "Transaction ID", children: transaction.id },
            { key: "date", label: "Date", children: formatDate(transaction.createdAt) },
          ]}
        />
      }
      onSubmit={async (values) => {
        const updated = await updateTransaction(id, values)
        setTransaction(updated)
        return toFormValues(updated)
      }}
    />
  )
}
