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
import { getCustomers, savePayment, updatePayment, type Payment, type Customer } from "@/lib/supabase-data-store"

interface PaymentDialogProps {
  payment?: Payment
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function PaymentDialog({ payment, trigger, onSuccess }: PaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState(payment?.customer_id || "")
  const [amount, setAmount] = useState(payment?.amount.toString() || "")
  const [paymentMethod, setPaymentMethod] = useState(payment?.payment_method || "cash")
  const [paymentDate, setPaymentDate] = useState(
    payment?.date ? new Date(payment.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  )
  const [notes, setNotes] = useState(payment?.notes || "")
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
      setError("Penter a valid amount")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Saving payment with customer_id:", customerId)

      if (payment) {
        const updated = await updatePayment(payment.id, {
          customer_id: customerId,
          amount: Number.parseFloat(amount),
          payment_method: paymentMethod,
          date: paymentDate,
          notes: notes || "",
        })

        if (!updated) {
          throw new Error("Failed to update payment")
        }
      } else {
        const saved = await savePayment({
          customer_id: customerId,
          amount: Number.parseFloat(amount),
          payment_method: paymentMethod,
          date: paymentDate,
          notes: notes || "",
        })

        if (!saved) {
          throw new Error("Failed to save payment")
        }
      }

      setOpen(false)
      setCustomerId("")
      setAmount("")
      setPaymentMethod("cash")
      setPaymentDate(new Date().toISOString().split("T")[0])
      setNotes("")
      onSuccess?.()
    } catch (error: unknown) {
      console.error("[v0] Error saving payment:", error)
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
            Record Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{payment ? "Edit Payment" : "Record New Payment"}</DialogTitle>
          <DialogDescription>
            {payment ? "Update payment details" : "Record a payment received from a customer"}
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
              <Label htmlFor="method">Payment Method *</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: "cash" | "bank_transfer" | "upi" | "other") => setPaymentMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Payment Date</Label>
              <Input id="date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !customerId}>
              {isLoading ? "Saving..." : payment ? "Update" : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
