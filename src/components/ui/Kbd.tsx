import React from "react"

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  keys?: string[]
  children?: React.ReactNode
  className?: string
}

export default function Kbd({ keys, children, className = "", ...props }: KbdProps) {
  if (keys && keys.length > 0) {
    return (
      <span className="inline-flex items-center gap-1">
        {keys.map((k, idx) => (
          <React.Fragment key={`${k}-${idx}`}>
            {idx > 0 && <span className="text-xs text-slate-400 select-none">+</span>}
            <kbd className={`keycap ${className}`} {...props}>
              {k}
            </kbd>
          </React.Fragment>
        ))}
      </span>
    )
  }

  return (
    <kbd className={`keycap ${className}`} {...props}>
      {children}
    </kbd>
  )
}
