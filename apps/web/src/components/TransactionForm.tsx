import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Button, Input, Select, message } from "antd"

import { CardBrand, TransactionStatus } from "../models/transaction"

const MONEY_INPUT_PATTERN = /^\d*(?:\.\d{0,2})?$/
const VALID_MONEY_PATTERN = /^\d+(?:\.\d{1,2})?$/
const PERCENT_INPUT_PATTERN = /^\d*(?:\.\d{0,2})?$/
const VALID_PERCENT_PATTERN = /^\d+(?:\.\d{1,2})?$/
const MIN_MERCHANT_NAME_LENGTH = 3

type SurchargeSource = "amount" | "percentage"

export interface TransactionFormValues {
  merchantName: string
  cardBrand: CardBrand
  amount: number
  surcharge: number
  status: TransactionStatus
}

interface TransactionFormProps {
  title: string
  submitLabel: string
  initialValues: TransactionFormValues
  metadata?: ReactNode
  requireChanges?: boolean
  blankMoneyFields?: boolean
  successMessage?: string
  onSubmit: (values: TransactionFormValues) => Promise<TransactionFormValues | void>
}

interface TransactionFormState {
  merchantName: string
  cardBrand: CardBrand
  amount: string
  surchargeAmount: string
  surchargePercentage: string
  status: TransactionStatus
}

const formatMoneyInput = (value: number): string => value.toFixed(2)
const formatPercentageInput = (value: number): string => value.toFixed(2)

const toFormState = (values: TransactionFormValues, blankMoneyFields = false): TransactionFormState => {
  const surchargePercentage = values.amount > 0 ? (values.surcharge / values.amount) * 100 : 0

  return {
    merchantName: values.merchantName,
    cardBrand: values.cardBrand,
    amount: blankMoneyFields ? "" : formatMoneyInput(values.amount),
    surchargeAmount: blankMoneyFields ? "" : formatMoneyInput(values.surcharge),
    surchargePercentage: blankMoneyFields ? "" : formatPercentageInput(surchargePercentage),
    status: values.status,
  }
}

const toComparableState = (form: TransactionFormState): TransactionFormState => ({
  ...form,
  merchantName: form.merchantName.trim(),
  amount: formatMoneyInput(Number(form.amount)),
  surchargeAmount: formatMoneyInput(Number(form.surchargeAmount)),
  surchargePercentage: formatPercentageInput(Number(form.surchargePercentage)),
})

export const TransactionForm = ({
  title,
  submitLabel,
  initialValues,
  metadata,
  requireChanges = false,
  blankMoneyFields = false,
  successMessage,
  onSubmit,
}: TransactionFormProps) => {
  const [form, setForm] = useState<TransactionFormState>(() => toFormState(initialValues, blankMoneyFields))
  const [savedForm, setSavedForm] = useState<TransactionFormState>(() => toFormState(initialValues, blankMoneyFields))
  const [surchargeSource, setSurchargeSource] = useState<SurchargeSource>("amount")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const nextForm = toFormState(initialValues, blankMoneyFields)
    setForm(nextForm)
    setSavedForm(nextForm)
    setSurchargeSource("amount")
  }, [initialValues, blankMoneyFields])

  const parsedAmount = Number(form.amount)
  const parsedSurchargeAmount = Number(form.surchargeAmount)
  const parsedSurchargePercentage = Number(form.surchargePercentage)
  const merchantNameIsValid = form.merchantName.trim().length >= MIN_MERCHANT_NAME_LENGTH
  const amountIsValid = VALID_MONEY_PATTERN.test(form.amount) && Number.isFinite(parsedAmount) && parsedAmount > 0
  const surchargeAmountIsValid =
    VALID_MONEY_PATTERN.test(form.surchargeAmount) &&
    Number.isFinite(parsedSurchargeAmount) &&
    parsedSurchargeAmount >= 0
  const surchargePercentageIsValid =
    VALID_PERCENT_PATTERN.test(form.surchargePercentage) &&
    Number.isFinite(parsedSurchargePercentage) &&
    parsedSurchargePercentage >= 0 &&
    parsedSurchargePercentage <= 100
  const formIsValid = merchantNameIsValid && amountIsValid && surchargeAmountIsValid && surchargePercentageIsValid
  const isDirty = JSON.stringify(toComparableState(form)) !== JSON.stringify(toComparableState(savedForm))
  const canSubmit = formIsValid && (!requireChanges || isDirty)

  const updateForm = (updates: Partial<TransactionFormState>) => {
    setForm((current) => ({ ...current, ...updates }))
  }

  const handleAmountChange = (value: string) => {
    if (!MONEY_INPUT_PATTERN.test(value)) {
      return
    }

    const nextAmount = Number(value)
    const nextAmountIsValid = VALID_MONEY_PATTERN.test(value) && Number.isFinite(nextAmount) && nextAmount > 0
    const updates: Partial<TransactionFormState> = { amount: value }

    if (nextAmountIsValid) {
      if (surchargeSource === "amount" && surchargeAmountIsValid) {
        updates.surchargePercentage = formatPercentageInput((parsedSurchargeAmount / nextAmount) * 100)
      }

      if (surchargeSource === "percentage" && surchargePercentageIsValid) {
        updates.surchargeAmount = formatMoneyInput(nextAmount * (parsedSurchargePercentage / 100))
      }
    }

    updateForm(updates)
  }

  const handleSurchargeAmountChange = (value: string) => {
    if (!MONEY_INPUT_PATTERN.test(value)) {
      return
    }

    setSurchargeSource("amount")

    const nextSurchargeAmount = Number(value)
    const nextSurchargeAmountIsValid =
      VALID_MONEY_PATTERN.test(value) && Number.isFinite(nextSurchargeAmount) && nextSurchargeAmount >= 0
    const updates: Partial<TransactionFormState> = { surchargeAmount: value }

    updates.surchargePercentage =
      amountIsValid && nextSurchargeAmountIsValid
        ? formatPercentageInput((nextSurchargeAmount / parsedAmount) * 100)
        : ""

    updateForm(updates)
  }

  const handleSurchargePercentageChange = (value: string) => {
    if (!PERCENT_INPUT_PATTERN.test(value)) {
      return
    }

    setSurchargeSource("percentage")

    const nextSurchargePercentage = Number(value)
    const nextSurchargePercentageIsValid =
      VALID_PERCENT_PATTERN.test(value) &&
      Number.isFinite(nextSurchargePercentage) &&
      nextSurchargePercentage >= 0 &&
      nextSurchargePercentage <= 100
    const updates: Partial<TransactionFormState> = { surchargePercentage: value }

    updates.surchargeAmount =
      amountIsValid && nextSurchargePercentageIsValid
        ? formatMoneyInput(parsedAmount * (nextSurchargePercentage / 100))
        : ""

    updateForm(updates)
  }

  const handleSubmit = async () => {
    if (!canSubmit || submitting) {
      return
    }

    const values: TransactionFormValues = {
      merchantName: form.merchantName.trim(),
      cardBrand: form.cardBrand,
      amount: parsedAmount,
      surcharge: parsedSurchargeAmount,
      status: form.status,
    }

    try {
      setSubmitting(true)
      const nextValues = await onSubmit(values)
      const nextForm = toFormState(nextValues ?? values)
      setForm(nextForm)
      setSavedForm(nextForm)
      if (successMessage) {
        message.success(successMessage)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="transaction-form">
      <h2>{title}</h2>
      {metadata}

      <div className="form-field">
        <Input
          placeholder="Merchant name"
          value={form.merchantName}
          onChange={(event) => updateForm({ merchantName: event.target.value })}
          status={form.merchantName === "" || merchantNameIsValid ? undefined : "error"}
        />
        {form.merchantName !== "" && !merchantNameIsValid && (
          <div className="form-error">Merchant name must be at least 3 characters.</div>
        )}
      </div>

      <div className="form-field">
        <Select
          style={{ width: "100%" }}
          value={form.cardBrand}
          onChange={(value) => updateForm({ cardBrand: value })}
          options={[
            { value: CardBrand.VISA, label: "VISA" },
            { value: CardBrand.MASTERCARD, label: "MASTERCARD" },
            { value: CardBrand.AMEX, label: "AMEX" },
            { value: CardBrand.DISCOVER, label: "DISCOVER" },
          ]}
        />
      </div>

      <div className="form-field">
        <Input
          placeholder="Amount"
          prefix="$"
          value={form.amount}
          inputMode="decimal"
          onChange={(event) => handleAmountChange(event.target.value)}
          status={form.amount === "" || amountIsValid ? undefined : "error"}
        />
        {form.amount !== "" && !amountIsValid && (
          <div className="form-error">Enter a valid dollar amount greater than $0.00.</div>
        )}
      </div>

      <div className="form-field">
        <Input
          placeholder="Surcharge"
          prefix="$"
          value={form.surchargeAmount}
          inputMode="decimal"
          onChange={(event) => handleSurchargeAmountChange(event.target.value)}
          status={form.surchargeAmount === "" || surchargeAmountIsValid ? undefined : "error"}
        />
        {form.surchargeAmount !== "" && !surchargeAmountIsValid && (
          <div className="form-error">Enter a valid surcharge amount.</div>
        )}
      </div>

      <div className="form-field">
        <Input
          placeholder="Surcharge percentage"
          suffix="%"
          value={form.surchargePercentage}
          inputMode="decimal"
          onChange={(event) => handleSurchargePercentageChange(event.target.value)}
          status={form.surchargePercentage === "" || surchargePercentageIsValid ? undefined : "error"}
        />
        {form.surchargePercentage !== "" && !surchargePercentageIsValid && (
          <div className="form-error">Enter a valid surcharge percentage from 0 to 100.</div>
        )}
      </div>

      <div className="form-field">
        <Select
          style={{ width: "100%" }}
          value={form.status}
          onChange={(value) => updateForm({ status: value })}
          options={[
            { value: TransactionStatus.APPROVED, label: "APPROVED" },
            { value: TransactionStatus.DECLINED, label: "DECLINED" },
            { value: TransactionStatus.REFUNDED, label: "REFUNDED" },
            { value: TransactionStatus.PENDING, label: "PENDING" },
            { value: TransactionStatus.VOIDED, label: "VOIDED" },
          ]}
        />
      </div>

      <Button type="primary" onClick={handleSubmit} disabled={!canSubmit} loading={submitting}>
        {submitLabel}
      </Button>
    </div>
  )
}
