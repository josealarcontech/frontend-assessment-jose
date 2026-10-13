import { useNavigate } from "react-router-dom"

import { TransactionForm } from "../components/TransactionForm"
import type { TransactionFormValues } from "../components/TransactionForm"
import { CardBrand, TransactionStatus } from "../models/transaction"
import { createTransaction } from "../services/transaction-service"

const initialValues: TransactionFormValues = {
  merchantName: "",
  cardBrand: CardBrand.VISA,
  amount: 0,
  surcharge: 0,
  status: TransactionStatus.APPROVED,
}

export const NewTransactionPage = () => {
  const navigate = useNavigate()

  return (
    <TransactionForm
      title="New Transaction"
      submitLabel="Create"
      initialValues={initialValues}
      blankMoneyFields
      onSubmit={async (values) => {
        await createTransaction(values)
        navigate("/")
      }}
    />
  )
}
