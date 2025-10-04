export interface Customer {
  id: string
  name: string
  phone: string
  address: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  customer_id: string
  transaction_type: "debit" | "credit"
  amount: number
  description: string
  transaction_date: string
  created_at: string
}

export interface Payment {
  id: string
  customer_id: string
  amount: number
  payment_method: "cash" | "bank_transfer" | "upi" | "other"
  payment_date: string
  notes: string
  created_at: string
}

// Storage keys
const CUSTOMERS_KEY = "shopkeeper_customers"
const TRANSACTIONS_KEY = "shopkeeper_transactions"
const PAYMENTS_KEY = "shopkeeper_payments"

// Helper to generate unique IDs
export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Customer operations
export const getCustomers = (): Customer[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(CUSTOMERS_KEY)
  return data ? JSON.parse(data) : []
}

export const saveCustomer = (customer: Omit<Customer, "id" | "created_at" | "updated_at">): Customer => {
  const customers = getCustomers()
  const newCustomer: Customer = {
    ...customer,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  customers.push(newCustomer)
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers))
  return newCustomer
}

export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | null => {
  const customers = getCustomers()
  const index = customers.findIndex((c) => c.id === id)
  if (index === -1) return null

  customers[index] = {
    ...customers[index],
    ...updates,
    updated_at: new Date().toISOString(),
  }
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers))
  return customers[index]
}

export const deleteCustomer = (id: string): boolean => {
  const customers = getCustomers()
  const filtered = customers.filter((c) => c.id !== id)
  if (filtered.length === customers.length) return false

  // Also delete related transactions and payments
  const transactions = getTransactions().filter((t) => t.customer_id !== id)
  const payments = getPayments().filter((p) => p.customer_id !== id)

  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(filtered))
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments))
  return true
}

export const getCustomerById = (id: string): Customer | null => {
  const customers = getCustomers()
  return customers.find((c) => c.id === id) || null
}

// Transaction operations
export const getTransactions = (): Transaction[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(TRANSACTIONS_KEY)
  return data ? JSON.parse(data) : []
}

export const saveTransaction = (transaction: Omit<Transaction, "id" | "created_at">): Transaction => {
  const transactions = getTransactions()
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
    created_at: new Date().toISOString(),
  }
  transactions.push(newTransaction)
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
  return newTransaction
}

export const updateTransaction = (id: string, updates: Partial<Transaction>): Transaction | null => {
  const transactions = getTransactions()
  const index = transactions.findIndex((t) => t.id === id)
  if (index === -1) return null

  transactions[index] = { ...transactions[index], ...updates }
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
  return transactions[index]
}

export const deleteTransaction = (id: string): boolean => {
  const transactions = getTransactions()
  const filtered = transactions.filter((t) => t.id !== id)
  if (filtered.length === transactions.length) return false

  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered))
  return true
}

export const getTransactionsByCustomer = (customerId: string): Transaction[] => {
  return getTransactions().filter((t) => t.customer_id === customerId)
}

// Payment operations
export const getPayments = (): Payment[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(PAYMENTS_KEY)
  return data ? JSON.parse(data) : []
}

export const savePayment = (payment: Omit<Payment, "id" | "created_at">): Payment => {
  const payments = getPayments()
  const newPayment: Payment = {
    ...payment,
    id: generateId(),
    created_at: new Date().toISOString(),
  }
  payments.push(newPayment)
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments))
  return newPayment
}

export const updatePayment = (id: string, updates: Partial<Payment>): Payment | null => {
  const payments = getPayments()
  const index = payments.findIndex((p) => p.id === id)
  if (index === -1) return null

  payments[index] = { ...payments[index], ...updates }
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments))
  return payments[index]
}

export const deletePayment = (id: string): boolean => {
  const payments = getPayments()
  const filtered = payments.filter((p) => p.id !== id)
  if (filtered.length === payments.length) return false

  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(filtered))
  return true
}

export const getPaymentsByCustomer = (customerId: string): Payment[] => {
  return getPayments().filter((p) => p.customer_id === customerId)
}

// Calculate customer balance
export const getCustomerBalance = (customerId: string): number => {
  const transactions = getTransactionsByCustomer(customerId)
  const payments = getPaymentsByCustomer(customerId)

  const debitTotal = transactions.filter((t) => t.transaction_type === "debit").reduce((sum, t) => sum + t.amount, 0)

  const creditTotal = transactions.filter((t) => t.transaction_type === "credit").reduce((sum, t) => sum + t.amount, 0)

  const paymentTotal = payments.reduce((sum, p) => sum + p.amount, 0)

  return debitTotal - creditTotal - paymentTotal
}

// Dashboard statistics
export const getDashboardStats = () => {
  const customers = getCustomers()
  const transactions = getTransactions()
  const payments = getPayments()

  const totalDebit = transactions.filter((t) => t.transaction_type === "debit").reduce((sum, t) => sum + t.amount, 0)

  const totalCredit = transactions.filter((t) => t.transaction_type === "credit").reduce((sum, t) => sum + t.amount, 0)

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)

  const outstandingBalance = totalDebit - totalCredit - totalPayments

  return {
    totalCustomers: customers.length,
    totalTransactions: transactions.length,
    totalPayments: payments.length,
    totalDebit,
    totalCredit,
    totalPaymentsAmount: totalPayments,
    outstandingBalance,
  }
}
