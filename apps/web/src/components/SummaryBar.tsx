import { Statistic } from "antd"

import type { TransactionSummary } from "../services/transaction-service"

interface SummaryBarProps {
  summary: TransactionSummary
}

export const SummaryBar = ({ summary }: SummaryBarProps) => {
  return (
    <div className="summary-bar">
      <Statistic title="Total Transactions" value={summary.count} />
      <Statistic title="Total Processed" value={summary.totalVolume} precision={2} prefix="$" />
    </div>
  )
}
