"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import {
  getCustomers,
  saveTransaction,
  updateTransaction,
  type Transaction,
  type Customer,
} from "@/lib/supabase-data-store"

interface TransactionDialogProps {
  transaction?: Transaction
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function TransactionDialog({ transaction, trigger, onSuccess }: TransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState(transaction?.customer_id || "")
  const [transactionType, setTransactionType] = useState<"debit" | "credit">(transaction?.type || "debit")
  const [amount, setAmount] = useState(transaction?.amount.toString() || "")
  const [description, setDescription] = useState(transaction?.description || "")
  const [transactionDate, setTransactionDate] = useState(
    transaction?.date ? new Date(transaction.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCustomers() {
      if (open) {
        const loadedCustomers = await getCustomers()
        setCustomers(loadedCustomers)
      }
    }
    loadCustomers()
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!customerId) {
      setError("select a customer")
      setIsLoading(false)
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("enter a valid amount")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Saving transaction with customer_id:", customerId)

      if (transaction) {
        const updated = await updateTransaction(transaction.id, {
          customer_id: customerId,
          type: transactionType,
          amount: Number.parseFloat(amount),
          description: description || "",
          date: transactionDate,
        })

        if (!updated) {
          throw new Error("Failed to update transaction")
        }
      } else {
        const saved = await saveTransaction({
          customer_id: customerId,
          type: transactionType,
          amount: Number.parseFloat(amount),
          description: description || "",
          date: transactionDate,
        })

        if (!saved) {
          throw new Error("Failed to save transaction")
        }
      }

      setOpen(false)
      setCustomerId("")
      setTransactionType("debit")
      setAmount("")
      setDescription("")
      setTransactionDate(new Date().toISOString().split("T")[0])
      onSuccess?.()
    } catch (error: unknown) {
      console.error("[v0] Error saving transaction:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
          <DialogDescription>
            {transaction ? "Update transaction details" : "Record a new debit or credit transaction"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select value={transactionType} onValueChange={(value: "debit" | "credit") => setTransactionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Debit (Customer owes)</SelectItem>
                  <SelectItem value="credit">Credit (Customer paid back)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Transaction Date</Label>
              <Input
                id="date"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !customerId}>
              {isLoading ? "Saving..." : transaction ? "Update" : "Add Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
