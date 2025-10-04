"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface EmailConfirmationBannerProps {
  user: {
    email_confirmed_at?: string | null
    email?: string
  }
}

export function EmailConfirmationBanner({ user }: EmailConfirmationBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  useEffect(() => {
    // Check if email is not confirmed
    if (!user.email_confirmed_at) {
      setIsVisible(true)
    }
  }, [user.email_confirmed_at])

  const handleResendEmail = async () => {
    if (!user.email) return

    setIsResending(true)
    setResendMessage("")

    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
      },
    })

    if (error) {
      setResendMessage("Failed to resend email. Please try again later.")
    } else {
      setResendMessage("Confirmation email sent! Please check your inbox.")
    }

    setIsResending(false)
  }

  if (!isVisible) return null

  return (
    <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
      <Mail className="h-4 w-4 text-amber-600 dark:text-amber-500" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">Email Not Confirmed</p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Please check your inbox and confirm your email address to ensure full account access.
            {resendMessage && <span className="block mt-1 font-medium">{resendMessage}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendEmail}
            disabled={isResending}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20 bg-transparent"
          >
            {isResending ? "Sending..." : "Resend Email"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
