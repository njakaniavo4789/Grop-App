"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

export type ReasoningProps = {
  children: React.ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isStreaming?: boolean
}

export function Reasoning({ children, className, open, onOpenChange, isStreaming }: ReasoningProps) {
  const [internalOpen, setInternalOpen] = React.useState(true)

  const controlledOpen = open !== undefined ? open : internalOpen
  const handleOpenChange = (value: boolean) => {
    setInternalOpen(value)
    onOpenChange?.(value)
  }

  React.useEffect(() => {
    if (isStreaming === false && open === undefined) {
      setInternalOpen(false)
    }
  }, [isStreaming, open])

  return (
    <Collapsible open={controlledOpen} onOpenChange={handleOpenChange} className={cn(className)}>
      {children}
    </Collapsible>
  )
}

export type ReasoningTriggerProps = React.ComponentProps<typeof CollapsibleTrigger>

export const ReasoningTrigger = ({ children, className, ...props }: ReasoningTriggerProps) => (
  <CollapsibleTrigger
    className={cn(
      "group flex cursor-pointer items-center gap-1.5 text-xs text-[var(--ai-400)] hover:text-[var(--ai-300)] transition-colors",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="size-3 transition-transform group-data-[state=open]:rotate-180" />
  </CollapsibleTrigger>
)

export type ReasoningContentProps = React.ComponentProps<typeof CollapsibleContent> & {
  markdown?: boolean
  contentClassName?: string
}

export const ReasoningContent = ({ children, className, contentClassName, markdown, ...props }: ReasoningContentProps) => (
  <CollapsibleContent className={cn("overflow-hidden", className)} {...props}>
    <div className={cn("mt-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-glass)] p-3 text-sm text-[var(--text-muted)]", contentClassName)}>
      {children}
    </div>
  </CollapsibleContent>
)
