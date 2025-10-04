"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Pencil, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getCustomers, deleteCustomer, type Customer } from "@/lib/supabase-data-store"
import { CustomerDialog } from "@/components/customer-dialog"
import Link from "next/link"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])

  const loadCustomers = async () => {
    const loadedCustomers = await getCustomers()
    setCustomers(loadedCustomers)
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this customer? This will also delete all related transactions and payments.",
      )
    ) {
      await deleteCustomer(id)
      loadCustomers()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">Manage your customer accounts</p>
        </div>
        <CustomerDialog onSuccess={loadCustomers} />
      </div>

      {customers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <Link href={`/customers/${customer.id}`} className="hover:underline">
                    {customer.name}
                  </Link>
                  <div className="flex gap-2">
                    <CustomerDialog
                      customer={customer}
                      onSuccess={loadCustomers}
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {customer.phone && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Phone:</span> {customer.phone}
                    </p>
                  )}
                  {customer.address && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Address:</span> {customer.address}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No customers yet</p>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                Add your first customer to start tracking their transactions and payments.
              </p>
              <CustomerDialog onSuccess={loadCustomers} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
