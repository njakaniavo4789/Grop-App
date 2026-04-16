"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PromptSuggestionProps = React.ComponentProps<"button"> & {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  highlight?: string
}

export const PromptSuggestion = ({
  children,
  variant = "outline",
  size = "lg",
  highlight,
  className,
  ...props
}: PromptSuggestionProps) => (
  <button
    className={cn("suggestion-card-glass", className)}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      color: "var(--text-secondary)",
      fontSize: size === "sm" ? 12 : size === "lg" ? 14 : 13,
      padding: size === "sm" ? "8px 14px" : size === "lg" ? "14px 20px" : "10px 16px",
      ...(variant === "ghost" ? {
        background: "transparent",
        border: "1px solid transparent",
        backdropFilter: "none",
      } : {}),
    }}
    {...props}
  >
    {children}
  </button>
)
