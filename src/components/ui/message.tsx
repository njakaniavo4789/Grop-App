"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react"

export type MessageProps = React.ComponentProps<"div"> & {
  children: React.ReactNode
}

export const Message = ({ children, className, ...props }: MessageProps) => (
  <div className={cn("group flex gap-3 py-4", className)} {...props}>
    {children}
  </div>
)

export type MessageAvatarProps = {
  src?: string
  alt?: string
  fallback: string
  delayMs?: number
  className?: string
  children?: React.ReactNode
}

export const MessageAvatar = ({ src, alt, fallback, delayMs, className, children }: MessageAvatarProps) => (
  <Avatar className={cn("h-9 w-9 shrink-0", className)}>
    {src && <AvatarImage src={src} alt={alt} />}
    <AvatarFallback delayMs={delayMs}>{fallback}</AvatarFallback>
    {children}
  </Avatar>
)

export type MessageContentProps = React.ComponentProps<"div"> & {
  markdown?: boolean
}

export const MessageContent = ({ children, className, markdown, ...props }: MessageContentProps) => (
  <div
    className={cn("min-w-0 flex-1 space-y-2 text-sm leading-relaxed text-[var(--text-secondary)]", className)}
    {...props}
  >
    {children}
  </div>
)

export type MessageActionsProps = React.ComponentProps<"div">

export const MessageActions = ({ children, className, ...props }: MessageActionsProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props}>
    {children}
  </div>
)

export type MessageActionProps = {
  tooltip: React.ReactNode
  children: React.ReactNode
  className?: string
  side?: "top" | "bottom" | "left" | "right"
  disabled?: boolean
}

export const MessageAction = ({ tooltip, children, className, side = "top", disabled }: MessageActionProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            "rounded-md p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-secondary)]",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side={side}>{tooltip}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
