"use client"

import React from "react"
import Avatar from "./Avatar"

export interface AvatarGroupProfile {
  id?: string
  name: string
  color?: string | null
}

export interface AvatarGroupProps {
  profiles: AvatarGroupProfile[]
  max?: number
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
  ringClassName?: string
}

const SIZE_CLASSES = {
  xs: "w-5 h-5 text-[9px] -space-x-1.5",
  sm: "w-6 h-6 text-[10px] -space-x-1.5",
  md: "w-8 h-8 text-xs -space-x-2",
  lg: "w-10 h-10 text-sm -space-x-2.5",
}

const BADGE_SIZE_CLASSES = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
}

export default function AvatarGroup({
  profiles,
  max = 3,
  size = "md",
  className = "",
  ringClassName = "ring-2 ring-white dark:ring-[#070c12]",
}: AvatarGroupProps) {
  // Always filter out ALLE_FERIEN from avatar display per guidelines
  const validProfiles = profiles.filter((p) => p.id !== "ALLE_FERIEN" && p.name !== "ALLE_FERIEN")

  if (validProfiles.length === 0) return null

  const visibleProfiles = validProfiles.slice(0, max)
  const remainingCount = validProfiles.length - max

  const spacingClass = size === "xs" || size === "sm" ? "-space-x-1.5" : "-space-x-2"
  const badgeSize = BADGE_SIZE_CLASSES[size] || BADGE_SIZE_CLASSES.md

  return (
    <div className={`flex items-center ${spacingClass} ${className}`}>
      {visibleProfiles.map((p, idx) => (
        <Avatar
          key={p.id || `${p.name}-${idx}`}
          name={p.name}
          color={p.color}
          size={size}
          className={`${ringClassName} transition-transform hover:z-10 hover:scale-110`}
          title={p.name}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono font-bold flex items-center justify-center select-none shrink-0 ${badgeSize} ${ringClassName} transition-transform hover:z-10 hover:scale-110 shadow-sm`}
          title={`${remainingCount} weitere Profile`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}
