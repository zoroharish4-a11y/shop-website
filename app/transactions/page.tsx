"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Receipt, Pencil, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getTransactions, getCustomers, deleteTransaction, type Transaction } from "@/lib/supabase-data-store"
import { TransactionDialog } from "@/components/transaction-dialog"
import { Badge } from "@/components/ui/badge"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [customers, setCustomers] = useState<Map<string, string>>(new Map())

  const loadTransactions = async () => {
    const [loadedTransactions, loadedCustomers] = await Promise.all([getTransactions(), getCustomers()])
    setTransactions(loadedTransactions)

    const customerMap = new Map(loadedCustomers.map((c) => [c.id, c.name]))
    setCustomers(customerMap)
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(id)
      loadTransactions()
    }
  }

  const getCustomerName = (customerId: string) => {
    return customers.get(customerId) || "Unknown Customer"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">Manage all debit and credit transactions</p>
        </div>
        <TransactionDialog onSuccess={loadTransactions} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{getCustomerName(transaction.customer_id)}</p>
                      <Badge variant={transaction.type === "debit" ? "destructive" : "default"}>
                        {transaction.type === "debit" ? "Debit" : "Credit"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className={`text-lg font-bold ${transaction.type === "debit" ? "text-red-600" : "text-green-600"}`}
                    >
                      ₹{transaction.amount.toFixed(2)}
                    </p>
                    <div className="flex gap-2">
                      <TransactionDialog
                        transaction={transaction}
                        onSuccess={loadTransactions}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No transactions yet</p>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                Record your first transaction to start tracking debits and credits.
              </p>
              <TransactionDialog onSuccess={loadTransactions} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
