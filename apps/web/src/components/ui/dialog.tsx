"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  // Ensure window exists before using portal (Next.js SSR)
  if (typeof window === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-all duration-100" 
        onClick={() => onOpenChange?.(false)} 
      />
      <div className="z-50 grid w-full max-w-lg gap-4 border border-border bg-background p-6 shadow-lg sm:rounded-lg">
        {children}
      </div>
    </div>,
    document.body
  )
}

export { Dialog }
