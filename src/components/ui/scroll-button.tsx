"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ArrowDown } from "lucide-react"

export type ScrollButtonProps = {
  className?: string
  onClick?: () => void
}

export function ScrollButton({ className, onClick }: ScrollButtonProps) {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const container = document.querySelector("[data-chat-container]")
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container as HTMLElement
      setVisible(scrollTop + clientHeight < scrollHeight - 100)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] shadow-lg transition-all hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-primary)]",
        className
      )}
    >
      <ArrowDown size={16} />
    </button>
  )
}
