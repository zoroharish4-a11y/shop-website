export interface Customer {
  id: string
  admin_id: string
  name: string
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  admin_id: string
  customer_id: string
  transaction_type: "debit" | "credit"
  amount: number
  description: string | null
  transaction_date: string
  created_at: string
}

export interface Payment {
  id: string
  admin_id: string
  customer_id: string
  amount: number
  payment_method: "cash" | "bank_transfer" | "cheque" | "online"
  payment_date: string
  notes: string | null
  created_at: string
}

export interface CustomerWithBalance extends Customer {
  total_debit: number
  total_credit: number
  total_payments: number
  balance: number
}
