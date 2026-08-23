"use client"

import React from "react"
import { getInitials } from "@/lib/profileUtils"

export interface AvatarProps {
  name?: string | null
  color?: string | null
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  title?: string
  showDot?: boolean
}

const SIZE_CLASSES = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
  xl: "w-12 h-12 text-base",
}

export default function Avatar({
  name,
  color = "#0284c7",
  size = "md",
  className = "",
  title,
  showDot = false,
}: AvatarProps) {
  const initials = getInitials(name)
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md
  const effectiveColor = color || "#0284c7"
  const effectiveTitle = title || name || "Profil"

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`rounded-full flex items-center justify-center font-bold text-white shadow-sm select-none shrink-0 ${sizeClass} ${className}`}
        style={{ backgroundColor: effectiveColor }}
        title={effectiveTitle}
      >
        {initials}
      </div>
      {showDot && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#070c12]"
          style={{ backgroundColor: effectiveColor }}
        />
      )}
    </div>
  )
}
