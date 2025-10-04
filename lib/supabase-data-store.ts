import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface Customer {
  id: string
  name: string
  phone: string
  address: string
  created_at: string
}

export interface Transaction {
  id: string
  customer_id: string
  type: "debit" | "credit"
  amount: number
  description: string
  date: string
  created_at: string
}

export interface Payment {
  id: string
  customer_id: string
  amount: number
  payment_method: string
  date: string
  notes?: string
  created_at: string
}

// Customer operations
export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching customers:", error)
    return []
  }
  return data || []
}

export async function saveCustomer(customer: Omit<Customer, "id" | "created_at">): Promise<Customer | null> {
  const { data, error } = await supabase.from("customers").insert([customer]).select().single()

  if (error) {
    console.error("[v0] Error saving customer:", error)
    return null
  }
  return data
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | null> {
  const { data, error } = await supabase.from("customers").update(customer).eq("id", id).select().single()

  if (error) {
    console.error("[v0] Error updating customer:", error)
    return null
  }
  return data
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const { error } = await supabase.from("customers").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting customer:", error)
    return false
  }
  return true
}

// Transaction operations
export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase.from("transactions").select("*").order("date", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching transactions:", error)
    return []
  }
  return data || []
}

export async function saveTransaction(
  transaction: Omit<Transaction, "id" | "created_at">,
): Promise<Transaction | null> {
  const { data, error } = await supabase.from("transactions").insert([transaction]).select().single()

  if (error) {
    console.error("[v0] Error saving transaction:", error)
    return null
  }
  return data
}

export async function updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | null> {
  const { data, error } = await supabase.from("transactions").update(transaction).eq("id", id).select().single()

  if (error) {
    console.error("[v0] Error updating transaction:", error)
    return null
  }
  return data
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const { error } = await supabase.from("transactions").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting transaction:", error)
    return false
  }
  return true
}

// Payment operations
export async function getPayments(): Promise<Payment[]> {
  const { data, error } = await supabase.from("payments").select("*").order("date", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching payments:", error)
    return []
  }
  return data || []
}

export async function savePayment(payment: Omit<Payment, "id" | "created_at">): Promise<Payment | null> {
  const { data, error } = await supabase.from("payments").insert([payment]).select().single()

  if (error) {
    console.error("[v0] Error saving payment:", error)
    return null
  }
  return data
}

export async function updatePayment(id: string, payment: Partial<Payment>): Promise<Payment | null> {
  const { data, error } = await supabase.from("payments").update(payment).eq("id", id).select().single()

  if (error) {
    console.error("[v0] Error updating payment:", error)
    return null
  }
  return data
}

export async function deletePayment(id: string): Promise<boolean> {
  const { error } = await supabase.from("payments").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting payment:", error)
    return false
  }
  return true
}

// Helper function to get customer balance
export async function getCustomerBalance(customerId: string): Promise<number> {
  const transactions = await getTransactions()
  const payments = await getPayments()

  const customerTransactions = transactions.filter((t) => t.customer_id === customerId)
  const customerPayments = payments.filter((p) => p.customer_id === customerId)

  const debits = customerTransactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)

  const credits = customerTransactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)

  const totalPayments = customerPayments.reduce((sum, p) => sum + p.amount, 0)

  return debits - credits - totalPayments
}
