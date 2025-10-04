import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

async function getDetailedReport(adminId: string) {
  const supabase = await createClient()

  // Get all customers with their balances
  const { data: customers } = await supabase.from("customers").select("*").eq("admin_id", adminId).order("name")

  if (!customers) return []

  const customersWithBalance = await Promise.all(
    customers.map(async (customer) => {
      // Get transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select("transaction_type, amount")
        .eq("customer_id", customer.id)

      // Get payments
      const { data: payments } = await supabase.from("payments").select("amount").eq("customer_id", customer.id)

      let totalDebit = 0
      let totalCredit = 0
      let totalPayments = 0

      transactions?.forEach((t) => {
        if (t.transaction_type === "debit") {
          totalDebit += Number(t.amount)
        } else {
          totalCredit += Number(t.amount)
        }
      })

      payments?.forEach((p) => {
        totalPayments += Number(p.amount)
      })

      const balance = totalDebit - totalCredit - totalPayments

      return {
        ...customer,
        total_debit: totalDebit,
        total_credit: totalCredit,
        total_payments: totalPayments,
        balance,
      }
    }),
  )

  return customersWithBalance
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const customersReport = await getDetailedReport(user.id)

  const totalOutstanding = customersReport.reduce((sum, customer) => sum + customer.balance, 0)
  const customersWithDebt = customersReport.filter((c) => c.balance > 0).length
  const totalDebit = customersReport.reduce((sum, customer) => sum + customer.total_debit, 0)
  const totalPayments = customersReport.reduce((sum, customer) => sum + customer.total_payments, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/payments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
          <p className="text-muted-foreground">Detailed breakdown of all customer accounts</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalOutstanding.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customers with Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersWithDebt}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Debit Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalDebit.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payments Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPayments.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Balance Report</CardTitle>
        </CardHeader>
        <CardContent>
          {customersReport.length === 0 ? (
            <p className="text-sm text-muted-foreground">No customer data available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead className="text-right">Total Debit</TableHead>
                  <TableHead className="text-right">Total Credit</TableHead>
                  <TableHead className="text-right">Total Payments</TableHead>
                  <TableHead className="text-right">Outstanding Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersReport.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      <Link href={`/customers/${customer.id}`} className="hover:underline">
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right text-red-600">₹{customer.total_debit.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-green-600">₹{customer.total_credit.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-blue-600">₹{customer.total_payments.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${customer.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                        ₹{customer.balance.toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
