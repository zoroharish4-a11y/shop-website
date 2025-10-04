"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Receipt, CreditCard, TrendingUp, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCustomers, getTransactions, getPayments } from "@/lib/supabase-data-store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalTransactions: 0,
    totalPayments: 0,
    outstandingBalance: 0,
  })
  const [databaseError, setDatabaseError] = useState(false)

  useEffect(() => {
    console.log("[v0] Dashboard - Component mounted")
    console.log("[v0] Dashboard - isLoading:", isLoading)
    console.log("[v0] Dashboard - user:", user)

    if (!isLoading && !user) {
      console.log("[v0] Dashboard - No user found, redirecting to login")
      router.push("/auth/login")
      return
    }

    if (user) {
      console.log("[v0] Dashboard - User authenticated:", user.email)
      loadMetrics()
    }
  }, [user, isLoading, router])

  const loadMetrics = async () => {
    console.log("[v0] Dashboard - Loading metrics from Supabase")

    try {
      const [customers, transactions, payments] = await Promise.all([getCustomers(), getTransactions(), getPayments()])

      console.log("[v0] Dashboard - Loaded customers:", customers.length)
      console.log("[v0] Dashboard - Loaded transactions:", transactions.length)
      console.log("[v0] Dashboard - Loaded payments:", payments.length)

      setDatabaseError(false)

      // Calculate metrics
      const totalCustomers = customers.length
      const totalTransactions = transactions.length

      const totalDebits = transactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)

      const totalCredits = transactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)

      const totalPaymentsAmount = payments.reduce((sum, p) => sum + p.amount, 0)
      const outstandingBalance = totalDebits - totalCredits - totalPaymentsAmount

      setMetrics({
        totalCustomers,
        totalTransactions,
        totalPayments: totalPaymentsAmount,
        outstandingBalance,
      })

      console.log("[v0] Dashboard - Metrics calculated:", {
        totalCustomers,
        totalTransactions,
        totalPayments: totalPaymentsAmount,
        outstandingBalance,
      })
    } catch (error: any) {
      console.error("[v0] Dashboard - Error loading metrics:", error)
      if (error?.message?.includes("table") || error?.message?.includes("schema cache")) {
        console.log("[v0] Dashboard - Database tables not found, showing setup instructions")
        setDatabaseError(true)
      }
    }
  }

  if (isLoading) {
    console.log("[v0] Dashboard - Showing loading state")
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log("[v0] Dashboard - No user, returning null")
    return null
  }

  console.log("[v0] Dashboard - Rendering dashboard UI")

  return (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-slate-200/50">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-slate-600 mt-1">Welcome back, {user.name}! Manage your shop&apos;s transactions here.</p>
      </div>

      {databaseError && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Setup Required</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>The database tables haven&apos;t been created yet. Please follow these steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to your Supabase project dashboard</li>
              <li>Click on &quot;SQL Editor&quot; in the left sidebar</li>
              <li>Click &quot;New Query&quot;</li>
              <li>Copy and paste the SQL code from scripts/003_create_simplified_tables.sql</li>
              <li>Click &quot;Run&quot; to create the tables</li>
              <li>Refresh this page</li>
            </ol>
            <p className="text-sm mt-2">
              <strong>Quick SQL:</strong> You can find the complete SQL script in the{" "}
              <code className="bg-red-100 px-1 py-0.5 rounded">scripts</code> folder of your project.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{metrics.totalCustomers}</div>
            <p className="text-xs text-slate-600">
              {metrics.totalCustomers === 0
                ? "No customers yet"
                : `${metrics.totalCustomers} active customer${metrics.totalCustomers !== 1 ? "s" : ""}`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{metrics.totalTransactions}</div>
            <p className="text-xs text-slate-600">
              {metrics.totalTransactions === 0
                ? "No transactions yet"
                : `${metrics.totalTransactions} transaction${metrics.totalTransactions !== 1 ? "s" : ""} recorded`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{metrics.totalPayments.toFixed(2)}</div>
            <p className="text-xs text-slate-600">
              {metrics.totalPayments === 0 ? "No payments yet" : "Total payments received"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Outstanding Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                metrics.outstandingBalance > 0
                  ? "text-red-600"
                  : metrics.outstandingBalance < 0
                    ? "text-green-600"
                    : "text-slate-900"
              }`}
            >
              ₹{Math.abs(metrics.outstandingBalance).toFixed(2)}
            </div>
            <p className="text-xs text-slate-600">
              {metrics.outstandingBalance === 0
                ? "All settled"
                : metrics.outstandingBalance > 0
                  ? "Amount receivable"
                  : "Amount payable"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-slate-900">Get Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Receipt className="h-12 w-12 text-blue-600 mb-4" />
            <p className="text-lg font-medium mb-2 text-slate-900">Welcome to your dashboard!</p>
            <p className="text-sm text-slate-600 max-w-md">
              Start by adding customers and recording transactions to manage your shop&apos;s finances effectively.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
