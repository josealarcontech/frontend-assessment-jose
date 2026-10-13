import { useState } from "react"
import { Button, Input, Pagination, Spin } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

import { SummaryBar } from "../components/SummaryBar"
import { TransactionList } from "../components/TransactionList"
import { useTransactionSummary } from "../hooks/useTransactionSummary"
import { useTransactions } from "../hooks/useTransactions"
import { DEFAULT_TRANSACTION_PAGE_SIZE, TRANSACTION_PAGE_SIZES } from "../services/transaction-service"
import type { TransactionPageSize } from "../services/transaction-service"

export const TransactionsPage = () => {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<TransactionPageSize>(DEFAULT_TRANSACTION_PAGE_SIZE)
  const { transactions, total, loading } = useTransactions({ page, pageSize, search })
  const { summary, loading: summaryLoading } = useTransactionSummary(search)

  console.log("render TransactionsPage", transactions.length, "search:", search)

  const submitSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  if (loading || summaryLoading || summary === null) {
    return (
      <div className="app-loading">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <>
      <header className="app-header">
        <h1>Transactions</h1>
        <div className="transaction-search">
          <Input
            style={{ width: 320 }}
            prefix={<SearchOutlined />}
            allowClear
            placeholder="Search merchant, id, card, status..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={submitSearch}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={submitSearch}>
            Search
          </Button>
        </div>
      </header>

      <SummaryBar summary={summary} />

      <TransactionList transactions={transactions} onSelect={(transaction) => navigate(`/transactions/${transaction.id}`)} />

      <Pagination
        className="transaction-pagination"
        current={page}
        pageSize={pageSize}
        pageSizeOptions={[...TRANSACTION_PAGE_SIZES]}
        showSizeChanger
        total={total}
        onChange={(nextPage, nextPageSize) => {
          setPage(nextPageSize !== pageSize ? 1 : nextPage)
          setPageSize(nextPageSize as TransactionPageSize)
        }}
      />

    </>
  )
}
