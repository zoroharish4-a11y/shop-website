"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Download, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getPayments, getCustomers, getTransactions, deletePayment, type Payment } from "@/lib/supabase-data-store"
import { PaymentDialog } from "@/components/payment-dialog"
import { Badge } from "@/components/ui/badge"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [customers, setCustomers] = useState<Map<string, string>>(new Map())
  const [stats, setStats] = useState({
    totalDebit: 0,
    totalCredit: 0,
    totalPaymentsAmount: 0,
    outstandingBalance: 0,
  })

  const loadData = async () => {
    const [loadedPayments, loadedCustomers, loadedTransactions] = await Promise.all([
      getPayments(),
      getCustomers(),
      getTransactions(),
    ])

    setPayments(loadedPayments)

    const customerMap = new Map(loadedCustomers.map((c) => [c.id, c.name]))
    setCustomers(customerMap)

    const totalDebit = loadedTransactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)

    const totalCredit = loadedTransactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)

    const totalPaymentsAmount = loadedPayments.reduce((sum, p) => sum + p.amount, 0)
    const outstandingBalance = totalDebit - totalCredit - totalPaymentsAmount

    setStats({
      totalDebit,
      totalCredit,
      totalPaymentsAmount,
      outstandingBalance,
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      await deletePayment(id)
      loadData()
    }
  }

  const getCustomerName = (customerId: string) => {
    return customers.get(customerId) || "Unknown Customer"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments & Reports</h2>
          <p className="text-muted-foreground">Track payments and view financial reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/payments/reports">
              <Download className="mr-2 h-4 w-4" />
              View Reports
            </Link>
          </Button>
          <PaymentDialog onSuccess={loadData} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Debit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{stats.totalDebit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Amount customers owe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalCredit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Amount credited back</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{stats.totalPaymentsAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Payments received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.outstandingBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{stats.outstandingBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Net amount due</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{getCustomerName(payment.customer_id)}</p>
                      <Badge variant="outline">{payment.payment_method.replace("_", " ").toUpperCase()}</Badge>
                    </div>
                    {payment.notes && <p className="text-sm text-muted-foreground">{payment.notes}</p>}
                    <p className="text-xs text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-blue-600">₹{payment.amount.toFixed(2)}</p>
                    <div className="flex gap-2">
                      <PaymentDialog
                        payment={payment}
                        onSuccess={loadData}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(payment.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No payments recorded yet</p>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                Record your first payment to start tracking customer payments.
              </p>
              <PaymentDialog onSuccess={loadData} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
